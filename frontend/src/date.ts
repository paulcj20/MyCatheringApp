/**
 * Fecha en formato ISO `YYYY-MM-DD`, leída en la zona horaria local.
 *
 * NO usar `date.toISOString().split('T')[0]` para esto. `toISOString`
 * convierte a UTC, y Uruguay está en UTC−3: una fecha elegida el 24 de
 * diciembre a las 22:00 se convierte en `2026-12-25T01:00:00Z` y termina
 * enviándose como el día 25.
 *
 * En un sistema de reservas eso significa que el equipo aparece un día
 * tarde al evento. El bug solo se manifiesta cuando la reserva se carga
 * después de las 21:00, así que es invisible en pruebas hechas de día.
 */
export function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
