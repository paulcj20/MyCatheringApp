import { FaWhatsapp } from 'react-icons/fa';
import { siteConfig } from '../site';

const WHATSAPP_MESSAGE = 'Hola! Me gustaria consultar por el catering para un evento.';
const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

/**
 * Fixed bottom-right WhatsApp shortcut, visible on every section (not just the
 * hero). WhatsApp is this business's primary channel, so a visitor scrolled
 * past the hero should never lose access to it. Green is used only as the
 * icon color on a light circular surface, never as a background behind text.
 */
const FloatingWhatsApp = () => {
    return (
        <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
            className="fixed z-40 bottom-5 right-5 sm:bottom-6 sm:right-6 flex items-center justify-center w-14 h-14 rounded-full bg-white text-primary-600 shadow-xl border border-ink-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
            <FaWhatsapp size={28} />
        </a>
    );
};

export default FloatingWhatsApp;
