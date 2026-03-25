import { createClient } from '@/infrastructure/supabase/client'
import { IDashboardRepository } from '@/core/application/ports/IDashboardRepository'
import { DashboardMetrics } from '@/core/domain/entities/DashboardMetrics'

/**
 * Implementación de IDashboardRepository usando Supabase.
 * Capa: Infraestructura
 */
export class SupabaseDashboardRepository implements IDashboardRepository {
  private client = createClient()

  async getMetrics(schoolId: string): Promise<DashboardMetrics> {
    // Ejecutar consultas en paralelo para mejor performance
    const [studentsResult, membersResult, pendingResult, schoolResult] =
      await Promise.all([
        // Total de alumnos de la escuela
        this.client
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', schoolId),

        // Total de docentes activos (members con role = 'docente')
        this.client
          .from('school_members')
          .select('id, member_roles!inner(role)', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('is_active', true)
          .eq('member_roles.role', 'docente'),

        // Pre-registros pendientes de revisión
        this.client
          .from('student_preregistrations')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('status', 'pendiente'),

        // Información de la escuela para el ciclo activo
        this.client
          .from('schools')
          .select('name, subscription_status, trial_ends_at')
          .eq('id', schoolId)
          .single(),
      ])

    if (schoolResult.error) {
      throw new Error(
        `Error al obtener datos de la escuela: ${schoolResult.error.message}`
      )
    }

    const school = schoolResult.data
    const totalStudents = studentsResult.count ?? 0
    const totalTeachers = membersResult.count ?? 0
    const pendingRequests = pendingResult.count ?? 0

    // Construir el nombre del ciclo activo a partir de los datos de suscripción
    let activeCycleName: string | null = null
    if (school.subscription_status === 'trial' && school.trial_ends_at) {
      const trialEnd = new Date(school.trial_ends_at)
      const year = trialEnd.getFullYear()
      activeCycleName = `Ciclo Escolar ${year - 1}–${year} (Período de Prueba)`
    } else if (school.subscription_status === 'active') {
      const now = new Date()
      const year = now.getFullYear()
      activeCycleName = `Ciclo Escolar ${year - 1}–${year}`
    }

    return {
      totalStudents,
      activeStudents: totalStudents, // Sin campo de baja aún
      totalTeachers,
      activeCycleName,
      pendingRequests,
    }
  }
}
