import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseInvitationService } from './SupabaseInvitationService';
import { createClient } from '../client';

// Mock del cliente de Supabase
vi.mock('../client', () => ({
  createClient: vi.fn(),
}));

describe('SupabaseInvitationService', () => {
  let service: SupabaseInvitationService;
  const mockInvoke = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue({
      functions: {
        invoke: mockInvoke,
      },
    });
    service = new SupabaseInvitationService();
  });

  it('debe invitar a un miembro exitosamente y retornar credenciales', async () => {
    const mockResponse = {
      data: {
        tempPassword: 'password123',
        username: 'jperez',
      },
      error: null,
    };
    mockInvoke.mockResolvedValue(mockResponse);

    const params = {
      emailOrPhone: '1234567890',
      fullName: 'Juan Perez',
      role: 'docente' as const,
      schoolId: 'school-123',
      invitedBy: 'director-123',
      specialty: 'Matemáticas',
      groupId: 'group-456'
    };

    const result = await service.inviteMember(params);

    expect(mockInvoke).toHaveBeenCalledWith('invite-user', {
      body: {
        emailOrPhone: params.emailOrPhone,
        role: params.role,
        subRole: undefined,
        schoolId: params.schoolId,
        invitedBy: params.invitedBy,
        specialty: 'Matemáticas',
        groupId: 'group-456',
        metadata: {
          full_name: params.fullName,
        },
      },
    });
    expect(result).toEqual({
      tempPassword: 'password123',
      username: 'jperez',
    });
  });

  it('debe lanzar un error si la función de Supabase falla', async () => {
    const mockError = {
      data: null,
      error: { message: 'Error de red' },
    };
    mockInvoke.mockResolvedValue(mockError);

    const params = {
      emailOrPhone: '1234567890',
      fullName: 'Juan Perez',
      role: 'docente' as const,
      schoolId: 'school-123',
      invitedBy: 'director-123',
    };

    await expect(service.inviteMember(params)).rejects.toThrow('Error de red');
  });

  it('debe lanzar un error si no se reciben datos del servidor', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: null });

    const params = {
      emailOrPhone: '1234567890',
      fullName: 'Juan Perez',
      role: 'docente' as const,
      schoolId: 'school-123',
      invitedBy: 'director-123',
    };

    await expect(service.inviteMember(params)).rejects.toThrow('No se recibieron credenciales de la invitación');
  });
});
