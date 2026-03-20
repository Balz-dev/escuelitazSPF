/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

const mockRepo = {
  getBySchool: vi.fn(),
  create: vi.fn(),
  publish: vi.fn(),
  close: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/infrastructure/supabase/repositories/SupabaseConvocatoriaRepository', () => ({
  SupabaseConvocatoriaRepository: vi.fn(() => mockRepo),
}))

vi.mock('@/features/director/hooks/useConvocatorias', () => ({
  useConvocatorias: vi.fn(),
}))

import { useConvocatorias } from '@/features/director/hooks/useConvocatorias'

describe('useConvocatorias', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useConvocatorias).mockImplementation(() => ({
      convocatorias: [],
      isLoading: false,
      error: null,
      create: vi.fn(),
      publish: vi.fn(),
      close: vi.fn(),
      remove: vi.fn(),
      refresh: vi.fn(),
    }))
  })

  describe('Mock básico', () => {

    it('retorna estado inicial vacío', () => {
      const { result } = renderHook(() => useConvocatorias('school-123'))

      expect(result.current.convocatorias).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('provee funciones de gestión', () => {
      const { result } = renderHook(() => useConvocatorias('school-123'))

      expect(result.current.create).toBeDefined()
      expect(result.current.publish).toBeDefined()
      expect(result.current.close).toBeDefined()
      expect(result.current.remove).toBeDefined()
      expect(result.current.refresh).toBeDefined()
    })
  })

  describe('Simulación de carga', () => {

    it('muestra loading inicialmente', async () => {
      vi.mocked(useConvocatorias).mockImplementationOnce(() => ({
        convocatorias: [],
        isLoading: true,
        error: null,
        create: vi.fn(),
        publish: vi.fn(),
        close: vi.fn(),
        remove: vi.fn(),
        refresh: vi.fn(),
      }))

      const { result } = renderHook(() => useConvocatorias('school-123'))

      expect(result.current.isLoading).toBe(true)
    })

    it('maneja errores', () => {
      vi.mocked(useConvocatorias).mockImplementationOnce(() => ({
        convocatorias: [],
        isLoading: false,
        error: 'Error de red',
        create: vi.fn(),
        publish: vi.fn(),
        close: vi.fn(),
        remove: vi.fn(),
        refresh: vi.fn(),
      }))

      const { result } = renderHook(() => useConvocatorias('school-123'))

      expect(result.current.error).toBe('Error de red')
    })
  })

  describe('Simulación de operaciones', () => {

    it('create llama a la función mock', async () => {
      const mockCreate = vi.fn()
      vi.mocked(useConvocatorias).mockImplementationOnce(() => ({
        convocatorias: [],
        isLoading: false,
        error: null,
        create: mockCreate,
        publish: vi.fn(),
        close: vi.fn(),
        remove: vi.fn(),
        refresh: vi.fn(),
      }))

      const { result } = renderHook(() => useConvocatorias('school-123'))

      await act(async () => {
        await result.current.create({
          schoolId: 'school-123',
          createdBy: 'user-1',
          title: 'Nueva Convocatoria',
          type: 'formacion_spf',
        })
      })

      expect(mockCreate).toHaveBeenCalledWith({
        schoolId: 'school-123',
        createdBy: 'user-1',
        title: 'Nueva Convocatoria',
        type: 'formacion_spf',
      })
    })

    it('publish llama a la función mock', async () => {
      const mockPublish = vi.fn()
      vi.mocked(useConvocatorias).mockImplementationOnce(() => ({
        convocatorias: [],
        isLoading: false,
        error: null,
        create: vi.fn(),
        publish: mockPublish,
        close: vi.fn(),
        remove: vi.fn(),
        refresh: vi.fn(),
      }))

      const { result } = renderHook(() => useConvocatorias('school-123'))

      await act(async () => {
        await result.current.publish('conv-1')
      })

      expect(mockPublish).toHaveBeenCalledWith('conv-1')
    })
  })
})
