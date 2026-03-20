import { School, CreateSchoolDTO } from '@/core/domain/entities/School'

export interface ISchoolRepository {
  getById(id: string): Promise<School | null>
  getByIdentifier(identifier: string): Promise<School | null>
  create(data: CreateSchoolDTO): Promise<School>
  update(id: string, data: Partial<School>): Promise<School>
  list(): Promise<School[]>
}
