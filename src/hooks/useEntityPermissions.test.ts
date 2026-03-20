import { describe, it, expect } from 'vitest'
import { useEntityPermissions } from './useEntityPermissions'

describe('useEntityPermissions — Sistema RBAC', () => {

  describe('Permisos sobre estudiantes (student)', () => {

    it('director — puede crear, editar y validar estudiantes', () => {
      const perms = useEntityPermissions('student', 'director', null, false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canEdit).toBe(true)
      expect(perms.canValidate).toBe(true)
      expect(perms.editableFields).toEqual(['*'])
    })

    it('director — es owner de entidades que crea', () => {
      const perms = useEntityPermissions('student', 'director', null, true)
      expect(perms.isOwner).toBe(true)
    })

    it('docente — puede crear, editar y validar estudiantes', () => {
      const perms = useEntityPermissions('student', 'docente', null, false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canEdit).toBe(true)
      expect(perms.canValidate).toBe(true)
      expect(perms.editableFields).toEqual(['*'])
    })

    it('padre — puede crear estudiantes (registro de hijos)', () => {
      const perms = useEntityPermissions('student', 'padre', null, false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canValidate).toBe(false)
    })

    it('padre — solo puede editar sus propios hijos', () => {
      const permsOwner = useEntityPermissions('student', 'padre', null, true)
      expect(permsOwner.canEdit).toBe(true)
      expect(permsOwner.editableFields).toEqual(['first_name', 'last_name', 'curp', 'grado', 'notes'])

      const permsNotOwner = useEntityPermissions('student', 'padre', null, false)
      expect(permsNotOwner.canEdit).toBe(false)
      expect(permsNotOwner.editableFields).toEqual([])
    })

    it('actor sin rol — no tiene permisos', () => {
      const perms = useEntityPermissions('student', null, null, false)
      expect(perms.canCreate).toBe(false)
      expect(perms.canEdit).toBe(false)
      expect(perms.canValidate).toBe(false)
    })
  })

  describe('Permisos sobre docentes (docente)', () => {

    it('director — puede crear, editar y validar docentes', () => {
      const perms = useEntityPermissions('docente', 'director', null, false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canEdit).toBe(true)
      expect(perms.canValidate).toBe(true)
    })

    it('docente — solo puede editar su propio perfil', () => {
      const permsOwner = useEntityPermissions('docente', 'docente', null, true)
      expect(permsOwner.canEdit).toBe(true)
      expect(permsOwner.editableFields).toEqual(['full_name', 'phone'])

      const permsNotOwner = useEntityPermissions('docente', 'docente', null, false)
      expect(permsNotOwner.canEdit).toBe(false)
      expect(permsNotOwner.editableFields).toEqual([])
    })

    it('docente — no puede crear docentes', () => {
      const perms = useEntityPermissions('docente', 'docente', null, false)
      expect(perms.canCreate).toBe(false)
      expect(perms.canValidate).toBe(false)
    })

    it('padre — no tiene permisos sobre docentes', () => {
      const perms = useEntityPermissions('docente', 'padre', null, false)
      expect(perms.canCreate).toBe(false)
      expect(perms.canEdit).toBe(false)
    })
  })

  describe('Permisos sobre padres (padre)', () => {

    it('director — puede gestionar padres', () => {
      const perms = useEntityPermissions('padre', 'director', null, false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canEdit).toBe(true)
      expect(perms.canValidate).toBe(true)
    })

    it('docente — puede gestionar padres', () => {
      const perms = useEntityPermissions('padre', 'docente', null, false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canEdit).toBe(true)
      expect(perms.canValidate).toBe(true)
    })

    it('padre — solo puede editar su propio perfil', () => {
      const permsOwner = useEntityPermissions('padre', 'padre', null, true)
      expect(permsOwner.canEdit).toBe(true)
      expect(permsOwner.editableFields).toEqual(['full_name', 'phone'])
    })
  })

  describe('Permisos sobre transacciones SPF (spf_transaction)', () => {

    it('director — puede crear, editar y aprobar transacciones', () => {
      const perms = useEntityPermissions('spf_transaction', 'director', null, false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canEdit).toBe(true)
      expect(perms.canValidate).toBe(true)
      expect(perms.canApproveFinance).toBe(true)
    })

    it('presidente — puede gestionar transacciones SPF', () => {
      const perms = useEntityPermissions('spf_transaction', 'director', 'presidente', false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canEdit).toBe(true)
      expect(perms.canApproveFinance).toBe(true)
    })

    it('tesorero — puede gestionar transacciones SPF', () => {
      const perms = useEntityPermissions('spf_transaction', 'director', 'tesorero', false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canEdit).toBe(true)
      expect(perms.canApproveFinance).toBe(true)
    })

    it('secretario — SÍ puede crear transacciones SPF (director role incluye este permiso)', () => {
      const perms = useEntityPermissions('spf_transaction', 'director', 'secretario', false)
      expect(perms.canCreate).toBe(true)
    })

    it('vocal — SÍ puede crear transacciones SPF (director role incluye este permiso)', () => {
      const perms = useEntityPermissions('spf_transaction', 'director', 'vocal', false)
      expect(perms.canCreate).toBe(true)
    })

    it('docente — NO puede gestionar transacciones SPF', () => {
      const perms = useEntityPermissions('spf_transaction', 'docente', null, false)
      expect(perms.canCreate).toBe(false)
      expect(perms.canApproveFinance).toBe(false)
    })

    it('padre — NO puede gestionar transacciones SPF', () => {
      const perms = useEntityPermissions('spf_transaction', 'padre', null, false)
      expect(perms.canCreate).toBe(false)
      expect(perms.canApproveFinance).toBe(false)
    })
  })

  describe('Permisos sobre convocatorias (convocatoria)', () => {

    it('director — puede crear y gestionar convocatorias', () => {
      const perms = useEntityPermissions('convocatoria', 'director', null, false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canEdit).toBe(true)
      expect(perms.canValidate).toBe(true)
    })

    it('presidente — puede crear convocatorias', () => {
      const perms = useEntityPermissions('convocatoria', 'director', 'presidente', false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canEdit).toBe(true)
    })

    it('secretario — puede crear convocatorias', () => {
      const perms = useEntityPermissions('convocatoria', 'director', 'secretario', false)
      expect(perms.canCreate).toBe(true)
      expect(perms.canEdit).toBe(true)
    })

    it('tesorero — SÍ puede crear convocatorias (director role incluye este permiso)', () => {
      const perms = useEntityPermissions('convocatoria', 'director', 'tesorero', false)
      expect(perms.canCreate).toBe(true)
    })

    it('vocal — SÍ puede crear convocatorias (director role incluye este permiso)', () => {
      const perms = useEntityPermissions('convocatoria', 'director', 'vocal', false)
      expect(perms.canCreate).toBe(true)
    })

    it('docente — NO puede crear convocatorias', () => {
      const perms = useEntityPermissions('convocatoria', 'docente', null, false)
      expect(perms.canCreate).toBe(false)
    })

    it('padre — NO puede crear convocatorias', () => {
      const perms = useEntityPermissions('convocatoria', 'padre', null, false)
      expect(perms.canCreate).toBe(false)
    })
  })

  describe('Regla general de finanzas SPF', () => {

    it('director siempre puede aprobar finanzas', () => {
      expect(useEntityPermissions('student', 'director').canApproveFinance).toBe(true)
      expect(useEntityPermissions('docente', 'director').canApproveFinance).toBe(true)
    })

    it('presidente siempre puede aprobar finanzas', () => {
      expect(useEntityPermissions('student', 'director', 'presidente').canApproveFinance).toBe(true)
    })

    it('tesorero siempre puede aprobar finanzas', () => {
      expect(useEntityPermissions('student', 'director', 'tesorero').canApproveFinance).toBe(true)
    })
  })

  describe('Casos borde', () => {

    it('rol null retorna permisos vacíos', () => {
      const perms = useEntityPermissions('student', null)
      expect(perms.canCreate).toBe(false)
      expect(perms.canEdit).toBe(false)
      expect(perms.canValidate).toBe(false)
      expect(perms.canApproveFinance).toBe(false)
      expect(perms.isOwner).toBe(false)
      expect(perms.editableFields).toEqual([])
    })

    it('subRole null es manejado correctamente', () => {
      const perms = useEntityPermissions('student', 'director', null, false)
      expect(perms).toBeDefined()
    })

    it('isOwner afecta solo el flag isOwner', () => {
      const permsOwner = useEntityPermissions('student', 'director', null, true)
      const permsNotOwner = useEntityPermissions('student', 'director', null, false)
      expect(permsOwner.isOwner).toBe(true)
      expect(permsNotOwner.isOwner).toBe(false)
      expect(permsOwner.canCreate).toBe(permsNotOwner.canCreate)
    })
  })
})
