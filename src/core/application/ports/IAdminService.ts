import { Tables } from '@/infrastructure/supabase/database.types'

export type OnboardingRequest = Tables<'school_onboarding_requests'>

export interface ApproveRequestResult {
  success: boolean
  school: any
  credentials: any
}

export interface IAdminService {
  getOnboardingRequests(): Promise<OnboardingRequest[]>
  approveRequest(requestId: string, data: {
    schoolName: string;
    directorName: string;
    contactPhone: string;
    contactEmail?: string;
    requesterRole?: string;
    requesterName?: string;
  }): Promise<ApproveRequestResult>
  rejectRequest(requestId: string, reason?: string): Promise<{ success: boolean }>
  deleteRequest(requestId: string): Promise<{ success: boolean }>
  updateRequest(requestId: string, data: Partial<OnboardingRequest>): Promise<{ success: boolean }>
}
