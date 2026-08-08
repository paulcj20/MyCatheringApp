import { motion } from 'framer-motion';

const services = [
    {
        title: 'Bodas',
        description: 'Menús personalizados que cuentan su historia de amor a través de sabores exquisitos.',
        icon: '💍',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
        title: 'Eventos Corporativos',
        description: 'Impresione a sus clientes y socios con catering profesional de alto nivel.',
        icon: '🎩',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
        title: 'Cumpleaños & Social',
        description: 'Celebraciones vibrantes y emotivas, donde cada detalle refleja su alegría.',
        icon: '🎂',
        image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
        title: 'Fiestas Privadas',
        description: 'Celebre con estilo en la comodidad de su hogar o venue favorito.',
        icon: '🎉',
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
];




const Services = () => {
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

                <div
                    className="mt-12 md:mt-20 mb-12 relative w-full overflow-hidden pb-8"
                    style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
                >
                    <div className="flex w-max hover:pause animate-scroll gap-8">
                        {/* First set of items */}
                        {[...services, ...services].map((service, index) => (
                            <div
                                key={`${service.title}-${index}`}
                                className="flex-shrink-0 w-80 md:w-96 group relative bg-surface rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-ink-200 mx-4"
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
