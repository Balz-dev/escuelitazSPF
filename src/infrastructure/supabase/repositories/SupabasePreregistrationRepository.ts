import { createClient } from '../client'
import {
  StudentPreregistration,
  CreatePreregistrationDTO,
  ReviewPreregistrationDTO,
} from '@/core/domain/entities/StudentPreregistration'
import { Tables } from '../database.types'

type PreregistrationRow = Tables<'student_preregistrations'>

/** Repositorio de pre-registros de alumnos — soporta inserción pública (padres) y revisión interna */
export class SupabasePreregistrationRepository {
  private supabase = createClient()

  /** Obtener todos los pre-registros de una escuela (requiere rol director/docente) */
  async getBySchool(schoolId: string): Promise<StudentPreregistration[]> {
    const { data, error } = await this.supabase
      .from('student_preregistrations')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al obtener pre-registros: ${error.message}`)
    return (data || []).map(row => this.mapToDomain(row))
  }

  /** Filtrar por estado (pendiente / aprobado / rechazado) */
  async getByStatus(schoolId: string, status: 'pendiente' | 'aprobado' | 'rechazado'): Promise<StudentPreregistration[]> {
    const { data, error } = await this.supabase
      .from('student_preregistrations')
      .select('*')
      .eq('school_id', schoolId)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al filtrar pre-registros: ${error.message}`)
    return (data || []).map(row => this.mapToDomain(row))
  }

  /** Crear pre-registro (uso desde formulario público o interno) */
  async create(dto: CreatePreregistrationDTO): Promise<StudentPreregistration> {
    const { data, error } = await this.supabase
      .from('student_preregistrations')
      .insert({
        school_id:     dto.schoolId,
        first_name:    dto.firstName,
        last_name:     dto.lastName,
        curp:          dto.curp ?? null,
        grado:         dto.grado ?? null,
        parent_name:   dto.parentName,
        parent_phone:  dto.parentPhone,
        parent_email:  dto.parentEmail ?? null,
        relationship:  dto.relationship,
        registered_by: dto.registeredBy ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(`Error al crear pre-registro: ${error.message}`)
    return this.mapToDomain(data)
  }

  /** Aprobar o rechazar un pre-registro */
  async review(id: string, dto: ReviewPreregistrationDTO): Promise<StudentPreregistration> {
    const { data, error } = await this.supabase
      .from('student_preregistrations')
      .update({
        status:       dto.status,
        reviewed_by:  dto.reviewedBy,
        reviewed_at:  new Date().toISOString(),
        notes:        dto.notes ?? null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Error al revisar pre-registro: ${error.message}`)
    return this.mapToDomain(data)
  }

  private mapToDomain(raw: PreregistrationRow): StudentPreregistration {
    return {
      id:           raw.id,
      schoolId:     raw.school_id,
      firstName:    raw.first_name,
      lastName:     raw.last_name,
      curp:         raw.curp,
      grado:        raw.grado,
      parentName:   raw.parent_name,
      parentPhone:  raw.parent_phone,
      parentEmail:  raw.parent_email,
      relationship: raw.relationship,
      status:       raw.status as any, // Cast to domain status (they are identical strings)
      registeredBy: raw.registered_by,
      reviewedBy:   raw.reviewed_by,
      reviewedAt:   raw.reviewed_at   ? new Date(raw.reviewed_at) : null,
      notes:        raw.notes,
      createdAt:    new Date(raw.created_at),
      updatedAt:    new Date(raw.updated_at),
    }
  }
}
