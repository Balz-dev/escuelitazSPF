import { createClient } from '../client'
import { IDocenteService, TeacherContext, DocenteDashboardStats } from '@/core/application/ports/IDocenteService'

export class SupabaseDocenteService implements IDocenteService {
  private supabase = createClient()

  async getTeacherContext(userId: string): Promise<TeacherContext | null> {
    // Obtenemos la membresía del usuario como docente
    const { data: membership, error } = await this.supabase
      .from('school_members')
      .select(`
        id,
        school_id,
        is_active,
        schools:school_id(name),
        profiles:user_id(specialty)
      `)
      .eq('user_id', userId)
      .single()

    if (error || !membership) return null

    // Verificamos si tiene el rol de docente
    const { data: roleData, error: roleError } = await this.supabase
      .from('member_roles')
      .select('role')
      .eq('member_id', membership.id)
      .eq('role', 'docente')
      .single()

    if (roleError || !roleData) return null

    // Obtenemos el grupo asignado
    const { data: group, error: groupError } = await this.supabase
      .from('groups' as any)
      .select('id, grade, name')
      .eq('teacher_id', membership.id)
      .maybeSingle()

    return {
      memberId: membership.id,
      schoolId: membership.school_id,
      schoolName: (membership.schools as any)?.name || null,
      groupId: group ? (group as any).id : null,
      groupName: group ? `${(group as any).grade}° ${(group as any).name}` : null,
      specialty: (membership.profiles as any)?.specialty || null,
      isActive: membership.is_active
    }
  }

  async getDashboardStats(schoolId: string, groupId: string | null): Promise<DocenteDashboardStats> {
    // 1. Alumnos en el grupo
    let studentsCount = 0
    if (groupId) {
      const { count, error: countError } = await this.supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
      
      if (!countError) {
        studentsCount = count || 0
      }
    }

    // 2. Pre-registros pendientes
    // Si tiene grupo, filtramos por el grado de ese grupo.
    // Si no, mostramos los de la escuela que no tengan grado asignado (o todos los pendientes de la escuela)
    let prQuery = this.supabase
      .from('student_preregistrations')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'pendiente')

    if (groupId) {
      const { data: group } = await this.supabase
        .from('groups' as any)
        .select('grade')
        .eq('id', groupId)
        .single()
      
      if (group && (group as any).grade) {
        prQuery = prQuery.eq('grado', (group as any).grade)
      }
    }

    const { count: prCount } = await prQuery

    return {
      alumnosEnGrupo: studentsCount,
      preRegistrosPendientes: prCount || 0,
      cicloActivo: 'Ciclo 2023-2024' // TODO: Obtener de una tabla de configuración
    }
  }

  async updateProfile(userId: string, data: { fullName: string; phone: string; specialty: string }): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        specialty: data.specialty
      })
      .eq('id', userId)

    if (error) {
      console.error('[SupabaseDocenteService] Error al actualizar perfil:', error)
      throw new Error('No se pudo actualizar la información del perfil.')
    }
  }
}
