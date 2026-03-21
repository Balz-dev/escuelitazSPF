import { createClient } from '../client'
import { IAuthService } from '@/core/application/ports/IAuthService'
import { UserProfile } from '@/core/domain/entities/User'
import { AuthResponse, Session } from '@supabase/supabase-js'

export class SupabaseAuthService implements IAuthService {
  private supabase = createClient()

  async getSession(): Promise<Session | null> {
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

  async signInWithPassword(identifier: string, password: string): Promise<AuthResponse['data']> {
    let finalIdentifier = identifier
    let isPhone = false

    // 1. Intentar resolver como username si no parece email ni teléfono directo
    if (!identifier.includes('@') && !identifier.startsWith('+') && isNaN(Number(identifier.slice(0, 5)))) {
      const { data, error } = await (this.supabase as any).rpc('resolve_identifier_by_username', { 
        p_username: identifier 
      });
      
      const results = data as { email: string | null; phone: string | null }[] | null
      
      if (!error && results && results.length > 0) {
        // PRIORIDADES: Preferimos Email (phantom o real), luego Phone
        const email = results[0].email
        const phone = results[0].phone
        
        finalIdentifier = email || phone || identifier
        isPhone = !!(!email && phone)
      }
    } else {
      // 2. Si parece teléfono directo (números), asegurar el '+'
      isPhone = !identifier.includes('@')
      if (isPhone && !finalIdentifier.startsWith('+')) {
        const digits = finalIdentifier.replace(/\D/g, '')
        finalIdentifier = digits.length === 10 ? `+52${digits}` : `+${digits}`
      }
    }

    const { data, error } = await this.supabase.auth.signInWithPassword(
      isPhone ? { phone: finalIdentifier, password } : { email: finalIdentifier, password }
    )
    if (error) throw error
    return data
  }

  async signInWithOtp(emailOrPhone: string): Promise<void> {
    const isEmail = emailOrPhone.includes('@');
    const { error } = await this.supabase.auth.signInWithOtp(
      isEmail ? { email: emailOrPhone } : { phone: emailOrPhone }
    );
    if (error) throw new Error(`Error al solicitar el código: ${error.message}`);
  }

  async verifyOtp(emailOrPhone: string, token: string): Promise<AuthResponse['data']> {
    const isEmail = emailOrPhone.includes('@');
    
    // @ts-ignore
    const { data, error } = await this.supabase.auth.verifyOtp(
      isEmail 
        ? { email: emailOrPhone, token, type: 'magiclink' }
        : { phone: emailOrPhone, token, type: 'sms' }
    );

    if (error) throw new Error(`Error de verificación: ${error.message}`);
    return data;
  }

  async inviteMember(emailOrPhone: string, schoolId: string, role: string, metadata?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data, error } = await this.supabase.functions.invoke('invite-user', {
      body: { emailOrPhone, role, schoolId, metadata },
    });

    if (error) throw new Error(`Error en la invitación: ${error.message}`);
    const result = data as Record<string, unknown>;
    if (result?.error) throw new Error(`Error de la función: ${result.error}`);

    return result;
  }
  
  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw new Error(`Error al iniciar sesión con Google: ${error.message}`)
  }
}
