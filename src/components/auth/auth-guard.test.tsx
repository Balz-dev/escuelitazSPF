import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import React from 'react'
import { AuthGuard } from './auth-guard'

const mockRouter = {
  push: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: vi.fn(() => '/dashboard'),
}))

const mockSupabase = {
  auth: {
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
}

vi.mock('@/infrastructure/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

describe('AuthGuard', () => {

  const TestComponent = () => <div data-testid="protected-content">Contenido Protegido</div>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rutas públicas', () => {

    it('muestra contenido en ruta pública /', async () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/')

      let callback: (event: string, session: unknown) => void
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
        callback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      await act(async () => { callback?.('INITIAL_SESSION', null) })
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).toBeInTheDocument()
      })
    })

    it('muestra contenido en ruta /login', async () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/login')

      let callback: (event: string, session: unknown) => void
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
        callback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      await act(async () => { callback?.('INITIAL_SESSION', null) })
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).toBeInTheDocument()
      })
    })

    it('muestra contenido en subrutas de /demo', async () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/demo/alguna-ruta')

      let callback: (event: string, session: unknown) => void
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
        callback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      await act(async () => { callback?.('INITIAL_SESSION', null) })
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).toBeInTheDocument()
      })
    })
  })

  describe('Redirecciones sin sesión', () => {

    it('redirige a /login si no hay sesión en ruta protegida', async () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/dashboard')

      let callback: (event: string, session: unknown) => void
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
        callback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      await act(async () => { callback?.('INITIAL_SESSION', null) })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('Redirecciones por rol', () => {

    it('redirige director a /director', async () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/login')

      let callback: (event: string, session: unknown) => void
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
        callback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      await act(async () => {
        callback?.('INITIAL_SESSION', { user: { user_metadata: { role: 'director' } } })
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/director')
      })
    })

    it('redirige docente a /docente', async () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/login')

      let callback: (event: string, session: unknown) => void
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
        callback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      await act(async () => {
        callback?.('INITIAL_SESSION', { user: { user_metadata: { role: 'docente' } } })
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/docente')
      })
    })

    it('redirige superadmin a /admin/requests', async () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/login')

      let callback: (event: string, session: unknown) => void
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
        callback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      await act(async () => {
        callback?.('INITIAL_SESSION', { user: { user_metadata: { role: 'superadmin' } } })
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/admin/requests')
      })
    })

    it('redirige padre a /padre', async () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/login')

      let callback: (event: string, session: unknown) => void
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
        callback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      await act(async () => {
        callback?.('INITIAL_SESSION', { user: { user_metadata: { role: 'padre' } } })
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/padre')
      })
    })

    it('redirige rol desconocido a /dashboard', async () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/login')

      let callback: (event: string, session: unknown) => void
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
        callback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      await act(async () => {
        callback?.('INITIAL_SESSION', { user: { user_metadata: { role: 'unknown' } } })
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Verificación de escuela activa', () => {

    it('redirige a /suspended si escuela inactiva', async () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/director')

      let callback: (event: string, session: unknown) => void
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
        callback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      mockSupabase.single.mockResolvedValueOnce({ data: { is_active: false }, error: null })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      await act(async () => {
        callback?.('INITIAL_SESSION', {
          user: { user_metadata: { role: 'director', school_id: 'school-123' } },
        })
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/suspended')
      })
    })

    it('permite acceso si escuela activa', async () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/director')

      let callback: (event: string, session: unknown) => void
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
        callback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      mockSupabase.single.mockResolvedValueOnce({ data: { is_active: true }, error: null })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      await act(async () => {
        callback?.('INITIAL_SESSION', {
          user: { user_metadata: { role: 'director', school_id: 'school-123' } },
        })
      })

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).toBeInTheDocument()
      })
    })
  })

  describe('Spinner de carga', () => {

    it('muestra spinner mientras verifica', () => {
      const usePathname = require('next/navigation').usePathname
      usePathname.mockReturnValueOnce('/dashboard')
      mockSupabase.auth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(<AuthGuard><TestComponent /></AuthGuard>)

      expect(screen.getByText('Verificando sesión…')).toBeInTheDocument()
    })
  })
})
