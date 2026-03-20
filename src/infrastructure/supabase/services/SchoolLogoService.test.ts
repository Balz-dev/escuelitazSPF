/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SchoolLogoService } from './SchoolLogoService'

const { mockStorage, mockSupabase } = vi.hoisted(() => {
  const mockStorage: any = {
    from: vi.fn().mockReturnThis(),
    upload: vi.fn(),
    remove: vi.fn(),
    getPublicUrl: vi.fn(),
  }

  const mockSupabase: any = {
    storage: mockStorage,
    from: vi.fn().mockReturnThis(),
  }

  return { mockStorage, mockSupabase }
})

vi.mock('../client', () => ({
  createClient: () => mockSupabase,
}))

describe('SchoolLogoService', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
  })

  describe('uploadLogo', () => {

    it('construye ruta correcta con schoolId y extensión', async () => {
      const service = new SchoolLogoService()
      const mockFile = new File(['fake-image'], 'logo.png', { type: 'image/png' })

      mockStorage.upload.mockResolvedValueOnce({ error: null })
      mockStorage.getPublicUrl.mockReturnValueOnce({ data: { publicUrl: 'https://cdn.example.com/logo.png' } })

      await service.uploadLogo('school-abc-123', mockFile)

      expect(mockStorage.from).toHaveBeenCalledWith('school-assets')
      expect(mockStorage.upload).toHaveBeenCalledWith(
        'school-abc-123/logo.png',
        mockFile,
        { upsert: true, contentType: 'image/png' }
      )
    })

    it('preserva la extensión del archivo original', async () => {
      const service = new SchoolLogoService()
      const mockFile = new File(['fake'], 'mylogo.jpg', { type: 'image/jpeg' })

      mockStorage.upload.mockResolvedValueOnce({ error: null })
      mockStorage.getPublicUrl.mockReturnValueOnce({ data: { publicUrl: 'http://x.com/l.jpg' } })

      await service.uploadLogo('school-1', mockFile)

      expect(mockStorage.upload).toHaveBeenCalledWith(
        'school-1/logo.jpg',
        expect.anything(),
        expect.anything()
      )
    })

    it('retorna la URL pública del logo', async () => {
      const service = new SchoolLogoService()
      const mockFile = new File(['img'], 'logo.png', { type: 'image/png' })
      const expectedUrl = 'https://storage.supabase.co/bucket/school-1/logo.png'

      mockStorage.upload.mockResolvedValueOnce({ error: null })
      mockStorage.getPublicUrl.mockReturnValueOnce({ data: { publicUrl: expectedUrl } })

      const result = await service.uploadLogo('school-1', mockFile)

      expect(result).toBe(expectedUrl)
    })

    it('lanza error si falla el upload a Storage', async () => {
      const service = new SchoolLogoService()
      const mockFile = new File(['img'], 'logo.png', { type: 'image/png' })
      mockStorage.upload.mockResolvedValueOnce({ error: { message: 'Upload failed' } })

      await expect(service.uploadLogo('school-1', mockFile)).rejects.toThrow(
        'Error al subir el logo: Upload failed'
      )
    })

    it('lanza error si falla la actualización en BD', async () => {
      const service = new SchoolLogoService()
      const mockFile = new File(['img'], 'logo.png', { type: 'image/png' })

      mockStorage.upload.mockResolvedValueOnce({ error: null })
      mockStorage.getPublicUrl.mockReturnValueOnce({ data: { publicUrl: 'http://x.com/l.png' } })

      mockSupabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'DB update failed' } }),
      })

      await expect(service.uploadLogo('school-1', mockFile)).rejects.toThrow(
        'Error al actualizar logo en la escuela: DB update failed'
      )
    })
  })

  describe('deleteLogo', () => {

    it('elimina el archivo del Storage', async () => {
      const service = new SchoolLogoService()
      mockStorage.remove.mockResolvedValueOnce({ error: null })

      await service.deleteLogo('school-123', 'png')

      expect(mockStorage.from).toHaveBeenCalledWith('school-assets')
      expect(mockStorage.remove).toHaveBeenCalledWith(['school-123/logo.png'])
    })

    it('usa png como extensión por defecto', async () => {
      const service = new SchoolLogoService()
      mockStorage.remove.mockResolvedValueOnce({ error: null })

      await service.deleteLogo('school-1')

      expect(mockStorage.remove).toHaveBeenCalledWith(['school-1/logo.png'])
    })

    it('lanza error si falla la eliminación del Storage', async () => {
      const service = new SchoolLogoService()
      mockStorage.remove.mockResolvedValueOnce({ error: { message: 'File not found' } })

      await expect(service.deleteLogo('school-1')).rejects.toThrow(
        'Error al eliminar logo: File not found'
      )
    })
  })
})
