import { toIsoDate } from '../date';

it('devuelve la fecha en formato YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 11, 24, 12, 0, 0))).toBe('2026-12-24');
});

it('rellena mes y dia de un digito con cero', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 12, 0, 0))).toBe('2026-01-05');
});

it('no adelanta el dia cuando la hora local cae de noche', () => {
    // Este es el bug que motivo el modulo. Con toISOString(), una fecha
    // elegida a las 22:00 en Uruguay (UTC-3) se convertia en el dia
    // siguiente en UTC y la reserva se guardaba corrida: el equipo
    // aparecia un dia tarde al evento.
    const nocheDel24 = new Date(2026, 11, 24, 22, 0, 0);
    expect(toIsoDate(nocheDel24)).toBe('2026-12-24');
});

it('no atrasa el dia cuando la hora local cae de madrugada', () => {
    // El caso simetrico, para husos con desplazamiento positivo.
    const madrugadaDel24 = new Date(2026, 11, 24, 1, 0, 0);
    expect(toIsoDate(madrugadaDel24)).toBe('2026-12-24');
});
