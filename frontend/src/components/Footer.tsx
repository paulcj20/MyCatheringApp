import { FaInstagram, FaFacebookF, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-brand-800 border-t border-brand-700 text-ink-100">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <span className="font-serif text-3xl font-bold text-white tracking-wide">MyCatering</span>
                        <p className="text-ink-300 text-sm leading-relaxed pr-4">
                            Elevando estándares culinarios. Momentos inolvidables, sabores exquisitos y un servicio que supera expectativas.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center text-white hover:bg-brand-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
                                <FaInstagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center text-white hover:bg-brand-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
                                <FaFacebookF size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center text-white hover:bg-brand-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
                                <FaWhatsapp size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-serif text-lg font-semibold mb-6 tracking-wide">Explorar</h3>
                        <ul className="space-y-4">
                            <li><a href="#home" className="text-ink-300 hover:text-primary-400 hover:pl-1 transition-all">Inicio</a></li>
                            <li><a href="#services" className="text-ink-300 hover:text-primary-400 hover:pl-1 transition-all">Servicios</a></li>
                            <li><a href="#agenda" className="text-ink-300 hover:text-primary-400 hover:pl-1 transition-all">Reservar Fecha</a></li>
                            <li><a href="#contact" className="text-ink-300 hover:text-primary-400 hover:pl-1 transition-all">Contacto</a></li>
                        </ul>
                    </div>

                    {/* Services Links */}
                    <div>
                        <h3 className="text-white font-serif text-lg font-semibold mb-6 tracking-wide">Servicios</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-ink-300 hover:text-primary-400 hover:pl-1 transition-all">Bodas & Uniones</a></li>
                            <li><a href="#" className="text-ink-300 hover:text-primary-400 hover:pl-1 transition-all">Eventos Corporativos</a></li>
                            <li><a href="#" className="text-ink-300 hover:text-primary-400 hover:pl-1 transition-all">Cenas Privadas</a></li>
                            <li><a href="#" className="text-ink-300 hover:text-primary-400 hover:pl-1 transition-all">Cocktail Parties</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-serif text-lg font-semibold mb-6 tracking-wide">Contacto</h3>
                        <ul className="space-y-5">
                            <li className="flex items-start group">
                                <FaMapMarkerAlt className="mt-1.5 mr-3 text-primary-500 group-hover:text-primary-400 transition-colors" />
                                <span className="text-ink-300 group-hover:text-white transition-colors">Av. Libertador 1234,<br />Buenos Aires, Argentina</span>
                            </li>
                            <li className="flex items-center group">
                                <FaPhoneAlt className="mr-3 text-primary-500 group-hover:text-primary-400 transition-colors" />
                                <span className="text-ink-300 group-hover:text-white transition-colors">+54 9 11 1234 5678</span>
                            </li>
                            <li className="flex items-center group">
                                <FaEnvelope className="mr-3 text-primary-500 group-hover:text-primary-400 transition-colors" />
                                <span className="text-ink-300 group-hover:text-white transition-colors">hola@mycatering.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-brand-700 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-ink-400">
                        &copy; 2026 MyCatering. Todos los derechos reservados.
                    </p>
                    <div className="flex space-x-8 mt-4 md:mt-0 text-sm text-ink-400">
                        <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
