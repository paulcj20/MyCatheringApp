import { motion } from 'framer-motion';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaUser, FaCommentDots, FaClock } from 'react-icons/fa';

const Contact = () => {
    return (
        <section id="contact" className="py-16 md:py-24 bg-white relative overflow-hidden">
            {/* Decorative bg elements (same as Agenda but inverted colors for white bg compatibility) */}
            <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 z-0"></div>
            <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 z-0"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.25 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-sm md:text-base text-accent-600 font-semibold tracking-wide uppercase">Contacto</h2>
                    <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 font-serif">
                        Hablemos de su Evento
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
                        ¿Tienes dudas o estás listo para planear? Estamos aquí para ayudarte en cada paso.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                    {/* Info Card - Left Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.25 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        <div className="bg-primary-50 p-8 rounded-2xl border border-primary-100 shadow-lg">
                            <h3 className="text-2xl font-bold text-primary-900 mb-6 font-serif">Información Directa</h3>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600">
                                            <FaPhoneAlt />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">Teléfono</p>
                                        <p className="text-base text-gray-600">+54 9 11 1234 5678</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600">
                                            <FaEnvelope />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">Email</p>
                                        <p className="text-base text-gray-600">contacto@mycathering.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600">
                                            <FaMapMarkerAlt />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">Ubicación</p>
                                        <p className="text-base text-gray-600">Buenos Aires, Argentina</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
                            <h4 className="flex items-center text-lg font-bold text-gray-900 mb-4 font-serif">
                                <FaClock className="text-accent-500 mr-2" /> Horarios de Atención
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Lunes a Viernes</span>
                                    <span className="font-medium text-gray-900">9:00 - 18:00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Sábados</span>
                                    <span className="font-medium text-gray-900">10:00 - 14:00</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Card - Right Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.25 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3 bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-2xl"
                    >
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="name"
                                            className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 p-3 border transition-colors"
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 p-3 border transition-colors"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="msg" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FaCommentDots className="text-gray-400" />
                                    </div>
                                    <textarea
                                        id="msg"
                                        rows={5}
                                        className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 p-3 border transition-colors"
                                        placeholder="¿En qué podemos ayudarte?"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white uppercase tracking-wider bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all transform hover:-translate-y-1 hover:shadow-xl"
                                >
                                    Enviar Consulta
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
