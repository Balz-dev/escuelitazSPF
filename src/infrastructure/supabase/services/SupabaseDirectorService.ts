import { createClient } from '../client'
import { IDirectorService, DirectorDashboardStats } from '@/core/application/ports/IDirectorService'
import { PasswordResetRequest } from '@/core/domain/entities/PasswordResetRequest'
import { Teacher } from '@/core/domain/entities/Teacher'
import { Group } from '@/core/domain/entities/Group'
import { UpdateTeacherDto } from '@/core/domain/dtos/UpdateTeacherDto'

export class SupabaseDirectorService implements IDirectorService {
  private supabase = createClient()

  async getStats(schoolId: string): Promise<DirectorDashboardStats> {
    const [ { count: alums }, { count: docs }, { count: sols } ] = await Promise.all([
      // Para alumnos (padres vinculados en este contexto MVP)
      this.supabase.from('member_roles')
        .select('*, school_members!inner(school_id)', { count: 'exact', head: true })
        .eq('school_members.school_id', schoolId)
        .eq('role', 'padre'),
      // Para docentes
      this.supabase.from('member_roles')
        .select('*, school_members!inner(school_id)', { count: 'exact', head: true })
        .eq('school_members.school_id', schoolId)
        .eq('role', 'docente'),
      // Para pre-registros
      this.supabase.from('student_preregistrations')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'pendiente')
    ]);

    return {
      alumnos: alums || 0,
      docentes: docs || 0,
      solicitudes: sols || 0
    };
  }

  async getPendingPasswordResetRequests(schoolId: string): Promise<PasswordResetRequest[]> {
    const { data, error } = await this.supabase
      .from('password_reset_requests')
      .select(`
          id,
          user_id,
          school_id,
          status,
          created_at,
          profiles:user_id(full_name, username, phone)
      `)
      .eq('school_id', schoolId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      schoolId: row.school_id,
      status: row.status as any,
      createdAt: new Date(row.created_at),
      profiles: row.profiles ? {
        fullName: (row.profiles as any).full_name,
        username: (row.profiles as any).username,
        phone: (row.profiles as any).phone
      } : null
    }));
  }

  async getDirectorProfile(userId: string): Promise<{ full_name: string | null, onboarding_completed: boolean } | null> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('full_name, onboarding_completed')
      .eq('id', userId)
      .single();
    
    if (error || !profile) return null;
    return {
      full_name: profile.full_name,
      onboarding_completed: !!profile.onboarding_completed
    };
  }

  async getSchoolMembership(userId: string): Promise<{ school_id: string, school_name: string } | null> {
    const { data: membership, error } = await this.supabase
      .from('school_members')
      .select(`
        school_id, 
        school:schools(name)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (error || !membership) return null;
    
    return {
      school_id: membership.school_id,
      school_name: (membership as any).school?.name || 'Mi Escuela'
    };
  }

  async getTeachers(schoolId: string): Promise<Teacher[]> {
    const { data: members, error } = await this.supabase
      .from('school_members')
      .select(`
        id,
        is_active,
        substituted_by_id,
        profiles:user_id(id, full_name, username, phone, specialty),
        member_roles!inner(role, is_substitute),
        groups:groups(id, grade, name)
      `)
      .eq('school_id', schoolId)
      .eq('member_roles.role', 'docente');

    if (error) throw error;

    // Get student counts for groups
    const { data: students, error: studentError } = await this.supabase
      .from('students')
      .select('group_id')
      .eq('school_id', schoolId);

    if (studentError) throw studentError;

    return ((members as any[]) || []).map(m => {
      const groupData = (m.groups as any)?.[0];
      const studentCount = students ? (students as any[]).filter(s => s.group_id === groupData?.id).length : 0;
      const profile = (m.profiles as any);
      const role = (m.member_roles as any)?.[0];

      return {
        memberId: m.id,
        userId: profile?.id,
        fullName: profile?.full_name || 'Docente sin nombre',
        username: profile?.username,
        phone: profile?.phone,
        specialty: profile?.specialty,
        isActive: m.is_active,
        isSubstitute: role?.is_substitute,
        substitutedById: m.substituted_by_id,
        group: groupData ? `${groupData.grade}° ${groupData.name}` : 'Sin grupo',
        groupId: groupData?.id,
        studentCount
      };
    });
  }

  async updateTeacher(memberId: string, data: UpdateTeacherDto): Promise<void> {
    if (data.fullName || data.phone || data.specialty) {
      const { error: profileError } = await this.supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone,
          specialty: data.specialty
        })
        .eq('id', data.userId as string);

      if (profileError) throw profileError;
    }

    if (data.isActive !== undefined) {
      const { error: memberError } = await this.supabase
        .from('school_members')
        .update({ is_active: data.isActive })
        .eq('id', memberId);
      
      if (memberError) throw memberError;
    }
  }

  async deactivateTeacher(memberId: string): Promise<void> {
    const { error } = await this.supabase
      .from('school_members')
      .update({ is_active: false })
      .eq('id', memberId);
    
    if (error) throw error;
  }

  async getGroups(schoolId: string): Promise<Group[]> {
    const { data, error } = await this.supabase
      .from('groups' as any)
      .select('*')
      .eq('school_id', schoolId);
    if (error) throw error;
    return (data as unknown) as Group[];
  }

  async createGroup(schoolId: string, grade: string, name: string): Promise<Group> {
    const { data, error } = await this.supabase
      .from('groups' as any)
      .insert({ school_id: schoolId, grade, name })
      .select('*')
      .single();
    if (error) throw error;
    return (data as unknown) as Group;
  }

  async assignTeacherToGroup(memberId: string, groupId: string | null): Promise<void> {
    await this.supabase
      .from('groups' as any)
      .update({ teacher_id: null } as any)
      .eq('teacher_id', memberId);
    
    if (groupId) {
      const { error } = await this.supabase
        .from('groups' as any)
        .update({ teacher_id: memberId } as any)
        .eq('id', groupId);
      if (error) throw error;
    }
  }

  async startSubstitution(originalMemberId: string, substituteMemberId: string): Promise<void> {
    const { data: group } = await this.supabase
      .from('groups' as any)
      .select('id')
      .eq('teacher_id', originalMemberId)
      .single();

    if (!group) throw new Error('El docente original no tiene un grupo asignado.');

    await this.supabase
      .from('school_members')
      .update({ substituted_by_id: substituteMemberId } as any)
      .eq('id', originalMemberId);

    await this.supabase
      .from('member_roles')
      .update({ is_substitute: true } as any)
      .eq('member_id', substituteMemberId);

    await this.supabase
      .from('groups' as any)
      .update({ teacher_id: substituteMemberId } as any)
      .eq('id', (group as any).id);
  }

  async endSubstitution(originalMemberId: string): Promise<void> {
    const { data: member } = await this.supabase
      .from('school_members')
      .select('substituted_by_id')
      .eq('id', originalMemberId)
      .single();

    if (!(member as any)?.substituted_by_id) return;

    const { data: group } = await this.supabase
      .from('groups' as any)
      .select('id')
      .eq('teacher_id', (member as any).substituted_by_id)
      .single();

    if (group) {
      await this.supabase
        .from('groups' as any)
        .update({ teacher_id: originalMemberId } as any)
        .eq('id', (group as any).id);
    }

    await this.supabase
      .from('school_members')
      .update({ substituted_by_id: null } as any)
      .eq('id', originalMemberId);

    await this.supabase
      .from('member_roles')
      .update({ is_substitute: false } as any)
      .eq('member_id', (member as any).substituted_by_id);
  }
}
