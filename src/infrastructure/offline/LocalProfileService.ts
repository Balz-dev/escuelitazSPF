import { db, LocalUserProfile } from '@/infrastructure/offline/db'

/**
 * Servicio para gestionar el perfil personal del usuario de forma local.
 * Los datos (incluido el avatar como blob) se almacenan solo en IndexedDB.
 * NUNCA se sincronizan con Supabase — cumplen la regla de privacidad del dispositivo.
 */
export class LocalProfileService {
  /** Obtener el perfil local del usuario */
  async getProfile(userId: string): Promise<LocalUserProfile | null> {
    return (await db.localUserProfile.get(userId)) ?? null
  }

  /** Guardar o actualizar datos de perfil (sin imagen) */
  async saveProfile(userId: string, data: Partial<Omit<LocalUserProfile, 'id'>>): Promise<void> {
    const existing = await db.localUserProfile.get(userId)
    await db.localUserProfile.put({
      ...existing,
      ...data,
      id: userId,
      updatedAt: new Date().toISOString(),
    })
  }

  /**
   * Guardar el avatar del usuario como blob binario.
   * Acepta un File o Blob del <input type="file">.
   */
  async saveAvatar(userId: string, file: File | Blob): Promise<void> {
    const arrayBuffer = await file.arrayBuffer()
    const mimeType = file instanceof File ? file.type : 'image/jpeg'

    const existing = await db.localUserProfile.get(userId)
    await db.localUserProfile.put({
      ...existing,
      id: userId,
      avatarBlob: arrayBuffer,
      avatarMimeType: mimeType,
      updatedAt: new Date().toISOString(),
    })
  }

  /**
   * Generar una URL temporal de objeto para renderizar el avatar en un <img>.
   * Recuerda revocar la URL con URL.revokeObjectURL() cuando ya no sea necesaria.
   */
  async getAvatarObjectUrl(userId: string): Promise<string | null> {
    const profile = await db.localUserProfile.get(userId)
    if (!profile?.avatarBlob) return null

    const blob = new Blob([profile.avatarBlob], {
      type: profile.avatarMimeType ?? 'image/jpeg',
    })
    return URL.createObjectURL(blob)
  }

  /** Eliminar el avatar del usuario */
  async deleteAvatar(userId: string): Promise<void> {
    const existing = await db.localUserProfile.get(userId)
    if (!existing) return

    await db.localUserProfile.put({
      ...existing,
      avatarBlob: undefined,
      avatarMimeType: undefined,
      updatedAt: new Date().toISOString(),
    })
  }

  /** Verificar si el perfil está suficientemente completo (tiene bio o avatar) */
  async isProfileComplete(userId: string): Promise<boolean> {
    const profile = await db.localUserProfile.get(userId)
    return !!profile && (!!profile.bio || !!profile.avatarBlob)
  }
}

export const localProfileService = new LocalProfileService()
