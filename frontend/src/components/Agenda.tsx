import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaCalendarAlt, FaClock, FaUsers, FaGlassCheers, FaCommentDots, FaWhatsapp } from 'react-icons/fa';

const Agenda = () => {
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
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const timeParts = formData.eventTime.split(':');
            const formattedTime = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:00`;

            const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
            await axios.post(`${apiBase}/api/bookings`, {
                ...formData,
                eventDate: formData.eventDate.toISOString().split('T')[0],
                eventTime: formattedTime
            });
            setStatus('success');
            setFormData(initialForm);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <section id="agenda" className="py-16 md:py-24 bg-surface relative overflow-hidden">
            {/* Decorative bg element */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.25 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-sm md:text-base text-brand-600 font-semibold tracking-wide uppercase">Reservas</h2>
                    <p className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-950 font-serif">
                        Agenda Online
                    </p>
                    <p className="mt-4 max-w-2xl text-lg text-ink-500 mx-auto">
                        Contanos sobre tu evento y te confirmamos disponibilidad a la brevedad por WhatsApp.
                    </p>
                </motion.div>

                <div className="lg:grid lg:grid-cols-5 lg:gap-12 items-start">
                    {/* Left Column: Context/Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.25 }}
                        className="lg:col-span-2 mb-12 lg:mb-0"
                    >
                        <h3 className="text-2xl font-bold text-brand-950 font-serif mb-6">¿Por qué elegirnos?</h3>
                        <ul className="space-y-6">
                            <li className="flex">
                                <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 text-primary-700">
                                    <FaGlassCheers size={20} />
                                </span>
                                <div className="ml-4">
                                    <h4 className="text-lg font-medium text-brand-950">Experiencia Única</h4>
                                    <p className="mt-1 text-ink-500">Diseñamos cada menú y ambientación a medida.</p>
                                </div>
                            </li>
                            <li className="flex">
                                <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 text-primary-700">
                                    <FaClock size={20} />
                                </span>
                                <div className="ml-4">
                                    <h4 className="text-lg font-medium text-brand-950">Puntualidad Perfecta</h4>
                                    <p className="mt-1 text-ink-500">Cronograma ajustado al minuto para su tranquilidad.</p>
                                </div>
                            </li>
                            <li className="flex">
                                <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 text-primary-700">
                                    <FaUsers size={20} />
                                </span>
                                <div className="ml-4">
                                    <h4 className="text-lg font-medium text-brand-950">Staff Profesional</h4>
                                    <p className="mt-1 text-ink-500">Camareros y chefs de primer nivel.</p>
                                </div>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Right Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.25 }}
                        className="lg:col-span-3 bg-surface rounded-2xl shadow-2xl p-6 md:p-10 border border-ink-200"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                <div className="relative">
                                    <label htmlFor="clientName" className="block text-sm font-medium text-ink-700 mb-1">Nombre Completo</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-ink-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="clientName"
                                            required
                                            className="block w-full pl-10 rounded-lg border-ink-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border"
                                            placeholder="Juan Pérez"
                                            value={formData.clientName}
                                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">Email</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="text-ink-400" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            className="block w-full pl-10 rounded-lg border-ink-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border"
                                            placeholder="juan@ejemplo.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
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
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-ink-700 mb-1">Fecha del Evento</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <FaCalendarAlt className="text-ink-400" />
                                        </div>
                                        <DatePicker
                                            selected={formData.eventDate}
                                            onChange={(date: Date | null) => date && setFormData({ ...formData, eventDate: date })}
                                            className="block w-full pl-10 rounded-lg border-ink-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border"
                                            minDate={new Date()}
                                            wrapperClassName="w-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="eventTime" className="block text-sm font-medium text-ink-700 mb-1">Hora (Aprox)</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaClock className="text-ink-400" />
                                        </div>
                                        <input
                                            type="time"
                                            id="eventTime"
                                            className="block w-full pl-10 rounded-lg border-ink-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border"
                                            value={formData.eventTime}
                                            onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="guestCount" className="block text-sm font-medium text-ink-700 mb-1">Invitados</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUsers className="text-ink-400" />
                                        </div>
                                        <input
                                            type="number"
                                            id="guestCount"
                                            min="10"
                                            className="block w-full pl-10 rounded-lg border-ink-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border"
                                            value={formData.guestCount}
                                            onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="eventType" className="block text-sm font-medium text-ink-700 mb-1">Tipo de Evento</label>
                                    <select
                                        id="eventType"
                                        className="block w-full rounded-lg border-ink-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border"
                                        value={formData.eventType}
                                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                    >
                                        <option>Bodas</option>
                                        <option>Corporativo</option>
                                        <option>Cumpleaños</option>
                                        <option>Privado</option>
                                        <option>Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-ink-700 mb-1">Detalles Adicionales</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FaCommentDots className="text-ink-400" />
                                    </div>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        className="block w-full pl-10 rounded-lg border-ink-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border"
                                        placeholder="Cuéntanos más sobre tu evento..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

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

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white uppercase tracking-wider bg-brand-700 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-700 transition-all transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? 'Procesando...' : 'Solicitar Presupuesto'}
                                </button>
                            </div>

                            {status === 'success' && (
                                <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-green-800">¡Solicitud Recibida!</h3>
                                            <div className="mt-2 text-sm text-green-700">
                                                <p>Nuestro equipo coordinará los detalles y te contactará a la brevedad.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {status === 'error' && (
                                <div role="alert" className="rounded-lg bg-danger-500/10 p-4 border border-danger-500/40">
                                    <h3 className="text-sm font-medium text-danger-700">No pudimos enviar tu solicitud</h3>
                                    <p className="mt-2 text-sm text-danger-700">
                                        Revisá tu conexión e intentá de nuevo. Si el problema sigue,
                                        escribinos por WhatsApp y lo resolvemos al momento.
                                    </p>
                                </div>
                            )}
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Agenda;
