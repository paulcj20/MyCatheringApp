# Landing de E&E Gastronomía — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar la landing de E&E Gastronomía con su identidad visual real, el formulario de reservas funcional y validado, y el SEO completo — lista para desplegarse como estático.

**Architecture:** SPA Vite + React 19 que compila a archivos estáticos. El tema se define con `@theme` de Tailwind v4 en CSS (no hay `tailwind.config.js`). Los datos de contacto del negocio se centralizan en un único módulo `siteConfig` que consumen Contact, Footer y el JSON-LD, para que no puedan volver a divergir. El formulario de reservas envía a un endpoint externo configurado por variable de entorno.

**Tech Stack:** Vite 7, React 19, TypeScript 5.9, Tailwind CSS v4, Framer Motion 12, react-datepicker, Vitest + Testing Library (se instala en la Tarea 5), Pillow (Python, para generar recursos de marca).

Este plan cubre los componentes 1, 2, 3, 4 y 9 del spec
`docs/superpowers/specs/2026-08-08-e-e-gastronomia-puesta-en-produccion-design.md`.
Los componentes 5–8 (tabla `bookings`, ruta API, calendario e integración CRM) viven en el
fork de wacrm y van en un plan aparte, que requiere el spike previo. El componente 10
(despliegue) va en un tercer plan y depende de que el dominio esté comprado.

## Global Constraints

- **Tailwind v4.** No existe `tailwind.config.js`. Todo token de tema va en `@theme` dentro
  de `src/index.css`. Nunca reintroducir el archivo de config.
- **Nombre de marca exacto: `E&E Gastronomía`** — con ampersand y con tilde. Idéntico en
  `<title>`, Open Graph, JSON-LD, Navbar y Footer. Nunca "MyCatering", "MyCathering",
  "E2E" ni "EyE".
- **Dominio: `https://eyegastronomia.com`** (sin `www`). El panel va en
  `https://admin.eyegastronomia.com`.
- **Paleta, valores exactos:** vinoso `#691316`, verde `#03be65`, rojo `#ff3131`, fondo
  cálido `#fdfbf7`.
- **El verde nunca es fondo de un elemento con texto blanco.** `#03be65` sobre blanco da
  ~2.3:1, debajo del mínimo 4.5:1 de WCAG AA. El relleno primario es el vinoso.
- **El ámbar/dorado se elimina por completo.** Ninguna clase `accent-*` debe quedar en el
  código al terminar la Tarea 2.
- **La rampa `gray-*` de Tailwind se elimina por completo**, reemplazada por los neutros
  cálidos `ink-*`. Los grises de Tailwind son fríos y azulados y se ven sucios contra el
  vinoso y el fondo crema. Ninguna clase `gray-*` debe quedar al terminar la Tarea 2.
- **Idioma del sitio: español.** `<html lang="es">`.
- Los textos de cara al usuario no prometen verificación instantánea de disponibilidad
  mientras esa función no exista.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `frontend/src/index.css` | Tokens de tema (`@theme`), estilos base, keyframes |
| `frontend/tailwind.config.js` | **Se elimina** (roto e ignorado por v4) |
| `frontend/postcss.config.js` | Se quita `autoprefixer` |
| `frontend/src/site.ts` | **Nuevo.** Única fuente de verdad de nombre, NAP, horarios, redes |
| `frontend/src/components/Navbar.tsx` | Navegación + logo |
| `frontend/src/components/Hero.tsx` | Portada |
| `frontend/src/components/Services.tsx` | Catálogo de servicios |
| `frontend/src/components/Agenda.tsx` | Formulario de reservas |
| `frontend/src/components/Contact.tsx` | Datos de contacto + consulta por WhatsApp |
| `frontend/src/components/Footer.tsx` | Pie |
| `frontend/src/App.tsx` | Composición de secciones |
| `frontend/index.html` | Metadatos de SEO (title, description, Open Graph) |
| `frontend/vite.config.ts` | Config de Vite + Vitest + plugin que inyecta el JSON-LD |
| `frontend/public/` | favicon, `og-image.jpg`, `robots.txt`, `sitemap.xml` |
| `frontend/src/assets/images/logo-circular.png` | Logo con fondo transparente |
| `scripts/build-brand-assets.py` | **Nuevo.** Genera logo circular, favicons y OG |
| `frontend/src/components/__tests__/Agenda.test.tsx` | **Nuevo.** Tests del formulario |

---

### Task 1: Tokens del tema

Hoy `tailwind.config.js` tiene un error de sintaxis en la línea 50 y además Tailwind v4 no
lo lee. Resultado: las clases `accent-*`, `primary-*`, las fuentes y el keyframe `shine` no
existen. Esta tarea crea los tokens; la Tarea 2 los aplica.

**Files:**
- Delete: `frontend/tailwind.config.js`
- Modify: `frontend/postcss.config.js`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Consumes: nada.
- Produces: las utilidades `bg-brand-*`, `text-brand-*`, `border-brand-*` (y equivalentes
  para `primary-*` y `danger-*`), `bg-surface`, `font-sans`, `font-serif`, `animate-shine`.
  Escalas disponibles: `brand` 50–950, `primary` 50–950, `danger` 400–700. Las tareas
  siguientes usan **solo** estos nombres.

- [ ] **Step 1: Eliminar el archivo de config roto**

```bash
cd frontend && git rm tailwind.config.js
```

- [ ] **Step 2: Quitar autoprefixer de PostCSS**

Tailwind v4 ya aplica los prefijos internamente; duplicado puede pisar declaraciones.
Reemplazar el contenido completo de `frontend/postcss.config.js` por:

```js
export default {
    plugins: {
        "@tailwindcss/postcss": {},
    },
}
```

- [ ] **Step 3: Desinstalar autoprefixer**

```bash
cd frontend && npm uninstall autoprefixer
```

- [ ] **Step 4: Escribir el bloque @theme**

Reemplazar el contenido completo de `frontend/src/index.css` por lo siguiente. Notar que
`--color-brand-700` es exactamente el vinoso del logo y `--color-primary-500` el verde del
logo; el resto de la escala se deriva de esos dos.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

@import "tailwindcss";

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-serif: 'Playfair Display', ui-serif, Georgia, serif;

  /* Vinoso — color estructural de la marca. 700 es el hex exacto del logo. */
  --color-brand-50: #fdf4f4;
  --color-brand-100: #fbe6e6;
  --color-brand-200: #f6cfd0;
  --color-brand-300: #eda9ab;
  --color-brand-400: #e07a7d;
  --color-brand-500: #c94a4e;
  --color-brand-600: #a52a2f;
  --color-brand-700: #691316;
  --color-brand-800: #560f12;
  --color-brand-900: #470d10;
  --color-brand-950: #260608;

  /* Verde — acentos, iconos y detalles. 500 es el hex exacto del logo. */
  --color-primary-50: #e9fdf2;
  --color-primary-100: #cbfae0;
  --color-primary-200: #9af3c3;
  --color-primary-300: #5ee7a1;
  --color-primary-400: #22d47f;
  --color-primary-500: #03be65;
  --color-primary-600: #009b52;
  --color-primary-700: #007a42;
  --color-primary-800: #036036;
  --color-primary-900: #044f2e;
  --color-primary-950: #002d1a;

  /* Rojo — estados de error y línea de acento. 500 es el hex exacto del logo. */
  --color-danger-400: #ff6161;
  --color-danger-500: #ff3131;
  --color-danger-600: #e51b1b;
  --color-danger-700: #c01414;

  /* Neutros calidos. Reemplazan la rampa gray-* de Tailwind, que es fria y
     azulada y se ve sucia contra el vinoso y el fondo crema.
     Contraste verificado sobre surface (#fdfbf7): ink-500 4.6:1, ink-600 6:1.
     Sobre brand-800 (#560f12): ink-300 7:1, ink-200 9.3:1. */
  --color-ink-50: #faf7f6;
  --color-ink-100: #f2ecea;
  --color-ink-200: #e4dad7;
  --color-ink-300: #cbbcb8;
  --color-ink-400: #a8938e;
  --color-ink-500: #877069;
  --color-ink-600: #6d5951;
  --color-ink-700: #5a4842;
  --color-ink-800: #4a3b36;
  --color-ink-900: #3d312d;
  --color-ink-950: #241c1a;

  /* Fondo cálido, reemplaza el blanco puro */
  --color-surface: #fdfbf7;

  --animate-shine: shine 1s;
}

@keyframes shine {
  100% {
    left: 125%;
  }
}

@layer base {
  html {
    scroll-behavior: smooth;
  }

  /* Inter para el cuerpo: Playfair es una display serif de alto contraste y se
     lee mal en labels de 14px e inputs. */
  body {
    @apply font-sans text-brand-950 bg-surface;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-serif;
  }
}

@layer utilities {
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }

    100% {
      transform: translateX(-50%);
    }
  }

  .animate-scroll {
    animation: scroll 40s linear infinite;
  }

  .hover\:pause:hover {
    animation-play-state: paused;
  }
}
```

- [ ] **Step 5: Verificar que el build compila**

```bash
cd frontend && npm run build
```

Esperado: build exitoso, sin errores de PostCSS ni de Tailwind. Si falla con "Cannot apply
unknown utility class", el token correspondiente está mal escrito en `@theme`.

- [ ] **Step 6: Verificar que los tokens generan CSS**

```bash
cd frontend && grep -c "691316" dist/assets/*.css
```

Esperado: al menos 1. Si devuelve 0, el `@theme` no se está procesando — revisar que
`@import "tailwindcss"` esté **antes** del bloque `@theme`.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/index.css frontend/postcss.config.js frontend/package.json frontend/package-lock.json
git rm --cached frontend/tailwind.config.js
git commit -m "fix(theme): define brand tokens with Tailwind v4 @theme

El tailwind.config.js tenia un error de sintaxis y ademas v4 no lo lee,
asi que ninguna clase accent-* ni primary-* existia. La paleta ahora sale
del logo real de E&E Gastronomia."
```

---

### Task 2: Aplicar la paleta a los componentes

Los componentes usan `accent-*` (ámbar del logo placeholder) y `gray-900` como color
estructural. Esta tarea los migra a los tokens de la Tarea 1. Es el cambio de mayor impacto
visual del plan.

**Files:**
- Modify: `frontend/src/components/Navbar.tsx`
- Modify: `frontend/src/components/Hero.tsx`
- Modify: `frontend/src/components/Services.tsx`
- Modify: `frontend/src/components/Agenda.tsx`
- Modify: `frontend/src/components/Contact.tsx`
- Modify: `frontend/src/components/Footer.tsx`

**Interfaces:**
- Consumes: las utilidades `brand-*`, `primary-*`, `danger-*`, `ink-*`, `surface` de la
  Tarea 1.
- Produces: nada nuevo. Deja el árbol sin ninguna clase `accent-*` ni `gray-*`.

**La rampa `gray-*` se reemplaza completa**, no solo los tonos oscuros. Los grises de
Tailwind son fríos y azulados; contra el vinoso y el fondo crema se ven sucios. Hay ~90
apariciones de `gray-*` en los seis componentes y **todas** deben migrar, o el gate del
Step 7 falla.

**Sustituciones del acento (el ámbar del logo placeholder):**

| Antes | Después | Motivo |
|---|---|---|
| `text-accent-600` (eyebrow de sección) | `text-brand-600` | |
| `text-accent-400`, `text-accent-500` | `text-primary-500` | el verde es el acento |
| `bg-accent-100` | `bg-primary-100` | |
| `bg-accent-500` (hover de redes) | `bg-brand-700` | evita verde con texto blanco |
| `hover:text-accent-400` | `hover:text-primary-400` | |
| `focus:border-accent-500 focus:ring-accent-500` | `focus:border-brand-500 focus:ring-brand-500` | |

**Sustituciones en secciones claras** (Hero, Services, Agenda, Contact):

| Antes | Después |
|---|---|
| `bg-white` en el `<section>` | `bg-surface` |
| `text-gray-900` | `text-brand-950` |
| `text-gray-700` (labels) | `text-ink-700` |
| `text-gray-600` | `text-ink-600` |
| `text-gray-500` | `text-ink-500` |
| `text-gray-400` (iconos dentro de inputs) | `text-ink-400` |
| `border-gray-300` | `border-ink-300` |
| `border-gray-200` | `border-ink-200` |
| `border-gray-100` | `border-ink-200` |
| `bg-gray-900`, `hover:bg-gray-800` (botones) | `bg-brand-700`, `hover:bg-brand-800` |
| `focus:ring-gray-900` | `focus:ring-brand-700` |

**Sustituciones en superficies oscuras** (Navbar, Footer). Los tonos se eligen por
contraste sobre vinoso, que es más oscuro que el `gray-900` original: un swap literal
de `gray-400` dejaría los links del Footer en ~4.0:1, por debajo del mínimo.

| Antes | Después |
|---|---|
| `bg-gray-900` | `bg-brand-700` en Navbar, `bg-brand-800` en Footer |
| `bg-gray-800`, `hover:bg-gray-800` | `bg-brand-700`, `hover:bg-brand-800` |
| `border-gray-800` | `border-brand-800` en Navbar, `border-brand-700` en Footer |
| `text-gray-200` | `text-ink-100` |
| `text-gray-300` | `text-ink-200` |
| `text-gray-400` | `text-ink-300` |
| `text-gray-500` (copyright) | `text-ink-400` |

Las tablas de arriba son la autoridad; cada Step de abajo aplica esas tablas a un archivo y
solo detalla lo que las tablas no pueden decidir por sí solas. Trabajar por búsqueda de
contenido, no por número de línea.

- [ ] **Step 1: Migrar Navbar**

Aplicar la tabla del acento y la de **superficies oscuras** a
`frontend/src/components/Navbar.tsx`. La barra pasa a vinoso y el subrayado animado de los
links a verde.

Decisiones propias de este archivo:
- `bg-gray-900/95` → `bg-brand-700/95` (conservar el `/95` de opacidad)
- `focus:ring-offset-gray-900` → `focus:ring-offset-brand-700`
- El panel del menú móvil usa `bg-gray-900` sólido → `bg-brand-700`

- [ ] **Step 2: Migrar Hero**

El botón primario pierde el degradado dorado y pasa a vinoso sólido, que con texto blanco
cumple contraste de sobra.

En `frontend/src/components/Hero.tsx`, reemplazar el `<a>` del botón primario
(líneas 53-61) por:

```tsx
                    <a
                        href="#agenda"
                        className="group relative px-10 py-5 bg-brand-700 text-white text-lg font-bold rounded-none uppercase tracking-[0.2em] overflow-hidden transition-all duration-300 hover:bg-brand-800 hover:shadow-[0_0_40px_rgba(105,19,22,0.6)] transform hover:-translate-y-1 border border-primary-500/40"
                    >
                        <span className="relative z-10 drop-shadow-md">Reservar Fecha</span>
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                    </a>
```

Y en el `<span>` del subtítulo del `<h1>`: `text-accent-400` → `text-primary-400`.

- [ ] **Step 3: Migrar Services**

Aplicar la tabla del acento y la de **secciones claras** a
`frontend/src/components/Services.tsx`. No tiene decisiones propias.

- [ ] **Step 4: Migrar Agenda**

Aplicar la tabla del acento y la de **secciones claras** a
`frontend/src/components/Agenda.tsx`.

Decisiones propias de este archivo:
- El `<section>` usa `bg-primary-50` (no `bg-white`) → `bg-surface`
- Los tres círculos de iconos de la columna izquierda usan `bg-accent-100 text-accent-600` →
  `bg-primary-100 text-primary-700`. Va a `primary-700` y no a `primary-500` porque el verde
  claro sobre fondo `primary-100` no alcanza contraste suficiente para un icono.

- [ ] **Step 5: Migrar Contact**

Aplicar la tabla del acento y la de **secciones claras** a
`frontend/src/components/Contact.tsx`.

Decisiones propias de este archivo:
- Los tres círculos de iconos de información usan `bg-accent-100 text-accent-600` →
  `bg-primary-100 text-primary-700`, por el mismo motivo que en Agenda
- El icono del reloj de "Horarios de Atención" usa `text-accent-500` → `text-primary-600`
- Los círculos de redes usan `bg-primary-50 text-primary-600` con `hover:bg-accent-500
  hover:text-white` → el hover pasa a `hover:bg-brand-700`, que sí cumple contraste con
  texto blanco

- [ ] **Step 6: Migrar Footer**

Aplicar la tabla del acento y la de **superficies oscuras** a
`frontend/src/components/Footer.tsx`.

Decisiones propias de este archivo:
- El `<footer>` es la superficie más oscura del sitio: `bg-gray-900 border-gray-800` →
  `bg-brand-800 border-brand-700`
- Los círculos de redes usan `bg-gray-800` → `bg-brand-700`, con `hover:bg-accent-500` →
  `hover:bg-brand-600`
- Los iconos de la columna de contacto usan `text-accent-500 group-hover:text-accent-400` →
  `text-primary-500 group-hover:text-primary-400`

- [ ] **Step 7: Verificar que no quedan clases del tema viejo**

```bash
cd frontend && grep -rn "accent-\|gray-" src/components/
```

Esperado: **sin resultados**. Cualquier coincidencia es una migración incompleta. Recorrer las
tablas de sustitución de arriba hasta que el grep salga vacío.

- [ ] **Step 8: Verificar visualmente**

```bash
cd frontend && npm run dev
```

Abrir `http://localhost:5173` y confirmar, en este orden:
1. El Navbar es **vinoso**, no gris oscuro.
2. El botón "Reservar Fecha" del Hero es **vinoso**, no dorado.
3. La sección Agenda muestra halos de color de fondo (verde), no fondo plano.
4. Los títulos usan Playfair Display (serif con remates finos) y los labels del formulario
   usan Inter (sans).
5. El fondo general es crema, no blanco puro.

Si algo sigue gris o dorado, la sustitución de ese componente quedó incompleta.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/
git commit -m "feat(theme): apply E&E brand palette across all components

Vinoso como color estructural en lugar de gray-900, verde como acento en
lugar del ambar del logo placeholder."
```

---

### Task 3: Recursos de marca

`logo.jpg` es un JPG de 500×500 con el campo vinoso incrustado como cuadrado; sobre el
Navbar mostraría un recuadro con halo de compresión. Medido sobre el archivo: el círculo
exterior termina en radio 200 desde el centro (250,250), el anillo rojo ocupa 187–200 y el
verde 172–183.

**Files:**
- Create: `scripts/build-brand-assets.py`
- Create: `frontend/src/assets/images/logo-circular.png`
- Create: `frontend/public/favicon-32.png`, `frontend/public/favicon-180.png`, `frontend/public/og-image.jpg`
- Delete: `frontend/src/assets/images/logo.png`, `frontend/public/vite.svg`
- Modify: `frontend/src/components/Navbar.tsx`, `frontend/src/components/Footer.tsx`

**Interfaces:**
- Consumes: `logo.jpg` en la raíz del repo.
- Produces: `logo-circular.png` (404×404, fondo transparente), `favicon-32.png`,
  `favicon-180.png` (apple-touch-icon), `og-image.jpg` (1200×630). La Tarea 7 los referencia
  por esas rutas exactas.

- [ ] **Step 1: Escribir el script generador**

Crear `scripts/build-brand-assets.py`:

```python
"""Genera los recursos de marca de E&E Gastronomia a partir de logo.jpg.

El logo original es un cuadrado de 500x500 con el campo vinoso incrustado.
Radios medidos desde el centro (250,250): circulo exterior termina en r=200.
Recortamos a r=202 para dejar 2px de margen y aplicamos mascara circular.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "logo.jpg"
ASSETS = ROOT / "frontend" / "src" / "assets" / "images"
PUBLIC = ROOT / "frontend" / "public"

CENTER = 250
RADIUS = 202
WINE = (105, 19, 22)  # #691316

def circular_logo():
    im = Image.open(SRC).convert("RGB")
    box = (CENTER - RADIUS, CENTER - RADIUS, CENTER + RADIUS, CENTER + RADIUS)
    cropped = im.crop(box)
    size = RADIUS * 2

    # Mascara circular con supersampling x4 para bordes suaves
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)

    out = cropped.convert("RGBA")
    out.putalpha(mask)
    return out

def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)

    logo = circular_logo()
    logo.save(ASSETS / "logo-circular.png")

    logo.resize((32, 32), Image.LANCZOS).save(PUBLIC / "favicon-32.png")
    logo.resize((180, 180), Image.LANCZOS).save(PUBLIC / "favicon-180.png")

    # Open Graph 1200x630: campo vinoso con el logo centrado.
    # Sin texto agregado: el logo ya contiene el wordmark "GASTRONOMIA",
    # lo que evita depender de que Playfair este instalada en el sistema.
    og = Image.new("RGB", (1200, 630), WINE)
    badge = logo.resize((480, 480), Image.LANCZOS)
    og.paste(badge, ((1200 - 480) // 2, (630 - 480) // 2), badge)
    og.save(PUBLIC / "og-image.jpg", quality=90)

    print("Recursos generados en", ASSETS, "y", PUBLIC)

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Ejecutar el script**

```bash
cd "c:/Tool Room/Development/MyCatheringApp" && python scripts/build-brand-assets.py
```

Esperado: imprime la confirmación y crea los cuatro archivos.

- [ ] **Step 3: Verificar los archivos generados**

```bash
cd "c:/Tool Room/Development/MyCatheringApp" && python -c "
from PIL import Image
for p in ['frontend/src/assets/images/logo-circular.png','frontend/public/favicon-32.png','frontend/public/favicon-180.png','frontend/public/og-image.jpg']:
    im = Image.open(p); print(p, im.size, im.mode)
"
```

Esperado:
```
frontend/src/assets/images/logo-circular.png (404, 404) RGBA
frontend/public/favicon-32.png (32, 32) RGBA
frontend/public/favicon-180.png (180, 180) RGBA
frontend/public/og-image.jpg (1200, 630) RGB
```

Abrir `logo-circular.png` y confirmar que las esquinas son transparentes y el borde del
círculo no tiene un halo cuadrado vinoso.

- [ ] **Step 4: Usar el logo en el Navbar**

En `frontend/src/components/Navbar.tsx`, agregar el import al principio del archivo:

```tsx
import logo from '../assets/images/logo-circular.png';
```

Y reemplazar el bloque de la marca (líneas 19-23) por:

```tsx
                    <div className="flex-shrink-0">
                        <a href="#home" className="flex items-center gap-3">
                            <img src={logo} alt="E&E Gastronomía" className="h-12 w-12" />
                            <span className="font-serif text-2xl font-bold text-white tracking-wide">
                                E&amp;E Gastronomía
                            </span>
                        </a>
                    </div>
```

Notar que el `href` pasa de `#` a `#home`: hoy apunta a `#`, que salta al tope de la página
sin ancla y ensucia el historial del navegador.

- [ ] **Step 5: Usar el logo en el Footer**

En `frontend/src/components/Footer.tsx`, agregar el import:

```tsx
import logo from '../assets/images/logo-circular.png';
```

Y reemplazar la línea 10 por:

```tsx
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="E&E Gastronomía" className="h-14 w-14" />
                            <span className="font-serif text-2xl font-bold text-white tracking-wide">
                                E&amp;E Gastronomía
                            </span>
                        </div>
```

- [ ] **Step 6: Borrar los recursos del placeholder**

```bash
cd "c:/Tool Room/Development/MyCatheringApp" && git rm frontend/src/assets/images/logo.png frontend/public/vite.svg
```

Si `frontend/public/vite.svg` no está versionado, borrarlo con `rm` en su lugar.

- [ ] **Step 7: Verificar el build**

```bash
cd frontend && npm run build && npm run dev
```

Esperado: build exitoso. En el navegador, el logo circular aparece en Navbar y Footer sin
recuadro de fondo, y el texto dice "E&E Gastronomía".

- [ ] **Step 8: Commit**

```bash
git add scripts/build-brand-assets.py frontend/src/assets/images/logo-circular.png frontend/public/ frontend/src/components/Navbar.tsx frontend/src/components/Footer.tsx
git commit -m "feat(brand): generate circular logo, favicons and OG image

Reemplaza el logo placeholder de MyCatering y el favicon de Vite por los
recursos derivados del logo real."
```

---

### Task 4: Centralizar los datos del negocio

Hoy los datos de contacto son inventados y se contradicen: `Contact.tsx:133` dice
"Montevideo, Uruguay" y `Footer.tsx:55` dice "Av. Libertador 1234, Buenos Aires, Argentina".
El teléfono `+54 9 11 1234 5678` es relleno, y hay tres emails distintos
(`contacto@mycathering.com`, `hola@mycatering.com`, ninguno del dominio real).

Google castiga la inconsistencia de nombre-dirección-teléfono entre lo declarado en el
JSON-LD y lo que muestra la página, así que esto no es cosmético. La solución estructural es
una única fuente de verdad que consuman los tres lugares.

**Files:**
- Create: `frontend/src/site.ts`
- Modify: `frontend/src/components/Contact.tsx`
- Modify: `frontend/src/components/Footer.tsx`

**Interfaces:**
- Consumes: nada.
- Produces: `siteConfig`, exportado desde `frontend/src/site.ts`, con esta forma exacta:

```ts
{
  name: string; domain: string; url: string;
  email: string; phoneDisplay: string; phoneE164: string; whatsappNumber: string;
  address: { street: string; city: string; region: string; postalCode: string; country: string; countryCode: string };
  hours: Array<{ days: string; opens: string; closes: string; schemaDays: string[] }>;
  social: { instagram: string; facebook: string };
}
```

La Tarea 6 y la Tarea 7 consumen este objeto.

- [ ] **Step 1: Crear el módulo de configuración**

Crear `frontend/src/site.ts` con los datos reales del negocio:

```ts
/**
 * Unica fuente de verdad de los datos del negocio.
 *
 * Consumido por Contact, Footer y el JSON-LD del index.html. Cambiar un dato
 * aca lo cambia en los tres lugares, que es lo que evita la inconsistencia de
 * nombre-direccion-telefono que penaliza Google.
 *
 * El JSON-LD de index.html duplica estos valores por necesidad (los
 * rastreadores lo leen del HTML servido, no del JS) y hay que mantenerlo
 * sincronizado a mano.
 */
export const siteConfig = {
    name: 'E&E Gastronomía',
    domain: 'eyegastronomia.com',
    url: 'https://eyegastronomia.com',

    email: 'eyegastronomia5@hotmail.com',
    phoneDisplay: '091 908 707',
    phoneE164: '+59891908707',      // Uruguay: cae el 0 inicial del 091
    whatsappNumber: '59891908707',  // sin + ni espacios, para wa.me

    address: {
        street: 'Zum Felde',
        city: 'Montevideo',
        region: 'Montevideo',
        postalCode: '11400',
        country: 'Uruguay',
        countryCode: 'UY',
    },

    hours: [
        { days: 'Lunes a Viernes', opens: '09:00', closes: '19:00',
          schemaDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
        { days: 'Sábados', opens: '10:00', closes: '16:00',
          schemaDays: ['Saturday'] },
    ],

    social: {
        instagram: 'https://www.instagram.com/eye_gastronomia/',
        facebook: '', // vacio oculta el icono
    },
} as const;
```

Notar que el tipo de `address` ahora incluye `postalCode`, así que la firma declarada en el
bloque de **Interfaces** de esta tarea lleva ese campo también.

- [ ] **Step 2: Consumir el módulo en Contact**

En `frontend/src/components/Contact.tsx`, agregar el import:

```tsx
import { siteConfig } from '../site';
```

Reemplazar los valores hardcodeados:
- Línea 115 (`+54 9 11 1234 5678`) → `{siteConfig.phoneDisplay}`
- Línea 124 (`contacto@mycathering.com`) → `{siteConfig.email}`
- Línea 133 (`Montevideo, Uruguay`) → `{`${siteConfig.address.city}, ${siteConfig.address.country}`}`

Reemplazar la lista de horarios (líneas 160-169) por:

```tsx
                            <ul className="space-y-4 pl-2">
                                {siteConfig.hours.map((h) => (
                                    <li key={h.days} className="flex justify-between items-center text-lg border-b border-dashed border-ink-200 pb-2">
                                        <span className="text-ink-700 font-medium">{h.days}</span>
                                        <span className="text-brand-950 font-bold">{h.opens} - {h.closes}</span>
                                    </li>
                                ))}
                            </ul>
```

Y en el bloque de redes sociales (líneas 141-151), reemplazar los tres `href="#"`: el de
Instagram por `siteConfig.social.instagram`, el de Facebook por `siteConfig.social.facebook`,
y el de WhatsApp por `` `https://wa.me/${siteConfig.whatsappNumber}` ``. Envolver Instagram
y Facebook en `{siteConfig.social.instagram && (...)}` para que no se rendericen vacíos.

- [ ] **Step 3: Consumir el módulo en Footer**

En `frontend/src/components/Footer.tsx`, agregar el import:

```tsx
import { siteConfig } from '../site';
```

La Tarea 3 ya insertó líneas en este archivo, así que las sustituciones van **por contenido**,
no por número de línea:

| Buscar | Reemplazar por |
|---|---|
| `Av. Libertador 1234,<br />Buenos Aires, Argentina` | `` {`${siteConfig.address.city}, ${siteConfig.address.country}`} `` |
| `+54 9 11 1234 5678` | `{siteConfig.phoneDisplay}` |
| `hola@mycatering.com` | `{siteConfig.email}` |
| `&copy; 2026 MyCatering. Todos los derechos reservados.` | `` {`© ${new Date().getFullYear()} ${siteConfig.name}. Todos los derechos reservados.`} `` |

En los tres iconos de redes del bloque de marca, aplicar los mismos `href` que en el Step 2:
Instagram a `siteConfig.social.instagram`, Facebook a `siteConfig.social.facebook` (envuelto en
`{siteConfig.social.facebook && (...)}` para que no se renderice vacío), y WhatsApp a
`` `https://wa.me/${siteConfig.whatsappNumber}` ``.

Los cuatro links de la columna "Servicios" apuntan a `href="#"` y no van a ninguna parte.
Apuntarlos todos a `#services`, que es la sección que efectivamente los describe.

- [ ] **Step 4: Verificar que no quedan datos hardcodeados**

```bash
cd frontend && grep -rn "mycatering\|mycathering\|MyCatering\|1234 5678\|Libertador" src/ index.html
```

Esperado: **sin resultados**.

- [ ] **Step 5: Verificar el build**

```bash
cd frontend && npm run build
```

Esperado: build exitoso, sin errores de TypeScript.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/site.ts frontend/src/components/Contact.tsx frontend/src/components/Footer.tsx
git commit -m "refactor(site): centralize business data in siteConfig

Contact decia Montevideo y Footer decia Buenos Aires, con tres emails
distintos y telefono de relleno. Una sola fuente de verdad evita que la
inconsistencia NAP vuelva y rompa el JSON-LD."
```

---

### Task 5: Infraestructura de tests

El proyecto no tiene tests. Se instala Vitest solo para lo que puede fallar en silencio y
costarle reservas a la empresa: la lógica del formulario. El tema visual y la maquetación se
verifican a mano, que es lo apropiado para color y tipografía.

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`
- Create: `frontend/src/test-setup.ts`

**Interfaces:**
- Consumes: nada.
- Produces: el comando `npm test` en `frontend/`, con `describe`/`it`/`expect` globales,
  entorno jsdom y los matchers de `@testing-library/jest-dom` cargados.

- [ ] **Step 1: Instalar las dependencias**

```bash
cd frontend && npm install -D vitest@^3 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Configurar Vitest en Vite**

Reemplazar el contenido de `frontend/vite.config.ts` por:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

- [ ] **Step 3: Crear el archivo de setup**

Crear `frontend/src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Agregar el script de test**

En `frontend/package.json`, dentro de `"scripts"`, agregar:

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 5: Verificar que el runner arranca**

```bash
cd frontend && npm test
```

Esperado: Vitest arranca y reporta "No test files found". Eso confirma que la configuración
carga. Si falla con un error de `environment`, `jsdom` no se instaló.

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vite.config.ts frontend/src/test-setup.ts
git commit -m "test: add vitest with jsdom and testing-library"
```

---

### Task 6: Formulario de reservas

Cinco problemas concretos en `Agenda.tsx`: no pide teléfono (identificador imprescindible
para el CRM de WhatsApp), la URL del endpoint está hardcodeada a `localhost:8080`, el estado
de error se setea pero nunca se renderiza, no hay honeypot contra bots, y el texto promete
verificación instantánea de disponibilidad que no existe.

**Files:**
- Modify: `frontend/src/components/Agenda.tsx`
- Create: `frontend/src/components/__tests__/Agenda.test.tsx`
- Create: `frontend/.env.example`

**Interfaces:**
- Consumes: la infraestructura de test de la Tarea 5.
- Produces: el contrato del `POST` que la ruta API del plan de wacrm debe aceptar:

```ts
{
  clientName: string; email: string; phone: string;
  eventDate: string;   // "YYYY-MM-DD"
  eventTime: string;   // "HH:MM:00"
  guestCount: number; eventType: string; message: string;
  contactPreference: string;  // honeypot: siempre "" en envíos legítimos
}
```

- [ ] **Step 1: Escribir los tests que fallan**

Crear `frontend/src/components/__tests__/Agenda.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Agenda from '../Agenda';

vi.mock('axios');
const mockedPost = vi.mocked(axios.post);

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana López');
    await user.type(screen.getByLabelText(/^email$/i), 'ana@ejemplo.com');
    await user.type(screen.getByLabelText(/whatsapp/i), '+59899123456');
};

beforeEach(() => {
    vi.resetAllMocks();
});

it('pide el telefono como campo obligatorio', () => {
    render(<Agenda />);
    const phone = screen.getByLabelText(/whatsapp/i);
    expect(phone).toBeRequired();
});

it('envia el telefono en el payload', async () => {
    const user = userEvent.setup();
    mockedPost.mockResolvedValue({ data: {} });
    render(<Agenda />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: /solicitar/i }));

    await waitFor(() => expect(mockedPost).toHaveBeenCalled());
    const payload = mockedPost.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.phone).toBe('+59899123456');
});

it('envia la fecha como YYYY-MM-DD y la hora como HH:MM:00', async () => {
    const user = userEvent.setup();
    mockedPost.mockResolvedValue({ data: {} });
    render(<Agenda />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: /solicitar/i }));

    await waitFor(() => expect(mockedPost).toHaveBeenCalled());
    const payload = mockedPost.mock.calls[0][1] as Record<string, string>;
    expect(payload.eventDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(payload.eventTime).toMatch(/^\d{2}:\d{2}:00$/);
});

it('incluye el honeypot vacio en un envio legitimo', async () => {
    const user = userEvent.setup();
    mockedPost.mockResolvedValue({ data: {} });
    render(<Agenda />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: /solicitar/i }));

    await waitFor(() => expect(mockedPost).toHaveBeenCalled());
    const payload = mockedPost.mock.calls[0][1] as Record<string, string>;
    expect(payload.contactPreference).toBe('');
});

it('muestra un mensaje de error visible cuando el envio falla', async () => {
    const user = userEvent.setup();
    mockedPost.mockRejectedValue(new Error('network down'));
    render(<Agenda />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: /solicitar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos/i);
});

it('no promete verificacion instantanea de disponibilidad', () => {
    render(<Agenda />);
    expect(screen.queryByText(/al instante/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

```bash
cd frontend && npm test
```

Esperado: FAIL. `pide el telefono` falla con "Unable to find a label with the text
/whatsapp/i", y `no promete verificacion instantanea` falla porque el texto "al instante"
todavía está en el componente.

- [ ] **Step 3: Agregar el campo de teléfono y el honeypot al estado**

En `frontend/src/components/Agenda.tsx`, cambiar el estado inicial (líneas 9-17) por —y usar
el mismo objeto en el reset de las líneas 33-41:

```tsx
    const initialForm = {
        clientName: '',
        email: '',
        phone: '',
        eventDate: new Date(),
        eventTime: '12:00',
        guestCount: 50,
        eventType: 'Bodas',
        message: '',
        contactPreference: '', // honeypot: los bots lo llenan, las personas no lo ven
    };
    const [formData, setFormData] = useState(initialForm);
```

Y en `handleSubmit`, reemplazar el bloque de reset por `setFormData(initialForm);`.

- [ ] **Step 4: Sacar la URL hardcodeada**

Reemplazar la llamada de la línea 27 por:

```tsx
            const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
            await axios.post(`${apiBase}/api/bookings`, {
                ...formData,
                eventDate: formData.eventDate.toISOString().split('T')[0],
                eventTime: formattedTime
            });
```

Crear `frontend/.env.example`:

```
# Base del endpoint de reservas. En produccion apunta al panel wacrm.
VITE_API_BASE_URL=https://admin.eyegastronomia.com
```

- [ ] **Step 5: Agregar el input de teléfono al formulario**

Importar `FaWhatsapp` desde `react-icons/fa` (agregarlo a la lista de imports de la línea 6)
y insertar este bloque dentro del primer `grid` del formulario, después del campo de email:

```tsx
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-ink-700 mb-1">
                                        WhatsApp
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaWhatsapp className="text-ink-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            id="phone"
                                            required
                                            className="block w-full pl-10 rounded-lg border-ink-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border"
                                            placeholder="+598 91 234 567"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-ink-600">
                                        Con código de país. Te escribimos por acá.
                                    </p>
                                </div>
```

El primer `grid` pasa de `sm:grid-cols-2` a `sm:grid-cols-3` para acomodar los tres campos.

- [ ] **Step 6: Agregar el honeypot**

Insertar antes del `<div className="pt-2">` del botón. `aria-hidden` y `tabIndex={-1}` lo
sacan del foco y de los lectores de pantalla; los bots que llenan todo lo van a completar.

```tsx
                            <div className="absolute left-[-9999px]" aria-hidden="true">
                                <label htmlFor="contactPreference">No completar</label>
                                <input
                                    type="text"
                                    id="contactPreference"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={formData.contactPreference}
                                    onChange={(e) => setFormData({ ...formData, contactPreference: e.target.value })}
                                />
                            </div>
```

- [ ] **Step 7: Renderizar el estado de error**

Después del bloque de `status === 'success'`, agregar:

```tsx
                            {status === 'error' && (
                                <div role="alert" className="rounded-lg bg-danger-500/10 p-4 border border-danger-500/40">
                                    <h3 className="text-sm font-medium text-danger-700">No pudimos enviar tu solicitud</h3>
                                    <p className="mt-2 text-sm text-danger-700">
                                        Revisá tu conexión e intentá de nuevo. Si el problema sigue,
                                        escribinos por WhatsApp y lo resolvemos al momento.
                                    </p>
                                </div>
                            )}
```

- [ ] **Step 8: Corregir los textos que prometen lo que no existe**

- Línea 66: reemplazar `Planifique su próximo evento con nosotros. Complete el formulario y
  verificaremos disponibilidad al instante.` por:
  `Contanos sobre tu evento y te confirmamos disponibilidad a la brevedad por WhatsApp.`
- Línea 245: el texto del botón pasa de `Confirmar Disponibilidad` a `Solicitar Presupuesto`.
  El botón no confirma nada; solicitar es lo que efectivamente hace.

- [ ] **Step 9: Correr los tests y verificar que pasan**

```bash
cd frontend && npm test
```

Esperado: los 6 tests en PASS.

- [ ] **Step 10: Verificar el build**

```bash
cd frontend && npm run build
```

Esperado: build exitoso.

- [ ] **Step 11: Commit**

```bash
git add frontend/src/components/Agenda.tsx frontend/src/components/__tests__/Agenda.test.tsx frontend/.env.example
git commit -m "feat(agenda): add required phone field, honeypot and visible error state

El telefono es el identificador del contacto en el CRM de WhatsApp y no se
estaba pidiendo. Ademas el estado de error se seteaba sin renderizarse, y el
copy prometia verificacion instantanea de disponibilidad que no existe."
```

---

### Task 7: SEO

`index.html` está sin tocar desde el scaffold de Vite: el título es `frontend`, el idioma
`en`, el favicon el de Vite, y no hay descripción, canonical, Open Graph ni datos
estructurados.

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/vite.config.ts`
- Create: `frontend/public/robots.txt`
- Create: `frontend/public/sitemap.xml`

**Interfaces:**
- Consumes: los recursos de la Tarea 3 (`favicon-32.png`, `favicon-180.png`, `og-image.jpg`)
  y los datos de la Tarea 4 (`siteConfig`). También la configuración de Vitest que la Tarea 5
  agregó a `vite.config.ts`, que hay que conservar.
- Produces: nada que consuman otras tareas.

**El JSON-LD se genera en tiempo de build desde `siteConfig`, no se escribe a mano.** El hook
`transformIndexHtml` de Vite corre en dev y en build, y su salida queda dentro del HTML
servido — así que los rastreadores lo leen igual que si estuviera literal, pero el dato del
negocio vive en un único lugar. Escribirlo dos veces sería duplicación innecesaria; generarlo
en el navegador con JavaScript lo volvería invisible para parte de los rastreadores. Esta vía
evita las dos cosas.

Las metaetiquetas (`title`, `description`, Open Graph) **sí** van literales en el HTML: son
texto de marketing, no datos del negocio, y leerlas en el archivo es una ventaja.

- [ ] **Step 1: Escribir el index.html completo**

Reemplazar el contenido de `frontend/index.html` por:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>E&amp;E Gastronomía — Catering para bodas y eventos en Montevideo</title>
    <meta name="description" content="Catering artesanal para bodas, eventos corporativos y celebraciones en Montevideo. Menús a medida, staff profesional y coordinación completa. Pedí tu presupuesto por WhatsApp." />
    <link rel="canonical" href="https://eyegastronomia.com/" />

    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png" />
    <meta name="theme-color" content="#691316" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="E&amp;E Gastronomía" />
    <meta property="og:title" content="E&amp;E Gastronomía — Catering para bodas y eventos" />
    <meta property="og:description" content="Catering artesanal para bodas, eventos corporativos y celebraciones en Montevideo. Menús a medida y coordinación completa." />
    <meta property="og:url" content="https://eyegastronomia.com/" />
    <meta property="og:image" content="https://eyegastronomia.com/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="es_UY" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="E&amp;E Gastronomía — Catering para bodas y eventos" />
    <meta name="twitter:description" content="Catering artesanal para bodas, eventos corporativos y celebraciones en Montevideo." />
    <meta name="twitter:image" content="https://eyegastronomia.com/og-image.jpg" />

    <!-- El JSON-LD lo inyecta el plugin jsonLdPlugin de vite.config.ts desde src/site.ts -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Generar el JSON-LD desde siteConfig**

Reemplazar el contenido de `frontend/vite.config.ts` por lo siguiente. **Conserva el bloque
`test` que agregó la Tarea 5** — no borrarlo.

```ts
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { siteConfig } from './src/site'

const DESCRIPTION =
  'Catering artesanal para bodas, eventos corporativos y celebraciones en Montevideo.'

/**
 * Inyecta el JSON-LD de schema.org/Caterer en el <head> en tiempo de build,
 * derivandolo de siteConfig. Corre en dev y en build, y su salida queda en el
 * HTML servido, asi que los rastreadores lo leen sin ejecutar JavaScript.
 *
 * Esto mantiene los datos del negocio en un unico lugar (src/site.ts).
 */
function jsonLdPlugin(): Plugin {
  return {
    name: 'inject-json-ld',
    transformIndexHtml() {
      const { address } = siteConfig

      const data: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Caterer',
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/favicon-180.png`,
        image: `${siteConfig.url}/og-image.jpg`,
        description: DESCRIPTION,
        email: siteConfig.email,
        telephone: siteConfig.phoneE164,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          // streetAddress se omite si esta vacio: declarar una direccion
          // incompleta es peor que no declararla.
          ...(address.street ? { streetAddress: address.street } : {}),
          addressLocality: address.city,
          addressRegion: address.region,
          postalCode: address.postalCode,
          addressCountry: address.countryCode,
        },
        areaServed: { '@type': 'City', name: address.city },
        openingHoursSpecification: siteConfig.hours.map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: h.schemaDays,
          opens: h.opens,
          closes: h.closes,
        })),
      }

      const sameAs = [siteConfig.social.instagram, siteConfig.social.facebook].filter(Boolean)
      if (sameAs.length > 0) data.sameAs = sameAs

      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify(data, null, 2),
          injectTo: 'head',
        },
      ]
    },
  }
}

export default defineConfig({
  plugins: [react(), jsonLdPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

- [ ] **Step 3: Crear robots.txt**

Crear `frontend/public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://eyegastronomia.com/sitemap.xml
```

- [ ] **Step 4: Crear sitemap.xml**

Es una sola página, así que el sitemap tiene una sola URL. Actualizar `lastmod` a la fecha
de publicación.

Crear `frontend/public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://eyegastronomia.com/</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

- [ ] **Step 5: Compilar y verificar que el JSON-LD inyectado es válido**

Este es el paso que confirma que el plugin funciona. El JSON-LD **no** está en
`index.html` — hay que buscarlo en el HTML compilado.

```bash
cd frontend && npm run build
```

Luego:

```bash
cd frontend && python -c "
import json, re, pathlib
html = pathlib.Path('dist/index.html').read_text(encoding='utf-8')
m = re.search(r'<script type=\"application/ld\+json\">(.*?)</script>', html, re.S)
assert m, 'FALLO: el plugin no inyecto ningun bloque JSON-LD'
data = json.loads(m.group(1))
print('tipo    ', data['@type'])
print('nombre  ', data['name'])
print('email   ', data['email'])
print('telefono', data['telephone'])
print('ciudad  ', data['address']['addressLocality'])
print('horarios', len(data['openingHoursSpecification']), 'bloques')
print('sameAs  ', data.get('sameAs'))
"
```

Esperado:
```
tipo     Caterer
nombre   E&E Gastronomía
email    eyegastronomia5@hotmail.com
telefono +59891908707
ciudad   Montevideo
horarios 2 bloques
sameAs   ['https://www.instagram.com/eye_gastronomia/']
```

Si el `assert` falla, el plugin no está registrado en el array `plugins` de
`vite.config.ts`. Si los valores no coinciden con `src/site.ts`, el plugin está leyendo
constantes propias en lugar de `siteConfig`.

- [ ] **Step 6: Verificar que el JSON-LD también aparece en dev**

El hook corre en los dos modos, y conviene comprobarlo: si solo funcionara en build, un
error de datos no se vería hasta publicar.

```bash
cd frontend && npm run dev &
sleep 4 && curl -s http://localhost:5173/ | grep -c 'application/ld+json'
```

Esperado: `1`. Después, detener el servidor de dev.

- [ ] **Step 7: Verificar que el build copia los archivos estáticos**

```bash
cd frontend && ls dist/robots.txt dist/sitemap.xml dist/og-image.jpg dist/favicon-32.png
```

Esperado: los cuatro archivos existen en `dist/`.

- [ ] **Step 8: Verificar que el título llegó al HTML compilado**

```bash
cd frontend && grep -c "E&amp;E Gastronomía" dist/index.html
```

Esperado: un número mayor a 0. Si es 0, Vite no procesó el `index.html` correcto.

- [ ] **Step 9: Verificar que los tests siguen pasando**

`vite.config.ts` fue reescrito y contiene la configuración de Vitest; hay que confirmar que
sobrevivió.

```bash
cd frontend && npm test
```

Esperado: los 6 tests de la Tarea 6 en PASS. Si Vitest no arranca, el bloque `test` se perdió
al reescribir el archivo.

- [ ] **Step 10: Commit**

```bash
git add frontend/index.html frontend/vite.config.ts frontend/public/robots.txt frontend/public/sitemap.xml
git commit -m "feat(seo): add metadata, Open Graph and generated Caterer JSON-LD

El index.html seguia siendo el del scaffold: titulo 'frontend', lang en,
favicon de Vite y ninguna descripcion. El JSON-LD se genera en build desde
siteConfig con un plugin de Vite, asi los datos del negocio no se duplican."
```

---

### Task 8: Distribución visual

Cuatro problemas de maquetación independientes de la paleta.

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/Services.tsx`
- Modify: `frontend/src/components/Hero.tsx`
- Modify: `frontend/src/components/Agenda.tsx`
- Modify: `frontend/src/components/Contact.tsx`

**Interfaces:**
- Consumes: los tokens de la Tarea 1.
- Produces: nada.

- [ ] **Step 1: Quitar el `<hr>` y unificar el ritmo de espaciado**

Separar secciones con una regla horizontal es un parche; el espaciado consistente hace el
trabajo. Reemplazar el contenido de `frontend/src/App.tsx` por:

```tsx
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Agenda from './components/Agenda';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Hero />
      <Services />
      <Agenda />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
```

Y unificar el padding vertical de las secciones, que hoy varía sin criterio. Buscar por
contenido (las tareas anteriores desplazaron los números de línea) y reemplazar en los tres
archivos:

- `Services.tsx`: `py-12 md:py-24` → `py-20 md:py-28`
- `Agenda.tsx`: `py-16 md:py-24` → `py-20 md:py-28`
- `Contact.tsx`: `py-16 md:py-24` → `py-20 md:py-28`

Verificar que quedaron los tres:

```bash
cd frontend && grep -rn "py-20 md:py-28" src/components/
```

Esperado: 3 resultados, uno por archivo.

- [ ] **Step 2: Quitar la clase inexistente `mask-gradient-x`**

`Services.tsx` línea 53 usa `mask-gradient-x`, que no es una utilidad de Tailwind y no
genera nada. La intención era desvanecer los bordes del carrusel; se logra con una máscara
real. Reemplazar la línea 53 por:

```tsx
                <div
                    className="mt-12 md:mt-20 mb-12 relative w-full overflow-hidden pb-8"
                    style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
                >
```

- [ ] **Step 3: Dejar de reanimar en cada scroll**

Todos los componentes usan `viewport={{ once: false }}`, así que el contenido se reanima cada
vez que la sección entra en pantalla y parpadea al subir y bajar. Cambiar **todas** las
apariciones de `once: false` por `once: true`:

```bash
cd frontend && grep -rn "once: false" src/components/
```

Archivos afectados: `Hero.tsx` (líneas 27, 38, 48), `Services.tsx` (línea 40),
`Agenda.tsx` (líneas 58, 75, 114), `Contact.tsx` (líneas 15, 33, 99).

- [ ] **Step 4: Verificar que no quedan animaciones repetitivas**

```bash
cd frontend && grep -rn "once: false" src/
```

Esperado: **sin resultados**.

- [ ] **Step 5: Limpiar el hack del icono de servicios**

`Services.tsx` guarda el string `'tophat'` como icono (línea 13) y lo traduce con un ternario
en el render (línea 65). Poner el emoji directo en los datos y simplificar el render:

- Línea 13: `icon: 'tophat',` → `icon: '🎩',`
- Línea 65: `{service.icon === 'tophat' ? '🎩' : service.icon}` → `{service.icon}`

- [ ] **Step 6: Verificar visualmente**

```bash
cd frontend && npm run dev
```

Confirmar:
1. No hay línea horizontal entre Agenda y Contacto; la separación se lee por espaciado.
2. El carrusel de servicios se desvanece en los bordes izquierdo y derecho.
3. Al hacer scroll hacia abajo y volver arriba, **las secciones no se reanimen**.
4. El espaciado vertical entre secciones es consistente.

- [ ] **Step 7: Correr los tests para descartar regresiones**

```bash
cd frontend && npm test && npm run build
```

Esperado: los 6 tests en PASS y build exitoso.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/
git commit -m "fix(layout): unify section spacing, fix carousel mask, stop re-animating

Quita el <hr> suelto, reemplaza la clase inexistente mask-gradient-x por una
mascara CSS real, y pasa las animaciones a once:true — venian reanimandose en
cada scroll."
```

---

### Task 9: Retirar el backend Java del proyecto

El spec retira Spring Boot pero **no borra el código**: queda en el repo con una nota que
explique la decisión, para que eliminarlo sea una decisión aparte y con calma.

**Files:**
- Modify: `README.md`
- Create: `backend/DEPRECATED.md`

**Interfaces:**
- Consumes: nada.
- Produces: nada.

- [ ] **Step 1: Escribir la nota de deprecación**

Crear `backend/DEPRECATED.md`:

```markdown
# Backend retirado

Este backend de Spring Boot fue reemplazado en agosto de 2026. No se despliega
y no forma parte del sistema en producción.

**Qué lo reemplazó:** las reservas se guardan en Supabase (Postgres) y el
endpoint que recibe el formulario público vive en el fork de wacrm, que además
provee el panel administrativo, el calendario y la integración con WhatsApp.

**Por qué:** con las reservas en Supabase y el panel en wacrm, la única función
que le quedaba a este servicio era recibir un POST e insertar una fila. wacrm ya
es una app Next.js con acceso a Supabase y ya está desplegada en el mismo
servidor.

**Por qué no se borró:** para que la eliminación sea una decisión separada. El
código no molesta donde está, y conserva el modelo de datos original por si hace
falta consultarlo.

Detalle completo en `docs/superpowers/specs/2026-08-08-e-e-gastronomia-puesta-en-produccion-design.md`.
```

- [ ] **Step 2: Actualizar el README**

Reemplazar el contenido de `README.md` por:

```markdown
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
```

- [ ] **Step 3: Verificar que el README no menciona la marca vieja**

```bash
cd "c:/Tool Room/Development/MyCatheringApp" && grep -rn "MyCatering\|MyCathering\|H2\|localhost:8080" README.md
```

Esperado: **sin resultados**.

- [ ] **Step 4: Commit**

```bash
git add README.md backend/DEPRECATED.md
git commit -m "docs: retire Java backend and rewrite README for E&E Gastronomia"
```

---

## Verificación final

Después de la Tarea 9, con todo integrado:

- [ ] `cd frontend && npm test` — los 6 tests en PASS
- [ ] `cd frontend && npm run build` — build exitoso
- [ ] `cd frontend && npm run lint` — sin errores
- [ ] `grep -rn "accent-\|gray-\|MyCatering\|mycathering\|localhost:8080" frontend/src frontend/index.html README.md` — sin resultados
- [ ] Revisión visual en `npm run dev`: Navbar y botones vinosos, logo circular sin recuadro,
      acentos verdes, fondo crema, títulos en Playfair y cuerpo en Inter, sin reanimación al
      hacer scroll
- [ ] Revisión responsive a 375px de ancho: el Navbar colapsa a menú hamburguesa, el
      formulario de reservas apila sus campos, el carrusel de servicios no desborda
      horizontalmente

## Datos del negocio: pendientes menores

Los datos reales ya están en el plan (nombre, teléfono `091 908 707`, email
`eyegastronomia5@hotmail.com`, Zum Felde / Montevideo / 11400, Instagram). Quedan dos cabos
sueltos, ninguno bloqueante:

- **Falta el número de puerta de Zum Felde.** El JSON-LD declara la calle sin altura. Si el
  negocio no atiende público en un local, eso está bien y se deja así. Si atiende, agregar la
  altura mejora la ficha local de Google; va en `siteConfig.address.street`.
- **Facebook queda vacío**, así que el icono no se renderiza y la URL no entra al `sameAs`.
  Si existe la página, agregar la URL a `siteConfig.social.facebook` — el plugin la suma al
  `sameAs` automáticamente.

Aparte, una observación que no afecta al plan: el email es de Hotmail, no del dominio. Funciona
y el JSON-LD lo acepta, pero una vez comprado `eyegastronomia.com` conviene mover el contacto
público a una dirección del dominio — pesa en la percepción de un negocio que cobra por
eventos. Es un cambio de una línea en `site.ts` cuando quieras hacerlo.

Cualquier cambio de estos datos se hace **solo en `src/site.ts`**: las secciones de Contacto y
el Footer lo consumen en runtime, y el JSON-LD se regenera en el build. No hay un segundo lugar
que actualizar.

## Fuera de alcance de este plan

- Tabla `bookings`, ruta API, calendario e integración con el CRM (plan de wacrm, requiere el
  spike previo)
- Despliegue: Nginx, Docker Compose, Cloudflare Tunnel, cron de backup (plan de despliegue,
  requiere el dominio comprado)
- El `noindex` de `admin.eyegastronomia.com`, que se sirve por cabecera desde Nginx y por lo
  tanto pertenece al plan de despliegue
- Verificación real de disponibilidad
- Hacer funcional el formulario de la sección Contacto. Hoy tiene `type="button"` sin handler:
  es decorativo. Se resuelve en el plan de wacrm, convirtiéndolo en un enlace `wa.me`
  prellenado, para que la consulta caiga directo en el inbox del CRM como conversación real de
  WhatsApp y no haga falta ningún endpoint nuevo.
