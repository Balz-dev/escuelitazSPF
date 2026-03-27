import React from 'react'
import { Building2 } from 'lucide-react'

interface DashboardHeaderProps {
  schoolName?: string
  activeCycle?: string
  userName?: string
}

/**
 * Componente de presentación puro para el encabezado del Dashboard.
 */
export function DashboardHeader({
  schoolName,
  activeCycle,
  userName
}: DashboardHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        {userName ? `¡Hola, ${userName}!` : 'Centro de Control'}
      </h1>
      <p className="text-muted-foreground flex items-center gap-2 mt-1">
        <Building2 className="w-4 h-4" /> 
        {schoolName ?? 'Cargando escuela...'} • {activeCycle ?? 'Cargando ciclo...'}
      </p>
    </div>
  )
}
