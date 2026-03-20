import { createClient } from '../client'
import {
  Convocatoria,
  CreateConvocatoriaDTO,
  UpdateConvocatoriaDTO,
} from '@/core/domain/entities/Convocatoria'
import { Tables } from '../database.types'

type ConvocatoriaRow = Tables<'convocatorias'>

/** Repositorio para operaciones CRUD de convocatorias con aislamiento multi-tenant */
export class SupabaseConvocatoriaRepository {
  private supabase = createClient()

  async getBySchool(schoolId: string): Promise<Convocatoria[]> {
    const { data, error } = await this.supabase
      .from('convocatorias')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al obtener convocatorias: ${error.message}`)
    return (data || []).map(row => this.mapToDomain(row))
  }

  async getActive(schoolId: string): Promise<Convocatoria[]> {
    const { data, error } = await this.supabase
      .from('convocatorias')
      .select('*')
      .eq('school_id', schoolId)
      .eq('status', 'activa')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al obtener convocatorias activas: ${error.message}`)
    return (data || []).map(row => this.mapToDomain(row))
  }

  async create(dto: CreateConvocatoriaDTO): Promise<Convocatoria> {
    const { data, error } = await this.supabase
      .from('convocatorias')
      .insert({
        school_id:   dto.schoolId,
        created_by:  dto.createdBy,
        title:       dto.title,
        description: dto.description ?? null,
        type:        dto.type as any,
        expires_at:  dto.expiresAt?.toISOString() ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(`Error al crear convocatoria: ${error.message}`)
    return this.mapToDomain(data)
  }

  async update(id: string, dto: UpdateConvocatoriaDTO): Promise<Convocatoria> {
    const payload: any = {}
    if (dto.title       !== undefined) payload.title        = dto.title
    if (dto.description !== undefined) payload.description  = dto.description
    if (dto.status      !== undefined) payload.status       = dto.status
    if (dto.expiresAt   !== undefined) payload.expires_at   = dto.expiresAt?.toISOString() ?? null
    if (dto.publishedAt !== undefined) payload.published_at = dto.publishedAt?.toISOString() ?? null

    const { data, error } = await this.supabase
      .from('convocatorias')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar convocatoria: ${error.message}`)
    return this.mapToDomain(data)
  }

  async publish(id: string): Promise<Convocatoria> {
    return this.update(id, { status: 'activa', publishedAt: new Date() })
  }

  async close(id: string): Promise<Convocatoria> {
    return this.update(id, { status: 'cerrada' })
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('convocatorias')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Error al eliminar convocatoria: ${error.message}`)
  }

  private mapToDomain(raw: ConvocatoriaRow): Convocatoria {
    return {
      id:          raw.id,
      schoolId:    raw.school_id,
      createdBy:   raw.created_by,
      title:       raw.title,
      description: raw.description,
      type:        raw.type as any,
      status:      raw.status as any,
      expiresAt:   raw.expires_at   ? new Date(raw.expires_at)   : null,
      publishedAt: raw.published_at ? new Date(raw.published_at) : null,
      createdAt:   new Date(raw.created_at),
      updatedAt:   new Date(raw.updated_at),
    }
  }
}
