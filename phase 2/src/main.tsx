import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import './index.css';

/**
 * Root Router separating the new Landing/Home page at root route ("/")
 * from the existing Dashboard (/dashboard).
 */
function RootRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === '/dashboard' ? '/dashboard' : '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname === '/dashboard' ? '/dashboard' : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (currentPath === '/dashboard') {
    return <App />;
  }

  // Root route ("/") renders the new landing/home page
  return <LandingPage onGetStarted={() => navigateTo('/dashboard')} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootRouter />
  </StrictMode>,
);
