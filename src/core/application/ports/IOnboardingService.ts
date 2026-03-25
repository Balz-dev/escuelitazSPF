export interface OnboardingAccessRequest {
  schoolName: string;
  directorName: string;
  contactPhone: string;
  contactEmail?: string;
  requesterName?: string;
  requesterRole?: string;
}

export interface IOnboardingService {
  requestAccess(data: OnboardingAccessRequest): Promise<{ success: boolean }>
}
