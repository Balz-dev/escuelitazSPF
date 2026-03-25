import { School } from '@/core/domain/entities/School'

export interface ISchoolService {
  getSchoolByIdentifier(identifier: string): Promise<School | null>
  getSchoolById(id: string): Promise<School | null>
  getActiveSchoolId(userId: string): Promise<string | null>
}
