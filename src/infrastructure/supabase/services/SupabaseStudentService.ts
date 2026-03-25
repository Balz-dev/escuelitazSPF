import { IStudentService } from '@/core/application/ports/IStudentService'
import { IPreregistrationRepository } from '@/core/application/repositories/IPreregistrationRepository'
import { SupabasePreregistrationRepository } from '../repositories/SupabasePreregistrationRepository'
import { CreatePreregistrationDTO, StudentPreregistration } from '@/core/domain/entities/StudentPreregistration'

export class SupabaseStudentService implements IStudentService {
  constructor(private repository: IPreregistrationRepository = new SupabasePreregistrationRepository()) {}

  async createPreregistration(data: CreatePreregistrationDTO): Promise<StudentPreregistration> {
    return this.repository.create(data)
  }

  async getPreregistrationsByStatus(schoolId: string, status: 'pendiente' | 'aprobado' | 'rechazado'): Promise<StudentPreregistration[]> {
    return this.repository.getByStatus(schoolId, status)
  }

  async reviewPreregistration(id: string, status: 'aprobado' | 'rechazado', reviewedBy: string): Promise<StudentPreregistration> {
    return this.repository.review(id, { status, reviewedBy })
  }
}
