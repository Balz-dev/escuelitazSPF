import { createClient } from '../client'
import { ISchoolRepository } from '@/core/application/repositories/ISchoolRepository'
import { School, CreateSchoolDTO } from '@/core/domain/entities/School'

export class SupabaseSchoolRepository implements ISchoolRepository {
  private supabase = createClient()

  async getById(id: string): Promise<School | null> {
    const { data, error } = await this.supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return this.mapToDomain(data)
  }

  async getByIdentifier(identifier: string): Promise<School | null> {
    const { data, error } = await this.supabase
      .from('schools')
      .select('*')
      .eq('identifier', identifier)
      .single()

    if (error || !data) return null
    return this.mapToDomain(data)
  }

  async create(data: CreateSchoolDTO): Promise<School> {
    const { data: created, error } = await this.supabase
      .from('schools')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(`Error al crear escuela: ${error.message}`)
    return this.mapToDomain(created)
  }

  async update(id: string, data: Partial<School>): Promise<School> {
    const { data: updated, error } = await this.supabase
      .from('schools')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar escuela: ${error.message}`)
    return this.mapToDomain(updated)
  }

  async list(): Promise<School[]> {
    const { data, error } = await this.supabase
      .from('schools')
      .select('*')

    if (error) throw new Error(`Error al listar escuelas: ${error.message}`)
    return data.map(this.mapToDomain)
  }

  // Mapeador de Supabase a Dominios Entidades
  private mapToDomain(raw: any): School {
    return {
      id: raw.id,
      name: raw.name,
      identifier: raw.identifier,
      cct: raw.cct,
      address: raw.address,
      logoUrl: raw.logo_url,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    }
  }
}
