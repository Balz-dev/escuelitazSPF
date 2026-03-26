import { PasswordResetRequest } from '@/core/domain/entities/PasswordResetRequest'
import { Teacher } from '@/core/domain/entities/Teacher'
import { Group } from '@/core/domain/entities/Group'
import { UpdateTeacherDto } from '@/core/domain/dtos/UpdateTeacherDto'

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
  getTeachers(schoolId: string): Promise<Teacher[]>
  updateTeacher(memberId: string, data: UpdateTeacherDto): Promise<void>
  deactivateTeacher(memberId: string): Promise<void>
  getGroups(schoolId: string): Promise<Group[]>
  createGroup(schoolId: string, grade: string, name: string): Promise<Group>
  assignTeacherToGroup(memberId: string, groupId: string | null): Promise<void>

  /**
   * Inicia una suplantación temporal de un docente.
   */
  startSubstitution(originalMemberId: string, substituteMemberId: string): Promise<void>

  /**
   * Finaliza una suplantación temporal y restaura al docente original.
   */
  endSubstitution(originalMemberId: string): Promise<void>
}
