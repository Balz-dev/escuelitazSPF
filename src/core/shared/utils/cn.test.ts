import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn — Utilidad de merge de clases CSS', () => {

  describe('Valores simples', () => {

    it('retorna string vacío para inputs vacíos', () => {
      expect(cn()).toBe('')
      expect(cn(undefined)).toBe('')
      expect(cn(null)).toBe('')
      expect(cn(false)).toBe('')
    })

    it('retorna strings sin cambios', () => {
      expect(cn('foo')).toBe('foo')
      expect(cn('bar baz')).toBe('bar baz')
    })

    it('convierte números positivos a string', () => {
      expect(cn(123)).toBe('123')
      expect(cn(42)).toBe('42')
    })

    it('combina múltiples strings', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
      expect(cn('a', 'b', 'c')).toBe('a b c')
    })
  })

  describe('Objetos como condiciones', () => {

    it('incluye keys con valor truthy', () => {
      expect(cn({ foo: true, bar: true })).toBe('foo bar')
    })

    it('excluye keys con valor falsy', () => {
      expect(cn({ foo: true, bar: false })).toBe('foo')
    })

    it('maneja objetos vacíos', () => {
      expect(cn({})).toBe('')
      expect(cn({ foo: true }, {})).toBe('foo')
    })
  })

  describe('Arrays como inputs', () => {

    it('aplancha arrays en el resultado', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    it('procesa arrays anidados recursivamente', () => {
      expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz')
    })

    it('filtra valores vacíos dentro de arrays', () => {
      expect(cn(['foo', null, 'bar', undefined])).toBe('foo bar')
    })

    it('maneja arrays vacíos', () => {
      expect(cn([])).toBe('')
      expect(cn('foo', [])).toBe('foo')
    })
  })

  describe('Casos mixtos', () => {

    it('combina strings, objetos y arrays', () => {
      const result = cn(
        'base-class',
        { 'conditional-class': true },
        ['array-class']
      )
      expect(result).toBe('base-class conditional-class array-class')
    })

    it('maneja objetos con condiciones booleanas', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'btn',
        { 'btn-primary': isActive, 'btn-disabled': isDisabled }
      )
      expect(result).toBe('btn btn-primary')
    })
  })

  describe('Casos borde', () => {

    it('ignora valores booleanos en el nivel superior', () => {
      expect(cn(true)).toBe('')
      expect(cn(false)).toBe('')
    })

    it('no incluye el string "true" o "false"', () => {
      expect(cn({ 'is-active': true })).toBe('is-active')
    })

    it('preserva clases con guiones', () => {
      expect(cn({ 'text-center': true })).toBe('text-center')
    })

    it('preserva clases con números', () => {
      expect(cn({ 'col-span-2': true })).toBe('col-span-2')
    })
  })

  describe('Orden de clases', () => {

    it('mantiene el orden de aparición', () => {
      const result = cn(
        'z-class',
        { 'a-class': true, 'm-class': true },
        ['b-class', 'y-class']
      )
      const classes = result.split(' ')
      expect(classes[0]).toBe('z-class')
      expect(classes[classes.length - 1]).toBe('y-class')
    })
  })
})
