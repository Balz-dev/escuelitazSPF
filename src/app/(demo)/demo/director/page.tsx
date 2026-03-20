"use client"

import React from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/infrastructure/offline/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users, Banknote, History, GraduationCap } from 'lucide-react'

export default function DirectorDemoDashboard() {
  const alumnos = useLiveQuery(() => db.alumnos.toArray()) || []
  const transacciones = useLiveQuery(() => db.transacciones.toArray()) || []

  const balanceTotal = transacciones.reduce((acc, current) => acc + current.monto, 0)

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Panel del Director (Demo)</h1>
        <p className="text-muted-foreground">Vista global de la institución educativa.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alumnos.length}</div>
            <p className="text-xs text-muted-foreground">Inscritos en el periodo actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Caja SPF</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balanceTotal >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ${balanceTotal.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Fondo acumulado de cuotas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transacciones.length}</div>
            <p className="text-xs text-muted-foreground">Movimientos registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Alumnos Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Control de Alumnos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Nombre</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Grado</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Grupo</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {alumnos.map((alumno) => (
                  <tr key={alumno.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-2 align-middle font-medium">{alumno.nombre}</td>
                    <td className="p-2 align-middle">{alumno.grado}</td>
                    <td className="p-2 align-middle">{alumno.grupo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
