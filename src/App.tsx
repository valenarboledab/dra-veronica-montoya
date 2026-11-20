import {useEffect, useState} from 'react';
import {views, type View} from './content';
import {Botox} from './components/Botox';
import {Footer} from './components/Footer';
import {Hero} from './components/Hero';
import {Nav} from './components/Nav';
import {Page} from './components/Pages';
import {Split} from './components/Split';
import {Statement} from './components/Statement';
import {useReducedMotion} from './hooks/useReducedMotion';
import {useReveals} from './hooks/useReveals';
import {scrollToY, startScroll} from './lib/scroll';

const ids: string[] = [...views.map((v) => v.id), 'agenda'];
const fromHash = (): View => {
  const h = location.hash.slice(1);
  return (ids.includes(h) ? h : 'inicio') as View;
};

export default function App() {
  const reduced = useReducedMotion();
  const navRoot = useReveals<HTMLDivElement>();
  const [view, setView] = useState<View>(fromHash);

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
          <Botox reduced={reduced} />
          <Statement reduced={reduced} />
        </>
      ) : (
        <Page key={view} view={view} />
      )}
      <Footer />
    </main>
  );
}
