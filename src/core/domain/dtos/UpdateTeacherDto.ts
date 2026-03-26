export interface UpdateTeacherDto {
  fullName?: string
  phone?: string
  specialty?: string
  isActive?: boolean
  userId?: string // Necesario para actualizar el perfil
}
