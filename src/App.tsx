import {ConsentDialog, WaLink} from './components/Consent';
import {useEffect, useState} from 'react';
import {views, type View} from './content';
import {Footer} from './components/Footer';
import {Hero} from './components/Hero';
import {Nav} from './components/Nav';
import {Page} from './components/Pages';
import {Split} from './components/Split';
import {Statement} from './components/Statement';
import {Reels} from './components/Reels';
import {TrustStrip} from './components/Trust';
import {useReducedMotion} from './hooks/useReducedMotion';
import {useReveals} from './hooks/useReveals';
import {scrollToY, startScroll} from './lib/scroll';

const ids: string[] = [...views.map((v) => v.id), 'agenda', 'resultados', 'privacidad', 'pagar', 'panel', 'cotizacion'];
const fromHash = (): View => {
  const h = location.hash.slice(1).split('?')[0];
  return (ids.includes(h) ? h : 'inicio') as View;
};

export default function App() {
  const reduced = useReducedMotion();
  const navRoot = useReveals<HTMLDivElement>();
  const [view, setView] = useState<View>(fromHash);
  // en celular el botón de WhatsApp aparece al pasar la portada, para no tapar el título
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const check = () => setPastHero(window.innerWidth >= 1024 || window.scrollY > window.innerHeight * 0.6);
    check();
    window.addEventListener('scroll', check, {passive: true});
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);
  const bubble = view !== 'inicio' || pastHero;

  useEffect(() => startScroll(reduced), [reduced]);

  // Cada pestaña es una vista propia: al cambiar de hash se cambia de vista y se vuelve arriba.
  useEffect(() => {
    const onHash = () => {
      setView(fromHash());
      requestAnimationFrame(() => scrollToY(0));
    };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  return (
    <main className="relative">
      <div ref={navRoot} className={view === 'inicio' ? '' : 'sticky top-0 z-30'}>
        <Nav view={view} />
      </div>
      {view === 'inicio' ? (
        <>
          <Hero reduced={reduced} />
          <Split reduced={reduced} />
          <Statement reduced={reduced} />
          <TrustStrip />
          <Reels />
        </>
      ) : (
        <Page key={view} view={view} />
      )}
      <Footer />
      {/* WhatsApp flotante, abajo a la izquierda */}
      <ConsentDialog />
      <WaLink
        text="Hola EXORA, quiero agendar una valoración."
        label="Escribir por WhatsApp"
        className={`fixed bottom-4 left-4 z-50 grid size-12 place-items-center transition-[opacity,transform] duration-500 md:size-14 ${bubble ? "" : "pointer-events-none translate-y-4 opacity-0"} rounded-full bg-[#25d366] text-white shadow-[0_12px_30px_-8px_rgb(0_0_0/0.35)] transition-transform hover:scale-105 md:bottom-7 md:left-7`}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366]/40 motion-reduce:hidden" />
        <svg viewBox="0 0 24 24" className="relative size-6 md:size-7" fill="currentColor" aria-hidden>
          <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.1-1.3A9.9 9.9 0 1 0 12 2Zm0 18.1c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.1 8.1 0 1 1 12 20.1Zm4.5-6c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.8c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
        </svg>
      </WaLink>
    </main>
  );
}
