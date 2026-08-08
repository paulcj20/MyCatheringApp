// https://vite.dev/config/
// defineConfig viene de 'vitest/config', no de 'vite': es lo que hace que la
// propiedad `test` type-checkee. Si esto vuelve a 'vite', tsc falla en `test:`.
import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
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
