/**
 * Puerto de Servicio para el manejo de invitaciones a la plataforma.
 * Capa: Application
 */
export interface InvitationCredentials {
  tempPassword: string;
  username: string;
}

export interface IInvitationService {
  /**
   * Invita a un nuevo miembro (docente/padre) a la escuela.
   */
  inviteMember(params: {
    emailOrPhone: string;
    fullName: string;
    role: 'docente' | 'padre' | 'director';
    schoolId: string;
    subRole?: string | null;
    groupId?: string | null;
    specialty?: string | null;
  }): Promise<InvitationCredentials>;
}
