import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

/**
 * Crea el cliente de Supabase para uso en el navegador (PWA / Static Export).
 *
 * Opciones de autenticación explícitas para garantizar sesiones persistentes:
 * - persistSession: guarda la sesión en localStorage del dispositivo
 * - autoRefreshToken: renueva el JWT automáticamente antes de expirar
 * - detectSessionInUrl: captura tokens de magic links / invitaciones
 *
 * Estas opciones permiten que el usuario permanezca autenticado incluso al
 * cerrar y volver a abrir la app instalada como PWA.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'escuelitaz-auth-session',
      },
    }
  )
}
