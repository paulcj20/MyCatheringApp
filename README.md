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
