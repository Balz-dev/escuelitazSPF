export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      action_logs: {
        Row: {
          action: Database["public"]["Enums"]["log_action"]
          created_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["log_entity_type"]
          id: string
          metadata: Json | null
          school_id: string
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["log_action"]
          created_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["log_entity_type"]
          id?: string
          metadata?: Json | null
          school_id: string
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["log_action"]
          created_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["log_entity_type"]
          id?: string
          metadata?: Json | null
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          biography: string | null
          created_at: string
          cycle_id: string
          id: string
          is_substitute: boolean
          member_id: string
          position: Database["public"]["Enums"]["member_sub_role"]
        }
        Insert: {
          biography?: string | null
          created_at?: string
          cycle_id: string
          id?: string
          is_substitute?: boolean
          member_id: string
          position: Database["public"]["Enums"]["member_sub_role"]
        }
        Update: {
          biography?: string | null
          created_at?: string
          cycle_id?: string
          id?: string
          is_substitute?: boolean
          member_id?: string
          position?: Database["public"]["Enums"]["member_sub_role"]
        }
        Relationships: [
          {
            foreignKeyName: "candidates_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "election_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "school_members"
            referencedColumns: ["id"]
          },
        ]
      }
      convocatorias: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          expires_at: string | null
          id: string
          published_at: string | null
          school_id: string
          status: Database["public"]["Enums"]["convocatoria_status"]
          title: string
          type: Database["public"]["Enums"]["convocatoria_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          expires_at?: string | null
          id?: string
          published_at?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["convocatoria_status"]
          title: string
          type?: Database["public"]["Enums"]["convocatoria_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          published_at?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["convocatoria_status"]
          title?: string
          type?: Database["public"]["Enums"]["convocatoria_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "convocatorias_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convocatorias_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      election_cycles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          nombre: string
          school_id: string
          voting_ends_at: string | null
          voting_starts_at: string | null
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          nombre: string
          school_id: string
          voting_ends_at?: string | null
          voting_starts_at?: string | null
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          nombre?: string
          school_id?: string
          voting_ends_at?: string | null
          voting_starts_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "election_cycles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      election_votes: {
        Row: {
          candidate_id: string
          created_at: string
          cycle_id: string
          id: string
          voter_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          cycle_id: string
          id?: string
          voter_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          cycle_id?: string
          id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "election_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_votes_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "election_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_categories: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_required: boolean
          name: string
          school_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          is_required?: boolean
          name: string
          school_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_required?: boolean
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          id: string
          paid_by: string
          payment_date: string | null
          receipt_url: string | null
          school_id: string
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          id?: string
          paid_by: string
          payment_date?: string | null
          receipt_url?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          student_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          id?: string
          paid_by?: string
          payment_date?: string | null
          receipt_url?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fee_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_comments: {
        Row: {
          anonimato: boolean
          auto_flagged: boolean
          contenido: string
          created_at: string
          creator_id: string
          id: string
          thread_id: string
          updated_at: string
        }
        Insert: {
          anonimato?: boolean
          auto_flagged?: boolean
          contenido: string
          created_at?: string
          creator_id: string
          id?: string
          thread_id: string
          updated_at?: string
        }
        Update: {
          anonimato?: boolean
          auto_flagged?: boolean
          contenido?: string
          created_at?: string
          creator_id?: string
          id?: string
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          anonimato: boolean
          auto_flagged: boolean
          closed_at: string | null
          contenido: Json | null
          created_at: string
          creator_id: string
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          school_id: string
          status: Database["public"]["Enums"]["thread_status"]
          target_roles: string[]
          tipo: Database["public"]["Enums"]["thread_type"]
          titulo: string
          updated_at: string
          vigencia_fin: string | null
          vigencia_inicio: string | null
          votes_count: number
        }
        Insert: {
          anonimato?: boolean
          auto_flagged?: boolean
          closed_at?: string | null
          contenido?: Json | null
          created_at?: string
          creator_id: string
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          school_id: string
          status?: Database["public"]["Enums"]["thread_status"]
          target_roles?: string[]
          tipo?: Database["public"]["Enums"]["thread_type"]
          titulo: string
          updated_at?: string
          vigencia_fin?: string | null
          vigencia_inicio?: string | null
          votes_count?: number
        }
        Update: {
          anonimato?: boolean
          auto_flagged?: boolean
          closed_at?: string | null
          contenido?: Json | null
          created_at?: string
          creator_id?: string
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          school_id?: string
          status?: Database["public"]["Enums"]["thread_status"]
          target_roles?: string[]
          tipo?: Database["public"]["Enums"]["thread_type"]
          titulo?: string
          updated_at?: string
          vigencia_fin?: string | null
          vigencia_inicio?: string | null
          votes_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_votes: {
        Row: {
          anonimato: boolean
          created_at: string
          id: string
          opcion: string
          thread_id: string
          user_id: string | null
        }
        Insert: {
          anonimato?: boolean
          created_at?: string
          id?: string
          opcion: string
          thread_id: string
          user_id?: string | null
        }
        Update: {
          anonimato?: boolean
          created_at?: string
          id?: string
          opcion?: string
          thread_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_attendance: {
        Row: {
          attended: boolean
          id: string
          meeting_id: string
          member_id: string
          signed_at: string | null
        }
        Insert: {
          attended?: boolean
          id?: string
          meeting_id: string
          member_id: string
          signed_at?: string | null
        }
        Update: {
          attended?: boolean
          id?: string
          meeting_id?: string
          member_id?: string
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "school_members"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: string | null
          created_at: string
          created_by: string
          id: string
          location: string | null
          minutes_url: string | null
          scheduled_at: string
          school_id: string
          status: Database["public"]["Enums"]["meeting_status"]
          title: string
        }
        Insert: {
          agenda?: string | null
          created_at?: string
          created_by: string
          id?: string
          location?: string | null
          minutes_url?: string | null
          scheduled_at: string
          school_id: string
          status?: Database["public"]["Enums"]["meeting_status"]
          title: string
        }
        Update: {
          agenda?: string | null
          created_at?: string
          created_by?: string
          id?: string
          location?: string | null
          minutes_url?: string | null
          scheduled_at?: string
          school_id?: string
          status?: Database["public"]["Enums"]["meeting_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      member_roles: {
        Row: {
          active_since: string
          active_until: string | null
          id: string
          is_substitute: boolean
          member_id: string
          role: Database["public"]["Enums"]["member_role"]
          sub_role: Database["public"]["Enums"]["member_sub_role"] | null
        }
        Insert: {
          active_since?: string
          active_until?: string | null
          id?: string
          is_substitute?: boolean
          member_id: string
          role: Database["public"]["Enums"]["member_role"]
          sub_role?: Database["public"]["Enums"]["member_sub_role"] | null
        }
        Update: {
          active_since?: string
          active_until?: string | null
          id?: string
          is_substitute?: boolean
          member_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          sub_role?: Database["public"]["Enums"]["member_sub_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "member_roles_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "school_members"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_recipients: {
        Row: {
          id: string
          notification_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_recipients_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_recipients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          priority: Database["public"]["Enums"]["notification_priority"]
          school_id: string
          sender_id: string | null
          target_roles: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          priority?: Database["public"]["Enums"]["notification_priority"]
          school_id: string
          sender_id?: string | null
          target_roles?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          priority?: Database["public"]["Enums"]["notification_priority"]
          school_id?: string
          sender_id?: string | null
          target_roles?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          must_change_password: boolean
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          must_change_password?: boolean
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          must_change_password?: boolean
          phone?: string | null
        }
        Relationships: []
      }
      school_members: {
        Row: {
          id: string
          is_active: boolean
          joined_at: string
          school_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          joined_at?: string
          school_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          joined_at?: string
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_members_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_onboarding_requests: {
        Row: {
          contact_email: string | null
          contact_phone: string
          created_at: string | null
          director_name: string
          id: string
          rejection_reason: string | null
          requester_name: string | null
          requester_role: string | null
          school_name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone: string
          created_at?: string | null
          director_name: string
          id?: string
          rejection_reason?: string | null
          requester_name?: string | null
          requester_role?: string | null
          school_name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string
          created_at?: string | null
          director_name?: string
          id?: string
          rejection_reason?: string | null
          requester_name?: string | null
          requester_role?: string | null
          school_name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          cct: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          identifier: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cct?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          identifier: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cct?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          identifier?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      spf_categories: {
        Row: {
          created_at: string
          id: string
          nombre: string
          school_id: string
          tipo: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          school_id: string
          tipo: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          school_id?: string
          tipo?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "spf_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      spf_financial_periods: {
        Row: {
          cerrado: boolean
          creado_por: string
          created_at: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          nombre: string
          saldo_final: number | null
          saldo_inicial: number
          school_id: string
          updated_at: string
        }
        Insert: {
          cerrado?: boolean
          creado_por: string
          created_at?: string
          fecha_fin: string
          fecha_inicio: string
          id?: string
          nombre: string
          saldo_final?: number | null
          saldo_inicial?: number
          school_id: string
          updated_at?: string
        }
        Update: {
          cerrado?: boolean
          creado_por?: string
          created_at?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          nombre?: string
          saldo_final?: number | null
          saldo_inicial?: number
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spf_financial_periods_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spf_financial_periods_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      spf_transactions: {
        Row: {
          aprobado_por: string | null
          categoria_id: string | null
          concepto: string
          created_at: string
          evidencia_urls: string[]
          id: string
          monto: number
          periodo_id: string
          registrado_por: string
          school_id: string
          status_aprobacion: Database["public"]["Enums"]["approval_status"]
          tipo: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          aprobado_por?: string | null
          categoria_id?: string | null
          concepto: string
          created_at?: string
          evidencia_urls?: string[]
          id?: string
          monto: number
          periodo_id: string
          registrado_por: string
          school_id: string
          status_aprobacion?: Database["public"]["Enums"]["approval_status"]
          tipo: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          aprobado_por?: string | null
          categoria_id?: string | null
          concepto?: string
          created_at?: string
          evidencia_urls?: string[]
          id?: string
          monto?: number
          periodo_id?: string
          registrado_por?: string
          school_id?: string
          status_aprobacion?: Database["public"]["Enums"]["approval_status"]
          tipo?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spf_transactions_aprobado_por_fkey"
            columns: ["aprobado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spf_transactions_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "spf_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spf_transactions_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "spf_financial_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spf_transactions_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spf_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      student_parents: {
        Row: {
          is_primary: boolean
          parent_id: string
          relationship: string | null
          student_id: string
        }
        Insert: {
          is_primary?: boolean
          parent_id: string
          relationship?: string | null
          student_id: string
        }
        Update: {
          is_primary?: boolean
          parent_id?: string
          relationship?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_parents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_preregistrations: {
        Row: {
          created_at: string
          curp: string | null
          first_name: string
          grado: string | null
          id: string
          last_name: string
          notes: string | null
          parent_email: string | null
          parent_name: string
          parent_phone: string
          registered_by: string | null
          relationship: string
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          status: Database["public"]["Enums"]["preregistro_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          curp?: string | null
          first_name: string
          grado?: string | null
          id?: string
          last_name: string
          notes?: string | null
          parent_email?: string | null
          parent_name: string
          parent_phone: string
          registered_by?: string | null
          relationship?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["preregistro_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          curp?: string | null
          first_name?: string
          grado?: string | null
          id?: string
          last_name?: string
          notes?: string | null
          parent_email?: string | null
          parent_name?: string
          parent_phone?: string
          registered_by?: string | null
          relationship?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["preregistro_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_preregistrations_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_preregistrations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_preregistrations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          curp: string | null
          first_name: string
          grado: string | null
          id: string
          last_name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          curp?: string | null
          first_name: string
          grado?: string | null
          id?: string
          last_name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          curp?: string | null
          first_name?: string
          grado?: string | null
          id?: string
          last_name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string | null
          expires_at: string
          id: string
          invited_by: string
          phone: string | null
          role: Database["public"]["Enums"]["member_role"]
          school_id: string
          status: Database["public"]["Enums"]["invitation_status"]
          sub_role: Database["public"]["Enums"]["member_sub_role"] | null
          temp_username: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invited_by: string
          phone?: string | null
          role: Database["public"]["Enums"]["member_role"]
          school_id: string
          status?: Database["public"]["Enums"]["invitation_status"]
          sub_role?: Database["public"]["Enums"]["member_sub_role"] | null
          temp_username?: string | null
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invited_by?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          school_id?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          sub_role?: Database["public"]["Enums"]["member_sub_role"] | null
          temp_username?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_school_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      approval_status: "pendiente" | "aprobado" | "rechazado"
      convocatoria_status: "borrador" | "activa" | "cerrada"
      convocatoria_type:
        | "formacion_spf"
        | "reunion_ordinaria"
        | "asamblea_extraordinaria"
      invitation_status: "pending" | "accepted" | "expired" | "revoked"
      log_action: "create" | "update" | "delete" | "approve" | "reject" | "sync"
      log_entity_type:
        | "payment"
        | "transaction"
        | "meeting"
        | "election"
        | "forum"
        | "notification"
        | "student"
        | "member"
        | "invitation"
      meeting_status:
        | "draft"
        | "published"
        | "in_progress"
        | "completed"
        | "cancelled"
      member_role: "director" | "docente" | "padre"
      member_sub_role: "presidente" | "tesorero" | "secretario" | "vocal"
      notification_priority: "alta" | "media" | "baja"
      payment_status: "pendiente" | "pagado" | "rechazado"
      preregistro_status: "pendiente" | "aprobado" | "rechazado"
      priority_level: "alta" | "media" | "baja"
      thread_status: "abierto" | "cerrado" | "oculto"
      thread_type: "hilo" | "encuesta"
      transaction_type: "ingreso" | "egreso"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_status: ["pendiente", "aprobado", "rechazado"],
      convocatoria_status: ["borrador", "activa", "cerrada"],
      convocatoria_type: [
        "formacion_spf",
        "reunion_ordinaria",
        "asamblea_extraordinaria",
      ],
      invitation_status: ["pending", "accepted", "expired", "revoked"],
      log_action: ["create", "update", "delete", "approve", "reject", "sync"],
      log_entity_type: [
        "payment",
        "transaction",
        "meeting",
        "election",
        "forum",
        "notification",
        "student",
        "member",
        "invitation",
      ],
      meeting_status: [
        "draft",
        "published",
        "in_progress",
        "completed",
        "cancelled",
      ],
      member_role: ["director", "docente", "padre"],
      member_sub_role: ["presidente", "tesorero", "secretario", "vocal"],
      notification_priority: ["alta", "media", "baja"],
      payment_status: ["pendiente", "pagado", "rechazado"],
      preregistro_status: ["pendiente", "aprobado", "rechazado"],
      priority_level: ["alta", "media", "baja"],
      thread_status: ["abierto", "cerrado", "oculto"],
      thread_type: ["hilo", "encuesta"],
      transaction_type: ["ingreso", "egreso"],
    },
  },
} as const
