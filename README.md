# E&E Gastronomía

Sitio de catering de E&E Gastronomía: landing pública con formulario de reservas.

## Estructura

- **`frontend/`** — La landing. React 19 + Vite + TypeScript + Tailwind v4 + Framer Motion.
  Compila a estático y se sirve por Nginx.
- **`backend/`** — Retirado, no se despliega. Ver `backend/DEPRECATED.md`.
- **`scripts/`** — Utilidades. `build-brand-assets.py` genera logo, favicons e imagen de
  Open Graph a partir de `logo.jpg`.
- **`docs/superpowers/`** — Especificaciones y planes de implementación.

El panel administrativo, el calendario de reservas y la integración con WhatsApp viven en un
fork de [wacrm](https://github.com/ArnasDon/wacrm), en repositorio aparte.

## Requisitos

- Node.js 18+
- Python 3 con Pillow (solo para regenerar los recursos de marca)

## Desarrollo

```bash
cd frontend
npm install
cp .env.example .env    # apuntar VITE_API_BASE_URL al endpoint de reservas
npm run dev             # http://localhost:5173
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila TypeScript y genera `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm test` | Tests con Vitest |
| `npm run lint` | ESLint |

## Datos del negocio

Nombre, teléfono, email, dirección y horarios viven **solo** en `frontend/src/site.ts`. Lo
consumen las secciones de Contacto y el Footer, y el JSON-LD de `schema.org/Caterer` se genera
desde ahí en tiempo de build, mediante el plugin `jsonLdPlugin` de `vite.config.ts`. Para
cambiar un dato del negocio se edita un solo archivo.

## Despliegue

El sitio corre en la Debian de casa, publicado por el túnel de Cloudflare que ya servía otros
servicios. **No hay Nginx en 80/443** — esos puertos son de Pi-hole, el DNS de la red — ni
Certbot: el TLS lo termina Cloudflare.

| Pieza | Contenedor | Puerto | URL |
|---|---|---|---|
| Landing | `eye-sitio` (nginx:alpine) | 8081 | `https://eyegastronomia.com` |
| Panel | `eye-panel` (Next.js) | 3000 | `https://admin.eyegastronomia.com` |

El stack vive en `~/stacks/eyegastronomia/` en el servidor y aparece en Dockge junto a los
demás.

> [!] **El túnel se configura desde el panel de Cloudflare, no por archivo.** Es un túnel de
> configuración remota: `~/stacks/cloudflared/config.yaml` existe pero se ignora, y
> cloudflared registra `Updated to new configuration ... version=N` al arrancar. Las rutas se
> agregan en Zero Trust → Networks → Tunnels → Public Hostname, que además crea el DNS solo.
> El tipo de servicio va en **HTTP**: el TLS lo pone Cloudflare, y poner HTTPS da 502 porque
> los contenedores sirven texto plano en la red local.

### Subir un cambio de la landing

```bash
cd frontend
npm run build
scp -r dist/* paul@192.168.1.3:~/stacks/eyegastronomia/sitio/
```

No hace falta reiniciar nada: nginx sirve los archivos del volumen. El HTML se manda con
`no-cache` y los assets llevan hash en el nombre, así que el cambio se ve en la próxima
recarga sin purgar caché.

### Subir un cambio del panel

```bash
ssh paul@192.168.1.3 'cd ~/stacks/eyegastronomia/panel && git pull && cd .. && docker compose up -d --build panel'
```

Las variables `NEXT_PUBLIC_*` se incrustan **durante el build**, no en tiempo de ejecución, así
que cambiar el `.env` no alcanza: hay que reconstruir la imagen. Están declaradas como
`build.args` en el `compose.yaml` justamente por eso.

### Backup

`~/stacks/eyegastronomia/backup-supabase.sh` corre por cron a las 3:30 y deja volcados en
`~/backups/supabase/`, conservando 30 días. El plan free de Supabase no tiene backups propios
y además pausa los proyectos tras una semana sin actividad; este cron resuelve las dos cosas,
porque conectarse cuenta como actividad.

El script **falla a propósito** si el volcado tiene menos de diez tablas, para que un backup
vacío se note el día que se genera y no el día que hace falta.
