import { useState } from 'react';
import { SupabaseInvitationService } from '@/infrastructure/supabase/services/SupabaseInvitationService';
import { InvitationCredentials } from '@/core/application/ports/IInvitationService';

const invitationService = new SupabaseInvitationService();

/**
 * Hook para manejar la lógica de invitación de usuarios.
 * Capa: UI (Hook de Integración)
 */
export function useInvitation() {
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteMember = async (params: {
    emailOrPhone: string;
    fullName: string;
    role: 'docente' | 'padre' | 'director';
    schoolId: string;
    subRole?: string | null;
  }): Promise<InvitationCredentials | null> => {
    setIsInviting(true);
    setError(null);

    try {
      const credentials = await invitationService.inviteMember(params);
      return credentials;
    } catch (err: any) {
      console.error('Error in inviteMember:', err);
      setError(err.message || 'Error desconocido al invitar');
      return null;
    } finally {
      setIsInviting(false);
    }
  };

  return {
    inviteMember,
    isInviting,
    error
  };
}
