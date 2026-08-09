import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Agenda from './components/Agenda';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';

function App() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Hero />
      <Services />
      <Agenda />
      <Contact />
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}

export default App
