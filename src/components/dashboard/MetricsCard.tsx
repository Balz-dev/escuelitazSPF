import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, MousePointerClick, LucideIcon } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: number | string | undefined
  icon: LucideIcon
  isLoading?: boolean
  onClick?: () => void
  footerText?: string
  footerIcon?: LucideIcon
  className?: string
  valueClassName?: string
}

/**
 * Componente de presentación puro para KPis del dashboard.
 * Aislado de la lógica de datos.
 */
export function MetricsCard({
  title,
  value,
  icon: Icon,
  isLoading,
  onClick,
  footerText,
  footerIcon: FooterIcon = MousePointerClick,
  className = '',
  valueClassName = ''
}: MetricsCardProps) {
  return (
    <Card 
      className={`hover:shadow-md transition-shadow cursor-pointer border-t-4 ${className}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <div className={`text-2xl font-bold ${valueClassName}`}>
            {value ?? '—'}
          </div>
        )}
        {footerText && (
          <p className="text-xs mt-1 flex items-center gap-1 opacity-80">
            <FooterIcon className="w-3 h-3" /> {footerText}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
