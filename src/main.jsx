import React, { Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/* Hash routing keeps the app one static bundle — no router dependency, and
   #/staff works on any host without rewrite rules. The panel is a lazy chunk
   so guests never download the code for it. */
const StaffApp = lazy(() => import('./admin/StaffApp.jsx'));

function Root() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  return hash.startsWith('#/staff')
    ? <Suspense fallback={null}><StaffApp /></Suspense>
    : <App />;
}

createRoot(document.getElementById('root')).render(<Root />);
