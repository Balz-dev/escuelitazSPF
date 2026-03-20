import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LocalProfileService } from '@/infrastructure/offline/LocalProfileService'

// Mock Dexie / db
vi.mock('@/infrastructure/offline/db', () => {
  const store = new Map<string, Record<string, unknown>>()
  return {
    db: {
      localUserProfile: {
        get: vi.fn(async (id: string) => store.get(id) ?? undefined),
        put: vi.fn(async (record: { id: string; [key: string]: unknown }) => {
          store.set(record.id, record)
        }),
      },
    },
  }
})

describe('LocalProfileService', () => {
  let service: LocalProfileService

  beforeEach(() => {
    service = new LocalProfileService()
  })

  it('getProfile — devuelve null si no existe', async () => {
    const result = await service.getProfile('nonexistent-uuid')
    expect(result).toBeNull()
  })

  it('saveProfile — guarda y recupera bio correctamente', async () => {
    await service.saveProfile('user-123', { bio: 'Hola soy director' })
    const profile = await service.getProfile('user-123')
    expect(profile).not.toBeNull()
    expect(profile?.bio).toBe('Hola soy director')
    expect(profile?.id).toBe('user-123')
    expect(profile?.updatedAt).toBeTruthy()
  })

  it('saveAvatar — guarda el blob correctamente', async () => {
    const blob = new Blob(['fake-image-data'], { type: 'image/png' })
    const file = new File([blob], 'avatar.png', { type: 'image/png' })
    await service.saveProfile('user-456', { bio: 'Test' })
    await service.saveAvatar('user-456', file)

    const profile = await service.getProfile('user-456')
    expect(profile?.avatarBlob).toBeTruthy()
    expect(profile?.avatarMimeType).toBe('image/png')
  })

  it('isProfileComplete — false si no existe perfil', async () => {
    const complete = await service.isProfileComplete('user-never-saved')
    expect(complete).toBe(false)
  })

  it('isProfileComplete — true si tiene bio', async () => {
    await service.saveProfile('user-789', { bio: 'Tengo bio' })
    const complete = await service.isProfileComplete('user-789')
    expect(complete).toBe(true)
  })
})
