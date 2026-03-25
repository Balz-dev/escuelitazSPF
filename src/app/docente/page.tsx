"use client"

import React from 'react'
import { UserPasswordResetWidget } from '@/components/shared/UserPasswordResetWidget'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function DocenteDashboard() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Panel del Docente</h1>
        <p className="text-muted-foreground">Bienvenido a tu panel de control.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
          <UserPasswordResetWidget targetRoleName="Padre de familia o Estudiante" />
        </div>

        <div className="md:col-span-7">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Mis Alumnos y Padres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Users className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">Próximamente: Listado de alumnos asignados.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
