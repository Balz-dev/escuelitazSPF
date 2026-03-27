'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { DocenteProfileForm } from '@/features/docente/components/DocenteProfileForm'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function DocentePerfilPage() {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/docente')}
          aria-label="Volver al dashboard"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu información profesional.</p>
        </div>
      </div>

      <DocenteProfileForm />
    </div>
  )
}
