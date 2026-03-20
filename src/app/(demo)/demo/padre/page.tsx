"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Wallet, Bell, CalendarCheck, HelpCircle } from 'lucide-react'

export default function PadreDemoDashboard() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Portal del Padre (Demo)</h1>
        <p className="text-muted-foreground mr-4">Gestión de cuotas y seguimiento escolar de tus hijos.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pagos Card */}
        <Card className="border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Estatus de Cuotas 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Cuota de Mantenimiento Anual</span>
              <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-xs uppercase font-bold">Pagado</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[100%] transition-all" />
            </div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Cuota Extraordinaria (Día del Niño)</span>
              <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-xs uppercase font-bold">Pendiente</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 w-[40%] transition-all" />
            </div>
            <button className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-bold shadow-md hover:bg-primary/90 transition-all mt-4">
              Pagar $150.00 ahora
            </button>
          </CardContent>
        </Card>

        {/* Avisos Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Avisos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-xl space-y-1">
              <div className="text-xs text-muted-foreground">Hace 2 horas</div>
              <div className="font-bold text-sm">Próxima Asamblea General</div>
              <div className="text-sm text-muted-foreground">Se convoca a todos los padres el viernes 20 de marzo a las 8:00 AM para la revisión de cuentas.</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-xl space-y-1 opacity-60">
              <div className="text-xs text-muted-foreground">Ayer</div>
              <div className="font-bold text-sm text-primary">¡Éxito en la venta de uniformes!</div>
              <div className="text-sm text-muted-foreground">Gracias a su apoyo se recaudaron $12,400 para la techumbre.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendario / Info */}
      <h2 className="text-xl font-bold pt-4">Recursos Útiles</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/30 transition-colors cursor-pointer">
          <CalendarCheck className="text-primary" />
          <span className="text-xs font-bold leading-tight">Calendario Escolar</span>
        </div>
        <div className="p-4 bg-card border rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/30 transition-colors cursor-pointer">
          <HelpCircle className="text-primary" />
          <span className="text-xs font-bold leading-tight">Mesa Directiva</span>
        </div>
      </div>
    </div>
  )
}
