# Agenda de reservas en wacrm — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Darle a E&E Gastronomía una agenda operativa dentro de wacrm, donde el equipo cargue y gestione todas las reservas —lleguen por la web, por WhatsApp, por Instagram o por teléfono— con el contacto y la tarjeta de pipeline creados automáticamente.

**Architecture:** Todo vive en un fork de wacrm (Next.js 16 + Supabase). Una migración agrega la tabla `bookings` siguiendo el patrón de tenencia `account_id` + `is_account_member` que ya usan sus 36 migraciones. Una función TypeScript compartida crea la reserva y sincroniza el CRM, y la llaman dos caminos: la ruta pública que recibe el formulario del sitio (service role, solo servidor) y la página de calendario del panel (cliente con RLS, como ya hace la página de pipelines).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Supabase (Postgres + Auth + RLS), Vitest (entorno `node`).

Este plan cubre los componentes 5, 6, 7 y 8 del spec
`docs/superpowers/specs/2026-08-08-e-e-gastronomia-puesta-en-produccion-design.md`.
El despliegue es un plan aparte y requiere el dominio configurado.

## Global Constraints

- **Tenencia: la columna es `account_id`, nunca `team_id`.** Cada tabla lleva exactamente
  cuatro políticas nombradas `<tabla>_select`, `_insert`, `_update`, `_delete`, apoyadas en
  `is_account_member(account_id, min_role)`. Jerarquía: `owner > admin > agent > viewer`.
- **Toda fila lleva `user_id` Y `account_id`.** `user_id` es `NOT NULL` desde la migración
  001; `account_id` se agregó en la 017. Un `INSERT` con solo uno de los dos falla.
- **Las migraciones son idempotentes** (`IF NOT EXISTS` para tablas e índices,
  `DROP POLICY IF EXISTS` antes de crear políticas) y se numeran `NNN_nombre.sql`. La última
  existente es la `036`; la nuestra es la `037`.
- **La service role key solo se usa en código que corre en el servidor.** Nunca en un
  componente cliente ni en nada bajo `NEXT_PUBLIC_`.
- **El `account_id` del endpoint público sale de `BOOKINGS_ACCOUNT_ID`** (variable de entorno
  del servidor), nunca del cuerpo del pedido.
- **Los conflictos de fecha se avisan, no se bloquean.** No hay constraint de unicidad sobre
  `event_date`.
- **Nunca parsear una fecha con `new Date("YYYY-MM-DD")`.** Un string ISO solo-fecha se
  interpreta como medianoche **UTC**; en Montevideo (UTC−3) eso cae el día anterior a las
  21:00, y `getDay()` / `getDate()` devuelven el día equivocado. En un calendario de reservas
  eso significa mostrar un casamiento el 23 cuando es el 24. Reglas concretas:
  - `event_date` viaja siempre como string `YYYY-MM-DD` y se compara **como string**.
  - Las claves de día se arman con plantilla (`` `${y}-${pad(m)}-${pad(d)}` ``), nunca con
    `toISOString()`, que convierte a UTC.
  - Cuando haga falta un `Date` real, usar el constructor **local** de tres argumentos:
    `new Date(year, monthIndex, day)`. Ese sí respeta la zona horaria de la máquina.
  - Esto no es teórico: dos tests del upstream (`src/lib/dashboard/date-utils.test.ts`)
    fallan en cualquier huso negativo por exactamente este motivo.
- **El fork se crea con remote a upstream** para poder traer correcciones.
- Textos de interfaz en inglés y coreano (`messages/en.json`, `messages/ko.json`), siguiendo
  el patrón `labelKey` del sidebar.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `supabase/migrations/037_bookings.sql` | Tabla `bookings`, índices, RLS |
| `src/lib/bookings/types.ts` | Tipos y constantes compartidas (`BookingStatus`, `BookingSource`) |
| `src/lib/bookings/create.ts` | Crear reserva + sincronizar CRM. Recibe el cliente Supabase |
| `src/lib/bookings/create.test.ts` | Tests de la lógica de creación y del best-effort |
| `src/lib/bookings/queries.ts` | Leer reservas de un mes, contar por día |
| `src/lib/bookings/queries.test.ts` | Tests de rango de fechas |
| `src/app/api/bookings/route.ts` | Endpoint público del formulario (POST, OPTIONS) |
| `src/app/api/bookings/route.test.ts` | Validación, honeypot, límite de tasa, CORS |
| `src/app/(dashboard)/agenda/page.tsx` | Página del calendario |
| `src/components/agenda/month-grid.tsx` | Grilla mensual |
| `src/components/agenda/booking-form.tsx` | Alta manual |
| `src/components/agenda/booking-detail.tsx` | Detalle y cambio de estado |
| `src/components/layout/sidebar.tsx` | Ítem de navegación |
| `src/middleware.ts` | `/agenda` como ruta protegida |
| `messages/en.json`, `messages/ko.json` | Etiquetas |
| `.env.example` | `BOOKINGS_ACCOUNT_ID`, `BOOKINGS_ALLOWED_ORIGIN` |

---

### Task 1: Fork, entorno y proyecto Supabase

Sin una base real no se puede verificar ninguna migración, así que esta tarea deja el
entorno listo y ejecutando las 36 migraciones existentes.

**Files:**
- Ninguno del repo — es preparación de entorno.

**Interfaces:**
- Consumes: nada.
- Produces: un fork clonado con remote `upstream`, un proyecto Supabase con el esquema de
  wacrm aplicado, y un `.env.local` funcional. Las tareas siguientes asumen todo esto.

- [ ] **Step 1: Forkear con remote a upstream**

Forkear `https://github.com/ArnasDon/wacrm` a la cuenta `paulcj20` desde la interfaz de
GitHub, y después:

```bash
git clone https://github.com/paulcj20/wacrm.git
cd wacrm
git remote add upstream https://github.com/ArnasDon/wacrm.git
git remote -v
```

Esperado: `origin` apunta a `paulcj20/wacrm` y `upstream` a `ArnasDon/wacrm`. Sin
`upstream` no se pueden traer correcciones del proyecto original más adelante.

- [ ] **Step 2: Crear el proyecto Supabase**

Crear un proyecto nuevo en supabase.com (plan free, región más cercana a Uruguay). Anotar
la URL del proyecto, la `anon key` y la `service_role key`.

- [ ] **Step 3: Aplicar las 36 migraciones existentes**

En el SQL Editor de Supabase, ejecutar en orden `supabase/migrations/001_*.sql` hasta
`036_*.sql`. Son idempotentes, así que reejecutar una no rompe nada.

Verificar al terminar:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
```

Esperado: aparecen al menos `accounts`, `profiles`, `contacts`, `conversations`, `deals`,
`pipelines`, `pipeline_stages`.

```sql
SELECT proname FROM pg_proc WHERE proname = 'is_account_member';
```

Esperado: una fila. Si no aparece, la migración 017 no corrió y **nada del resto del plan
va a funcionar**.

- [ ] **Step 4: Configurar el entorno local**

```bash
cp .env.example .env.local
```

Completar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY`, más `ENCRYPTION_KEY` (32 bytes en hex) según pida el
`.env.example` del proyecto.

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`, registrarse, y confirmar que entra al dashboard.

- [ ] **Step 5: Anotar el `account_id` de la cuenta**

```sql
SELECT p.account_id, p.account_role, a.name
FROM profiles p JOIN accounts a ON a.id = p.account_id;
```

Guardar ese UUID: es el valor de `BOOKINGS_ACCOUNT_ID` de la Tarea 4.

- [ ] **Step 6: Verificar que la suite existente pasa**

```bash
npm test
```

Esperado: la suite de wacrm pasa. Si algo falla ya en este punto, es un problema heredado
del upstream y hay que anotarlo antes de agregar código propio.

---

### Task 2: Migración de la tabla `bookings`

**Files:**
- Create: `supabase/migrations/037_bookings.sql`

**Interfaces:**
- Consumes: `accounts`, `contacts`, `is_account_member`, `update_updated_at_column` — todos
  del esquema existente.
- Produces: la tabla `bookings` con estas columnas exactas, que las tareas siguientes usan
  por nombre: `id`, `account_id`, `user_id`, `contact_id`, `client_name`, `email`, `phone`,
  `event_date`, `event_time`, `guest_count`, `event_type`, `message`, `status`, `source`,
  `created_at`, `updated_at`.

- [ ] **Step 1: Escribir la migración**

Crear `supabase/migrations/037_bookings.sql`:

```sql
-- ============================================================
-- BOOKINGS — la agenda operativa del negocio.
--
-- Las reservas llegan por varios canales (web, WhatsApp, Instagram,
-- telefono, presencial); `source` registra cual. La web es solo uno.
--
-- Idempotente, como el resto de las migraciones.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status_enum') THEN
    CREATE TYPE booking_status_enum AS ENUM ('pendiente', 'confirmada', 'rechazada');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_source_enum') THEN
    CREATE TYPE booking_source_enum AS ENUM
      ('web', 'whatsapp', 'instagram', 'telefono', 'presencial', 'otro');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Ambas columnas de tenencia: user_id viene del patron de la 001,
  -- account_id del de la 017. Las dos son obligatorias.
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- El contacto puede faltar si la sincronizacion con el CRM fallo;
  -- la reserva nunca se pierde por eso. ON DELETE SET NULL para que
  -- borrar un contacto no borre su historial de eventos.
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  client_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,

  event_date DATE NOT NULL,
  event_time TIME,
  guest_count INTEGER,
  event_type TEXT,
  message TEXT,

  status booking_status_enum NOT NULL DEFAULT 'pendiente',
  source booking_source_enum NOT NULL DEFAULT 'otro',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- El calendario consulta siempre por rango de fechas dentro de una cuenta.
CREATE INDEX IF NOT EXISTS idx_bookings_account_date
  ON bookings (account_id, event_date);

CREATE INDEX IF NOT EXISTS idx_bookings_contact
  ON bookings (contact_id);

-- NO hay UNIQUE sobre event_date: los conflictos se avisan en la interfaz,
-- no se bloquean en la base. Un sistema que impide cargar un evento extra
-- empuja al equipo a anotarlo en un papel, y ahi el panel deja de reflejar
-- la realidad.

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bookings_select ON bookings;
DROP POLICY IF EXISTS bookings_insert ON bookings;
DROP POLICY IF EXISTS bookings_update ON bookings;
DROP POLICY IF EXISTS bookings_delete ON bookings;

CREATE POLICY bookings_select ON bookings FOR SELECT
  USING (is_account_member(account_id));
CREATE POLICY bookings_insert ON bookings FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY bookings_update ON bookings FOR UPDATE
  USING (is_account_member(account_id, 'agent'));
CREATE POLICY bookings_delete ON bookings FOR DELETE
  USING (is_account_member(account_id, 'admin'));

DROP TRIGGER IF EXISTS set_updated_at ON bookings;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Notar que el borrado exige `admin` y no `agent`: una reserva borrada es información de
negocio perdida, mientras que rechazarla la conserva.

- [ ] **Step 2: Aplicar la migración**

Ejecutar el archivo completo en el SQL Editor de Supabase.

- [ ] **Step 3: Verificar la estructura**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings' ORDER BY ordinal_position;
```

Esperado: `event_date` es `date` (no `text`), `event_time` es `time without time zone`,
`account_id` y `user_id` son `NOT NULL`, `contact_id` es nullable.

- [ ] **Step 4: Verificar que las cuatro políticas existen**

```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'bookings' ORDER BY policyname;
```

Esperado exactamente cuatro filas: `bookings_delete` (DELETE), `bookings_insert` (INSERT),
`bookings_select` (SELECT), `bookings_update` (UPDATE).

- [ ] **Step 5: Verificar que la RLS efectivamente aísla**

Este es el paso que evita el fallo silencioso más caro del proyecto: una política mal
puesta hace que el calendario devuelva vacío sin ningún error.

No alcanza con comprobar que el dueño ve la fila: hay que comprobar también que **alguien de
otra cuenta no la ve**. Una política que admite a todos pasa la primera mitad de la prueba y
falla en lo único que importa.

En el SQL Editor, que corre como `postgres` y evita RLS, insertar una fila de prueba con los
UUID reales de la cuenta:

```sql
INSERT INTO bookings (account_id, user_id, client_name, phone, event_date, source)
VALUES ('<ACCOUNT_ID>', '<USER_ID>', 'Prueba RLS', '59891908707', CURRENT_DATE, 'otro');

-- ¿La ve el dueño de la cuenta?
BEGIN;
  SELECT set_config('request.jwt.claims',
    '{"sub":"<USER_ID>","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) AS visibles_para_el_dueno FROM bookings;
ROLLBACK;

-- ¿La ve alguien de otra cuenta?
BEGIN;
  SELECT set_config('request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) AS visibles_para_un_extrano FROM bookings;
ROLLBACK;
```

`set_config('request.jwt.claims', …)` es de donde `auth.uid()` lee el usuario, así que esto
simula una sesión real sin necesitar el navegador.

**Esperado: `1` y `0`.** Si la primera da `0`, la política de SELECT no reconoce al dueño y
el calendario va a salir vacío sin ningún error. Si la segunda da `1`, la RLS no aísla y cada
cuenta vería las reservas de las demás.

- [ ] **Step 6: Limpiar la fila de prueba y commitear**

```sql
DELETE FROM bookings WHERE client_name = 'Prueba RLS';
```

```bash
git add supabase/migrations/037_bookings.sql
git commit -m "feat(db): add bookings table with account_id RLS

La agenda operativa del negocio. source registra el canal de entrada
porque la mayoria de las reservas no llegan por la web. Sin UNIQUE
sobre event_date: los conflictos se avisan, no se bloquean."
```

---

### Task 3: Tipos y creación de reservas

El corazón del plan. Una sola función crea la reserva y sincroniza el CRM, y la reciben
tanto la ruta pública como la página del panel — cada una con su propio cliente Supabase.
Así no hay dos implementaciones que se desincronicen.

**Files:**
- Create: `src/lib/bookings/types.ts`
- Create: `src/lib/bookings/create.ts`
- Create: `src/lib/bookings/create.test.ts`

**Interfaces:**
- Consumes: la tabla `bookings` de la Tarea 2.
- Produces:
  - `BOOKING_STATUSES`, `BOOKING_SOURCES` (arrays readonly), tipos `BookingStatus`,
    `BookingSource`, e interfaz `Booking`.
  - `NewBookingInput` — `{ clientName: string; email?: string | null; phone: string; eventDate: string; eventTime?: string | null; guestCount?: number | null; eventType?: string | null; message?: string | null; source: BookingSource }`
  - `createBooking(supabase: SupabaseClient, accountId: string, userId: string, input: NewBookingInput): Promise<{ bookingId: string; contactId: string | null; crmSynced: boolean }>`
  - `syncBookingToCrm(supabase: SupabaseClient, accountId: string, userId: string, input: NewBookingInput, bookingId: string): Promise<string | null>` — devuelve el `contact_id`, o `null` si falló.

- [ ] **Step 1: Escribir los tipos**

Crear `src/lib/bookings/types.ts`:

```ts
export const BOOKING_STATUSES = ['pendiente', 'confirmada', 'rechazada'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_SOURCES = [
  'web',
  'whatsapp',
  'instagram',
  'telefono',
  'presencial',
  'otro',
] as const;
export type BookingSource = (typeof BOOKING_SOURCES)[number];

export interface Booking {
  id: string;
  account_id: string;
  user_id: string;
  contact_id: string | null;
  client_name: string;
  email: string | null;
  phone: string;
  /** ISO `YYYY-MM-DD`. */
  event_date: string;
  /** `HH:MM:SS` o null. */
  event_time: string | null;
  guest_count: number | null;
  event_type: string | null;
  message: string | null;
  status: BookingStatus;
  source: BookingSource;
  created_at: string;
  updated_at: string;
}

export interface NewBookingInput {
  clientName: string;
  email?: string | null;
  phone: string;
  /** ISO `YYYY-MM-DD`. */
  eventDate: string;
  /** `HH:MM` o `HH:MM:SS`. */
  eventTime?: string | null;
  guestCount?: number | null;
  eventType?: string | null;
  message?: string | null;
  source: BookingSource;
}
```

- [ ] **Step 2: Escribir los tests que fallan**

Crear `src/lib/bookings/create.test.ts`. Los tests documentan la garantía más importante del
diseño: **una reserva nunca se pierde porque el CRM falle**.

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createBooking } from './create';

/**
 * Constructor de un doble de Supabase. Cada tabla devuelve el resultado
 * que le indiquemos, y registramos las llamadas para poder afirmar sobre
 * los payloads.
 */
function makeSupabase(handlers: Record<string, unknown>) {
  const calls: Array<{ table: string; op: string; payload: unknown }> = [];

  const client = {
    calls,
    from(table: string) {
      return {
        insert(payload: unknown) {
          calls.push({ table, op: 'insert', payload });
          return {
            select: () => ({
              single: async () => handlers[`${table}.insert`],
            }),
          };
        },
        upsert(payload: unknown, options: unknown) {
          calls.push({ table, op: 'upsert', payload: { payload, options } });
          return {
            select: () => ({
              single: async () => handlers[`${table}.upsert`],
            }),
          };
        },
        select() {
          return {
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => handlers[`${table}.select`],
              }),
            }),
          };
        },
      };
    },
  };

  return client as never;
}

const input = {
  clientName: 'Ana López',
  email: 'ana@ejemplo.com',
  phone: '+598 91 908 707',
  eventDate: '2026-12-24',
  eventTime: '21:00',
  guestCount: 80,
  eventType: 'Bodas',
  message: 'Menú sin gluten',
  source: 'web' as const,
};

describe('createBooking', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('guarda la reserva con account_id y user_id', async () => {
    const supabase = makeSupabase({
      'bookings.insert': { data: { id: 'booking-1' }, error: null },
      'contacts.upsert': { data: { id: 'contact-1' }, error: null },
      'pipelines.select': { data: null, error: null },
    });

    const result = await createBooking(supabase, 'account-1', 'user-1', input);

    expect(result.bookingId).toBe('booking-1');
    const insert = (supabase as never as { calls: Array<{ table: string; payload: Record<string, unknown> }> })
      .calls.find((c) => c.table === 'bookings');
    expect(insert?.payload.account_id).toBe('account-1');
    expect(insert?.payload.user_id).toBe('user-1');
    expect(insert?.payload.source).toBe('web');
    expect(insert?.payload.status).toBe('pendiente');
  });

  it('normaliza la hora a HH:MM:SS', async () => {
    const supabase = makeSupabase({
      'bookings.insert': { data: { id: 'booking-1' }, error: null },
      'contacts.upsert': { data: { id: 'contact-1' }, error: null },
      'pipelines.select': { data: null, error: null },
    });

    await createBooking(supabase, 'account-1', 'user-1', input);

    const insert = (supabase as never as { calls: Array<{ table: string; payload: Record<string, unknown> }> })
      .calls.find((c) => c.table === 'bookings');
    expect(insert?.payload.event_time).toBe('21:00:00');
  });

  it('guarda la reserva igual cuando la sincronizacion con el CRM falla', async () => {
    const supabase = makeSupabase({
      'bookings.insert': { data: { id: 'booking-1' }, error: null },
      'contacts.upsert': { data: null, error: { message: 'rls denied' } },
      'pipelines.select': { data: null, error: null },
    });

    const result = await createBooking(supabase, 'account-1', 'user-1', input);

    expect(result.bookingId).toBe('booking-1');
    expect(result.crmSynced).toBe(false);
    expect(result.contactId).toBeNull();
  });

  it('propaga el error si la reserva misma no se pudo guardar', async () => {
    const supabase = makeSupabase({
      'bookings.insert': { data: null, error: { message: 'boom' } },
    });

    await expect(
      createBooking(supabase, 'account-1', 'user-1', input),
    ).rejects.toThrow(/boom/);
  });
});
```

- [ ] **Step 3: Correr los tests y verificar que fallan**

```bash
npm test -- src/lib/bookings/create.test.ts
```

Esperado: FAIL con "Cannot find module './create'".

- [ ] **Step 4: Implementar la creación**

Crear `src/lib/bookings/create.ts`:

```ts
// ============================================================
// Alta de reservas.
//
// Una sola implementacion para los dos caminos de entrada:
//   - la ruta publica del formulario del sitio (cliente service-role,
//     solo servidor)
//   - la pagina de agenda del panel (cliente con RLS del usuario)
//
// El cliente Supabase se recibe por parametro justamente para que la
// logica no se duplique entre ambos.
//
// Garantia central: la reserva se guarda primero y la sincronizacion
// con el CRM es best-effort. Un fallo creando el contacto o la tarjeta
// nunca hace perder la reserva — eso seria perder trabajo del negocio
// por un problema secundario.
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';

import { normalizePhone } from '@/lib/whatsapp/phone-utils';

import type { NewBookingInput } from './types';

export interface CreateBookingResult {
  bookingId: string;
  contactId: string | null;
  crmSynced: boolean;
}

/** Postgres `time` quiere HH:MM:SS; el input del navegador da HH:MM. */
function normalizeTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const parts = value.split(':');
  if (parts.length < 2) return null;
  const hh = parts[0].padStart(2, '0');
  const mm = parts[1].padStart(2, '0');
  const ss = (parts[2] ?? '00').padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/**
 * Crea o reutiliza el contacto y le cuelga una tarjeta de pipeline.
 *
 * La deduplicacion por telefono no se implementa aca: la base ya tiene
 * una columna generada `phone_normalized` con un indice
 * UNIQUE (account_id, phone_normalized), asi que alcanza con ON CONFLICT.
 *
 * Devuelve el contact_id, o null si algo fallo.
 */
export async function syncBookingToCrm(
  supabase: SupabaseClient,
  accountId: string,
  userId: string,
  input: NewBookingInput,
  bookingId: string,
): Promise<string | null> {
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .upsert(
      {
        account_id: accountId,
        user_id: userId,
        phone: input.phone,
        name: input.clientName,
        email: input.email ?? null,
      },
      { onConflict: 'account_id,phone_normalized' },
    )
    .select('id')
    .single();

  if (contactError || !contact) {
    console.error('[bookings] contact upsert failed:', contactError);
    return null;
  }

  // La tarjeta es opcional: si no hay pipeline configurado todavia,
  // la reserva y el contacto ya cumplieron su funcion.
  try {
    const { data: pipeline } = await supabase
      .from('pipelines')
      .select('id')
      .eq('account_id', accountId)
      .eq('name', 'Sales Pipeline')
      .maybeSingle();

    if (pipeline) {
      const { data: stage } = await supabase
        .from('pipeline_stages')
        .select('id')
        .eq('pipeline_id', pipeline.id)
        .order('position', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (stage) {
        await supabase.from('deals').insert({
          account_id: accountId,
          user_id: userId,
          pipeline_id: pipeline.id,
          stage_id: stage.id,
          contact_id: contact.id,
          title: `${input.eventType ?? 'Evento'} — ${input.clientName}`,
          // expected_close_date ya existe en deals y es DATE: la fecha
          // del evento entra ahi sin inventar columnas.
          expected_close_date: input.eventDate,
          notes: `Reserva ${bookingId}`,
        });
      }
    }
  } catch (err) {
    console.error('[bookings] deal creation failed:', err);
  }

  return contact.id;
}

export async function createBooking(
  supabase: SupabaseClient,
  accountId: string,
  userId: string,
  input: NewBookingInput,
): Promise<CreateBookingResult> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      account_id: accountId,
      user_id: userId,
      client_name: input.clientName,
      email: input.email ?? null,
      phone: input.phone,
      event_date: input.eventDate,
      event_time: normalizeTime(input.eventTime),
      guest_count: input.guestCount ?? null,
      event_type: input.eventType ?? null,
      message: input.message ?? null,
      status: 'pendiente',
      source: input.source,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`No se pudo guardar la reserva: ${error?.message ?? 'sin datos'}`);
  }

  const bookingId = data.id as string;

  let contactId: string | null = null;
  try {
    contactId = await syncBookingToCrm(supabase, accountId, userId, input, bookingId);
  } catch (err) {
    console.error('[bookings] crm sync threw:', err);
  }

  if (contactId) {
    await supabase.from('bookings').update({ contact_id: contactId }).eq('id', bookingId);
  }

  return { bookingId, contactId, crmSynced: contactId !== null };
}

export { normalizePhone };
```

- [ ] **Step 5: Correr los tests y verificar que pasan**

```bash
npm test -- src/lib/bookings/create.test.ts
```

Esperado: los 4 tests en PASS. Si el test del `update` de `contact_id` rompe el doble,
agregar `update` al constructor `makeSupabase` devolviendo `{ eq: async () => ({ error: null }) }`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/bookings/
git commit -m "feat(bookings): shared create + best-effort CRM sync

Una sola implementacion para la ruta publica y el panel; el cliente
Supabase entra por parametro. La reserva se guarda antes de tocar el
CRM, asi un fallo del CRM nunca hace perder trabajo del negocio."
```

---

### Task 4: Endpoint público del formulario

**Files:**
- Create: `src/app/api/bookings/route.ts`
- Create: `src/app/api/bookings/route.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `createBooking` de la Tarea 3, `supabaseAdmin` de `@/lib/flows/admin-client`,
  `checkRateLimit` / `rateLimitResponse` / `RATE_LIMITS` de `@/lib/rate-limit`.
- Produces: `POST /api/bookings` y `OPTIONS /api/bookings`. Acepta exactamente el contrato
  que ya emite el formulario del sitio: `clientName`, `email`, `phone`, `eventDate`
  (`YYYY-MM-DD`), `eventTime` (`HH:MM:00`), `guestCount` (número), `eventType`, `message`,
  `contactPreference` (honeypot). Responde 201, 400, 429.

- [ ] **Step 1: Agregar las variables de entorno**

En `.env.example`, agregar:

```
# Cuenta a la que pertenecen las reservas que llegan por el formulario
# publico. Sale del servidor, NUNCA del cuerpo del pedido: si viniera en
# el JSON cualquiera podria escribir reservas en la cuenta de otro.
BOOKINGS_ACCOUNT_ID=

# Origen autorizado para el CORS del formulario publico.
BOOKINGS_ALLOWED_ORIGIN=https://eyegastronomia.com
```

Completar `BOOKINGS_ACCOUNT_ID` en `.env.local` con el UUID anotado en la Tarea 1 Step 5.

- [ ] **Step 2: Agregar el límite de tasa**

En `src/lib/rate-limit.ts`, dentro del objeto `RATE_LIMITS`, agregar:

```ts
  /** Formulario publico de reservas, por IP. 5/min: una persona
   *  cargando una reserva de verdad no necesita mas, y corta el spam
   *  automatizado sin molestar a nadie real. */
  publicBooking: { limit: 5, windowMs: 60_000 },
```

- [ ] **Step 3: Escribir los tests que fallan**

Crear `src/app/api/bookings/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createBooking: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/bookings/create', () => ({
  createBooking: mocks.createBooking,
}));

vi.mock('@/lib/flows/admin-client', () => ({
  supabaseAdmin: { name: 'admin-client' },
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  rateLimitResponse: () => Response.json({ error: 'rate limited' }, { status: 429 }),
  RATE_LIMITS: { publicBooking: { limit: 5, windowMs: 60_000 } },
}));

import { OPTIONS, POST } from './route';

const validBody = {
  clientName: 'Ana López',
  email: 'ana@ejemplo.com',
  phone: '+59891908707',
  eventDate: '2026-12-24',
  eventTime: '21:00:00',
  guestCount: 80,
  eventType: 'Bodas',
  message: 'Sin gluten',
  contactPreference: '',
};

function request(body: unknown) {
  return new Request('http://localhost/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin: 'https://eyegastronomia.com' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.stubEnv('BOOKINGS_ACCOUNT_ID', 'account-1');
  vi.stubEnv('BOOKINGS_ALLOWED_ORIGIN', 'https://eyegastronomia.com');
  mocks.createBooking.mockReset();
  mocks.checkRateLimit.mockReset();
  mocks.checkRateLimit.mockReturnValue({ success: true });
  mocks.createBooking.mockResolvedValue({
    bookingId: 'booking-1',
    contactId: 'contact-1',
    crmSynced: true,
  });
});

describe('POST /api/bookings', () => {
  it('crea la reserva con source web y responde 201', async () => {
    const response = await POST(request(validBody));

    expect(response.status).toBe(201);
    expect(mocks.createBooking).toHaveBeenCalledTimes(1);
    const [, accountId, , input] = mocks.createBooking.mock.calls[0];
    expect(accountId).toBe('account-1');
    expect(input.source).toBe('web');
    expect(input.phone).toBe('+59891908707');
  });

  it('nunca toma el account_id del cuerpo del pedido', async () => {
    await POST(request({ ...validBody, account_id: 'cuenta-ajena', accountId: 'cuenta-ajena' }));

    const [, accountId] = mocks.createBooking.mock.calls[0];
    expect(accountId).toBe('account-1');
  });

  it('descarta en silencio cuando el honeypot viene lleno', async () => {
    const response = await POST(request({ ...validBody, contactPreference: 'soy un bot' }));

    // 201 a proposito: un bot no debe poder distinguir el descarte
    // de un envio exitoso, o ajusta su ataque.
    expect(response.status).toBe(201);
    expect(mocks.createBooking).not.toHaveBeenCalled();
  });

  it('rechaza cuando falta el telefono', async () => {
    const response = await POST(request({ ...validBody, phone: '' }));

    expect(response.status).toBe(400);
    expect(mocks.createBooking).not.toHaveBeenCalled();
  });

  it('rechaza una fecha con formato invalido', async () => {
    const response = await POST(request({ ...validBody, eventDate: '24/12/2026' }));

    expect(response.status).toBe(400);
    expect(mocks.createBooking).not.toHaveBeenCalled();
  });

  it('rechaza textos desmesurados', async () => {
    const response = await POST(request({ ...validBody, message: 'x'.repeat(5001) }));

    expect(response.status).toBe(400);
  });

  it('responde 429 cuando se pasa del limite por IP', async () => {
    mocks.checkRateLimit.mockReturnValue({ success: false });

    const response = await POST(request(validBody));

    expect(response.status).toBe(429);
    expect(mocks.createBooking).not.toHaveBeenCalled();
  });

  it('devuelve las cabeceras CORS del origen permitido', async () => {
    const response = await POST(request(validBody));

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://eyegastronomia.com',
    );
  });

  it('responde el preflight OPTIONS', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });
});
```

- [ ] **Step 4: Correr los tests y verificar que fallan**

```bash
npm test -- src/app/api/bookings/route.test.ts
```

Esperado: FAIL con "Cannot find module './route'".

- [ ] **Step 5: Implementar la ruta**

Crear `src/app/api/bookings/route.ts`:

```ts
// ============================================================
// POST /api/bookings — endpoint publico del formulario del sitio.
//
// Es la UNICA superficie de este proyecto expuesta a internet sin
// autenticacion, asi que concentra las defensas: limite por IP,
// honeypot, validacion de esquema y topes de longitud.
//
// Usa la service role porque no hay sesion de usuario y la RLS de
// bookings exige ser miembro de la cuenta. La clave vive solo en el
// servidor; este archivo nunca se envia al navegador.
//
// El account_id sale de BOOKINGS_ACCOUNT_ID, jamas del cuerpo del
// pedido: si viniera en el JSON, cualquiera podria escribir reservas
// en la cuenta de otro.
// ============================================================

import { NextResponse } from 'next/server';

import { createBooking } from '@/lib/bookings/create';
import { supabaseAdmin } from '@/lib/flows/admin-client';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit';

const MAX_LEN = { clientName: 200, email: 320, phone: 40, eventType: 100, message: 5000 };

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': process.env.BOOKINGS_ALLOWED_ORIGIN ?? '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/** Misma heuristica que la ruta publica de invitaciones. */
function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const xri = request.headers.get('x-real-ip');
  if (xri) return xri.trim();
  return 'unknown';
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function tooLong(value: unknown, max: number): boolean {
  return typeof value === 'string' && value.length > max;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`booking:${ip}`, RATE_LIMITS.publicBooking);
  if (!limit.success) return rateLimitResponse(limit);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400, headers: corsHeaders() });
  }

  // Honeypot. Respondemos 201 igual que un envio bueno: si devolvieramos
  // un error, el bot sabria que lo detectamos y ajustaria el ataque.
  if (typeof body.contactPreference === 'string' && body.contactPreference.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 201, headers: corsHeaders() });
  }

  const clientName = typeof body.clientName === 'string' ? body.clientName.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : null;

  if (!clientName || !phone || !isIsoDate(body.eventDate)) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400, headers: corsHeaders() });
  }

  if (
    tooLong(clientName, MAX_LEN.clientName) ||
    tooLong(email, MAX_LEN.email) ||
    tooLong(phone, MAX_LEN.phone) ||
    tooLong(body.eventType, MAX_LEN.eventType) ||
    tooLong(body.message, MAX_LEN.message)
  ) {
    return NextResponse.json({ error: 'too_long' }, { status: 400, headers: corsHeaders() });
  }

  const accountId = process.env.BOOKINGS_ACCOUNT_ID;
  if (!accountId) {
    console.error('[bookings] BOOKINGS_ACCOUNT_ID is not set');
    return NextResponse.json({ error: 'server_error' }, { status: 500, headers: corsHeaders() });
  }

  // La reserva publica se atribuye al dueño de la cuenta, porque no hay
  // usuario que la haya cargado.
  const { data: account } = await supabaseAdmin
    .from('accounts')
    .select('owner_user_id')
    .eq('id', accountId)
    .single();

  if (!account) {
    console.error('[bookings] BOOKINGS_ACCOUNT_ID does not match any account');
    return NextResponse.json({ error: 'server_error' }, { status: 500, headers: corsHeaders() });
  }

  try {
    await createBooking(supabaseAdmin, accountId, account.owner_user_id as string, {
      clientName,
      email,
      phone,
      eventDate: body.eventDate,
      eventTime: typeof body.eventTime === 'string' ? body.eventTime : null,
      guestCount: typeof body.guestCount === 'number' ? body.guestCount : null,
      eventType: typeof body.eventType === 'string' ? body.eventType : null,
      message: typeof body.message === 'string' ? body.message : null,
      source: 'web',
    });
  } catch (err) {
    console.error('[bookings] create failed:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500, headers: corsHeaders() });
  }

  return NextResponse.json({ ok: true }, { status: 201, headers: corsHeaders() });
}
```

- [ ] **Step 6: Correr los tests y verificar que pasan**

```bash
npm test -- src/app/api/bookings/route.test.ts
```

Esperado: los 9 tests en PASS. El test de `accounts.select` puede requerir extender el mock
de `supabaseAdmin` a `{ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { owner_user_id: 'user-1' } }) }) }) }) }`;
ajustarlo si falla.

- [ ] **Step 7: Probar contra la base real**

Con `npm run dev` corriendo:

```bash
curl -i -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"clientName":"Prueba curl","phone":"+59891908707","eventDate":"2026-12-24","eventTime":"21:00:00","guestCount":50,"eventType":"Bodas","message":"prueba","contactPreference":""}'
```

Esperado: `HTTP/1.1 201`. Verificar en Supabase:

```sql
SELECT client_name, source, status, event_date, contact_id FROM bookings
WHERE client_name = 'Prueba curl';
```

Esperado: una fila con `source = 'web'`, `status = 'pendiente'` y `contact_id` no nulo — eso
último confirma que la sincronización con el CRM funcionó contra la base real.

- [ ] **Step 8: Commit**

```bash
git add src/app/api/bookings/ src/lib/rate-limit.ts .env.example
git commit -m "feat(bookings): public booking endpoint

Unica superficie sin autenticacion del proyecto: limite por IP,
honeypot que responde 201 para no darle señal al bot, validacion y
topes de longitud. El account_id sale del entorno, nunca del body."
```

---

### Task 5: Consultas del calendario

**Files:**
- Create: `src/lib/bookings/queries.ts`
- Create: `src/lib/bookings/queries.test.ts`

**Interfaces:**
- Consumes: la tabla `bookings`, el tipo `Booking` de la Tarea 3.
- Produces:
  - `monthRange(year: number, month: number): { from: string; to: string }` — `month` es
    1-12; devuelve el primer y último día del mes en `YYYY-MM-DD`.
  - `listBookingsForMonth(supabase, accountId, year, month): Promise<Booking[]>`
  - `countByDate(bookings: Booking[]): Map<string, number>` — clave `YYYY-MM-DD`, para
    detectar días con más de una reserva.

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/lib/bookings/queries.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { countByDate, monthRange } from './queries';
import type { Booking } from './types';

describe('monthRange', () => {
  it('cubre un mes de 31 dias', () => {
    expect(monthRange(2026, 12)).toEqual({ from: '2026-12-01', to: '2026-12-31' });
  });

  it('cubre un mes de 30 dias', () => {
    expect(monthRange(2026, 11)).toEqual({ from: '2026-11-01', to: '2026-11-30' });
  });

  it('cubre febrero en año bisiesto', () => {
    expect(monthRange(2028, 2)).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });

  it('cubre febrero en año no bisiesto', () => {
    expect(monthRange(2026, 2)).toEqual({ from: '2026-02-01', to: '2026-02-28' });
  });
});

function booking(date: string): Booking {
  return {
    id: date,
    account_id: 'a',
    user_id: 'u',
    contact_id: null,
    client_name: 'x',
    email: null,
    phone: '1',
    event_date: date,
    event_time: null,
    guest_count: null,
    event_type: null,
    message: null,
    status: 'pendiente',
    source: 'otro',
    created_at: '',
    updated_at: '',
  };
}

describe('countByDate', () => {
  it('cuenta cuantas reservas caen en cada dia', () => {
    const counts = countByDate([
      booking('2026-12-24'),
      booking('2026-12-24'),
      booking('2026-12-31'),
    ]);

    expect(counts.get('2026-12-24')).toBe(2);
    expect(counts.get('2026-12-31')).toBe(1);
    expect(counts.get('2026-12-01')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

```bash
npm test -- src/lib/bookings/queries.test.ts
```

Esperado: FAIL con "Cannot find module './queries'".

- [ ] **Step 3: Implementar las consultas**

Crear `src/lib/bookings/queries.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Booking } from './types';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Primer y ultimo dia de un mes, en ISO.
 *
 * `new Date(year, month, 0)` da el ultimo dia del mes anterior al
 * indice `month`; como los meses de JS son 0-based y aca recibimos
 * 1-12, eso es exactamente el ultimo dia del mes pedido.
 */
export function monthRange(year: number, month: number): { from: string; to: string } {
  const lastDay = new Date(year, month, 0).getDate();
  return {
    from: `${year}-${pad(month)}-01`,
    to: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
}

export async function listBookingsForMonth(
  supabase: SupabaseClient,
  accountId: string,
  year: number,
  month: number,
): Promise<Booking[]> {
  const { from, to } = monthRange(year, month);

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('account_id', accountId)
    .gte('event_date', from)
    .lte('event_date', to)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true, nullsFirst: true });

  if (error) {
    console.error('[bookings] month query failed:', error);
    return [];
  }

  return (data ?? []) as Booking[];
}

/** Cuantas reservas hay por dia — alimenta el aviso de conflicto. */
export function countByDate(bookings: Booking[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const b of bookings) {
    counts.set(b.event_date, (counts.get(b.event_date) ?? 0) + 1);
  }
  return counts;
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

```bash
npm test -- src/lib/bookings/queries.test.ts
```

Esperado: los 5 tests en PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/bookings/queries.ts src/lib/bookings/queries.test.ts
git commit -m "feat(bookings): month range and per-day counts for the calendar"
```

---

### Task 6: Página de agenda

**Files:**
- Create: `src/app/(dashboard)/agenda/page.tsx`
- Create: `src/components/agenda/month-grid.tsx`
- Create: `src/components/agenda/booking-form.tsx`
- Create: `src/components/agenda/booking-detail.tsx`
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/middleware.ts`
- Modify: `messages/en.json`, `messages/ko.json`

**Interfaces:**
- Consumes: `listBookingsForMonth`, `countByDate`, `monthRange` (Tarea 5); `createBooking`
  (Tarea 3); `useAuth()` para `accountId` y el usuario; `createClient` de
  `@/lib/supabase/client`.
- Produces: la ruta `/agenda`.

Antes de escribir, **leer `src/app/(dashboard)/pipelines/page.tsx`**: es la página más
parecida a esta y establece el patrón de esta base de código — componente cliente,
`useAuth()` para el `accountId`, e inserciones directas con el cliente Supabase del
navegador respetando RLS. Seguir ese patrón; no introducir rutas API para las escrituras del
panel.

- [ ] **Step 1: Agregar las etiquetas de i18n**

En `messages/en.json`, agregar `"agenda": "Agenda"` en los mismos dos objetos donde ya
aparece `"pipelines"` (líneas ~23 y ~48 del archivo actual). En `messages/ko.json`, agregar
la clave equivalente en los mismos objetos, con el valor `"예약"`.

Verificar que ambos archivos siguen siendo JSON válido:

```bash
node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); JSON.parse(require('fs').readFileSync('messages/ko.json','utf8')); console.log('JSON ok')"
```

- [ ] **Step 2: Agregar el ítem al sidebar**

En `src/components/layout/sidebar.tsx`, importar `CalendarDays` desde `lucide-react` sumándolo
a la lista de iconos ya importada, y agregar al array `navItems`, inmediatamente después de
la línea de `contacts`:

```ts
  { href: "/agenda", labelKey: "agenda", icon: CalendarDays },
```

- [ ] **Step 3: Proteger la ruta**

En `src/middleware.ts`, agregar `'/agenda'` al array `protectedPaths`:

```ts
  const protectedPaths = ['/dashboard', '/inbox', '/contacts', '/agenda', '/pipelines', '/broadcasts', '/automations', '/settings']
```

- [ ] **Step 4: Escribir la grilla mensual**

Crear `src/components/agenda/month-grid.tsx`:

```tsx
'use client';

import type { Booking } from '@/lib/bookings/types';

interface MonthGridProps {
  year: number;
  /** 1-12. */
  month: number;
  bookings: Booking[];
  counts: Map<string, number>;
  onSelectDay: (isoDate: string) => void;
  onSelectBooking: (booking: Booking) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function MonthGrid({
  year,
  month,
  bookings,
  counts,
  onSelectDay,
  onSelectBooking,
}: MonthGridProps) {
  const daysInMonth = new Date(year, month, 0).getDate();

  // getDay() devuelve 0 para domingo; la grilla arranca en lunes, asi
  // que rotamos: domingo pasa a ser la septima columna.
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7;

  const cells: Array<number | null> = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const byDate = new Map<string, Booking[]>();
  for (const b of bookings) {
    const list = byDate.get(b.event_date) ?? [];
    list.push(b);
    byDate.set(b.event_date, list);
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-px text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="p-2 text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border">
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-24 bg-background" />;
          }

          const iso = `${year}-${pad(month)}-${pad(day)}`;
          const dayBookings = byDate.get(iso) ?? [];
          const count = counts.get(iso) ?? 0;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDay(iso)}
              className="min-h-24 bg-background p-1 text-left align-top hover:bg-accent"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{day}</span>
                {count > 1 && (
                  <span
                    title={`${count} reservas este día`}
                    className="rounded-full bg-amber-500/20 px-1.5 text-[10px] font-semibold text-amber-700"
                  >
                    {count}
                  </span>
                )}
              </div>
              <ul className="mt-1 space-y-0.5">
                {dayBookings.map((b) => (
                  <li key={b.id}>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBooking(b);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          onSelectBooking(b);
                        }
                      }}
                      className="block truncate rounded px-1 text-[11px] hover:underline"
                    >
                      {b.event_time ? `${b.event_time.slice(0, 5)} ` : ''}
                      {b.client_name}
                    </span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Escribir el formulario de alta**

Crear `src/components/agenda/booking-form.tsx`:

```tsx
'use client';

import { useState } from 'react';

import { BOOKING_SOURCES, type BookingSource } from '@/lib/bookings/types';

export interface BookingFormValues {
  clientName: string;
  phone: string;
  email: string;
  eventDate: string;
  eventTime: string;
  guestCount: string;
  eventType: string;
  message: string;
  source: BookingSource;
}

interface BookingFormProps {
  /** Fecha preseleccionada al hacer clic en un día de la grilla. */
  initialDate: string;
  /** Cuántas reservas ya hay ese día — alimenta el aviso de conflicto. */
  existingOnDate: number;
  submitting: boolean;
  onSubmit: (values: BookingFormValues) => void;
  onCancel: () => void;
}

export function BookingForm({
  initialDate,
  existingOnDate,
  submitting,
  onSubmit,
  onCancel,
}: BookingFormProps) {
  const [values, setValues] = useState<BookingFormValues>({
    clientName: '',
    phone: '',
    email: '',
    eventDate: initialDate,
    eventTime: '',
    guestCount: '',
    eventType: '',
    message: '',
    // El alta manual existe porque la mayoria de las reservas llegan
    // por WhatsApp; es el valor por defecto mas probable.
    source: 'whatsapp',
  });

  const set = (key: keyof BookingFormValues, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="space-y-4"
    >
      {existingOnDate > 0 && (
        <div role="status" className="rounded border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          Ya hay {existingOnDate} {existingOnDate === 1 ? 'reserva' : 'reservas'} ese día.
          Podés cargar esta igual.
        </div>
      )}

      <div>
        <label htmlFor="clientName" className="block text-sm font-medium">Nombre</label>
        <input
          id="clientName" required value={values.clientName}
          onChange={(e) => set('clientName', e.target.value)}
          className="mt-1 w-full rounded border p-2"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium">WhatsApp</label>
        <input
          id="phone" type="tel" required value={values.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="+598 91 234 567"
          className="mt-1 w-full rounded border p-2"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Con código de país. Si el contacto ya existe, se reutiliza.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email (opcional)</label>
        <input
          id="email" type="email" value={values.email}
          onChange={(e) => set('email', e.target.value)}
          className="mt-1 w-full rounded border p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium">Fecha</label>
          <input
            id="eventDate" type="date" required value={values.eventDate}
            onChange={(e) => set('eventDate', e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </div>
        <div>
          <label htmlFor="eventTime" className="block text-sm font-medium">Hora</label>
          <input
            id="eventTime" type="time" value={values.eventTime}
            onChange={(e) => set('eventTime', e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="guestCount" className="block text-sm font-medium">Invitados</label>
          <input
            id="guestCount" type="number" min="1" value={values.guestCount}
            onChange={(e) => set('guestCount', e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </div>
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium">Tipo</label>
          <input
            id="eventType" value={values.eventType}
            onChange={(e) => set('eventType', e.target.value)}
            placeholder="Bodas"
            className="mt-1 w-full rounded border p-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="source" className="block text-sm font-medium">Vino por</label>
        <select
          id="source" value={values.source}
          onChange={(e) => set('source', e.target.value)}
          className="mt-1 w-full rounded border p-2"
        >
          {BOOKING_SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">Notas</label>
        <textarea
          id="message" rows={3} value={values.message}
          onChange={(e) => set('message', e.target.value)}
          className="mt-1 w-full rounded border p-2"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit" disabled={submitting}
          className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {submitting ? 'Guardando…' : 'Guardar reserva'}
        </button>
        <button type="button" onClick={onCancel} className="rounded border px-4 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 6: Escribir el detalle**

Crear `src/components/agenda/booking-detail.tsx`:

```tsx
'use client';

import { BOOKING_STATUSES, type Booking, type BookingStatus } from '@/lib/bookings/types';

interface BookingDetailProps {
  booking: Booking;
  updating: boolean;
  onChangeStatus: (status: BookingStatus) => void;
  onClose: () => void;
}

export function BookingDetail({ booking, updating, onChangeStatus, onClose }: BookingDetailProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{booking.client_name}</h3>
        <p className="text-sm text-muted-foreground">
          {booking.event_date}
          {booking.event_time ? ` · ${booking.event_time.slice(0, 5)}` : ''}
          {' · '}
          vino por {booking.source}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-muted-foreground">WhatsApp</dt>
        <dd>{booking.phone}</dd>
        <dt className="text-muted-foreground">Email</dt>
        <dd>{booking.email ?? '—'}</dd>
        <dt className="text-muted-foreground">Invitados</dt>
        <dd>{booking.guest_count ?? '—'}</dd>
        <dt className="text-muted-foreground">Tipo</dt>
        <dd>{booking.event_type ?? '—'}</dd>
      </dl>

      {booking.message && (
        <div>
          <p className="text-sm text-muted-foreground">Notas</p>
          <p className="whitespace-pre-wrap text-sm">{booking.message}</p>
        </div>
      )}

      {booking.contact_id && (
        <a href={`/contacts/${booking.contact_id}`} className="text-sm underline">
          Ver el contacto en el CRM
        </a>
      )}

      <div className="flex flex-wrap gap-2">
        {BOOKING_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={updating || booking.status === s}
            onClick={() => onChangeStatus(s)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            {booking.status === s ? `● ${s}` : s}
          </button>
        ))}
      </div>

      <button type="button" onClick={onClose} className="rounded border px-4 py-2">
        Cerrar
      </button>
    </div>
  );
}
```

- [ ] **Step 7: Escribir la página**

Crear `src/app/(dashboard)/agenda/page.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { BookingDetail } from '@/components/agenda/booking-detail';
import { BookingForm, type BookingFormValues } from '@/components/agenda/booking-form';
import { MonthGrid } from '@/components/agenda/month-grid';
import { useAuth } from '@/hooks/use-auth';
import { createBooking } from '@/lib/bookings/create';
import { countByDate, listBookingsForMonth } from '@/lib/bookings/queries';
import type { Booking, BookingStatus } from '@/lib/bookings/types';
import { createClient } from '@/lib/supabase/client';

export default function AgendaPage() {
  const supabase = useMemo(() => createClient(), []);
  const { accountId, user } = useAuth();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formDate, setFormDate] = useState<string | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    const rows = await listBookingsForMonth(supabase, accountId, year, month);
    setBookings(rows);
    setLoading(false);
  }, [supabase, accountId, year, month]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => countByDate(bookings), [bookings]);

  const handleCreate = async (values: BookingFormValues) => {
    if (!accountId || !user) return;
    setSubmitting(true);
    setError(null);
    try {
      await createBooking(supabase, accountId, user.id, {
        clientName: values.clientName,
        email: values.email || null,
        phone: values.phone,
        eventDate: values.eventDate,
        eventTime: values.eventTime || null,
        guestCount: values.guestCount ? Number(values.guestCount) : null,
        eventType: values.eventType || null,
        message: values.message || null,
        source: values.source,
      });
      setFormDate(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (status: BookingStatus) => {
    if (!selected) return;
    setSubmitting(true);
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', selected.id);
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSelected({ ...selected, status });
    await load();
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agenda</h1>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shiftMonth(-1)} className="rounded border px-3 py-1">
            ←
          </button>
          <span className="min-w-32 text-center font-medium">
            {String(month).padStart(2, '0')}/{year}
          </span>
          <button type="button" onClick={() => shiftMonth(1)} className="rounded border px-3 py-1">
            →
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <MonthGrid
          year={year}
          month={month}
          bookings={bookings}
          counts={counts}
          onSelectDay={(iso) => {
            setSelected(null);
            setFormDate(iso);
          }}
          onSelectBooking={(b) => {
            setFormDate(null);
            setSelected(b);
          }}
        />
      )}

      {formDate && (
        <section className="rounded border p-4">
          <h2 className="mb-4 text-lg font-semibold">Nueva reserva</h2>
          <BookingForm
            initialDate={formDate}
            existingOnDate={counts.get(formDate) ?? 0}
            submitting={submitting}
            onSubmit={handleCreate}
            onCancel={() => setFormDate(null)}
          />
        </section>
      )}

      {selected && (
        <section className="rounded border p-4">
          <BookingDetail
            booking={selected}
            updating={submitting}
            onChangeStatus={handleStatus}
            onClose={() => setSelected(null)}
          />
        </section>
      )}
    </div>
  );
}
```

**Sobre `useAuth`, ya verificado:** vive en `@/hooks/use-auth` (no en `@/lib/auth/`), su
tipo de retorno `AuthContextValue` expone `user: User | null` y `accountId`, y la página de
pipelines lo usa igual. El import de arriba es correcto tal cual está.

`accountId` sale del perfil, que carga después de la sesión. Eso ya está contemplado: `load`
sale temprano si `accountId` todavía es `undefined`, y como es dependencia del `useCallback`
y del `useEffect`, la carga se reintenta sola cuando el perfil llega. El estado `loading`
arranca en `true`, así que mientras tanto se ve "Cargando…" y no una grilla vacía engañosa.

- [ ] **Step 8: Verificar tipos y build**

```bash
npx tsc --noEmit
npm run build
```

Esperado: sin errores. Si `tsc` marca el `onChange` del `<select>` de `source`, castear:
`set('source', e.target.value as BookingSource)`.

- [ ] **Step 9: Verificar a mano en el navegador**

Con `npm run dev`, entrar a `http://localhost:3000/agenda` y confirmar:

1. Aparece "Agenda" en el sidebar y la ruta carga dentro del layout del panel.
2. La reserva de "Prueba curl" de la Tarea 4 aparece en su día.
3. Clic en un día vacío abre el formulario con esa fecha ya puesta.
4. Cargar una reserva con un teléfono **nuevo** la crea y aparece en la grilla.
5. Cargar otra con el **mismo teléfono** reutiliza el contacto — verificar en Supabase que
   `SELECT count(*) FROM contacts WHERE phone_normalized = '<digitos>'` sigue en 1.
6. Cargar una segunda reserva en un día que ya tenía una: aparece el aviso ámbar, y **deja
   guardar igual**.
7. Clic en una reserva abre el detalle y permite pasarla a `confirmada`.
8. Cerrar sesión e ir a `/agenda` redirige al login.

- [ ] **Step 10: Commit**

```bash
git add src/app/\(dashboard\)/agenda/ src/components/agenda/ src/components/layout/sidebar.tsx src/middleware.ts messages/
git commit -m "feat(agenda): month calendar with manual booking entry

El alta manual es el flujo principal, no un extra: la mayoria de las
reservas llegan por WhatsApp o telefono. Los conflictos de fecha se
avisan y dejan seguir."
```

---

### Task 7: Apuntar el formulario del sitio al endpoint

**Files:**
- Modify: `frontend/.env.example` — **en el repo `MyCatheringApp`, no en el fork de wacrm**

**Interfaces:**
- Consumes: el endpoint de la Tarea 4.
- Produces: nada.

El formulario ya construye la URL como `${import.meta.env.VITE_API_BASE_URL}/api/bookings`,
así que no hay que tocar código: alcanza con apuntar la variable.

- [ ] **Step 1: Documentar la variable en la landing**

En el repo `MyCatheringApp`, confirmar que `frontend/.env.example` contiene:

```
VITE_API_BASE_URL=https://admin.eyegastronomia.com
```

- [ ] **Step 2: Probar el circuito completo en local**

Con wacrm corriendo en `localhost:3000` y la landing en `localhost:5173`, crear
`frontend/.env.local` en el repo de la landing con:

```
VITE_API_BASE_URL=http://localhost:3000
```

Reiniciar el dev server de la landing, completar el formulario de la sección Agenda con un
teléfono nuevo y enviarlo.

Esperado: aparece el banner de confirmación, y la reserva aparece en `/agenda` de wacrm con
`source = 'web'`. Este es el único paso que prueba las dos piezas juntas.

- [ ] **Step 3: Verificar que el CORS bloquea otros orígenes**

```bash
curl -i -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Origin: https://sitio-ajeno.com" \
  -d '{"clientName":"CORS","phone":"1","eventDate":"2026-12-24","contactPreference":""}'
```

Esperado: la cabecera `Access-Control-Allow-Origin` de la respuesta es
`https://eyegastronomia.com` (o el valor de `BOOKINGS_ALLOWED_ORIGIN`), **no**
`https://sitio-ajeno.com`. El navegador de un sitio ajeno bloquea la respuesta.

> Notar que CORS es una defensa del navegador, no del servidor: un `curl` puede escribir
> igual. Contra eso protegen el límite por IP y el honeypot, no el CORS.

- [ ] **Step 4: Commit (en el repo de la landing, si hubo cambios)**

```bash
git add frontend/.env.example
git commit -m "docs: point VITE_API_BASE_URL at the wacrm booking endpoint"
```

---

## Verificación final

Con todo integrado, en el fork de wacrm:

- [ ] `npm test` — la suite completa pasa, incluidos los tests nuevos de `create`, `queries` y la ruta
- [ ] `npx tsc --noEmit` — sin errores
- [ ] `npm run build` — build exitoso
- [ ] `npx eslint .` — sin errores nuevos respecto al estado del Task 1 Step 6
- [ ] En Supabase: `SELECT source, count(*) FROM bookings GROUP BY source` muestra al menos
      `web` y una fuente manual, probando que ambos caminos escriben
- [ ] `SELECT count(*) FROM pg_policies WHERE tablename = 'bookings'` devuelve 4
- [ ] Una reserva creada por cualquiera de los dos caminos tiene `contact_id` no nulo

## Fuera de alcance

- **Despliegue**: Nginx, Docker Compose, Cloudflare Tunnel, cron de `pg_dump`. Plan aparte,
  requiere el dominio configurado.
- **Sincronización bidireccional** entre el estado de la tarjeta del pipeline y el de la
  reserva. Hoy es unidireccional y best-effort.
- **Restricción dura de cupo por día o por turno.** Se decide con datos reales de cuántos
  días se superponen; hoy solo se avisa.
- **Automatismos al confirmar** (mensaje de WhatsApp al cliente, mover la tarjeta de etapa).
  Se agregan cuando el equipo esté usando el panel y sepamos cómo trabaja.
- **Seña, cotización y especificación de servicios** — las otras tres etapas del flujo de
  comunicación con el cliente. No existen en ningún plan todavía.
- **Buscador de contactos existentes en el alta manual.** Hoy el teléfono resuelve la
  deduplicación en la base; un buscador con autocompletado es mejora futura.
