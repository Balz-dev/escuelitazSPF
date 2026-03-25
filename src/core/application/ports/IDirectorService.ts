import { PasswordResetRequest } from '@/core/domain/entities/PasswordResetRequest'

export interface DirectorDashboardStats {
  alumnos: number
  docentes: number
  solicitudes: number
}

export interface IDirectorService {
  getStats(schoolId: string): Promise<DirectorDashboardStats>
  getPendingPasswordResetRequests(schoolId: string): Promise<PasswordResetRequest[]>
  getDirectorProfile(userId: string): Promise<{ full_name: string | null, onboarding_completed: boolean } | null>
  getSchoolMembership(userId: string): Promise<{ school_id: string, school_name: string } | null>
  getTeachers(schoolId: string): Promise<any[]>
  updateTeacher(memberId: string, data: any): Promise<void>
  deactivateTeacher(memberId: string): Promise<void>
}
