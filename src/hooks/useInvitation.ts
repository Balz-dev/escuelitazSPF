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
    invitedBy: string; // Nuevo
    subRole?: string | null;
    specialty?: string;
    grade?: string;
    section?: string;
    groupId?: string;
  }): Promise<InvitationCredentials | null> => {
    setIsInviting(true);
    setError(null);

    try {
      let finalGroupId = params.groupId;

      // Si es docente y tiene grado/sección pero NO groupId, intentamos buscar o crear el grupo
      if (params.role === 'docente' && !finalGroupId && params.grade && params.section) {
        const { SupabaseDirectorService } = await import('@/infrastructure/supabase/services/SupabaseDirectorService');
        const directorService = new SupabaseDirectorService();
        
        const groups = await directorService.getGroups(params.schoolId);
        const existingGroup = groups.find(g => g.grade === params.grade && g.name === params.section);
        
        if (existingGroup) {
          finalGroupId = existingGroup.id;
        } else {
          const newGroup = await directorService.createGroup(params.schoolId, params.grade!, params.section!);
          finalGroupId = newGroup.id;
        }
      }

      const credentials = await invitationService.inviteMember({
        ...params,
        invitedBy: params.invitedBy,
        groupId: finalGroupId
      });
      return credentials;
    } catch (err: any) {
      console.error('Error in useInvitation:', err);
      setError(err.message || 'Error al procesar la invitación');
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
