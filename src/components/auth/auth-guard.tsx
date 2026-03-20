"use client"

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/infrastructure/supabase/client'

export interface AuthGuardProps {
  children: React.ReactNode
}

const PUBLIC_PATHS = ['/', '/demo', '/login', '/register', '/enroll', '/set-password', '/suspended']

function isPublicPath(pathname: string | null): boolean {
  if (!pathname) return false
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith('/demo/')
  )
}

/**
 * AuthGuard — Guardián de rutas para la PWA (Static Export, sin SSR).
 *
 * Estrategia de sesión persistente:
 * ─────────────────────────────────
 * Supabase guarda el token JWT en localStorage ('escuelitaz-auth-session').
 * onAuthStateChange dispara INITIAL_SESSION al montar el componente con la
 * sesión ya recuperada desde localStorage, sin necesidad de login.
 *
 * Esto permite que usuarios que cierran y reabren la PWA instalada
 * permanezcan autenticados sin escribir usuario/contraseña de nuevo.
 *
 * autoRefreshToken en el cliente renueva el JWT silenciosamente antes de
 * que expire (por defecto a la hora), extendiendo la sesión indefinidamente
 * mientras el dispositivo tenga conexión al menos ocasionalmente.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()

  // null = aún evaluando; false = no autenticado; object = sesión activa
  const [session, setSession] = React.useState<any>(null)
  const [isChecked, setIsChecked] = React.useState(false)

  React.useEffect(() => {
    const supabase = createClient()

    // onAuthStateChange captura INICIAL_SESSION con la sesión de localStorage
    // y cualquier cambio posterior (login, logout, token refresh).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)

        const onPublicPath = isPublicPath(pathname)

        // Sin sesión activa → redirigir al login si la ruta es protegida
        if (!currentSession && !onPublicPath) {
          router.push('/login')
          setIsChecked(true)
          return
        }

        // Con sesión activa → redirigir si está en login, o verificar escuela si no
        if (currentSession) {
          if (pathname === '/login') {
            const role = currentSession.user?.user_metadata?.role
            switch (role) {
              case 'director': router.push('/director'); break
              case 'docente': router.push('/docente'); break
              case 'superadmin': router.push('/admin/requests'); break
              case 'padre': router.push('/padre'); break
              default: router.push('/dashboard'); break
            }
            setIsChecked(true)
            return
          }

          if (!onPublicPath) {
            const schoolId = currentSession.user?.user_metadata?.school_id
            if (schoolId) {
              const { data: school, error } = await supabase
                .from('schools')
                .select('is_active')
                .eq('id', schoolId)
                .single()

              if (!error && school && !school.is_active) {
                router.push('/suspended')
                setIsChecked(true)
                return
              }
            }
          }
        }

        setIsChecked(true)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  // Mostrar spinner solo en rutas protegidas mientras se restaura la sesión
  if (!isChecked && !isPublicPath(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
          <p className="text-xs text-muted-foreground">Verificando sesión…</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
