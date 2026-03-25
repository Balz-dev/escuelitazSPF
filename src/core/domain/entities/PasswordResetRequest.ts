export interface PasswordResetRequest {
  id: string
  userId: string
  schoolId: string
  status: 'pending' | 'completed' | 'canceled'
  createdAt: Date
  profiles?: {
    fullName: string | null
    username: string | null
    phone: string | null
  } | null
}
