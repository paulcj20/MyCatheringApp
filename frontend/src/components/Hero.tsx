import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-primary-50">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-primary-900/50 mix-blend-overlay z-10"></div>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    poster="https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                >
                    <source src="/assets/videos/hero.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.25 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-serif mb-6 drop-shadow-lg"
                >
                    Arte Culinario para <br />
                    <span className="text-accent-500 italic">Momentos Inolvidables</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.25 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light drop-shadow-md px-4"
                >
                    Transformamos ingredientes frescos en experiencias gastronómicas excepcionales para bodas, eventos corporativos y eventos sociales.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.25 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-12 flex flex-col sm:flex-row justify-center gap-6 px-4"
                >
                    {/* Primary Button: Elegant Gold/Amber Gradient */}
                    <a
                        href="#agenda"
                        className="group relative px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-lg font-semibold rounded-none uppercase tracking-widest overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transform hover:-translate-y-1"
                    >
                        <span className="relative z-10">Reservar Fecha</span>
                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-accent-600 to-accent-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>

                    {/* Secondary Button: Premium Glassmorphism */}
                    <a
                        href="#services"
                        className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/30 text-white text-lg font-semibold rounded-none uppercase tracking-widest hover:bg-white/20 transition-all hover:border-white/50"
                    >
                        Ver Menú
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
