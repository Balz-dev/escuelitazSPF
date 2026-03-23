import { UserProfile } from '@/core/domain/entities/User'
import { AuthResponse, AuthTokenResponse, Session } from '@supabase/supabase-js'

export interface IAuthService {
  /**
   * Obtiene la sesión actual
   */
  getSession(): Promise<Session | null>

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
  verifyOtp(emailOrPhone: string, token: string): Promise<AuthResponse['data']>

  /**
   * Envía un link de invitación/acceso vía correo o teléfono invocando Edge Function
   */
  inviteMember(emailOrPhone: string, schoolId: string, role: string, metadata?: Record<string, unknown>): Promise<Record<string, unknown>>

  /**
   * Resetea la contraseña de un miembro específico a una contraseña temporal usando Edge Function
   */
  resetUserPassword(targetUserId: string): Promise<string>

  /**
   * Solicita el restablecimiento de contraseña para un usuario (notificando al Director)
   */
  requestPasswordReset(identifier: string): Promise<void>


  /**
   * Inicia sesión con el proveedor de Google.
   */
  signInWithGoogle(): Promise<void>

  /**
   * Inicia sesión con identificador (user/email/tel) y contraseña.
   */
  signInWithPassword(identifier: string, password: string): Promise<AuthResponse['data']>
}
