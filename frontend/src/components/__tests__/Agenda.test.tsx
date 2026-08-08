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
