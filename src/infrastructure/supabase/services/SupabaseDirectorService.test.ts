import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseDirectorService } from './SupabaseDirectorService';
import { createClient } from '../client';

// Mock del cliente de Supabase
vi.mock('../client', () => ({
  createClient: vi.fn(),
}));

describe('SupabaseDirectorService', () => {
  let service: SupabaseDirectorService;
  let queryBuilder: any;
  const mockSelect = vi.fn();
  const mockFrom = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuración compleja de mock para encadenamiento de Supabase
    queryBuilder = {
      select: mockSelect.mockReturnThis(),
      from: mockFrom.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      single: mockSingle.mockReturnThis(),
      insert: mockInsert.mockReturnThis(),
      update: mockUpdate.mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      // Para capturar el resultado final al hacer 'await'
      then: (onfulfilled: any) => Promise.resolve({ data: [], error: null }).then(onfulfilled)
    };

    mockFrom.mockReturnValue(queryBuilder);
    mockSelect.mockReturnValue(queryBuilder);
    mockEq.mockReturnValue(queryBuilder);
    mockSingle.mockReturnValue(queryBuilder);
    mockInsert.mockReturnValue(queryBuilder);
    mockUpdate.mockReturnValue(queryBuilder);

    (createClient as any).mockReturnValue({
      from: mockFrom,
    });

    service = new SupabaseDirectorService();
  });

  describe('getTeachers', () => {
    it('debe retornar una lista de docentes mapeada correctamente', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          is_active: true,
          profiles: { id: 'user-1', full_name: 'Juan Perez', username: 'jperez' },
          member_roles: [{ role: 'docente', is_substitute: false }],
          groups: [{ id: 'group-1', grade: '1', name: 'A' }]
        }
      ];

      // Primera llamada: school_members
      queryBuilder.then = (onfulfilled: any) => Promise.resolve({ data: mockMembers, error: null }).then(onfulfilled);
      // Segunda llamada: students (para conteo)
      // Necesitamos una forma de que la segunda vez que se use el queryBuilder retorne algo distinto
      // Pero 'getTeachers' usa 'this.supabase.from' dos veces.
      mockFrom.mockReturnValueOnce(queryBuilder) // para school_members
              .mockReturnValueOnce({ // para students
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                then: (onfulfilled: any) => Promise.resolve({ data: [{ group_id: 'group-1' }], error: null }).then(onfulfilled)
              });

      const teachers = await service.getTeachers('school-123');

      expect(teachers).toHaveLength(1);
      expect(teachers[0].fullName).toBe('Juan Perez');
      expect(teachers[0].group).toBe('1° A');
      expect(teachers[0].studentCount).toBe(1);
    });
  });

  describe('createGroup', () => {
    it('debe insertar un nuevo grupo y retornar el objeto creado', async () => {
      const mockGroup = { id: 'new-group-id', school_id: 'school-123', grade: '2', name: 'B' };
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockGroup, error: null })
      });

      const group = await service.createGroup('school-123', '2', 'B');

      expect(mockInsert).toHaveBeenCalledWith({
        school_id: 'school-123',
        grade: '2',
        name: 'B'
      });
      expect(group.id).toBe('new-group-id');
    });
  });

  describe('deactivateTeacher', () => {
    it('debe actualizar el estado is_active a false', async () => {
      mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      await service.deactivateTeacher('member-1');

      expect(mockUpdate).toHaveBeenCalledWith({ is_active: false });
    });
  });
});
