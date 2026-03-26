"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SupabaseDirectorService } from '@/infrastructure/supabase/services/SupabaseDirectorService'
import { Loader2 } from 'lucide-react'

const directorService = new SupabaseDirectorService()

interface EditTeacherDialogProps {
  teacher: any | null
  schoolId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditTeacherDialog({ teacher, schoolId, open, onOpenChange, onSuccess }: EditTeacherDialogProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('') // Añadido
  const [groupId, setGroupId] = useState<string>('none')
  const [groups, setGroups] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)

  useEffect(() => {
    if (teacher) {
      setFullName(teacher.fullName || '')
      setPhone(teacher.phone || '')
      setSpecialty(teacher.specialty || '') // Añadido
      setGroupId(teacher.groupId || 'none')
      loadGroups()
    }
  }, [teacher])

  const loadGroups = async () => {
    setIsLoadingGroups(true)
    try {
      const data = await directorService.getGroups(schoolId)
      setGroups(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingGroups(false)
    }
  }

  const handleSave = async () => {
    if (!teacher) return
    setIsSaving(true)
    try {
      // Update profile
      await directorService.updateTeacher(teacher.memberId, {
        fullName,
        phone,
        specialty, // Añadido
        userId: teacher.userId
      })

      // Assign group
      await directorService.assignTeacherToGroup(teacher.memberId, groupId === 'none' ? null : groupId)

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Docente</DialogTitle>
          <DialogDescription>
            Actualiza los datos de {teacher?.fullName} y su asignación de grupo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Teléfono / WhatsApp</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="specialty">Especialidad</Label>
            <Input id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ej. Inglés, Educación Física" />
          </div>
          <div className="grid gap-2">
            <Label>Grupo Asignado</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin grupo asignado</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.grade}° {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {groups.length === 0 && !isLoadingGroups && (
              <p className="text-[10px] text-muted-foreground italic">No hay grupos creados en esta escuela.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !fullName}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
