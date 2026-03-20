/**
 * Entidad de dominio: Convocatoria
 * Representa un llamado oficial del Director para integrar la SPF o convocar reuniones.
 */

export type ConvocatoriaStatus = 'borrador' | 'activa' | 'cerrada'
export type ConvocatoriaType = 'formacion_spf' | 'reunion_ordinaria' | 'asamblea_extraordinaria'

export interface Convocatoria {
  id: string
  schoolId: string
  createdBy: string
  title: string
  description?: string | null
  type: ConvocatoriaType
  status: ConvocatoriaStatus
  expiresAt?: Date | null
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export type CreateConvocatoriaDTO = Pick<Convocatoria,
  'schoolId' | 'createdBy' | 'title' | 'description' | 'type' | 'expiresAt'
>

export type UpdateConvocatoriaDTO = Partial<Pick<Convocatoria,
  'title' | 'description' | 'status' | 'expiresAt' | 'publishedAt'
>>
