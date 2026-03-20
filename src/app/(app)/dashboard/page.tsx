"use client"

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function DashboardPage() {
  return (
    <DashboardLayout role="director" title="Panel de Control">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Bienvenido al Dashboard</h2>
        <p className="text-muted-foreground">Esta sección se encuentra en desarrollo como parte de la transición a arquitectura PWA.</p>
      </div>
    </DashboardLayout>
  )
}
