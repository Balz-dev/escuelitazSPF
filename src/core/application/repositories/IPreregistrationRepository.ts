import { CreatePreregistrationDTO, StudentPreregistration, ReviewPreregistrationDTO } from '@/core/domain/entities/StudentPreregistration'

export interface IPreregistrationRepository {
  create(data: CreatePreregistrationDTO): Promise<StudentPreregistration>
  getByStatus(schoolId: string, status: 'pendiente' | 'aprobado' | 'rechazado'): Promise<StudentPreregistration[]>
  review(id: string, data: ReviewPreregistrationDTO): Promise<StudentPreregistration>
}
