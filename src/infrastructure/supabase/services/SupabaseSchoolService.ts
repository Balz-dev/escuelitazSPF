import { createClient } from '../client'
import { ISchoolService } from '@/core/application/ports/ISchoolService'
import { ISchoolRepository } from '@/core/application/repositories/ISchoolRepository'
import { SupabaseSchoolRepository } from '../repositories/SupabaseSchoolRepository'
import { School } from '@/core/domain/entities/School'

export class SupabaseSchoolService implements ISchoolService {
  constructor(private repository: ISchoolRepository = new SupabaseSchoolRepository()) {}

  async getSchoolByIdentifier(identifier: string): Promise<School | null> {
    return this.repository.getByIdentifier(identifier)
  }

  async getSchoolById(id: string): Promise<School | null> {
    return this.repository.getById(id)
  }

  async getActiveSchoolId(userId: string): Promise<string | null> {
    const { data: membership } = await createClient()
      .from('school_members')
      .select('school_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .single()
    
    return membership?.school_id || null
  }
}
