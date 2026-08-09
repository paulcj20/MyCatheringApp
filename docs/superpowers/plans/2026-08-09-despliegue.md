# Despliegue de E&E Gastronomía — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poner `eyegastronomia.com` y `admin.eyegastronomia.com` en internet desde la Debian del dueño, sin tocar nada de lo que ya corre en esa máquina.

**Architecture:** Dos contenedores nuevos en un stack de Dockge, publicados por el **túnel de Cloudflare que ya está corriendo**. No se instala Nginx en 80/443 ni Certbot: esos puertos son de Pi-hole y el TLS lo pone Cloudflare.

**Tech Stack:** Docker Compose v5.3.1, nginx:alpine (estático), Next.js 16 en contenedor, cloudflared (ya presente), Supabase cloud, cron + `pg_dump`.

## Lo que ya existe en el servidor — verificado por SSH, no supuesto

Debian 13 (trixie), x86_64, 6,7 GB de RAM, 77 GB libres. Acceso por clave como el usuario
`paul` (no `root`).

| Contenedor | Puerto | Qué es |
|---|---|---|
| `cloudflared` | — | **El túnel ya corre.** Config en `~/stacks/cloudflared/config.yaml` |
| `pihole` | **80, 443, 53** | DNS de la red |
| `automationsdata-n8n` + `n8n-postgres` | 5678 | Automatizaciones |
| `dockge` | 5001 | Gestor de stacks de Docker Compose |
| `syncthing` | 8384, 22000 | Sincroniza la bóveda de Obsidian |
| `stremio` | 11470, 12470 | Media |
| `beszel` + agente | 8090 | Monitoreo |

Los stacks viven en `~/stacks/<nombre>/`. El túnel es el `1117d2c2-2ca5-4f33-8aae-cdcc982e03fc`
y hoy publica tres hostnames de `devcontainers.site`.

**Puertos libres verificados:** 3000, 3001, 8081, 8082, 8083.

## Cómo esto cambia el diseño original

El spec asumía Nginx en 80/443 con el túnel por instalar. Ninguna de las dos cosas aplica:

- **80 y 443 son de Pi-hole**, que es el DNS de toda la red. Desalojarlo rompería la
  navegación de la casa. No se toca.
- **No hace falta Nginx en el host.** El túnel enruta por hostname directo al puerto de un
  contenedor, así que cada servicio escucha en un puerto alto y Cloudflare hace el resto.
  Nginx sigue existiendo, pero **dentro** del contenedor del sitio estático, en su puerto
  interno.
- **No hay Certbot.** El TLS lo termina Cloudflare.

Resultado: el despliegue es agregar un stack y dos reglas de ingress.

## Global Constraints

- **No tocar `pihole`, `n8n`, `syncthing`, `stremio`, `beszel` ni `dockge`.** Son servicios en
  uso; cualquier cambio ahí es un defecto.
- **No ocupar los puertos 80, 443 ni 53.**
- El stack nuevo va en `~/stacks/eyegastronomia/`, siguiendo la convención de la máquina, para
  que aparezca en Dockge junto a los demás.
- **Editar `~/stacks/cloudflared/config.yaml` conservando las tres reglas existentes** de
  `devcontainers.site`. La regla `http_status:404` va siempre última: es la que atrapa lo que
  no coincide, y cualquier regla puesta debajo nunca se evalúa.
- Los secretos van en un `.env` junto al `compose.yaml`, nunca en el repositorio.
- Dominio: `eyegastronomia.com` (landing) y `admin.eyegastronomia.com` (panel).
- El panel se sirve con `noindex`.
- Sesión SSH: usuario `paul`, clave `~/.ssh/id_ed25519`.

---

## Estructura de archivos

Todo en el servidor, bajo `~/stacks/eyegastronomia/`:

| Archivo | Responsabilidad |
|---|---|
| `compose.yaml` | Define los dos contenedores |
| `.env` | Variables de wacrm (Supabase, encryption key, cuenta de reservas) |
| `sitio/` | El `dist/` compilado de la landing |
| `nginx.conf` | Config del nginx interno del contenedor estático |
| `backup-supabase.sh` | Volcado nocturno |

Y en el repositorio de la landing: un flujo documentado para regenerar y subir `dist/`.

---

### Task 1: Preparar el stack y publicar la landing

La landing es la mitad simple y la que tiene beneficio con reloj corriendo: Google tarda
semanas en indexar, así que cada día sin publicar es SEO que no rinde.

**Files:**
- Create (servidor): `~/stacks/eyegastronomia/compose.yaml`
- Create (servidor): `~/stacks/eyegastronomia/nginx.conf`
- Create (servidor): `~/stacks/eyegastronomia/sitio/` (contenido compilado)

**Interfaces:**
- Consumes: nada.
- Produces: un contenedor `eye-sitio` escuchando en el puerto **8081** del host.

- [ ] **Step 1: Compilar la landing localmente**

En `C:\Tool Room\Development\MyCatheringApp\frontend`, con `.env.local` apuntando al panel
en producción:

```bash
echo "VITE_API_BASE_URL=https://admin.eyegastronomia.com" > .env.local
npm run build
```

Verificar que el JSON-LD quedó en el HTML compilado:

```bash
grep -c 'application/ld+json' dist/index.html
```

Esperado: `1`. Si es 0, el plugin de Vite no corrió y el sitio sale sin datos estructurados.

- [ ] **Step 2: Crear la carpeta del stack en el servidor**

```bash
ssh paul@192.168.1.3 'mkdir -p ~/stacks/eyegastronomia/sitio'
```

- [ ] **Step 3: Escribir la configuración de nginx**

Crear `~/stacks/eyegastronomia/nginx.conf` en el servidor:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA de una sola pagina: cualquier ruta cae en index.html.
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Los assets de Vite llevan hash en el nombre, asi que se pueden
    # cachear para siempre: si cambia el contenido, cambia el nombre.
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # El HTML no se cachea, o un deploy nuevo no se veria hasta que
    # venza el cache del visitante.
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;
    gzip_min_length 1024;
}
```

- [ ] **Step 4: Escribir el compose**

Crear `~/stacks/eyegastronomia/compose.yaml`:

```yaml
services:
  sitio:
    image: nginx:alpine
    container_name: eye-sitio
    restart: unless-stopped
    # 8081 verificado libre. NO usar 80/443: son de pihole, que es el
    # DNS de toda la red.
    ports:
      - "8081:80"
    volumes:
      - ./sitio:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

- [ ] **Step 5: Subir el sitio compilado**

Desde la máquina local:

```bash
cd "C:/Tool Room/Development/MyCatheringApp/frontend"
scp -r dist/* paul@192.168.1.3:~/stacks/eyegastronomia/sitio/
```

- [ ] **Step 6: Levantar el contenedor**

```bash
ssh paul@192.168.1.3 'cd ~/stacks/eyegastronomia && docker compose up -d && docker ps --filter name=eye-sitio --format "{{.Names}} {{.Status}} {{.Ports}}"'
```

- [ ] **Step 7: Verificar que responde localmente, antes de tocar DNS**

```bash
ssh paul@192.168.1.3 'curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8081/ && curl -s http://localhost:8081/ | grep -o "<title>[^<]*</title>"'
```

Esperado: `200` y el título `E&E Gastronomía — Catering para bodas y eventos en Montevideo`.

Si esto falla, el problema es del contenedor y no tiene nada que ver con Cloudflare — vale la
pena separarlo antes de sumar variables.

- [ ] **Step 8: Confirmar que no se rompió nada más**

```bash
ssh paul@192.168.1.3 'docker ps --format "{{.Names}}: {{.Status}}" | sort'
```

Esperado: `pihole`, `automationsdata-n8n`, `cloudflared`, `syncthing`, `stremio`, `beszel`,
`dockge` siguen `Up`. Y desde otra máquina de la red, que la navegación siga funcionando —
eso confirma que Pi-hole no se vio afectado.

---

### Task 2: Publicar la landing por el túnel

**Files:**
- Modify (servidor): `~/stacks/cloudflared/config.yaml`
- Cloudflare: un registro DNS

**Interfaces:**
- Consumes: el contenedor del Task 1 en el puerto 8081.
- Produces: `https://eyegastronomia.com` público.

> [!] **El túnel está gestionado REMOTAMENTE.** Se descubrió al ejecutar: al reiniciar,
> cloudflared registra `Updated to new configuration ... version=6` y usa la configuración
> que baja del panel de Cloudflare, **no** el `~/stacks/cloudflared/config.yaml` que tiene
> montado. Editar ese archivo no tiene ningún efecto.
>
> La versión original de esta tarea editaba el archivo y fue inútil — inofensiva, pero
> inútil. El archivo quedó anotado con una advertencia para que nadie lo vuelva a intentar.
>
> La buena noticia: agregar un *public hostname* desde el panel **crea el registro DNS solo**,
> así que se resuelven las dos cosas en un paso en vez de dos.

- [ ] **Step 1: Agregar los hostnames públicos en el panel de Cloudflare**

En **Zero Trust → Networks → Tunnels**, abrir el túnel `1117d2c2-2ca5-4f33-8aae-cdcc982e03fc`
(el mismo que ya publica n8n, Dockge y Beszel) → pestaña **Public Hostname** → **Add a public
hostname**, dos veces:

| Subdomain | Domain | Type | URL |
|---|---|---|---|
| *(vacío)* | `eyegastronomia.com` | HTTP | `localhost:8081` |
| `www` | `eyegastronomia.com` | HTTP | `localhost:8081` |

El tipo es **HTTP**, no HTTPS: el contenedor sirve HTTP plano en la red local y el TLS lo
termina Cloudflare en su borde. Poner HTTPS haría que el túnel intente hablar TLS con un
nginx que no lo tiene y fallaría con error 502.

No hay que reiniciar nada: el túnel recibe la configuración nueva en segundos.

- [ ] **Step 2: Confirmar que el túnel tomó la configuración**

```bash
ssh paul@192.168.1.3 'docker logs cloudflared --tail 5 2>&1 | grep -o "Updated to new configuration.*version=[0-9]*" | tail -1'
```

Esperado: un `version=` mayor que el anterior, y que el JSON del log incluya
`eyegastronomia.com`.

- [ ] **Step 5: Verificar que los servicios viejos siguen publicados**

Esto es lo que confirma que no rompimos nada al editar un archivo compartido:

```bash
for h in n8n mydockge mybeszel; do
  echo -n "$h.devcontainers.site → "
  curl -s -o /dev/null -w "%{http_code}\n" "https://$h.devcontainers.site"
done
```

Esperado: los tres responden como antes (200, o 302 al login según el servicio). Si alguno
da 404, la regla se perdió al editar — restaurar el `.bak` del Step 1.

- [ ] **Step 6: Verificar el sitio público**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://eyegastronomia.com
curl -s https://eyegastronomia.com | grep -o "<title>[^<]*</title>"
curl -s https://eyegastronomia.com/robots.txt
curl -s https://eyegastronomia.com/sitemap.xml | head -5
```

Esperado: `200`, el título correcto, y los dos archivos servidos. La propagación DNS puede
tardar unos minutos.

- [ ] **Step 7: Verificar el certificado y la redirección**

```bash
curl -sI http://eyegastronomia.com | head -3
```

Esperado: Cloudflare redirige a HTTPS. El certificado lo emite Cloudflare, no hace falta
Certbot.

---

### Task 3: Publicar el panel

**Files:**
- Modify (servidor): `~/stacks/eyegastronomia/compose.yaml`
- Create (servidor): `~/stacks/eyegastronomia/.env`
- Modify (servidor): `~/stacks/cloudflared/config.yaml`

**Interfaces:**
- Consumes: el stack del Task 1, el túnel del Task 2.
- Produces: `https://admin.eyegastronomia.com`.

- [ ] **Step 1: Clonar el fork en el servidor**

```bash
ssh paul@192.168.1.3 'cd ~/stacks/eyegastronomia && git clone https://github.com/paulcj20/wacrm.git panel && cd panel && git log --oneline -1'
```

Esperado: el último commit es el merge de `feat/agenda-reservas`.

- [ ] **Step 2: Escribir el `.env` del panel**

Crear `~/stacks/eyegastronomia/.env` con los valores reales. **No commitear este archivo.**

```
NEXT_PUBLIC_SUPABASE_URL=https://connvzbgdjvcfeuqydka.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<la anon key>
SUPABASE_SERVICE_ROLE_KEY=<la service role>
ENCRYPTION_KEY=<los 64 hex del .env.local de desarrollo>
META_APP_SECRET=placeholder-sin-meta-todavia
WHATSAPP_TEMPLATES_DRY_RUN=true
NEXT_PUBLIC_APP_LOCALE=en
NEXT_PUBLIC_SITE_URL=https://admin.eyegastronomia.com
BOOKINGS_ACCOUNT_ID=6a582c3e-4892-4400-919f-5365337b2800
BOOKINGS_ALLOWED_ORIGIN=https://eyegastronomia.com
NEXT_PUBLIC_BOOKINGS_PIPELINE_ID=acfc316e-75d3-4aad-b889-1d656b1effee
```

`ENCRYPTION_KEY` tiene que ser **la misma** que la de desarrollo si se quiere conservar
cualquier token de WhatsApp ya guardado; rotarla los deja ilegibles.

- [ ] **Step 3: Agregar el servicio al compose**

Agregar al `compose.yaml` del Task 1, sin tocar el servicio `sitio`:

```yaml
  panel:
    build:
      context: ./panel
    container_name: eye-panel
    restart: unless-stopped
    # 3000 verificado libre en el host.
    ports:
      - "3000:3000"
    env_file:
      - .env
```

- [ ] **Step 4: Construir y levantar**

La construcción de Next.js tarda varios minutos la primera vez.

```bash
ssh paul@192.168.1.3 'cd ~/stacks/eyegastronomia && docker compose up -d --build panel && docker logs eye-panel --tail 30'
```

- [ ] **Step 5: Verificar localmente antes del túnel**

```bash
ssh paul@192.168.1.3 'curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/'
```

Esperado: `307` (redirige al login por no tener sesión), que es la respuesta correcta.

- [ ] **Step 6: Agregar el hostname público en el panel**

Igual que en el Task 2, y por el mismo motivo — el túnel es de configuración remota, el
archivo local se ignora. En **Zero Trust → Networks → Tunnels → el túnel → Public Hostname**:

| Subdomain | Domain | Type | URL |
|---|---|---|---|
| `admin` | `eyegastronomia.com` | HTTP | `localhost:3000` |

Tipo **HTTP**: el TLS lo termina Cloudflare. El DNS se crea solo.

- [ ] **Step 7: Verificar el panel y que lo anterior sigue vivo**

```bash
curl -s -o /dev/null -w "admin: %{http_code}\n" https://admin.eyegastronomia.com
curl -s -o /dev/null -w "sitio: %{http_code}\n" https://eyegastronomia.com
for h in n8n mydockge mybeszel; do curl -s -o /dev/null -w "$h: %{http_code}\n" "https://$h.devcontainers.site"; done
```

- [ ] **Step 8: Probar el circuito completo, que es lo único que prueba las dos piezas juntas**

Desde el formulario de `https://eyegastronomia.com`, cargar una reserva con un teléfono de
prueba. Después verificar en el panel que aparece en la agenda con `source = 'web'`, con el
contacto enlazado y con su tarjeta en el pipeline "Eventos".

Si el formulario falla, mirar la consola del navegador: un error de CORS significa que
`BOOKINGS_ALLOWED_ORIGIN` no coincide exactamente con el origen del sitio.

Borrar la reserva de prueba al terminar.

---

### Task 4: Backup nocturno y `noindex`

Dos cosas que no son opcionales en producción y que es tentador postergar.

**Files:**
- Create (servidor): `~/stacks/eyegastronomia/backup-supabase.sh`
- Modify (servidor): crontab de `paul`
- Modify (servidor): `~/stacks/cloudflared/config.yaml`

**Interfaces:**
- Consumes: el proyecto Supabase.
- Produces: volcados diarios en `~/backups/supabase/`.

- [ ] **Step 1: Escribir el script de backup**

El plan free de Supabase **no tiene backups de ningún tipo**, y además **pausa los proyectos
tras una semana sin actividad** — con catering estacional eso es plausible, y pausado el
formulario de reservas falla en silencio. El mismo cron resuelve las dos cosas, porque
conectarse cuenta como actividad.

Crear `~/stacks/eyegastronomia/backup-supabase.sh`:

```bash
#!/usr/bin/env bash
# Volcado diario de Supabase. Cubre dos problemas del plan free a la vez:
# no hay backups, y los proyectos se pausan tras 7 dias sin actividad.
set -euo pipefail

DEST="$HOME/backups/supabase"
mkdir -p "$DEST"
STAMP=$(date +%Y-%m-%d)

# La cadena de conexion sale del panel de Supabase:
# Project Settings -> Database -> Connection string -> URI
docker run --rm postgres:16 pg_dump "$SUPABASE_DB_URL" \
  | gzip > "$DEST/eye-$STAMP.sql.gz"

# Conservar 30 dias. Sin esto el disco se llena en silencio.
find "$DEST" -name 'eye-*.sql.gz' -mtime +30 -delete

echo "$(date -Is) backup ok: $(du -h "$DEST/eye-$STAMP.sql.gz" | cut -f1)"
```

```bash
chmod +x ~/stacks/eyegastronomia/backup-supabase.sh
```

- [ ] **Step 2: Guardar la cadena de conexión fuera del script**

```bash
ssh paul@192.168.1.3 'echo "SUPABASE_DB_URL=postgresql://..." > ~/.eye-backup.env && chmod 600 ~/.eye-backup.env'
```

- [ ] **Step 3: Probar el backup a mano antes de programarlo**

Un cron que nunca se probó es un backup que no existe.

```bash
ssh paul@192.168.1.3 'set -a; . ~/.eye-backup.env; set +a; ~/stacks/eyegastronomia/backup-supabase.sh'
```

Esperado: imprime `backup ok` con un tamaño distinto de cero.

- [ ] **Step 4: Verificar que el volcado sirve, no solo que existe**

```bash
ssh paul@192.168.1.3 'zcat ~/backups/supabase/eye-*.sql.gz | grep -c "CREATE TABLE"'
```

Esperado: un número mayor a 30. Un archivo que pesa pero no tiene tablas adentro es un
backup falso, y es la forma más común de descubrir el problema el peor día posible.

- [ ] **Step 5: Programarlo**

```bash
ssh paul@192.168.1.3 'crontab -l 2>/dev/null; echo "30 3 * * * set -a; . \$HOME/.eye-backup.env; set +a; \$HOME/stacks/eyegastronomia/backup-supabase.sh >> \$HOME/backups/supabase/backup.log 2>&1"' 
```

Revisar la salida y volver a cargarla con `crontab -` conservando las entradas que ya
existieran.

- [ ] **Step 6: `noindex` en el panel**

El panel no debe competir en Google con el sitio comercial ni exponer su estructura. En la
regla de ingress de `admin.eyegastronomia.com`, no alcanza con confiar en el `robots.txt` de
wacrm. La forma más segura es una **Cloudflare Transform Rule** que agregue la cabecera
`X-Robots-Tag: noindex, nofollow` a todo lo servido por ese hostname.

En Cloudflare: Rules → Transform Rules → Modify Response Header → si el hostname es
`admin.eyegastronomia.com`, agregar `X-Robots-Tag: noindex, nofollow`.

Verificar:

```bash
curl -sI https://admin.eyegastronomia.com | grep -i x-robots-tag
```

Esperado: la cabecera presente.

---

### Task 5: Documentar el redespliegue

Sin esto, dentro de dos meses nadie se acuerda de cómo se sube un cambio, y el sitio se
congela.

**Files:**
- Modify: `README.md` del repositorio de la landing

**Interfaces:**
- Consumes: nada.
- Produces: nada.

- [ ] **Step 1: Agregar la sección al README**

```markdown
## Despliegue

El sitio corre en la Debian de casa, publicado por el túnel de Cloudflare que ya servía
otros servicios. No hay Nginx en 80/443 — esos puertos son de Pi-hole — ni Certbot: el TLS
lo pone Cloudflare.

| Pieza | Dónde | Puerto |
|---|---|---|
| Landing | contenedor `eye-sitio` | 8081 |
| Panel | contenedor `eye-panel` | 3000 |
| Stack | `~/stacks/eyegastronomia/` | gestionable desde Dockge |

### Subir un cambio de la landing

```bash
cd frontend
npm run build
scp -r dist/* paul@192.168.1.3:~/stacks/eyegastronomia/sitio/
```

No hace falta reiniciar el contenedor: nginx sirve los archivos del volumen. El HTML no se
cachea, así que el cambio se ve en la próxima recarga.

### Subir un cambio del panel

```bash
ssh paul@192.168.1.3 'cd ~/stacks/eyegastronomia/panel && git pull && cd .. && docker compose up -d --build panel'
```
```

- [ ] **Step 2: Commitear**

```bash
git add README.md
git commit -m "docs: how to deploy and redeploy"
```

---

## Verificación final

- [ ] `https://eyegastronomia.com` responde 200 con el título correcto
- [ ] `https://admin.eyegastronomia.com` redirige al login
- [ ] Los tres hostnames de `devcontainers.site` siguen respondiendo como antes
- [ ] Pi-hole sigue resolviendo DNS para la red
- [ ] Una reserva cargada desde el formulario público aparece en la agenda del panel
- [ ] `curl -sI https://admin.eyegastronomia.com | grep -i x-robots-tag` devuelve la cabecera
- [ ] Existe al menos un volcado en `~/backups/supabase/` y contiene tablas
- [ ] En Google Search Console: dar de alta la propiedad y enviar el sitemap

## Riesgos asumidos por el dueño

- **La `service_role` de Supabase quedó expuesta en un historial de chat** y Supabase ya no
  permite rotar las claves JWT antiguas. El dueño decidió mantenerla. Con el despliegue el
  riesgo cambia de naturaleza: pasa de una base en localhost a un sistema en internet.
- **WhatsApp no funciona todavía**: `META_APP_SECRET` es un placeholder. La agenda, los
  contactos y el pipeline sí funcionan. Conectar Meta después solo requiere cambiar variables
  y reiniciar el contenedor, sin redesplegar.

## Fuera de alcance

- Traducir el panel al español — decidido para después.
- Endurecer el SSH (`PermitRootLogin no`, sin contraseñas). El acceso ya es por clave; el
  endurecimiento es de la máquina, no de este despliegue.
- Mover la landing a un CDN o a hosting externo.
- Integración continua: hoy el despliegue es manual y documentado, que para un sitio que
  cambia poco es proporcionado.
