"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/infrastructure/supabase/client'
import { Loader2, ClipboardCheck } from 'lucide-react'
import { StudentRegistrationForm } from '@/components/shared/StudentRegistrationForm'
import { ValidationQueue } from '@/components/shared/ValidationQueue'
import { SupabasePreregistrationRepository } from '@/infrastructure/supabase/repositories/SupabasePreregistrationRepository'
import type { StudentPreregistration } from '@/core/domain/entities/StudentPreregistration'

export default function GestorAlumnosPage() {
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [filter, setFilter] = useState<'pendiente' | 'aprobado' | 'rechazado'>('pendiente')
  const [items, setItems] = useState<StudentPreregistration[]>([])
  const [isQueueLoading, setIsQueueLoading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)

  const repo = new SupabasePreregistrationRepository()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: membership } = await supabase
          .from('school_members')
          .select('school_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1)
          .single()
        
        if (membership) {
          setSchoolId(membership.school_id)
        }
      }
      setIsLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (schoolId) {
      loadQueue()
    }
  }, [schoolId, filter])

  const loadQueue = async () => {
    if (!schoolId) return
    setIsQueueLoading(true)
    try {
      const data = await repo.getByStatus(schoolId, filter)
      setItems(data)
    } finally {
      setIsQueueLoading(false)
    }
  }

  const handleReview = async (item: StudentPreregistration, status: 'aprobado' | 'rechazado') => {
    if (!userId) return
    setActionId(item.id)
    try {
      const updated = await repo.review(item.id, { status, reviewedBy: userId })
      setItems(prev => prev.map(i => i.id === item.id ? updated : i))
    } finally {
      setActionId(null)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!schoolId || !userId) {
    return <div className="p-6 text-center text-muted-foreground">No se encontró la escuela activa.</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Alumnos</h1>
        <p className="text-muted-foreground">Registra nuevos alumnos y aprueba las solicitudes de los padres de familia.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Lado izquierdo: Registro Rápido */}
        <div className="xl:col-span-5 sticky top-24">
           <StudentRegistrationForm 
             schoolId={schoolId}
             registeredBy={userId}
             actorRole="director"
             isOwner={false}
             isInternal={true}
             onSuccess={() => {
               if (filter === 'pendiente') loadQueue()
             }}
           />
        </div>

        {/* Lado derecho: Cola de Validación y Listas */}
        <div className="xl:col-span-7 flex flex-col gap-6">
           <ValidationQueue
             title="Solicitudes y Pre-registros"
             items={items}
             isLoading={isQueueLoading}
             filter={filter}
             onFilterChange={(f) => setFilter(f as any)}
             actionId={actionId}
             getItemId={(i) => i.id}
             getItemStatus={(i) => i.status as any}
             onApprove={(item) => handleReview(item, 'aprobado')}
             onReject={(item) => handleReview(item, 'rechazado')}
             renderItemContent={(item) => (
               <div className="space-y-0.5 mt-1">
                 <p className="font-medium text-foreground">{item.firstName} {item.lastName}</p>
                 {item.grado && <p className="text-xs text-muted-foreground flex items-center mt-1"><ClipboardCheck className="w-3 h-3 mr-1"/>Grado: {item.grado}</p>}
                 <div className="bg-muted/30 p-2 rounded-md mt-2 space-y-1">
                   <p className="text-sm text-foreground">
                     <span className="capitalize">{item.relationship}</span>: {item.parentName}
                   </p>
                   <p className="text-xs text-muted-foreground">WhatsApp: {item.parentPhone}</p>
                 </div>
                 <p className="text-[10px] text-muted-foreground/60 mt-2 block">
                   Enviado el {new Date(item.createdAt).toLocaleDateString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}
                 </p>
               </div>
             )}
           />
        </div>
      </div>
    </div>
  )
}
