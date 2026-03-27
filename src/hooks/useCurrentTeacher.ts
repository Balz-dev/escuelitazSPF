'use client'

import { useState, useEffect } from 'react'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { SupabaseDocenteService } from '@/infrastructure/supabase/services/SupabaseDocenteService'
import { TeacherContext } from '@/core/application/ports/IDocenteService'

const authService = new SupabaseAuthService()
const docenteService = new SupabaseDocenteService()

/**
 * Hook que resuelve el contexto del docente logueado.
 * Provee acceso a memberId, schoolId, groupId y especialidad.
 */
export function useCurrentTeacher() {
  const [teacher, setTeacher] = useState<TeacherContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchTeacher = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (!user) {
          if (isMounted) {
            setError('No hay sesión activa')
            setIsLoading(false)
          }
          return
        }

        const context = await docenteService.getTeacherContext(user.id)
        if (isMounted) {
          if (!context) {
            setError('No se encontró el perfil de docente para este usuario o no tiene una membresía activa.')
          } else {
            setTeacher(context)
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[useCurrentTeacher] Error:', err)
          setError(err.message || 'Error al obtener el contexto del docente')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTeacher()

    return () => {
      isMounted = false
    }
  }, [])

  return { 
    teacher, 
    isLoading, 
    error,
    isAuthenticated: !!teacher 
  }
}
