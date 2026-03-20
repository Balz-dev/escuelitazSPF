import React from 'react'
import { Sidebar } from './sidebar'

export interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'director' | 'padre' | 'maestro'
  title: string
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role, title }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} />
      
      <main className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b border-border bg-background/95 px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        </header>
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
