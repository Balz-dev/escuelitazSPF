'use client'

import React, { useEffect, useState } from 'react'
import { SupabasePreregistrationRepository } from '@/infrastructure/supabase/repositories/SupabasePreregistrationRepository'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, Clock, ClipboardList } from 'lucide-react'
import type { StudentPreregistration } from '@/core/domain/entities/StudentPreregistration'
import { createClient } from '@/infrastructure/supabase/client'

const repo = new SupabasePreregistrationRepository()

interface PreregistrationQueueProps {
  schoolId: string
}

const statusConfig = {
  pendiente:  { label: 'Pendiente',  variant: 'default'     as const, icon: Clock },
  aprobado:   { label: 'Aprobado',   variant: 'outline'     as const, icon: CheckCircle },
  rechazado:  { label: 'Rechazado',  variant: 'destructive' as const, icon: XCircle },
}

/**
 * Cola de revisión de pre-registros para Director/Docente.
 * Permite aprobar o rechazar solicitudes de entrada de alumnos.
 */
export function PreregistrationQueue({ schoolId }: PreregistrationQueueProps) {
  const [items, setItems] = useState<StudentPreregistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pendiente' | 'aprobado' | 'rechazado'>('pendiente')

  useEffect(() => {
    load()
  }, [schoolId, filter])

  const load = async () => {
    setIsLoading(true)
    try {
      const data = await repo.getByStatus(schoolId, filter)
      setItems(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReview = async (id: string, status: 'aprobado' | 'rechazado') => {
    const supabase = createClient()
    const { data: { user } }= await supabase.auth.getUser()
    if (!user) return

    setActionId(id)
    try {
      const updated = await repo.review(id, { status, reviewedBy: user.id })
      setItems(prev => prev.map(i => i.id === id ? updated : i))
    } finally {
      setActionId(null)
    }
  }

  const pendingCount  = items.filter(i => i.status === 'pendiente').length

  return (
    <div className="space-y-4">
      {/* Cabecera con filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Pre-registros</h2>
          {pendingCount > 0 && filter === 'pendiente' && (
            <Badge variant="default">{pendingCount}</Badge>
          )}
        </div>
        <div className="flex gap-1">
          {(['pendiente', 'aprobado', 'rechazado'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                filter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              ].join(' ')}
            >
              {statusConfig[s].label}s
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 bg-muted/20 rounded-xl border-2 border-dashed">
          <p className="text-muted-foreground text-sm">No hay solicitudes {filter}s.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const cfg = statusConfig[item.status]
            const Icon = cfg.icon
            return (
              <Card key={item.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.firstName} {item.lastName}</p>
                      <Badge variant={cfg.variant} className="text-xs">
                        <Icon className="h-3 w-3 mr-1" />{cfg.label}
                      </Badge>
                    </div>
                    {item.grado && <p className="text-xs text-muted-foreground">Grado: {item.grado}</p>}
                    <p className="text-sm text-muted-foreground">
                      {item.relationship.charAt(0).toUpperCase() + item.relationship.slice(1)}: {item.parentName} — {item.parentPhone}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                    </p>
                  </div>

                  {item.status === 'pendiente' && (
                    <div className="flex gap-2 items-center sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={actionId === item.id}
                        onClick={() => handleReview(item.id, 'rechazado')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />Rechazar
                      </Button>
                      <Button
                        size="sm"
                        disabled={actionId === item.id}
                        onClick={() => handleReview(item.id, 'aprobado')}
                      >
                        {actionId === item.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <><CheckCircle className="h-4 w-4 mr-1" />Aprobar</>}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
