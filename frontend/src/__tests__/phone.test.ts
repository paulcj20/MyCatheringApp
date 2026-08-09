import { isValidLocalPhone, toInternationalPhone } from '../phone';

it('acepta un numero local de 9 digitos con espacios', () => {
    expect(isValidLocalPhone('091 908 707')).toBe(true);
});

it('acepta un numero local de 9 digitos sin espacios', () => {
    expect(isValidLocalPhone('091908707')).toBe(true);
});

it('rechaza un numero con menos de 9 digitos', () => {
    expect(isValidLocalPhone('91 908 70')).toBe(false);
});

it('rechaza un numero con mas de 9 digitos', () => {
    expect(isValidLocalPhone('091 908 7077')).toBe(false);
});

it('rechaza texto sin digitos suficientes', () => {
    expect(isValidLocalPhone('')).toBe(false);
});

it('convierte un numero local a formato internacional sacando el 0 inicial', () => {
    expect(toInternationalPhone('091 908 707')).toBe('59891908707');
});

it('convierte un numero local sin espacios', () => {
    expect(toInternationalPhone('091908707')).toBe('59891908707');
});

it('devuelve null si el numero no tiene 9 digitos', () => {
    expect(toInternationalPhone('91 908 70')).toBeNull();
});
