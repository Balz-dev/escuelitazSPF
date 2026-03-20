import Dexie, { type Table } from 'dexie'

// =============================================
// Tablas sincronizadas con Supabase (cache local)
// =============================================

export interface Alumno {
  id?: number
  nombre: string
  grado: string
  grupo: string
  tenant_id: string
}

export interface Transaccion {
  id?: number
  monto: number
  fecha: string
  concepto: string
  synced: boolean
}

// =============================================
// Tablas exclusivamente locales (nunca suben a la nube)
// =============================================

/**
 * Perfil personal del usuario guardado localmente.
 * avatar_blob: imagen guardada como ArrayBuffer para renderizado offline.
 * Nunca se sube a Supabase; es privado del dispositivo.
 */
export interface LocalUserProfile {
  id: string       // = auth user UUID, clave primaria
  bio?: string
  avatarBlob?: ArrayBuffer
  avatarMimeType?: string
  updatedAt: string
}

// =============================================
// Clase principal de la base de datos local
// =============================================

export class EscuelitazDB extends Dexie {
  // Tablas operativas
  alumnos!: Table<Alumno>
  transacciones!: Table<Transaccion>

  // Tablas de perfil personal (solo locales)
  localUserProfile!: Table<LocalUserProfile>

  constructor() {
    super('EscuelitazDB')

    this.version(1).stores({
      alumnos: '++id, nombre, tenant_id',
      transacciones: '++id, fecha, synced',
    })

    // v2: añade almacenamiento de perfil local
    this.version(2).stores({
      alumnos: '++id, nombre, tenant_id',
      transacciones: '++id, fecha, synced',
      localUserProfile: 'id, updatedAt',
    })
  }
}

export const db = new EscuelitazDB()
