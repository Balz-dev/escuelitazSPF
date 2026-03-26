import { createClient } from '../client';
import { IInvitationService, InvitationCredentials } from '@/core/application/ports/IInvitationService';

/**
 * Implementación de IInvitationService usando Supabase Edge Functions.
 * Capa: Infraestructura
 */
export class SupabaseInvitationService implements IInvitationService {
  private supabase = createClient();

  async inviteMember(params: {
    emailOrPhone: string;
    fullName: string;
    role: 'docente' | 'padre' | 'director';
    schoolId: string;
    invitedBy: string;
    subRole?: string | null;
    groupId?: string | null;
    specialty?: string | null;
  }): Promise<InvitationCredentials> {
    const { data, error } = await this.supabase.functions.invoke('invite-user', {
      body: {
        emailOrPhone: params.emailOrPhone,
        role: params.role,
        subRole: params.subRole,
        schoolId: params.schoolId,
        invitedBy: params.invitedBy,
        groupId: params.groupId,
        specialty: params.specialty,
        metadata: {
          full_name: params.fullName
        }
      }
    });

    if (error) {
      throw new Error(error.message || 'Error al enviar invitación');
    }

    if (!data) {
      throw new Error('No se recibieron credenciales de la invitación');
    }

    return {
      tempPassword: data.tempPassword,
      username: data.username
    };
  }
}
