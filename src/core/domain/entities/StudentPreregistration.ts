/**
 * Entidad de dominio: StudentPreregistration
 * Representa un pre-registro de alumno/padre enviado desde cualquier rol o de forma pública.
 */

export type PreregistroStatus = 'pendiente' | 'aprobado' | 'rechazado'

export interface StudentPreregistration {
  id: string
  schoolId: string
  // Datos del alumno
  firstName: string
  lastName: string
  curp?: string | null
  grado?: string | null
  // Datos del padre/tutor
  parentName: string
  parentPhone: string
  parentEmail?: string | null
  relationship: string
  // Trazabilidad
  status: PreregistroStatus
  registeredBy?: string | null // null = auto-registro de padre anónimo
  reviewedBy?: string | null
  reviewedAt?: Date | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export type CreatePreregistrationDTO = Pick<StudentPreregistration,
  | 'schoolId'
  | 'firstName'
  | 'lastName'
  | 'curp'
  | 'grado'
  | 'parentName'
  | 'parentPhone'
  | 'parentEmail'
  | 'relationship'
  | 'registeredBy'
>

export type ReviewPreregistrationDTO = {
  status: 'aprobado' | 'rechazado'
  reviewedBy: string
  notes?: string
}
