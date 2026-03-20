import { createClient } from '../client'
import { Tables } from '../database.types'

type OnboardingRequestRow = Tables<'school_onboarding_requests'>

export class SupabaseAdminService {
  private supabase = createClient()

  async getOnboardingRequests(): Promise<OnboardingRequestRow[]> {
    const { data, error } = await this.supabase
      .from('school_onboarding_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async approveRequest(requestId: string, data: {
    schoolName: string;
    directorName: string;
    contactPhone: string;
    contactEmail?: string;
    requesterRole?: string;
    requesterName?: string;
  }) {
    // 1. Crear la escuela
    // Generamos un identificador simple basado en el nombre
    const identifier = data.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20) + '-' + Math.random().toString(36).substring(2, 5)
    
    const { data: school, error: schoolError } = await this.supabase
      .from('schools')
      .insert({
        name: data.schoolName,
        identifier: identifier,
        is_active: true,
        subscription_status: 'trial',
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail
      })
      .select()
      .single()

    if (schoolError) throw schoolError

    // 2. Llamar a la Edge Function para invitar al Director
    const { data: inviteData, error: inviteError } = await this.supabase.functions.invoke('invite-user', {
      body: {
        emailOrPhone: data.contactPhone, // Preferimos el teléfono para WhatsApp
        role: data.requesterRole || 'director',
        schoolId: school.id,
        metadata: {
          full_name: data.requesterName || data.directorName
        }
      }
    })

    if (inviteError) throw inviteError

    // 3. Actualizar el estado de la solicitud
    const { error: updateError } = await this.supabase
      .from('school_onboarding_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)

    if (updateError) throw updateError

    return {
      success: true,
      school,
      credentials: inviteData // Contiene tempPassword y username
    }
  }

  async rejectRequest(requestId: string) {
    const { error } = await this.supabase
      .from('school_onboarding_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
    
    if (error) throw error
    return { success: true }
  }
}
