// Entidad Perfil de Usuario
export interface UserProfile {
  id: string
  fullName?: string | null
  avatarUrl?: string | null
  phone?: string | null
  mustChangePassword: boolean
  createdAt: Date
}

// Entidad Membresía de Escuela (Un usuario puede pertenecer a N escuelas)
export interface SchoolMember {
  id: string
  schoolId: string
  userId: string
  isActive: boolean
  joinedAt: Date
  roles: MemberRole[]
}

export type RoleType = 'director' | 'docente' | 'padre'
export type SubRoleType = 'presidente' | 'tesorero' | 'secretario' | 'vocal'

export interface MemberRole {
  role: RoleType
  subRole?: SubRoleType | null
  isSubstitute: boolean
  activeSince: Date
  activeUntil?: Date | null
}
