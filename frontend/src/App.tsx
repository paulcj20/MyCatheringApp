import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Agenda from './components/Agenda';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Services />
      <Agenda />
      {/* Visual Separator */}
      <hr className="border-t border-gray-200" />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
