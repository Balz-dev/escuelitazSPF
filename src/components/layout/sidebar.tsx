import React from 'react'
import Link from 'next/link'
import { Building2, Home, Users, Settings, LogOut, FileText, Banknote } from 'lucide-react'

export interface SidebarProps {
  role: 'director' | 'padre' | 'maestro'
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const links = React.useMemo(() => {
    const base = [
      { label: 'Inicio', path: `/${role}`, icon: Home },
    ]
    
    if (role === 'director' || role === 'padre') {
      base.push({ label: 'Asambleas', path: `/${role}/asambleas`, icon: FileText })
      base.push({ label: 'Finanzas', path: `/${role}/finanzas`, icon: Banknote })
    }
    
    if (role === 'director') {
      base.push({ label: 'Usuarios', path: `/${role}/usuarios`, icon: Users })
      base.push({ label: 'Configuración', path: `/${role}/configuracion`, icon: Settings })
    }

    return base
  }, [role])

  return (
    <aside className="sticky top-0 h-screen w-64 flex flex-col border-r bg-card text-card-foreground">
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Building2 size={18} />
        </div>
        <span className="font-bold tracking-tight">Escuelitaz SPF</span>
      </div>
      
      <nav className="flex-1 px-4 py-2">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menú Principal
        </p>
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <li key={link.path}>
                <Link 
                  href={link.path} 
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
