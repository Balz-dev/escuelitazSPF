import { createClient } from '../client'
import { IAuthService } from '@/core/application/ports/IAuthService'
import { UserProfile } from '@/core/domain/entities/User'

export class SupabaseAuthService implements IAuthService {
  private supabase = createClient()

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession()
    if (error) return null
    return data.session
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error || !user) return null

    // Buscamos el perfil asociado en la tabla pública
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return null

    return {
      id: profile.id,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      phone: profile.phone,
      mustChangePassword: profile.must_change_password,
      createdAt: new Date(profile.created_at),
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw new Error(`Error al cerrar sesión: ${error.message}`)
  }

  async signInWithOtp(emailOrPhone: string): Promise<void> {
    const isEmail = emailOrPhone.includes('@');
    const { error } = await this.supabase.auth.signInWithOtp(
      isEmail ? { email: emailOrPhone } : { phone: emailOrPhone }
    );
    if (error) throw new Error(`Error al solicitar el código: ${error.message}`);
  }

  async verifyOtp(emailOrPhone: string, token: string): Promise<any> {
    const isEmail = emailOrPhone.includes('@');
    
    // @ts-ignore - Some Supabase types strictly prefer the explicit union structure
    const { data, error } = await this.supabase.auth.verifyOtp(
      isEmail 
        ? { email: emailOrPhone, token, type: 'magiclink' }
        : { phone: emailOrPhone, token, type: 'sms' }
    );

    if (error) throw new Error(`Error de verificación: ${error.message}`);
    return data;
  }

  async inviteMember(emailOrPhone: string, schoolId: string, role: string, metadata?: any): Promise<any> {
    // Invocamos la Edge Function para manejar la creación segura del usuario e invitación
    const { data, error } = await this.supabase.functions.invoke('invite-user', {
      body: { emailOrPhone, role, schoolId, metadata },
    });

    if (error) throw new Error(`Error en la invitación: ${error.message}`);
    if (data?.error) throw new Error(`Error de la función: ${data.error}`);

    return data;
  }
}
