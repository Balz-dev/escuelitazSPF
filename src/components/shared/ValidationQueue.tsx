import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, Clock, ClipboardList } from 'lucide-react'

export type ValidationStatus = 'pendiente' | 'aprobado' | 'rechazado'

interface ValidationQueueProps<T> {
  title: string
  items: T[]
  isLoading: boolean
  filter: ValidationStatus
  onFilterChange: (f: ValidationStatus) => void
  renderItemContent: (item: T) => React.ReactNode
  onApprove?: (item: T) => Promise<void>
  onReject?: (item: T) => Promise<void>
  actionId: string | null
  getItemId: (item: T) => string
  getItemStatus: (item: T) => ValidationStatus
  emptyMessage?: string
}

const statusConfig = {
  pendiente:  { label: 'Pendiente',  variant: 'default'     as const, icon: Clock },
  aprobado:   { label: 'Aprobado',   variant: 'outline'     as const, icon: CheckCircle },
  rechazado:  { label: 'Rechazado',  variant: 'destructive' as const, icon: XCircle },
}

/**
 * Componente genérico para la revisión colaborativa de entidades.
 * Muestra una cola de pendientes y permite filtrar por estado.
 */
export function ValidationQueue<T>({
  title,
  items,
  isLoading,
  filter,
  onFilterChange,
  renderItemContent,
  onApprove,
  onReject,
  actionId,
  getItemId,
  getItemStatus,
  emptyMessage = 'No hay solicitudes en esta categoría.'
}: ValidationQueueProps<T>) {
  
  const pendingCount = items.filter(i => getItemStatus(i) === 'pendiente').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">{title}</h2>
          {pendingCount > 0 && filter === 'pendiente' && (
            <Badge variant="default">{pendingCount}</Badge>
          )}
        </div>
        <div className="flex gap-1">
          {(['pendiente', 'aprobado', 'rechazado'] as const).map(s => (
            <button
              key={s}
              onClick={() => onFilterChange(s)}
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
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const id = getItemId(item)
            const status = getItemStatus(item)
            const cfg = statusConfig[status]
            const Icon = cfg.icon

            return (
              <Card key={id}>
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-3">
                  <div className="space-y-0.5 flex-1 cursor-default">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={cfg.variant} className="text-xs">
                        <Icon className="h-3 w-3 mr-1" />{cfg.label}
                      </Badge>
                    </div>
                    {renderItemContent(item)}
                  </div>

                  {status === 'pendiente' && (onApprove || onReject) && (
                    <div className="flex gap-2 items-center sm:self-center">
                      {onReject && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          disabled={actionId === id}
                          onClick={() => onReject(item)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />Rechazar
                        </Button>
                      )}
                      {onApprove && (
                        <Button
                          size="sm"
                          disabled={actionId === id}
                          onClick={() => onApprove(item)}
                        >
                          {actionId === id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <><CheckCircle className="h-4 w-4 mr-1" />Aprobar</>}
                        </Button>
                      )}
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
