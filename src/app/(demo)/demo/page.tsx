"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, Banknote, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { generateMockData } from '@/infrastructure/offline/mock-data'

export default function DemoPage() {
  React.useEffect(() => {
    generateMockData()
  }, [])
  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-2 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight px-4 border-l-4 border-primary">Modo Demostración</h1>
        <p className="text-muted-foreground">
          Explora Escuelitaz SPF con datos ficticios precargados. Selecciona un rol para ver la experiencia de usuario específica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Card: Director */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <ShieldAlert className="text-primary" size={20} />
            </div>
            <CardTitle>Director</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gestiona maestros, asigna roles de la mesa directiva y supervisa todas las finanzas.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/demo/director">Probar como Director</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Card: Docente */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <FileText className="text-primary" size={20} />
            </div>
            <CardTitle>Maestro / Docente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Accede a expedientes de alumnos, reportes de asistencia y comunicaciones directas.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/demo/maestro">Probar como Maestro</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Card: Padre */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Banknote className="text-primary" size={20} />
            </div>
            <CardTitle>Padre de Familia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Consulta gastos de la mesa, paga cuotas y revisa actas de asambleas pasadas.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/demo/padre">Probar como Padre</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground flex items-center gap-2 pt-8">
        <Users size={16} />
        <span>Tus cambios en este modo no se guardarán permanentemente.</span>
      </div>
    </div>
  )
}
