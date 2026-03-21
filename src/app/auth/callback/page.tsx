'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/infrastructure/supabase/client'

/**
 * Página de retorno (callback) para autenticación OAuth (Google).
 * Como el proyecto utiliza 'output: export', no podemos usar Route Handlers (route.ts).
 * Esta página usa el SDK de Supabase en el navegador para detectar el token/code
 * en la URL y establecer la sesión localmente.
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Escuchar cambios de estado para redirigir cuando la sesión se detecte
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event change in callback page:', event, session ? 'session exists' : 'no session');
      
      if (session) {
        // Redirigir al home o al dashboard
        router.push('/')
      } else if (event === 'SIGNED_OUT') {
        // En caso de fallo, volver al login
        router.push('/login?error=auth-failed')
      }
    })

    // Fail-safe: Verificación manual inmediata
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      } else if (error) {
        console.error('Error fetching session in callback:', error)
        router.push('/login?error=session-error')
      }
    };

    checkSession()

    // Tiempo límite para abortar si no hay respuesta (5 segundos)
    const timeoutId = setTimeout(() => {
      console.warn('Auth callback timeout reach');
       // No redirigimos forzosamente por si el usuario está eligiendo cuenta todavía
       // Pero podríamos mostrar un mensaje de error si no ocurrió nada
    }, 5000);

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] p-4 text-center">
      <div className="max-w-md w-full">
        <div className="relative mb-8 flex justify-center">
            <div className="absolute inset-0 bg-sky-500/20 blur-3xl rounded-full"></div>
            <div className="relative h-20 w-20 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400"></div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2 font-display">
          Vinculando tu cuenta...
        </h1>
        <p className="text-slate-400">
          Estamos estableciendo una sesión segura con Google. 
          Esto tomará solo un momento.
        </p>
        
        <div className="mt-12 text-xs text-slate-500 uppercase tracking-widest font-medium">
          Sistema de Autenticación Escuelitaz
        </div>
      </div>
    </div>
  )
}
