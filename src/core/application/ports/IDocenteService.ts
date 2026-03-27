import { Teacher } from '@/core/domain/entities/Teacher'

export interface TeacherContext {
  memberId: string
  schoolId: string
  schoolName: string | null
  groupId: string | null
  groupName: string | null
  specialty: string | null
  isActive: boolean
}

export interface DocenteDashboardStats {
  alumnosEnGrupo: number
  preRegistrosPendientes: number
  cicloActivo: string
}

export interface IDocenteService {
  /**
   * Obtiene el contexto del docente logueado basándose en su ID de usuario de Auth.
   */
  getTeacherContext(userId: string): Promise<TeacherContext | null>

  /**
   * Obtiene las métricas específicas para el dashboard del docente.
   */
  /**
   * Actualiza los datos del perfil del docente.
   */
  updateProfile(userId: string, data: { fullName: string; phone: string; specialty: string }): Promise<void>
}
