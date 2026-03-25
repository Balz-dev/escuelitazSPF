import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseAuthService } from './SupabaseAuthService'

// Mock del cliente Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    signOut: vi.fn(),
  },
  functions: {
    invoke: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
}

vi.mock('../client', () => ({
  createClient: () => mockSupabase,
}))

describe('SupabaseAuthService', () => {
  let authService: SupabaseAuthService

  beforeEach(() => {
    authService = new SupabaseAuthService()
    vi.clearAllMocks()
  })

  it('obtiene el perfil del usuario actual mapeado correctamente', async () => {
    const rawUser = { id: 'user-123', email: 'test@example.com' }
    const rawProfile = {
      id: 'user-123',
      full_name: 'Juan Pérez',
      avatar_url: 'http://avatar.jpg',
      phone: '555-1234',
      must_change_password: true,
      created_at: '2024-01-01T10:00:00Z',
    }

    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: rawUser }, error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: rawProfile, error: null })

    const profile = await authService.getCurrentUser()

    expect(profile).toBeDefined()
    expect(profile?.fullName).toBe('Juan Pérez')
    expect(profile?.mustChangePassword).toBe(true)
    expect(profile?.createdAt).toBeInstanceOf(Date)
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
  })

  it('retorna null si el perfil no existe en la tabla de perfiles', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u' } }, error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

    const profile = await authService.getCurrentUser()
    expect(profile).toBeNull()
  })

  it('invita a un miembro llamando a la edge function correctamente', async () => {
    const mockResponse = {
      data: {
        success: true,
        tempPassword: 'pedro1234',
        username: 'pedro',
        loginUrl: 'http://localhost/login'
      },
      error: null
    }

    // @ts-ignore
    mockSupabase.functions.invoke.mockResolvedValueOnce(mockResponse)

    const result = await authService.inviteMember('test@email.com', 'school-123', 'docente', { full_name: 'Pedro Páramo' })

    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('invite-user', {
      body: {
        emailOrPhone: 'test@email.com',
        schoolId: 'school-123',
        role: 'docente',
        metadata: { full_name: 'Pedro Páramo' }
      }
    })
    expect(result.tempPassword).toBe('pedro1234')
  })

  it('llama a la edge function reset-password correctamente y devuelve la clave', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'Contraseña reseteada exitosamente',
        tempPassword: 'temp5678'
      },
      error: null
    }

    mockSupabase.functions.invoke.mockResolvedValueOnce(mockResponse)

    const result = await authService.resetUserPassword('user-target-123')

    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('reset-password', {
      body: {
        targetUserId: 'user-target-123'
      }
    })
    expect(result).toBe('temp5678')
  })

  it('lanza error si la edge function de resetear contraseña falla', async () => {
    mockSupabase.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: new Error('Internal function error')
    })

    await expect(authService.resetUserPassword('user-target-123')).rejects.toThrow('Error al resetear contraseña: Internal function error')
  })

  describe('getRoleFromUser', () => {
    it('extrae el rol de app_metadata si existe', () => {
      const user = {
        app_metadata: { role: 'admin' },
        user_metadata: {}
      } as any
      expect(authService.getRoleFromUser(user)).toBe('admin')
    })

    it('extrae el rol de user_metadata si no existe en app_metadata', () => {
      const user = {
        app_metadata: {},
        user_metadata: { role: 'director' }
      } as any
      expect(authService.getRoleFromUser(user)).toBe('director')
    })

    it('retorna null si no hay rol en los metadatos', () => {
      const user = {
        app_metadata: {},
        user_metadata: {}
      } as any
      expect(authService.getRoleFromUser(user)).toBeNull()
    })
  })
})
