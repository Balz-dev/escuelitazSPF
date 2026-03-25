'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SupabaseSchoolService } from '@/infrastructure/supabase/services/SupabaseSchoolService'
import { StudentRegistrationForm } from '@/components/shared/StudentRegistrationForm'
import { Loader2, AlertCircle } from 'lucide-react'
import type { School } from '@/core/domain/entities/School'
import { APP_CONFIG } from '@/config/constants'

const schoolService = new SupabaseSchoolService()

function RegisterContent() {
  const searchParams = useSearchParams()
  // Recibe la URL compartida como pre-registro: /register?code=ESCUELA123
  const identifier = searchParams.get('code') || searchParams.get('c')
  
  const [school, setSchool] = useState<School | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!identifier) {
      setNotFound(true)
      setIsLoading(false)
      return
    }

    schoolService.getSchoolByIdentifier(identifier).then(s => {
      if (!s || !('id' in s)) {
        setNotFound(true)
      } else {
        setSchool(s)
      }
      setIsLoading(false)
    }).catch(() => { setNotFound(true); setIsLoading(false) })
  }, [identifier])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound || !school) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Escuela no encontrada</h1>
        <p className="text-muted-foreground">
          El enlace que recibiste falta de información o la escuela ha desactivado el registro.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Cabecera con identidad de la escuela */}
      <header className="border-b bg-card py-4 px-6">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {school.logoUrl
            ? <img src={school.logoUrl} alt={`Escudo de ${school.name}`} className="h-10 w-10 object-contain rounded" />
            : <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                {school.name.charAt(0)}
              </div>
          }
          <div>
            <p className="font-semibold text-sm">{school.name}</p>
            <p className="text-xs text-muted-foreground">{APP_CONFIG.brandName} — Registro de alumnos</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto py-8 px-4">
        <StudentRegistrationForm
          schoolId={school.id}
          registeredBy={null}
          actorRole={null}
          isInternal={false}
        />
      </main>
    </div>
  )
}

/**
 * Ruta pública estática de pre-registro: /enroll?code=IDENTIFICADOR
 * Para funcionar con "output: export" (PWA), la ruta no puede tener carpetas dinámicas.
 */
export default function PublicRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <RegisterContent />
    </Suspense>
  )
}
