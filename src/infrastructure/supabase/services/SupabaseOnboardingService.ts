import { createClient } from '../client'

export class SupabaseOnboardingService {
  private supabase = createClient()

  async requestAccess(data: {
    schoolName: string;
    directorName: string;
    contactPhone: string;
    contactEmail?: string;
    requesterName?: string;
    requesterRole?: string;
  }): Promise<{ success: boolean }> {
    const { error } = await this.supabase
      .from('school_onboarding_requests')
      .insert({
        school_name: data.schoolName,
        director_name: data.directorName,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        requester_name: data.requesterName || data.directorName,
        requester_role: data.requesterRole || 'director',
        status: 'pending'
      })

    if (error) throw error
    return { success: true }
  }
}
