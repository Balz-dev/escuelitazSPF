import { createClient } from '../client'

const BUCKET = 'school-assets'

/**
 * Servicio para subir y obtener el logo de la escuela.
 * Se sube a Supabase Storage para ser visible por todos los miembros.
 * La URL se guarda en schools.logo_url.
 */
export class SchoolLogoService {
  private supabase = createClient()

  /**
   * Sube el logo de la escuela y actualiza schools.logo_url.
   * @param schoolId - UUID de la escuela (multi-tenant)
   * @param file - Archivo de imagen seleccionado por el usuario
   * @returns URL pública del logo subido
   */
  async uploadLogo(schoolId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'png'
    const path = `${schoolId}/logo.${ext}`

    const { error: uploadError } = await this.supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      throw new Error(`Error al subir el logo: ${uploadError.message}`)
    }

    const { data } = this.supabase.storage.from(BUCKET).getPublicUrl(path)
    const publicUrl = data.publicUrl

    // Actualizar la URL en la tabla schools
    const { error: updateError } = await this.supabase
      .from('schools')
      .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', schoolId)

    if (updateError) {
      throw new Error(`Error al actualizar logo en la escuela: ${updateError.message}`)
    }

    return publicUrl
  }

  /**
   * Eliminar el logo actual de la escuela
   */
  async deleteLogo(schoolId: string, extension: string = 'png'): Promise<void> {
    const path = `${schoolId}/logo.${extension}`

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .remove([path])

    if (error) throw new Error(`Error al eliminar logo: ${error.message}`)

    await this.supabase
      .from('schools')
      .update({ logo_url: null, updated_at: new Date().toISOString() })
      .eq('id', schoolId)
  }
}

export const schoolLogoService = new SchoolLogoService()
