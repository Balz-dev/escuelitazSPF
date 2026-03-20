'use client'

import { useState, useEffect, useCallback } from 'react'
import { localProfileService } from '@/infrastructure/offline/LocalProfileService'
import type { LocalUserProfile } from '@/infrastructure/offline/db'

interface UseLocalProfileReturn {
  profile: LocalUserProfile | null
  avatarUrl: string | null
  isLoading: boolean
  saveProfile: (data: Partial<Omit<LocalUserProfile, 'id'>>) => Promise<void>
  saveAvatar: (file: File) => Promise<void>
  deleteAvatar: () => Promise<void>
}

/**
 * Hook para leer y escribir el perfil local del usuario desde IndexedDB.
 * El avatar se expone como un Object URL que se revoca automáticamente.
 */
export function useLocalProfile(userId: string | undefined): UseLocalProfileReturn {
  const [profile, setProfile] = useState<LocalUserProfile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Referencia para revocar el Object URL anterior
  let currentObjectUrl: string | null = null

  const load = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const p = await localProfileService.getProfile(userId)
      setProfile(p)

      // Generar Object URL del avatar si existe
      if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
      const url = await localProfileService.getAvatarObjectUrl(userId)
      currentObjectUrl = url
      setAvatarUrl(url)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
    return () => {
      if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
    }
  }, [load])

  const saveProfile = useCallback(async (data: Partial<Omit<LocalUserProfile, 'id'>>) => {
    if (!userId) return
    await localProfileService.saveProfile(userId, data)
    await load()
  }, [userId, load])

  const saveAvatar = useCallback(async (file: File) => {
    if (!userId) return
    await localProfileService.saveAvatar(userId, file)
    await load()
  }, [userId, load])

  const deleteAvatar = useCallback(async () => {
    if (!userId) return
    await localProfileService.deleteAvatar(userId)
    setAvatarUrl(null)
    await load()
  }, [userId, load])

  return { profile, avatarUrl, isLoading, saveProfile, saveAvatar, deleteAvatar }
}
