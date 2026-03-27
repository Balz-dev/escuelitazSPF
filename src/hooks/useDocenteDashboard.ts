'use client'

import { useState, useEffect, useCallback } from 'react'
import { SupabaseDocenteService } from '@/infrastructure/supabase/services/SupabaseDocenteService'
import { DocenteDashboardStats } from '@/core/application/ports/IDocenteService'

const docenteService = new SupabaseDocenteService()

interface UseDocenteDashboardResult {
  stats: DocenteDashboardStats | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Hook de UI que provee métricas del dashboard al Docente.
 * Filtra los datos según el contexto del docente (escuela y grupo).
 */
export function useDocenteDashboard(
  schoolId: string | undefined, 
  groupId: string | null | undefined
): UseDocenteDashboardResult {
  const [stats, setStats] = useState<DocenteDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!schoolId) return

    setIsLoading(true)
    setError(null)
    try {
      const data = await docenteService.getDashboardStats(
        schoolId, 
        groupId || null
      )
      setStats(data)
    } catch (err: any) {
      console.error('[useDocenteDashboard] Error:', err)
      setError('No se pudieron cargar las estadísticas del docente.')
    } finally {
      setIsLoading(false)
    }
  }, [schoolId, groupId])

  useEffect(() => {
    load()
  }, [load])

  return { stats, isLoading, error, refresh: load }
}
