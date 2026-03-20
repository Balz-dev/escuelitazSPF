import { Database } from '@/infrastructure/supabase/database.types'

type Role = Database['public']['Enums']['member_role']
type SubRole = Database['public']['Enums']['member_sub_role']

export interface EntityPermissions {
  canCreate: boolean
  canEdit: boolean
  canValidate: boolean
  canApproveFinance: boolean
  isOwner: boolean
  editableFields: string[]
}

export type CollaborativeEntity =
  | 'student'
  | 'docente'
  | 'padre'
  | 'spf_transaction'
  | 'convocatoria'

/**
 * Hook/Función pura para determinar permisos de un usuario sobre una entidad
 * según el patrón "Collaborative Data Ownership".
 */
export function useEntityPermissions(
  entityType: CollaborativeEntity,
  actorRole: Role | null,
  actorSubRole: SubRole | null = null,
  isEntityOwner: boolean = false
): EntityPermissions {
  const perms: EntityPermissions = {
    canCreate: false,
    canEdit: false,
    canValidate: false,
    canApproveFinance: false,
    isOwner: isEntityOwner,
    editableFields: [],
  }

  if (!actorRole) return perms

  switch (entityType) {
    case 'student':
      if (actorRole === 'director') {
        perms.canCreate = true
        perms.canEdit = true
        perms.canValidate = true
        perms.editableFields = ['*']
      } else if (actorRole === 'docente') {
        perms.canCreate = true
        perms.canEdit = true
        perms.canValidate = true
        perms.editableFields = ['*']
      } else if (actorRole === 'padre') {
        perms.canCreate = true
        perms.canEdit = isEntityOwner
        perms.canValidate = false
        perms.editableFields = isEntityOwner
          ? ['first_name', 'last_name', 'curp', 'grado', 'notes']
          : []
      }
      break

    case 'docente':
      if (actorRole === 'director') {
        perms.canCreate = true
        perms.canEdit = true
        perms.canValidate = true
        perms.editableFields = ['*']
      } else if (actorRole === 'docente') {
        perms.canEdit = isEntityOwner
        perms.editableFields = isEntityOwner ? ['full_name', 'phone'] : []
      }
      break

    case 'padre':
      if (actorRole === 'director' || actorRole === 'docente') {
        perms.canCreate = true
        perms.canEdit = true
        perms.canValidate = true
        perms.editableFields = ['*']
      } else if (actorRole === 'padre') {
        perms.canCreate = true
        perms.canEdit = isEntityOwner
        perms.editableFields = isEntityOwner ? ['full_name', 'phone'] : []
      }
      break

    case 'spf_transaction':
      if (
        actorRole === 'director' ||
        actorSubRole === 'presidente' ||
        actorSubRole === 'tesorero'
      ) {
        perms.canCreate = true
        perms.canEdit = true
        perms.canValidate = true
        perms.canApproveFinance = true
        perms.editableFields = ['*']
      }
      break

    case 'convocatoria':
      if (actorRole === 'director' || actorSubRole === 'presidente' || actorSubRole === 'secretario') {
        perms.canCreate = true
        perms.canEdit = true
        perms.canValidate = true
        perms.editableFields = ['*']
      }
      break
  }

  // Regla general para SPF finance
  if (actorRole === 'director' || actorSubRole === 'presidente' || actorSubRole === 'tesorero') {
    perms.canApproveFinance = true
  }

  return perms
}
