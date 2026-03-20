'use client'

import { useState, useEffect, useCallback } from 'react'
import { SupabaseConvocatoriaRepository } from '@/infrastructure/supabase/repositories/SupabaseConvocatoriaRepository'
import type { Convocatoria, CreateConvocatoriaDTO } from '@/core/domain/entities/Convocatoria'

const repo = new SupabaseConvocatoriaRepository()

export function useConvocatorias(schoolId: string | undefined) {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!schoolId) { setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    try {
      const data = await repo.getBySchool(schoolId)
      setConvocatorias(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [schoolId])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (dto: CreateConvocatoriaDTO) => {
    const created = await repo.create(dto)
    setConvocatorias(prev => [created, ...prev])
    return created
  }, [])

  const publish = useCallback(async (id: string) => {
    const updated = await repo.publish(id)
    setConvocatorias(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }, [])

  const close = useCallback(async (id: string) => {
    const updated = await repo.close(id)
    setConvocatorias(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }, [])

  const remove = useCallback(async (id: string) => {
    await repo.delete(id)
    setConvocatorias(prev => prev.filter(c => c.id !== id))
  }, [])

  return { convocatorias, isLoading, error, create, publish, close, remove, refresh: load }
}
