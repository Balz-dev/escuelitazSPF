import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { SupabaseAuthService } from '../SupabaseAuthService'
import { createClient } from '../../client'

vi.mock('../../client', () => ({
  createClient: vi.fn(),
}))

describe('SupabaseAuthService', () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as Mock).mockReturnValue(mockSupabase)
  })

  it('inicia sesión directamente con email si el identificador contiene @', async () => {
    const service = new SupabaseAuthService()
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { user: {} }, error: null })

    await service.signInWithPassword('test@example.com', 'pwd123')

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'pwd123'
    })
    expect(mockSupabase.rpc).not.toHaveBeenCalled()
  })

  it('resuelve el username antes de iniciar sesión si no es email ni teléfono', async () => {
    const service = new SupabaseAuthService()
    
    // Mock de la función RPC que resuelve el usuario
    mockSupabase.rpc.mockResolvedValue({ 
      data: [{ email: 'real-email@example.com', phone: null }], 
      error: null 
    })
    
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { user: {} }, error: null })

    await service.signInWithPassword('maestra.juanita', 'pwd123')

    expect(mockSupabase.rpc).toHaveBeenCalledWith('resolve_identifier_by_username', { 
      p_username: 'maestra.juanita' 
    })
    
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'real-email@example.com',
      password: 'pwd123'
    })
  })
})
