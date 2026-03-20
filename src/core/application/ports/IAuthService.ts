import { UserProfile } from '@/core/domain/entities/User'

export interface IAuthService {
  /**
   * Obtiene la sesión actual
   */
  getSession(): Promise<any | null>

  /**
   * Obtiene el perfil de usuario actual
   */
  getCurrentUser(): Promise<UserProfile | null>

  /**
   * Cierra sesión
   */
  signOut(): Promise<void>

  /**
   * Solicita un código OTP (o Magic Link) enviado por correo o SMS.
   */
  signInWithOtp(emailOrPhone: string): Promise<void>

  /**
   * Verifica el OTP recibido y autentica al usuario.
   */
  verifyOtp(emailOrPhone: string, token: string): Promise<any>

  /**
   * Envía un link de invitación/acceso vía correo o teléfono invocando Edge Function
   */
  inviteMember(emailOrPhone: string, schoolId: string, role: string, metadata?: any): Promise<any>
}
