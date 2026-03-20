import { describe, it, expect } from 'vitest'
import { createClient as createBrowserClient } from './client'
import { createClient as createServerClient } from './server'

describe('Supabase Client Infrastructure', () => {
  it('instancia el cliente del navegador con los tipos correctos', () => {
    const supabase = createBrowserClient()
    expect(supabase).toBeDefined()
    // Verificamos que contenga métodos de autenticación (señal de carga correcta)
    expect(supabase.auth).toBeDefined()
  })

  it('instancia el cliente del servidor correctamente', async () => {
    // Nota: El cliente del servidor requiere mocks de cookies
    const supabase = await createServerClient()
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })
})
