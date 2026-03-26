"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SupabaseDirectorService } from '@/infrastructure/supabase/services/SupabaseDirectorService'
import { Loader2, Plus, Shapes } from 'lucide-react'

const directorService = new SupabaseDirectorService()

interface GroupDialogProps {
  schoolId: string
  onSuccess: () => void
}

export function CreateGroupDialog({ schoolId, onSuccess }: GroupDialogProps) {
  const [grade, setGrade] = useState('')
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCreate = async () => {
    setIsSaving(true)
    try {
      await directorService.createGroup(schoolId, grade, name)
      onSuccess()
      setGrade('')
      setName('')
      setOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shapes className="h-5 w-5 text-primary" />
            Crear Nuevo Grupo
          </DialogTitle>
          <DialogDescription>
            Registra un grado y sección para asignar docentes y alumnos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="grade" className="text-right">Grado</Label>
            <Input 
              id="grade" 
              placeholder="Ej: 1" 
              className="col-span-3" 
              value={grade} 
              onChange={(e) => setGrade(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="section" className="text-right">Sección/Nombre</Label>
            <Input 
              id="section" 
              placeholder="Ej: A" 
              className="col-span-3" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={isSaving || !grade || !name}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Grupo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
