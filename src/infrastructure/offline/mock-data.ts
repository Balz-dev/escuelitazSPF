import { db } from './db';

export async function generateMockData() {
  const count = await db.alumnos.count();
  
  if (count > 0) return; // Ya hay datos

  console.log('[MockData] Generando datos de prueba para la demo...');

  // Generar Alumnos
  await db.alumnos.bulkAdd([
    { nombre: 'Juan Pérez García', grado: '1º', grupo: 'A', tenant_id: 'demo-school' },
    { nombre: 'María Rodríguez Cruz', grado: '1º', grupo: 'A', tenant_id: 'demo-school' },
    { nombre: 'Carlos Ruiz Lozano', grado: '2º', grupo: 'B', tenant_id: 'demo-school' },
    { nombre: 'Ana Martínez Sosa', grado: '3º', grupo: 'A', tenant_id: 'demo-school' },
    { nombre: 'Sofía López Méndez', grado: '4º', grupo: 'C', tenant_id: 'demo-school' },
  ]);

  // Generar Transacciones
  await db.transacciones.bulkAdd([
    { monto: 500, fecha: new Date().toISOString(), concepto: 'Cuota de Inscripción', synced: false },
    { monto: -1200, fecha: new Date().toISOString(), concepto: 'Mantenimiento de Pintura', synced: false },
    { monto: 200, fecha: new Date().toISOString(), concepto: 'Venta de Uniformes', synced: false },
    { monto: 1500, fecha: new Date().toISOString(), concepto: 'Donación Anónima', synced: false },
  ]);

  console.log('[MockData] Datos de prueba listos.');
}
