import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useLocalProfile } from '@/features/director/hooks/useLocalProfile'

const mockService = {
  getProfile: vi.fn(),
  saveProfile: vi.fn(),
  saveAvatar: vi.fn(),
  deleteAvatar: vi.fn(),
  getAvatarObjectUrl: vi.fn(),
}

vi.mock('@/infrastructure/offline/LocalProfileService', () => ({
  localProfileService: mockService,
}))

describe('useLocalProfile', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  describe('Carga inicial', () => {

    it('no carga si userId es undefined', async () => {
      const { result } = renderHook(() => useLocalProfile(undefined))

      expect(result.current.isLoading).toBe(false)
      expect(result.current.profile).toBeNull()
      expect(mockService.getProfile).not.toHaveBeenCalled()
    })

    it('carga el perfil del usuario', async () => {
      const mockProfile = {
        id: 'user-123',
        bio: 'Soy director',
        fullName: 'Juan Pérez',
      }
      mockService.getProfile.mockResolvedValueOnce(mockProfile)
      mockService.getAvatarObjectUrl.mockResolvedValueOnce(null)

      const { result } = renderHook(() => useLocalProfile('user-123'))

      await waitFor(() => !result.current.isLoading)

      expect(mockService.getProfile).toHaveBeenCalledWith('user-123')
      expect(result.current.profile).toEqual(mockProfile)
    })

    it('carga el avatar URL si existe', async () => {
      const mockProfile = { id: 'user-123', bio: 'Test' }
      mockService.getProfile.mockResolvedValueOnce(mockProfile)
      mockService.getAvatarObjectUrl.mockResolvedValueOnce('blob:avatar-url')

      const { result } = renderHook(() => useLocalProfile('user-123'))

      await waitFor(() => !result.current.isLoading)

      expect(result.current.avatarUrl).toBe('blob:avatar-url')
    })

    it('inicia con avatar null si no hay avatar', async () => {
      const mockProfile = { id: 'user-123', bio: 'Test' }
      mockService.getProfile.mockResolvedValueOnce(mockProfile)
      mockService.getAvatarObjectUrl.mockResolvedValueOnce(null)

      const { result } = renderHook(() => useLocalProfile('user-123'))

      await waitFor(() => !result.current.isLoading)

      expect(result.current.avatarUrl).toBeNull()
    })

    it('revoca el Object URL anterior al recargar', async () => {
      const mockProfile = { id: 'user-123', bio: 'Test' }
      mockService.getProfile.mockResolvedValue(mockProfile)
      mockService.getAvatarObjectUrl.mockResolvedValue('blob:new-url')

      const { result } = renderHook(() => useLocalProfile('user-123'))

      await waitFor(() => !result.current.isLoading)

      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  describe('saveProfile', () => {

    it('guarda los datos del perfil y recarga', async () => {
      const mockProfile = { id: 'user-123', bio: 'Actualizado' }
      mockService.getProfile.mockResolvedValue(mockProfile)
      mockService.getAvatarObjectUrl.mockResolvedValue(null)

      const { result } = renderHook(() => useLocalProfile('user-123'))

      await waitFor(() => !result.current.isLoading)

      await act(async () => {
        await result.current.saveProfile({ bio: 'Nuevo bio' })
      })

      expect(mockService.saveProfile).toHaveBeenCalledWith('user-123', { bio: 'Nuevo bio' })
      expect(mockService.getProfile).toHaveBeenCalledTimes(2)
    })

    it('no hace nada si userId es undefined', async () => {
      const { result } = renderHook(() => useLocalProfile(undefined))

      await act(async () => {
        await result.current.saveProfile({ bio: 'Test' })
      })

      expect(mockService.saveProfile).not.toHaveBeenCalled()
    })
  })

  describe('saveAvatar', () => {

    it('guarda el avatar y recarga el perfil', async () => {
      const mockProfile = { id: 'user-123', bio: 'Test' }
      const mockFile = new File(['image'], 'avatar.png', { type: 'image/png' })

      mockService.getProfile.mockResolvedValue(mockProfile)
      mockService.getAvatarObjectUrl.mockResolvedValue('blob:new-avatar')

      const { result } = renderHook(() => useLocalProfile('user-123'))

      await waitFor(() => !result.current.isLoading)

      await act(async () => {
        await result.current.saveAvatar(mockFile)
      })

      expect(mockService.saveAvatar).toHaveBeenCalledWith('user-123', mockFile)
      expect(mockService.getProfile).toHaveBeenCalledTimes(2)
    })

    it('no hace nada si userId es undefined', async () => {
      const { result } = renderHook(() => useLocalProfile(undefined))
      const mockFile = new File(['image'], 'a.png', { type: 'image/png' })

      await act(async () => {
        await result.current.saveAvatar(mockFile)
      })

      expect(mockService.saveAvatar).not.toHaveBeenCalled()
    })
  })

  describe('deleteAvatar', () => {

    it('elimina el avatar y actualiza el estado', async () => {
      const mockProfile = { id: 'user-123', bio: 'Test' }
      mockService.getProfile.mockResolvedValue(mockProfile)
      mockService.getAvatarObjectUrl.mockResolvedValue(null)

      const { result } = renderHook(() => useLocalProfile('user-123'))

      await waitFor(() => !result.current.isLoading)

      await act(async () => {
        await result.current.deleteAvatar()
      })

      expect(mockService.deleteAvatar).toHaveBeenCalledWith('user-123')
      expect(result.current.avatarUrl).toBeNull()
      expect(mockService.getProfile).toHaveBeenCalledTimes(2)
    })

    it('no hace nada si userId es undefined', async () => {
      const { result } = renderHook(() => useLocalProfile(undefined))

      await act(async () => {
        await result.current.deleteAvatar()
      })

      expect(mockService.deleteAvatar).not.toHaveBeenCalled()
    })
  })

  describe('Limpieza al desmontar', () => {

    it('revoca Object URL al desmontar el hook', async () => {
      const mockProfile = { id: 'user-123', bio: 'Test' }
      mockService.getProfile.mockResolvedValue(mockProfile)
      mockService.getAvatarObjectUrl.mockResolvedValue('blob:cleanup-url')

      const { result, unmount } = renderHook(() => useLocalProfile('user-123'))

      await waitFor(() => !result.current.isLoading)

      unmount()

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })
})
