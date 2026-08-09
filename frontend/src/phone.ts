/**
 * Helpers para el campo de telefono uruguayo del formulario de reservas.
 *
 * El visitante escribe su numero como lo hace toda la vida: con el 0 inicial
 * y sin codigo de pais (`091 908 707`). Wa.me y el backend necesitan el
 * formato internacional sin el 0 y con el prefijo `598` (`59891908707`).
 * Estas funciones separan esa conversion del componente para poder probarla
 * sin renderizar el formulario, siguiendo el mismo criterio que `toIsoDate`.
 */

/** Uruguay: 9 digitos en total, el celular empieza con 0. */
const LOCAL_PHONE_DIGITS = 9;

/** Quita todo lo que no sea digito (espacios, guiones, etc). */
function onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
}

/**
 * True si `value` tiene exactamente 9 digitos (ignorando espacios), el
 * formato en que un uruguayo escribe su celular: `091 908 707`.
 */
export function isValidLocalPhone(value: string): boolean {
    return onlyDigits(value).length === LOCAL_PHONE_DIGITS;
}

/**
 * Convierte un numero local (`091 908 707`) a formato internacional sin
 * simbolos (`59891908707`): saca el 0 inicial y antepone `598`.
 *
 * Devuelve `null` si `value` no tiene los 9 digitos esperados, para que el
 * llamador no mande a wa.me o al backend un numero a medio escribir.
 */
export function toInternationalPhone(value: string): string | null {
    const digits = onlyDigits(value);
    if (digits.length !== LOCAL_PHONE_DIGITS) return null;
    return `598${digits.slice(1)}`;
}
