import { motion } from 'framer-motion';
import heroVideo from '../assets/videos/hero.mp4';

const Hero = () => {
    return (
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
                {/* Darker, more dramatic overlay for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/70 z-10"></div>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-90"
                    poster="https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                >
                    <source src={heroVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold text-white font-serif mb-8 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tight leading-tight"
                >
                    Arte Culinario para <br />
                    <span className="text-primary-400 italic font-light">Momentos Inolvidables</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="mt-6 text-xl md:text-2xl text-white max-w-3xl mx-auto font-serif italic font-light drop-shadow-md px-4 tracking-wide leading-relaxed"
                >
                    Transformamos ingredientes frescos en experiencias gastronómicas excepcionales para bodas, eventos corporativos y celebraciones sociales.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    className="mt-16 flex flex-col sm:flex-row justify-center gap-8 px-4 items-center"
                >
                    {/* Primary Button: Vinoso Solid */}
                    <a
                        href="#agenda"
                        className="group relative px-10 py-5 bg-brand-700 text-white text-lg font-bold rounded-none uppercase tracking-[0.2em] overflow-hidden transition-all duration-300 hover:bg-brand-800 hover:shadow-[0_0_40px_rgba(105,19,22,0.6)] transform hover:-translate-y-1 border border-primary-500/40"
                    >
                        <span className="relative z-10 drop-shadow-md">Reservar Fecha</span>
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                    </a>

                    {/* Secondary Button: Premium Frosted Glass */}
                    <a
                        href="#services"
                        className="group px-10 py-5 bg-white/10 backdrop-blur-md border border-white/40 text-white text-lg font-medium rounded-none uppercase tracking-[0.2em] hover:bg-white/20 transition-all duration-300 hover:border-white/80 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        Ver Menú
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
