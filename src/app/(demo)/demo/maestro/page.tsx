"use client"

import React from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/infrastructure/offline/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CheckCircle, Clock, FileText, UserSquare } from 'lucide-react'

export default function MaestroDemoDashboard() {
  const alumnos = useLiveQuery(() => db.alumnos.toArray()) || []

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Panel del Maestro (Demo)</h1>
        <p className="text-muted-foreground">Control de asistencia y expedientes académicos.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Asistencia Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Pase de Lista Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">Estado General</span>
              <span className="text-destructive font-bold">Pendiente</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Tienes {alumnos.length} alumnos asignados en tu grupo esta mañana.
            </div>
            <button className="w-full h-10 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
              Iniciar Asistencia
            </button>
          </CardContent>
        </Card>

        {/* Reportes Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Reportes de Incidencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border border-border rounded-lg flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="text-sm">Reporte de conducta - Alumno Juan Pérez</div>
            </div>
            <div className="p-3 border border-border rounded-lg flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="text-sm">Baja médica aprobada - María Rodríguez</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alumnos List */}
      <h2 className="text-xl font-semibold pt-4">Mi Grupo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {alumnos.map((alumno) => (
          <Card key={alumno.id} className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <UserSquare className="text-primary" size={24} />
              </div>
              <div>
                <div className="font-bold">{alumno.nombre}</div>
                <div className="text-xs text-muted-foreground">{alumno.grado} {alumno.grupo}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
