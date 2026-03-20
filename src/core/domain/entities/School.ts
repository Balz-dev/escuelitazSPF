export interface School {
  id: string
  name: string
  identifier: string // slug para URL (escuela-ejemplo)
  cct?: string | null
  address?: string | null
  logoUrl?: string | null
  createdAt: Date
  updatedAt: Date
}

export type CreateSchoolDTO = Omit<School, 'id' | 'createdAt' | 'updatedAt'>
