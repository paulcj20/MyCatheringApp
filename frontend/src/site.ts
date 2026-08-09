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

    email: 'contact@eyegastronomia.com',
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
        facebook: 'https://www.facebook.com/elisayexequiel',
        tiktok: 'https://www.tiktok.com/@eyegastronomia',
    },
} as const;
