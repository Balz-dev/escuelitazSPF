export interface Teacher {
  memberId: string
  userId?: string
  fullName: string
  username?: string
  phone?: string
  specialty?: string
  isActive: boolean
  isSubstitute: boolean
  substitutedById?: string | null
  group: string
  groupId?: string
  studentCount: number
}
