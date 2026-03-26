"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Users, Pencil, Trash2, Shapes, RefreshCw } from 'lucide-react'
import { RegisterTeacherDialog } from '@/components/shared/RegisterTeacherDialog'
import { EditTeacherDialog } from '@/components/shared/EditTeacherDialog'
import { SupabaseDirectorService } from '@/infrastructure/supabase/services/SupabaseDirectorService'
import { Teacher } from '@/core/domain/entities/Teacher'
import { Group } from '@/core/domain/entities/Group'

const directorService = new SupabaseDirectorService()

interface TeachersListProps {
  schoolId: string
  title?: string
  maxHeight?: string
  showActions?: boolean
  onDataLoaded?: (count: number) => void
  userId?: string
}

export function TeachersList({ 
  schoolId, 
  title = "Docentes Registrados",
  maxHeight = "600px",
  showActions = true,
  onDataLoaded,
  userId = ""
}: TeachersListProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubstituting, setIsSubstituting] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!schoolId) return
    setIsLoading(true)
    try {
      const [teacherData, groupData] = await Promise.all([
        directorService.getTeachers(schoolId),
        directorService.getGroups(schoolId)
      ])
      setTeachers(teacherData)
      setGroups(groupData)
      if (onDataLoaded) onDataLoaded(teacherData.length)
    } catch (error) {
      console.error('Error cargando datos de docentes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [schoolId, onDataLoaded])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDeactivate = async (memberId: string) => {
    if (!confirm('¿Estás seguro de desactivar este docente?')) return
    try {
      await directorService.deactivateTeacher(memberId)
      loadData()
    } catch (error) {
      alert('Error al desactivar docente')
    }
  }

  const handleStartSubstitution = async (memberId: string) => {
    const substituteId = prompt('ID del docente suplente:')
    if (!substituteId) return
    setIsSubstituting(true)
    try {
      await directorService.startSubstitution(memberId, substituteId)
      loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al iniciar suplencia')
    } finally {
      setIsSubstituting(false)
    }
  }

  const handleEndSubstitution = async (memberId: string) => {
    setIsSubstituting(true)
    try {
      await directorService.endSubstitution(memberId)
      loadData()
    } catch (error) {
      alert('Error al finalizar suplencia')
    } finally {
      setIsSubstituting(false)
    }
  }

  return (
    <>
      <Card className="h-full border-muted/20 shadow-sm overflow-hidden flex flex-col">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {title}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={loadData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <RegisterTeacherDialog
                schoolId={schoolId}
                userId={userId}
                groups={groups}
                onSuccess={loadData}
              />
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {teachers.length} Activos
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center gap-4 text-muted-foreground italic">
              <Loader2 className="h-8 w-8 animate-spin" />
              Cargando plantilla docente...
            </div>
          ) : teachers.length === 0 ? (
            <div className="p-20 text-center text-muted-foreground flex flex-col items-center justify-center bg-muted/5">
              <Users className="h-12 w-12 mb-3 opacity-10" />
              <p className="text-sm font-medium">No hay docentes registrados aún.</p>
              <p className="text-xs mt-1">Registra a tu primer docente para verlo aquí.</p>
            </div>
          ) : (
            <div 
              className="grid grid-cols-1 divide-y divide-muted/10 overflow-y-auto"
              style={{ maxHeight }}
            >
              {teachers.map((teacher) => (
                <div 
                  key={teacher.memberId} 
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-muted/5 transition-all border-l-4 gap-4 ${teacher.substitutedById ? 'border-amber-400 bg-amber-50/30' : 'border-transparent hover:border-primary/40'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full shrink-0 flex items-center justify-center font-bold text-lg shadow-sm border ${teacher.isSubstitute ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-primary/10 text-primary border-primary/5'}`}>
                      {teacher.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-foreground text-base leading-tight">{teacher.fullName}</p>
                        {teacher.isSubstitute && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Suplente</span>
                        )}
                        {teacher.substitutedById && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Suplantado</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center bg-muted/30 px-2 py-0.5 rounded"><Users className="w-3 h-3 mr-1.5" /> @{teacher.username}</span>
                        {teacher.specialty && (
                          <span className="flex items-center text-primary/80 font-medium">✨ {teacher.specialty}</span>
                        )}
                        <span className="flex items-center"><Shapes className="w-3.5 h-3.5 mr-1.5 text-primary/60" /> Grupo: <strong className="ml-1 text-foreground">{teacher.group}</strong></span>
                        <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1.5 text-blue-500/60" /> Alumnos: <b className="ml-1 text-foreground px-1.5 bg-blue-50 rounded">{teacher.studentCount}</b></span>
                      </div>
                    </div>
                  </div>
                  
                  {showActions && (
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {!teacher.substitutedById && !teacher.isSubstitute && (
                        <Button
                          disabled={isLoading || isSubstituting}
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-bold uppercase"
                          onClick={() => handleStartSubstitution(teacher.memberId)}
                        >
                          Suplir
                        </Button>
                      )}
                      {teacher.substitutedById && (
                        <Button
                          disabled={isLoading || isSubstituting}
                          variant="secondary"
                          size="sm"
                          className="h-8 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 hover:bg-amber-200"
                          onClick={() => handleEndSubstitution(teacher.memberId)}
                        >
                          Finalizar
                        </Button>
                      )}
                      <Button
                        disabled={isLoading}
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                        onClick={() => {
                          setEditingTeacher(teacher)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        disabled={isLoading}
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                        onClick={() => handleDeactivate(teacher.memberId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditTeacherDialog
        teacher={editingTeacher}
        schoolId={schoolId}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={loadData}
        groups={groups}
      />
    </>
  )
}
