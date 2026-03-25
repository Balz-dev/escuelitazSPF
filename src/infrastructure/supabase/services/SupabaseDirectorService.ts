import { createClient } from '../client'
import { IDirectorService, DirectorDashboardStats } from '@/core/application/ports/IDirectorService'
import { PasswordResetRequest } from '@/core/domain/entities/PasswordResetRequest'

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
    
    return (data || []).map(row => ({
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

  async getTeachers(schoolId: string): Promise<any[]> {
    const { data: members, error } = await this.supabase
      .from('school_members')
      .select(`
        id,
        is_active,
        profiles:user_id(id, full_name, username, phone),
        member_roles!inner(role)
      `)
      .eq('school_id', schoolId)
      .eq('member_roles.role', 'docente')
      .eq('is_active', true);

    if (error) throw error;

    return (members || []).map(m => ({
      memberId: m.id,
      userId: (m.profiles as any)?.id,
      fullName: (m.profiles as any)?.full_name || 'Docente sin nombre',
      username: (m.profiles as any)?.username,
      phone: (m.profiles as any)?.phone,
      isActive: m.is_active
    }));
  }
}
