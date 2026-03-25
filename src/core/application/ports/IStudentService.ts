import { CreatePreregistrationDTO, StudentPreregistration } from '@/core/domain/entities/StudentPreregistration'

export interface IStudentService {
  createPreregistration(data: CreatePreregistrationDTO): Promise<StudentPreregistration>
  getPreregistrationsByStatus(schoolId: string, status: 'pendiente' | 'aprobado' | 'rechazado'): Promise<StudentPreregistration[]>
  reviewPreregistration(id: string, status: 'aprobado' | 'rechazado', reviewedBy: string): Promise<StudentPreregistration>
}
