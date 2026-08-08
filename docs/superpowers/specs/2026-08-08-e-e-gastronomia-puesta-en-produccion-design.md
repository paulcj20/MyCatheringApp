# E&E Gastronomía — Puesta en producción

**Fecha:** 2026-08-08
**Estado:** aprobado en brainstorming, pendiente de plan de implementación

## Objetivo

Dejar el sitio de E&E Gastronomía funcionando en producción, con la agenda de reservas
operativa para el equipo, indexable por Google, y con una identidad visual coherente con
la marca real.

Cuatro requisitos, del usuario:

1. Backend y frontend corriendo en su servidor.
2. Agenda web funcionando, con un entorno donde la empresa acceda al calendario.
3. SEO.
4. Corregir la distribución visual donde se vea mal.

## Punto de partida

- **Frontend:** SPA Vite + React 19 + Tailwind v4. Una página con Navbar, Hero, Services,
  Agenda, Contact, Footer.
- **Backend:** Spring Boot 3.2 escribiendo en Firestore. `BookingRepository` ya fue
  borrado; `application.properties` conserva configuración JPA/H2 huérfana.
- **Agenda:** solo un formulario. Hace POST a `http://localhost:8080` hardcodeado. Nadie
  consume el `GET /api/bookings`, que además está sin autenticación.
- **Infraestructura del usuario:** Debian LTS en `192.168.1.3`, con acceso por clave SSH y
  Cloudflare ya montado. En esa máquina corre **wacrm**.
- **wacrm** (github.com/ArnasDon/wacrm, MIT): Next.js 16 + React 19 + Tailwind v4 +
  Supabase, integrado con Meta Cloud API para WhatsApp. Trae inbox compartido, contactos
  con tags y campos custom, pipelines Kanban, broadcasts, automatizaciones, Supabase Auth
  con cuentas de equipo y roles, API REST pública en `/api/v1`, y Docker Compose.
  **No tiene módulo de calendario ni de citas.**

### Problemas encontrados durante el análisis

Estos no estaban en el pedido original pero condicionan el trabajo:

1. **El sistema de estilos no funciona.** `frontend/tailwind.config.js` tiene un error de
   sintaxis en la línea 50 (cierra el objeto exportado y después declara `plugins`), y
   además es ignorado: el proyecto usa Tailwind v4, que no lee `tailwind.config.js` salvo
   directiva `@config` explícita. Consecuencia: **ninguna clase `accent-*` ni `primary-*`
   existe**, ni la tipografía Playfair/Inter, ni el keyframe `shine`. El sitio se renderiza
   sin su paleta.
2. **La paleta pertenece a otra marca.** El `logo.png` del proyecto es un placeholder
   genérico de "MyCatering" en azul marino y dorado. Todo el ámbar del tema se eligió para
   ese logo, no para el de E&E.
3. **`192.168.1.3` es una dirección de red privada**, incompatible con el requisito de SEO:
   Google no puede rastrear una IP local. Resuelto por Cloudflare Tunnel.
4. **El formulario no pide teléfono.** Para un CRM de WhatsApp el teléfono es el
   identificador principal. Sin él la integración no tiene valor.
5. **`eventDate` se guarda como `String`** (`Booking.java:9`), consecuencia de modelar sobre
   Firestore. Hace frágil cualquier consulta de disponibilidad por rango de fechas.
6. **El endpoint público no tiene validación ni límite de tasa**, y el `GET /api/bookings`
   expone todas las reservas sin autenticación.
7. **El sitio promete algo que no cumple.** El texto de la Agenda dice "verificaremos
   disponibilidad al instante" y no existe ninguna verificación.

## Decisiones de arquitectura

### Consolidar en wacrm y Supabase

Se unifica la base de datos en **Supabase (cloud, plan free)** y el panel administrativo se
construye **dentro de un fork de wacrm**, en lugar de crear un `/admin` propio.

Razones: wacrm ya aporta Supabase Auth, roles y cuentas de equipo, layout con sidebar —
todo lo que habría que construir a mano sin diferenciación alguna. Su README se define como
*template*, o sea que está pensado para forkearse. Y usa React 19 + Tailwind v4, los mismos
idiomas que el frontend existente. Postgres además resuelve la disponibilidad por fecha con
una columna `date` y un índice, que en Firestore era incómodo.

**El backend Spring Boot se retira.** Con las reservas en Supabase y el panel en wacrm, su
única función restante sería recibir el POST del formulario e insertar una fila; wacrm ya es
una app Next.js con acceso a Supabase y ya está desplegada en esa máquina. No se borra el
código: queda en `backend/` con una nota en el README explicando que fue reemplazado, para
que la decisión de eliminarlo se tome después y por separado.

**Consecuencia asumida:** el requisito 1 se cumple en la forma "las dos piezas del sistema
corren en el servidor del usuario", no "hay un backend Java corriendo". El usuario aprobó
este cambio explícitamente.

### Plan free de Supabase: límites y mitigación

Verificado: 500 MB de base, 1 GB de archivos, 5 GB de egress, 50.000 usuarios activos
mensuales de Auth, 2 proyectos activos. Alcanza para reservas y contactos.

Dos limitaciones que exigen acción:

- **No hay backups de ningún tipo** en el plan free (ni automáticos ni point-in-time). Se
  mitiga con un `pg_dump` nocturno por cron desde la Debian, que ya está encendida.
- **Los proyectos free se pausan tras 1 semana de inactividad.** En catering estacional eso
  es plausible, y pausado el formulario de reservas falla en silencio. El cron del backup
  cuenta como actividad, así que la misma medida cubre ambos problemas.

El historial de mensajes del inbox de WhatsApp es lo que eventualmente agotará los 500 MB,
no las reservas. No es un bloqueo hoy.

### Piezas desplegadas

| Pieza | Qué es | Dónde |
|---|---|---|
| Landing | `vite build` → archivos estáticos | Nginx en la Debian, `eyegastronomia.com` |
| wacrm (fork) | Next.js: calendario + API de reservas + CRM + WhatsApp | Docker Compose en la Debian, `admin.eyegastronomia.com` |
| Base de datos | Postgres + Auth | Supabase cloud |

Ambos hostnames se publican por **Cloudflare Tunnel**: el túnel sale desde el servidor, así
que no hay puertos abiertos en el router, no hace falta IP fija, y funciona detrás de CGNAT.
TLS lo provee Cloudflare, sin Certbot.

**Se usa subdominio y no `eyegastronomia.com/admin`** a propósito: montar Next.js en un
subpath requiere modificar `basePath` en el fork, y cada archivo tocado del fork es fricción
al traer cambios de upstream. El costo es una cabecera CORS en el endpoint del formulario.
Beneficio adicional: el panel queda en otro hostname con `noindex`, sin competir en Google
con el sitio comercial.

### Flujo de datos

Las reservas entran por **dos puertas**, y la web es la menos transitada. La mayoría llega
por WhatsApp, Instagram o teléfono, y esas las carga el equipo a mano.

```
PUERTA 1 — Formulario público (landing, eyegastronomia.com)
    │  POST /api/bookings   (CORS: solo eyegastronomia.com)
    ▼
Ruta API pública en wacrm (admin.eyegastronomia.com), solo servidor
    │  valida, limita por IP, descarta honeypot
    │  account_id sale de variable de entorno, nunca del body
    ▼
supabaseAdmin (service role)  ──►  INSERT en bookings (source='web')

PUERTA 2 — Alta manual desde el calendario (equipo autenticado)
    │  busca un contacto existente o carga uno nuevo por teléfono
    ▼
INSERT en bookings (source='whatsapp' | 'instagram' | 'telefono' | …)

AMBAS  ──►  upsert de contacto por teléfono + tarjeta en el pipeline
       ──►  Calendario: el equipo ve, confirma o rechaza, y responde por WhatsApp
```

La creación del contacto y de la tarjeta es **best-effort**: si falla, la reserva ya quedó
guardada y el error se registra. Una reserva nunca se pierde porque el CRM falle.

## Componentes

Cada uno con un propósito, una interfaz y sus dependencias explícitas.

### 1. Tema visual (landing)

**Qué hace:** define los tokens de color y tipografía de la marca.
**Interfaz:** clases utilitarias de Tailwind consumidas por los componentes.
**Depende de:** nada.

Se borra `tailwind.config.js` (roto e ignorado) y el tema pasa a un bloque `@theme` en
`src/index.css`, la forma nativa de Tailwind v4, donde los colores se declaran como
variables CSS.

Paleta extraída del logo:

| Token | Hex | Rol |
|---|---|---|
| `brand` (vinoso) | `#691316` | color estructural: Navbar, Footer, botones primarios |
| `primary` (verde) | `#03be65` | iconos, bordes, detalles, texto sobre oscuro |
| `danger` (rojo) | `#ff3131` | estados de error, y línea de acento fina |
| fondo | `#fdfbf7` | blanco cálido, reemplaza el blanco puro |

Reglas que se derivan de esto:

- El vinoso reemplaza el `gray-900` de Navbar, Footer y el botón de la Agenda.
- **El verde no se usa como fondo de botón con texto blanco:** `#03be65` sobre blanco da
  ~2.3:1 de contraste, debajo del mínimo 4.5:1 de WCAG AA. Va en iconos, bordes y texto
  sobre fondo oscuro. El rol de relleno primario lo toma el vinoso, que con blanco supera
  holgadamente el mínimo.
- **El ámbar/dorado se elimina por completo.** Es residuo del logo placeholder. El Hero
  pierde el degradado dorado; su botón pasa a vinoso.
- El rojo se reserva como color de error del formulario y como línea de acento que evoque el
  anillo del logo. No se usa como área de color, para no colisionar con los estados de error.

También: se saca `autoprefixer` de `postcss.config.js` (Tailwind v4 ya lo hace internamente,
y duplicado puede pisar declaraciones), y se corrige `body { @apply font-serif }` — Playfair
Display es una display serif de alto contraste que se lee mal en labels de 14px e inputs;
queda para títulos, e Inter pasa a ser la tipografía de cuerpo.

**Verificación:** binaria y visual. Al levantar el dev server, el Hero tiene botón vinoso y
el bloque de la Agenda muestra sus halos de color. Si sigue gris, el `@theme` no está
tomando.

### 2. Recursos de marca

**Qué hace:** produce los archivos de imagen que necesitan la landing y el SEO.
**Interfaz:** archivos en `frontend/public/` y `frontend/src/assets/`.
**Depende de:** `logo.jpg` en la raíz del repo.

`logo.jpg` es un JPG con el campo vinoso incrustado como cuadrado; puesto sobre el Navbar
mostraría un recuadro con halo de compresión. Se genera:

- **Logo circular con fondo transparente** (PNG), recortando al círculo y conservando el
  vinoso interior. Sirve sobre cualquier fondo.
- **Favicon** en los tamaños habituales, reemplazando el `/vite.svg` actual.
- **Imagen de Open Graph** de 1200×630, necesaria para que el link se vea correctamente al
  compartirse por WhatsApp.

El `logo.png` de "MyCatering" se elimina.

### 3. SEO de la landing

**Qué hace:** hace el sitio indexable y presentable al compartirse.
**Interfaz:** `index.html`, `robots.txt`, `sitemap.xml`.
**Depende de:** los recursos de marca y el dominio.

**No se agrega SSR ni prerender.** Es una sola página; todo lo que Google necesita va
directo en `index.html`, que se sirve como HTML plano por Nginx. Un pipeline de prerender
para una página sería complejidad sin retorno.

Contenido: `lang="es"` (hoy dice `en`), `<title>` y `description` reales (hoy el título es
`frontend`), `canonical`, Open Graph y Twitter Card, y un bloque JSON-LD
`schema.org/Caterer` con nombre, logo, dirección, teléfono y horarios. Más `robots.txt` y
`sitemap.xml`.

El nombre de la marca es **"E&E Gastronomía"**, exactamente así, con ampersand y tilde, y
debe aparecer idéntico en `<title>`, Open Graph, JSON-LD y el Navbar — hoy el sitio dice
"MyCatering". Un nombre inconsistente impide que Google consolide la entidad.

En `admin.eyegastronomia.com` se sirve `noindex`.

### 4. Formulario público de reservas

**Qué hace:** recoge la solicitud y la envía al endpoint.
**Interfaz:** `POST /api/bookings`.
**Depende de:** la ruta API de wacrm.

Cambios:

- **Se agrega teléfono, obligatorio, en formato internacional.** Es el identificador del
  contacto en WhatsApp; sin él la integración no sirve.
- La URL del endpoint sale de una variable de entorno (`VITE_API_BASE_URL`), reemplazando el
  `http://localhost:8080` hardcodeado de `Agenda.tsx:27`.
- **Se corrige el texto que promete disponibilidad instantánea.** Mientras la verificación
  real no exista, el copy dice que el equipo confirma a la brevedad. Prometer lo que no se
  cumple es peor que no prometerlo; la verificación real es la fase 2.
- Se agrega manejo visible del estado de error: hoy `status === 'error'` se setea pero
  **nunca se renderiza**, así que un fallo deja el formulario en silencio.
- Campo honeypot oculto, para descartar bots sin CAPTCHA.

### 5. Ruta API de reservas (en wacrm)

**Qué hace:** recibe la reserva, la persiste, y la refleja en el CRM.
**Interfaz:** `POST /api/bookings`, JSON. Responde 201, 400 (validación), 429 (límite).
**Depende de:** Supabase.

Es la **única superficie expuesta a internet sin autenticación**, así que concentra las
defensas: validación de esquema en el servidor, límite de tasa por IP, descarte por
honeypot, y longitudes máximas en todos los campos de texto.

**Usa la service role key, en una ruta que corre solo en el servidor.** wacrm ya tiene ese
patrón: `supabaseAdmin` en `@/lib/flows/admin-client`. La clave nunca llega al navegador.

Se evaluó y se descartó copiar la ruta pública `/api/invitations/[token]/peek`, que resuelve
su caso con un RPC `SECURITY DEFINER` y sin clave privilegiada. La analogía no se sostiene:
en `peek` **el token es la autorización** — un secreto inadivinable que viaja en la URL.
El endpoint de reservas no tiene un secreto equivalente, así que el RPC tendría que recibir
el `account_id` como parámetro; y como toda app Next.js expone su
`NEXT_PUBLIC_SUPABASE_ANON_KEY` en el navegador, cualquiera podría invocarlo con la cuenta
que quisiera.

**El `account_id` sale de una variable de entorno del servidor, nunca del cuerpo del
pedido.** Si viniera en el JSON, cualquiera podría escribir reservas en la cuenta de otro.

CORS restringido a `https://eyegastronomia.com`.

### 6. Tabla `bookings` y RLS

**Qué hace:** persiste las reservas, vengan de donde vengan.
**Interfaz:** esquema Postgres + políticas RLS.
**Depende de:** las convenciones de wacrm, ya determinadas por el spike.

`event_date` es **`date`**, no texto, y `event_time` es `time`. Índice sobre `event_date`,
que es la columna por la que consulta el calendario.

Estado de la reserva: `pendiente | confirmada | rechazada`.

**Columna `source`**: `web | whatsapp | instagram | telefono | presencial | otro`. Las
reservas llegan por varios canales y la web es solo uno; registrar el origen cuesta nada y a
los seis meses dice por qué canal entra el trabajo.

**Patrón de tenencia, confirmado por el spike:** la columna es **`account_id`**, no
`team_id`. Cada tabla lleva exactamente cuatro políticas nombradas `<tabla>_select`,
`_insert`, `_update`, `_delete`, apoyadas en la función `is_account_member(account_id,
min_role)`, que es `SECURITY DEFINER` para no recursar sobre RLS. Jerarquía de roles:
`owner > admin > agent > viewer`. Leer exige cualquier miembro; escribir datos exige
`agent`; la configuración exige `admin`.

> **Trampa:** las filas llevan **`user_id` y `account_id` a la vez**. `user_id` viene de la
> migración 001 y sigue siendo `NOT NULL`; `account_id` lo agregó la 017. Un `INSERT` que
> ponga solo uno falla.

Las migraciones son idempotentes por convención y se numeran `NNN_nombre.sql`. La última
existente es la `036`.

### 7. Página de calendario (en wacrm)

**Qué hace:** es la **agenda operativa del negocio**, no un visor de lo que llega por la web.
**Interfaz:** una ruta nueva en el fork, dentro de su layout autenticado.
**Depende de:** la tabla `bookings`, el layout y el Auth de wacrm.

La mayoría de las reservas de un catering llegan por WhatsApp, Instagram o teléfono. Un panel
que solo muestre las del formulario haría que el equipo llevara la agenda real en otro lado y
quedaría muerto en un mes. Por eso **el alta manual es el flujo principal**, no un extra.

Grilla mensual con las reservas ubicadas por fecha, más lista lateral del mes. Clic en un día
abre el alta; clic en una reserva abre el detalle, permite cambiar el estado y enlaza a la
conversación del contacto en el inbox.

En el alta manual el cliente **casi siempre ya existe** en el CRM, porque vienen hablando por
WhatsApp. El formulario deja buscar un contacto existente o cargar uno nuevo por teléfono.

**Conflictos de fecha: solo se avisa, no se bloquea.** La grilla muestra cuántas reservas hay
por día y el alta advierte al cargar sobre una fecha ocupada, pero deja seguir. No hay
restricción en la base. Un sistema que bloquea antes de saber cómo trabaja el equipo genera
trabajo en la sombra: el día que necesiten meter un evento extra y no puedan, lo anotan en un
papel y el panel deja de reflejar la realidad. La restricción dura se evalúa después, con
datos reales de cuántos días se superponen.

Reutiliza el layout, el sidebar y la sesión de wacrm. No se construye login propio.

### 8. Integración con el CRM

**Qué hace:** hace que cada reserva sea accionable por WhatsApp.
**Interfaz:** llamada interna desde la ruta API y desde el alta manual.
**Depende de:** el esquema de contactos y pipelines de wacrm.

Al crear una reserva: upsert del contacto **deduplicando por teléfono**, y creación de una
tarjeta en el pipeline con la fecha del evento y un enlace a la reserva.

**La deduplicación ya está resuelta en la base**, según el spike: `contacts` tiene una
columna generada `phone_normalized` (solo dígitos) con un índice `UNIQUE (account_id,
phone_normalized)`. Alcanza con un `ON CONFLICT`; no hay que escribir lógica de matcheo.

Para la tarjeta, `deals` ya tiene `expected_close_date DATE`, `value`, `currency`,
`contact_id` y `conversation_id`. La fecha del evento entra en `expected_close_date` sin
inventar columnas.

Es **unidireccional y best-effort**: el estado de la tarjeta en el pipeline no vuelve a la
reserva, y un fallo del CRM no impide guardar la reserva.

### 9. Distribución visual

**Qué hace:** corrige lo que se ve mal, más allá de la paleta.
**Depende de:** el tema visual.

- Se elimina el `<hr>` suelto entre Agenda y Contact (`App.tsx:16`). Separar secciones con
  una regla horizontal es un parche; la separación se resuelve con ritmo de espaciado
  consistente entre secciones.
- Se unifica el espaciado vertical de las secciones, que hoy varía sin criterio.
- Se revisan `Services`, `Contact` y `Footer` una vez aplicada la paleta: varios problemas
  actuales son consecuencia de los tokens ausentes y se resuelven solos. Los que queden se
  corrigen ahí, sin rediseñar la estructura de las secciones.
- Las animaciones usan `viewport={{ once: false }}`, así que **se reanimen cada vez que la
  sección entra en pantalla**. Al hacer scroll hacia arriba y abajo el contenido parpadea.
  Pasa a `once: true`.

### 10. Despliegue

**Qué hace:** pone las dos piezas en línea.
**Depende de:** todo lo anterior.

- Nginx sirviendo el `dist/` de la landing como estático.
- wacrm por Docker Compose.
- Cloudflare Tunnel publicando los dos hostnames.
- Cron nocturno con `pg_dump` de Supabase a la Debian (backup + evita la pausa por
  inactividad).
- Secretos por variables de entorno en el servidor, fuera del repo.

**Hardening SSH:** el usuario ya tiene autenticación por clave. Se agrega
`PermitRootLogin no` y se deshabilita la autenticación por contraseña. La contraseña de root
actual quedó expuesta en un historial de chat y debe rotarse; no se registra en ningún
archivo del repositorio.

**El fork de wacrm se crea con remote a upstream**, no clonando y editando en el lugar, para
poder traer correcciones posteriores.

## Orden de implementación

El alcance es grande para un solo tramo, así que se ordena para que haya algo verificable
temprano y para que las dependencias no se bloqueen entre sí:

1. **Spike:** leer el esquema, las migraciones y el patrón de RLS de wacrm. Todo lo del panel
   depende de conocerlo; no se supone nada.
2. **Tema visual y recursos de marca** (componentes 1 y 2). Independiente del resto, y su
   efecto se ve de inmediato.
3. **Tabla `bookings` + ruta API + integración con el CRM** (5, 6, 8).
4. **Formulario público** apuntando a la ruta nueva (4).
5. **Página de calendario** (7).
6. **SEO y distribución visual** (3, 9).
7. **Despliegue** (10), que requiere el dominio comprado.

El paso 7 es el único bloqueado por algo externo: `eyegastronomia.com` todavía no está
comprado. Todo lo anterior avanza sin él.

## Estrategia de pruebas

El proyecto no tiene pruebas hoy. No se introduce una suite completa; se cubre lo que puede
fallar en silencio y costarle dinero a la empresa:

- **Ruta API de reservas:** pruebas de validación (falta teléfono, email inválido, fecha
  pasada), de rechazo por honeypot, y de límite de tasa. Es la superficie pública.
- **Fallo del CRM:** verificar que si la creación del contacto falla, la reserva se guarda
  igual y devuelve 201.
- **RLS:** verificar que un usuario de un equipo no lee reservas de otro.
- **Tema visual:** verificación manual, es lo apropiado para color y tipografía.
- **SEO:** validar el JSON-LD con la herramienta de resultados enriquecidos de Google, y
  comprobar la vista previa del Open Graph al compartir el link.

## Fuera de alcance

- **Verificación real de disponibilidad** (fase 2). Requiere definir qué significa "ocupado"
  para la empresa: ¿un evento por día? ¿por turno? ¿depende de la cantidad de invitados? Se
  decide con el equipo ya usando el panel. Hasta entonces el copy no la promete.
- **Sincronización bidireccional** entre el estado del pipeline y el de la reserva.
- **Mudar los datos de wacrm** o rediseñar sus módulos existentes.
- **Eliminar `backend/`** del repositorio.
- Rediseño de contenido, fotografía o textos de las secciones comerciales.

## Punto de decisión futuro

Si en algún momento se necesita que el estado de la tarjeta en el pipeline se refleje en la
reserva, o reportes que cruzan reservas y conversaciones, el lugar correcto para resolverlo
es dentro de Postgres — ya está todo ahí. La consolidación en Supabase que hace este diseño
es justamente lo que deja esa puerta abierta.

El límite de 500 MB del plan free lo va a agotar el historial del inbox. Cuando eso pase, la
decisión es pasar a plan pago (que además trae backups diarios y vuelve innecesario el cron)
y no migrar de base.
