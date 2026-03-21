import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthGuard } from '../auth-guard'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/infrastructure/supabase/client'
import React from 'react'

// Mocks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@/infrastructure/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('AuthGuard', () => {
  const mockPush = vi.fn()
  const mockSupabase = {
    auth: {
      onAuthStateChange: vi.fn((_cb: unknown) => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { is_active: true }, error: null })),
        })),
      })),
    })),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as Mock).mockReturnValue({ push: mockPush })
    ;(createClient as Mock).mockReturnValue(mockSupabase)
  })

  it('permite acceso inmediato a rutas públicas sin sesión', () => {
    ;(usePathname as Mock).mockReturnValue('/login')
    
    render(<AuthGuard><div>Contenido Público</div></AuthGuard>)
    
    expect(screen.getByText('Contenido Público')).toBeInTheDocument()
  })

  it('redirige a /login si no hay sesión en una ruta protegida', async () => {
    ;(usePathname as Mock).mockReturnValue('/director')
    
    // Capturamos el callback de onAuthStateChange
    let authCallback: (event: string, session: any) => Promise<void>
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
      authCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })

    render(<AuthGuard><div>Contenido Protegido</div></AuthGuard>)
    
    // Simulamos evento sin sesión
    await authCallback!('SIGNED_OUT', null)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('redirige a /unauthorized si hay sesión pero no hay rol', async () => {
    ;(usePathname as Mock).mockReturnValue('/dashboard')
    
    let authCallback: (event: string, session: any) => Promise<void>
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
      authCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })

    render(<AuthGuard><div>Dashboard</div></AuthGuard>)
    
    // Sesión con rol null
    const mockSession = { user: { app_metadata: { role: null }, user_metadata: {} } }
    await authCallback!('SIGNED_IN', mockSession)

    expect(mockPush).toHaveBeenCalledWith('/unauthorized')
  })

  it('redirige a /director si un usuario con rol Director entra en la raíz /', async () => {
    ;(usePathname as Mock).mockReturnValue('/')
    
    let authCallback: (event: string, session: any) => Promise<void>
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
      authCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })

    render(<AuthGuard><div>Home</div></AuthGuard>)
    
    const mockSessionArr = { user: { app_metadata: { role: 'director' } } }
    await authCallback!('SIGNED_IN', mockSessionArr)

    expect(mockPush).toHaveBeenCalledWith('/director')
  })

  it('redirige a /admin/requests si un Super Admin entra en login', async () => {
    ;(usePathname as Mock).mockReturnValue('/login')
    
    let authCallback: (event: string, session: any) => Promise<void>
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
      authCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })

    render(<AuthGuard><div>Login</div></AuthGuard>)
    
    const mockSession = { user: { app_metadata: { role: 'superadmin' } } }
    await authCallback!('SIGNED_IN', mockSession)

    expect(mockPush).toHaveBeenCalledWith('/admin/requests')
  })
})
