import { motion } from 'framer-motion';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaUser, FaCommentDots, FaClock, FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { siteConfig } from '../site';

const Contact = () => {
    return (
        <section id="contact" className="py-20 md:py-28 bg-surface relative overflow-hidden">
            {/* Decorative bg: soft ambient light anchored off two corners, warm brand
                tones fading to nothing — reads as light in the room, not shapes on the wall. */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        'radial-gradient(ellipse 900px 650px at 0% 0%, rgba(105, 19, 22, 0.07), transparent 60%), radial-gradient(ellipse 900px 650px at 100% 100%, rgba(228, 218, 215, 0.55), transparent 60%)',
                }}
            ></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    className="text-center mb-16"
                >
                    <p className="text-sm md:text-base text-brand-600 font-semibold tracking-wide uppercase">Contacto</p>
                    <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-950 font-serif">
                        Hablemos de su Evento
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-ink-500 max-w-2xl mx-auto">
                        ¿Tienes dudas o estás listo para planear? Estamos aquí para ayudarte en cada paso!
                        Nos ajustamos al presupuesto de cada evento.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                    {/* Form Card - Left Column (was Right) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3 bg-surface p-8 md:p-10 rounded-2xl border border-ink-200 shadow-2xl"
                    >
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1">Nombre</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-ink-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="name"
                                            className="block w-full pl-10 rounded-lg border-ink-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border transition-colors"
                                            placeholder="Tu nombre"
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
                                            className="block w-full pl-10 rounded-lg border-ink-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border transition-colors"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="msg" className="block text-sm font-medium text-ink-700 mb-1">Mensaje</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FaCommentDots className="text-ink-400" />
                                    </div>
                                    <textarea
                                        id="msg"
                                        rows={5}
                                        className="block w-full pl-10 rounded-lg border-ink-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border transition-colors"
                                        placeholder="¿En qué podemos ayudarte?"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white uppercase tracking-wider bg-brand-700 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-700 transition-all transform hover:-translate-y-1 hover:shadow-xl"
                                >
                                    Enviar Consulta
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Info Section - Right Column (was Left) */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-10"
                    >
                        {/* Direct Info */}
                        <div>
                            <h3 className="text-2xl font-bold text-brand-950 font-serif mb-6 border-b border-ink-200 pb-2 inline-block">
                                Información Directa
                            </h3>
                            <ul className="space-y-6">
                                <li className="flex items-start">
                                    <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 text-primary-700">
                                        <FaPhoneAlt size={18} />
                                    </span>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-brand-950">Teléfono</h4>
                                        <p className="mt-1 text-ink-500">{siteConfig.phoneDisplay}</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 text-primary-700">
                                        <FaEnvelope size={18} />
                                    </span>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-brand-950">Email</h4>
                                        <p className="mt-1 text-ink-500">{siteConfig.email}</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 text-primary-700">
                                        <FaMapMarkerAlt size={18} />
                                    </span>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-brand-950">Ubicación</h4>
                                        <p className="mt-1 text-ink-500">{`${siteConfig.address.city}, ${siteConfig.address.country}`}</p>
                                    </div>
                                </li>
                            </ul>

                            {/* Social Media */}
                            <div className="mt-8 pt-6 border-t border-ink-200">
                                <h4 className="text-lg font-medium text-brand-950 mb-4 font-serif">Síguenos</h4>
                                <div className="flex space-x-4">
                                    {siteConfig.social.instagram && (
                                        <a href={siteConfig.social.instagram} className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 hover:bg-brand-700 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1">
                                            <FaInstagram size={20} />
                                        </a>
                                    )}
                                    {siteConfig.social.facebook && (
                                        <a href={siteConfig.social.facebook} className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 hover:bg-brand-700 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1">
                                            <FaFacebookF size={20} />
                                        </a>
                                    )}
                                    {siteConfig.social.tiktok && (
                                        <a href={siteConfig.social.tiktok} className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 hover:bg-brand-700 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1">
                                            <FaTiktok size={20} />
                                        </a>
                                    )}
                                    <a href={`https://wa.me/${siteConfig.whatsappNumber}`} className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 hover:bg-brand-700 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1">
                                        <FaWhatsapp size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Hours */}
                        <div>
                            <h3 className="text-2xl font-bold text-brand-950 font-serif mb-6 border-b border-ink-200 pb-2 block flex items-center gap-2">
                                <FaClock className="text-primary-600" size={24} /> Horarios de Atención
                            </h3>
                            <ul className="space-y-4 pl-2">
                                {siteConfig.hours.map((h) => (
                                    <li key={h.days} className="flex justify-between items-center text-lg border-b border-dashed border-ink-200 pb-2">
                                        <span className="text-ink-700 font-medium">{h.days}</span>
                                        <span className="text-brand-950 font-bold">{h.opens} - {h.closes}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
