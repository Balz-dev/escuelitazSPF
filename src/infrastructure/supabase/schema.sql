-- =============================================
-- ESQUEMA CONSOLIDADO MULTI-TENANT (EscuelitazSPF)
-- NOTA: Este archivo es para referencia estructurada.
-- Las migraciones ya fueron aplicadas exitosamente en Supabase.
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================================
-- DOMINIO 1: IDENTIDAD Y MULTI-TENANCY
-- =================================================================================
CREATE TYPE public.member_role AS ENUM ('director', 'docente', 'padre');
CREATE TYPE public.member_sub_role AS ENUM ('presidente', 'tesorero', 'secretario', 'vocal');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

CREATE TABLE public.schools (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  identifier  text UNIQUE NOT NULL,
  cct         text,
  address     text,
  logo_url    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id                   uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name            text,
  avatar_url           text,
  phone                text,
  must_change_password boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.school_members (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id  uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  is_active  boolean NOT NULL DEFAULT true,
  joined_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, user_id)
);

CREATE TABLE public.member_roles (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id     uuid NOT NULL REFERENCES public.school_members (id) ON DELETE CASCADE,
  role          public.member_role NOT NULL,
  sub_role      public.member_sub_role,
  is_substitute boolean NOT NULL DEFAULT false,
  active_since  date NOT NULL DEFAULT CURRENT_DATE,
  active_until  date
);

CREATE TABLE public.user_invitations (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id    uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  invited_by   uuid NOT NULL REFERENCES public.profiles (id),
  phone        text,
  email        text,
  temp_username text,
  token        text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  role         public.member_role NOT NULL,
  sub_role     public.member_sub_role,
  status       public.invitation_status NOT NULL DEFAULT 'pending',
  expires_at   timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- =================================================================================
-- DOMINIO 2: ALUMNOS
-- =================================================================================
CREATE TABLE public.students (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id   uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  curp        text,
  grado       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.student_parents (
  student_id   uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  parent_id    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  relationship text,
  is_primary   boolean NOT NULL DEFAULT false,
  PRIMARY KEY (student_id, parent_id)
);

-- =================================================================================
-- DOMINIO 3: REUNIONES (ASAMBLEAS)
-- =================================================================================
CREATE TYPE public.meeting_status AS ENUM ('draft', 'published', 'in_progress', 'completed', 'cancelled');

CREATE TABLE public.meetings (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id    uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  title        text NOT NULL,
  agenda       text,
  location     text,
  scheduled_at timestamptz NOT NULL,
  status       public.meeting_status NOT NULL DEFAULT 'draft',
  minutes_url  text,
  created_by   uuid NOT NULL REFERENCES public.profiles (id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.meeting_attendance (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id  uuid NOT NULL REFERENCES public.meetings (id) ON DELETE CASCADE,
  member_id   uuid NOT NULL REFERENCES public.school_members (id) ON DELETE CASCADE,
  attended    boolean NOT NULL DEFAULT false,
  signed_at   timestamptz,
  UNIQUE (meeting_id, member_id)
);

-- =================================================================================
-- DOMINIO 4: ELECCIONES
-- =================================================================================
CREATE TABLE public.election_cycles (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id        uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  nombre           text NOT NULL,
  year             integer NOT NULL,
  is_active        boolean NOT NULL DEFAULT false,
  voting_starts_at timestamptz,
  voting_ends_at   timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, year)
);

CREATE TABLE public.candidates (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id      uuid NOT NULL REFERENCES public.election_cycles (id) ON DELETE CASCADE,
  member_id     uuid NOT NULL REFERENCES public.school_members (id) ON DELETE CASCADE,
  position      public.member_sub_role NOT NULL,
  is_substitute boolean NOT NULL DEFAULT false,
  biography     text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.election_votes (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id     uuid NOT NULL REFERENCES public.election_cycles (id) ON DELETE CASCADE,
  voter_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cycle_id, voter_id, candidate_id)
);

-- =================================================================================
-- DOMINIO 5: FINANZAS
-- =================================================================================
CREATE TYPE public.payment_status AS ENUM ('pendiente', 'pagado', 'rechazado');
CREATE TYPE public.transaction_type AS ENUM ('ingreso', 'egreso');
CREATE TYPE public.approval_status AS ENUM ('pendiente', 'aprobado', 'rechazado');

CREATE TABLE public.fee_categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id   uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  name        text NOT NULL,
  amount      decimal(10,2) NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fee_payments (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id    uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  student_id   uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  category_id  uuid REFERENCES public.fee_categories (id) ON DELETE SET NULL,
  paid_by      uuid NOT NULL REFERENCES public.profiles (id),
  amount       decimal(10,2) NOT NULL,
  status       public.payment_status NOT NULL DEFAULT 'pendiente',
  receipt_url  text,
  payment_date timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.spf_financial_periods (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id     uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  nombre        text NOT NULL,
  fecha_inicio  date NOT NULL,
  fecha_fin     date NOT NULL,
  saldo_inicial decimal(10,2) NOT NULL DEFAULT 0,
  saldo_final   decimal(10,2),
  creado_por    uuid NOT NULL REFERENCES public.profiles (id),
  cerrado       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.spf_categories (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id  uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  nombre     text NOT NULL,
  tipo       public.transaction_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.spf_transactions (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id           uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  periodo_id          uuid NOT NULL REFERENCES public.spf_financial_periods (id) ON DELETE CASCADE,
  categoria_id        uuid REFERENCES public.spf_categories (id) ON DELETE SET NULL,
  tipo                public.transaction_type NOT NULL,
  monto               decimal(10,2) NOT NULL,
  concepto            text NOT NULL,
  evidencia_urls      text[] NOT NULL DEFAULT '{}',
  status_aprobacion   public.approval_status NOT NULL DEFAULT 'pendiente',
  aprobado_por        uuid REFERENCES public.profiles (id),
  registrado_por      uuid NOT NULL REFERENCES public.profiles (id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- =================================================================================
-- DOMINIO 6: FORO
-- =================================================================================
CREATE TYPE public.thread_type AS ENUM ('hilo', 'encuesta');
CREATE TYPE public.thread_status AS ENUM ('abierto', 'cerrado', 'oculto');
CREATE TYPE public.priority_level AS ENUM ('alta', 'media', 'baja');

CREATE TABLE public.forum_threads (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id       uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  creator_id      uuid NOT NULL REFERENCES public.profiles (id),
  tipo            public.thread_type NOT NULL DEFAULT 'hilo',
  titulo          text NOT NULL,
  contenido       jsonb,
  anonimato       boolean NOT NULL DEFAULT false,
  priority        public.priority_level NOT NULL DEFAULT 'media',
  status          public.thread_status NOT NULL DEFAULT 'abierto',
  target_roles    text[] NOT NULL DEFAULT '{}',
  vigencia_inicio timestamptz,
  vigencia_fin    timestamptz,
  votes_count     integer NOT NULL DEFAULT 0,
  auto_flagged    boolean NOT NULL DEFAULT false,
  closed_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.forum_comments (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id    uuid NOT NULL REFERENCES public.forum_threads (id) ON DELETE CASCADE,
  creator_id   uuid NOT NULL REFERENCES public.profiles (id),
  contenido    text NOT NULL,
  anonimato    boolean NOT NULL DEFAULT false,
  auto_flagged boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.forum_votes (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id  uuid NOT NULL REFERENCES public.forum_threads (id) ON DELETE CASCADE,
  user_id    uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  opcion     text NOT NULL,
  anonimato  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =================================================================================
-- DOMINIO 7: NOTIFICACIONES
-- =================================================================================
CREATE TYPE public.notification_priority AS ENUM ('alta', 'media', 'baja');

CREATE TABLE public.notifications (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id    uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  sender_id    uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  message      text NOT NULL,
  priority     public.notification_priority NOT NULL DEFAULT 'media',
  target_roles text[],
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notification_recipients (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id uuid NOT NULL REFERENCES public.notifications (id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  read_at         timestamptz,
  UNIQUE (notification_id, user_id)
);

-- =================================================================================
-- DOMINIO 8: TRAZABILIDAD Y LOGS (Auditoría)
-- =================================================================================
CREATE TYPE public.log_entity_type AS ENUM (
  'payment', 'transaction', 'meeting', 'election',
  'forum', 'notification', 'student', 'member', 'invitation'
);

CREATE TYPE public.log_action AS ENUM (
  'create', 'update', 'delete', 'approve', 'reject', 'sync'
);

CREATE TABLE public.action_logs (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id   uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles (id),
  entity_type public.log_entity_type NOT NULL,
  entity_id   uuid NOT NULL,
  action      public.log_action NOT NULL,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Índices extraidos
CREATE INDEX idx_action_logs_entity ON public.action_logs (entity_type, entity_id);
CREATE INDEX idx_action_logs_school ON public.action_logs (school_id, created_at DESC);

-- =================================================================================
-- DOMINIO 9: CONVOCATORIAS (Formación SPF / Reuniones)
-- =================================================================================
CREATE TYPE public.convocatoria_status AS ENUM ('borrador', 'activa', 'cerrada');
CREATE TYPE public.convocatoria_type AS ENUM ('formacion_spf', 'reunion_ordinaria', 'asamblea_extraordinaria');

CREATE TABLE public.convocatorias (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id    uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  created_by   uuid NOT NULL REFERENCES public.profiles (id),
  title        text NOT NULL,
  description  text,
  type         public.convocatoria_type NOT NULL DEFAULT 'formacion_spf',
  status       public.convocatoria_status NOT NULL DEFAULT 'borrador',
  expires_at   timestamptz,
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- =================================================================================
-- DOMINIO 10: PRE-REGISTROS DE ALUMNOS (Registro Unificado)
-- =================================================================================
CREATE TYPE public.preregistro_status AS ENUM ('pendiente', 'aprobado', 'rechazado');

CREATE TABLE public.student_preregistrations (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id       uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  curp            text,
  grado           text,
  parent_name     text NOT NULL,
  parent_phone    text NOT NULL,
  parent_email    text,
  relationship    text NOT NULL DEFAULT 'padre',
  status          public.preregistro_status NOT NULL DEFAULT 'pendiente',
  registered_by   uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  reviewed_by     uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- =================================================================================
-- STORAGE: Bucket para logos de escuelas (público)
-- =================================================================================
-- Bucket: school-assets (5 MB max, solo imágenes)
-- Los avatares de usuario son locales (IndexedDB/Dexie) — no requieren bucket.

-- =================================================================================
-- POLÍTICAS RLS Y TRIGGERS (Resumen de las reglas de negocio implementadas)
-- [Se aplican al crear RLS individualmente, y aseguradas por Supabase Role policies]
-- =================================================================================

