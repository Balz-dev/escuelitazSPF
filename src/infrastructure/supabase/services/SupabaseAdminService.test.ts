/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseAdminService } from './SupabaseAdminService'

const mockSupabase: any = {
  from: vi.fn().mockReturnThis(),
  functions: {
    invoke: vi.fn(),
  },
}

vi.mock('../client', () => ({
  createClient: () => mockSupabase,
}))

describe('SupabaseAdminService', () => {

  let service: SupabaseAdminService

  beforeEach(() => {
    service = new SupabaseAdminService()
    vi.clearAllMocks()
    mockSupabase.from.mockClear()
    mockSupabase.functions.invoke.mockClear()
  })

  describe('getOnboardingRequests', () => {

    it('consulta la tabla school_onboarding_requests', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      })

      await service.getOnboardingRequests()

      expect(mockSupabase.from).toHaveBeenCalledWith('school_onboarding_requests')
    })

    it('retorna array de solicitudes', async () => {
      const mockRequests = [{ id: '1', school_name: 'Escuela A' }]
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockRequests, error: null }),
        }),
      })

      const result = await service.getOnboardingRequests()

      expect(result).toEqual(mockRequests)
    })

    it('lanza error si falla la consulta', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
        }),
      })

      await expect(service.getOnboardingRequests()).rejects.toThrow('DB Error')
    })
  })

  describe('approveRequest', () => {

    it('crea escuela con datos proporcionados', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'schools') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'school-123' }, error: null }),
              }),
            }),
          }
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      })
      mockSupabase.functions.invoke.mockResolvedValue({ data: {}, error: null })

      await service.approveRequest('req-1', {
        schoolName: 'Mi Escuela',
        directorName: 'Juan',
        contactPhone: '555',
        requesterName: 'Juan',
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('schools')
    })

    it('invoca edge function invite-user', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'schools') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 's' }, error: null }),
              }),
            }),
          }
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      })
      mockSupabase.functions.invoke.mockResolvedValue({ data: {}, error: null })

      await service.approveRequest('r', {
        schoolName: 'T',
        directorName: 'Pedro',
        contactPhone: '555-999',
        requesterName: 'Pedro García',
      })

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('invite-user', {
        body: expect.objectContaining({
          emailOrPhone: '555-999',
          schoolId: 's',
          metadata: { full_name: 'Pedro García' },
        }),
      })
    })

    it('actualiza solicitud a approved', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'schools') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 's' }, error: null }),
              }),
            }),
          }
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      })
      mockSupabase.functions.invoke.mockResolvedValue({ data: {}, error: null })

      await service.approveRequest('request-999', {
        schoolName: 'X',
        directorName: 'Y',
        contactPhone: '111',
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('school_onboarding_requests')
    })

    it('retorna resultado con success', async () => {
      const schoolData = { id: 'final', name: 'Final' }
      const inviteData = { tempPassword: 'abc', username: 'd' }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'schools') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: schoolData, error: null }),
              }),
            }),
          }
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      })
      mockSupabase.functions.invoke.mockResolvedValue({ data: inviteData, error: null })

      const result = await service.approveRequest('r1', {
        schoolName: 'F',
        directorName: 'D',
        contactPhone: '1',
      })

      expect(result.success).toBe(true)
      expect(result.school).toEqual(schoolData)
      expect(result.credentials).toEqual(inviteData)
    })
  })

  describe('rejectRequest', () => {

    it('actualiza solicitud a rejected', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      })

      await service.rejectRequest('request-1')

      expect(mockSupabase.from).toHaveBeenCalledWith('school_onboarding_requests')
    })

    it('retorna success true', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      })

      const result = await service.rejectRequest('req-1')

      expect(result).toEqual({ success: true })
    })
  })
})
