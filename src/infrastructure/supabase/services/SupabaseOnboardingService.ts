import { createClient } from '../client'
import { IOnboardingService, OnboardingAccessRequest } from '@/core/application/ports/IOnboardingService'

export class SupabaseOnboardingService implements IOnboardingService {
  private supabase = createClient()

  async requestAccess(data: OnboardingAccessRequest): Promise<{ success: boolean }> {
    // Normalizar teléfono a E.164 (asumiendo +52 si son 10 dígitos)
    let finalPhone = data.contactPhone.replace(/\s+/g, '')
    if (finalPhone && !finalPhone.startsWith('+')) {
      const digits = finalPhone.replace(/\D/g, '')
      finalPhone = digits.length === 10 ? `+52${digits}` : `+${digits}`
    }

    const { error } = await this.supabase
      .from('school_onboarding_requests')
      .insert({
        school_name: data.schoolName,
        director_name: data.directorName,
        contact_phone: finalPhone,
        contact_email: data.contactEmail,
        requester_name: data.requesterName || data.directorName,
        requester_role: data.requesterRole || 'director',
        status: 'pending'
      })

    if (error) throw error
    return { success: true }
  }
}
