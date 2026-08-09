import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import servicioBodas from '../assets/images/servicio-bodas.jpg';
import servicioCorporativo from '../assets/images/servicio-corporativo.jpg';
import servicioCumpleanos from '../assets/images/servicio-cumpleanos.jpg';
import servicioLunch from '../assets/images/servicio-lunch.jpg';
import servicioPasteleria from '../assets/images/servicio-pasteleria.jpg';
import servicioPrivadas from '../assets/images/servicio-privadas.jpg';

const services = [
    {
        title: 'Catering para casamientos',
        description: 'Menús personalizados que cuentan su historia de amor a través de sabores exquisitos.',
        icon: '💍',
        image: servicioBodas,
    },
    {
        title: 'Catering para eventos corporativos',
        description: 'Impresione a sus clientes y socios con catering profesional de alto nivel.',
        icon: '🎩',
        image: servicioCorporativo,
    },
    {
        title: 'Catering para cumpleaños',
        description: 'Celebraciones vibrantes y emotivas, donde cada detalle refleja su alegría.',
        icon: '🎂',
        image: servicioCumpleanos,
    },
    {
        title: 'Catering para fiestas privadas',
        description: 'Celebre con estilo en la comodidad de su hogar o venue favorito.',
        icon: '🎉',
        image: servicioPrivadas,
    },
    {
        title: 'Servicio de lunch',
        description: 'Enviamos lunch con distintas promociones para quienes buscan una opción práctica, sin necesidad de contratar el servicio completo de catering.',
        icon: '🥪',
        image: servicioLunch,
    },
    {
        title: 'Tortas por encargue',
        description: 'Tortas y postres a medida, hechos por encargue para endulzar cualquier celebración.',
        icon: '🍰',
        image: servicioPasteleria,
    },
];




const Services = () => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        setCanScrollPrev(el.scrollLeft > 4);
        setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        updateScrollState();
        const el = scrollerRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [updateScrollState]);

    const scrollByCard = (direction: 'prev' | 'next') => {
        const el = scrollerRef.current;
        if (!el) return;
        const card = el.querySelector<HTMLElement>('[data-service-card]');
        const amount = card ? card.offsetWidth + 32 /* gap-8 */ : el.clientWidth * 0.8;
        el.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section id="services" className="py-20 md:py-28 bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <p className="text-sm md:text-base text-brand-600 font-semibold tracking-wide uppercase">Nuestros Servicios</p>
                    <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl leading-8 font-extrabold tracking-tight text-brand-950 font-serif">
                        Excelencia en Cada Detalle
                    </h2>
                    <p className="mt-4 max-w-2xl text-lg md:text-xl text-ink-500 mx-auto">
                        Ofrecemos soluciones integrales de catering adaptadas a la esencia de su evento.
                    </p>
                </motion.div>

                <div className="mt-12 md:mt-20 mb-12 relative w-full">
                    {/* Arrows: pointer devices only, hidden on touch-only screens where they add nothing */}
                    <button
                        type="button"
                        aria-label="Ver servicios anteriores"
                        onClick={() => scrollByCard('prev')}
                        disabled={!canScrollPrev}
                        className="flex [@media(pointer:coarse)]:hidden absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-surface text-brand-700 shadow-lg border border-ink-200 transition-opacity hover:bg-brand-700 hover:text-white disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <FaChevronLeft size={18} />
                    </button>
                    <button
                        type="button"
                        aria-label="Ver más servicios"
                        onClick={() => scrollByCard('next')}
                        disabled={!canScrollNext}
                        className="flex [@media(pointer:coarse)]:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-surface text-brand-700 shadow-lg border border-ink-200 transition-opacity hover:bg-brand-700 hover:text-white disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <FaChevronRight size={18} />
                    </button>

                    <div
                        ref={scrollerRef}
                        tabIndex={0}
                        role="region"
                        aria-label="Carrusel de servicios, deslizable"
                        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-8 pb-8 scroll-px-4 px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl"
                        style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
                    >
                        {services.map((service) => (
                            <div
                                key={service.title}
                                data-service-card
                                className="flex-shrink-0 snap-start w-80 md:w-96 group relative bg-surface rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-ink-200"
                            >
                                <div className="h-48 w-full overflow-hidden">
                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-6 md:p-8">
                                    <div className="text-4xl mb-4">{service.icon}</div>
                                    <h3 className="text-xl font-bold text-brand-950 font-serif mb-2">{service.title}</h3>
                                    <p className="text-ink-500">{service.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;
