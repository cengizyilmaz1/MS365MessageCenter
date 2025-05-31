import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import SEO from './components/SEO';
import { useAnalytics } from './hooks/useAnalytics';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MessageDetail = lazy(() => import('./pages/MessageDetail'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Analytics wrapper component
function AppWithAnalytics() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle GitHub Pages SPA redirect
    if (location.search) {
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('/');
      
      if (redirect) {
        // Remove the ?/ from the beginning and restore the path
        const path = redirect.replace(/~and~/g, '&');
        navigate(path + location.hash, { replace: true });
        return;
      }
    }
    
    // Check if we have a redirect path from 404.html (old method)
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      // Clear the redirect path
      sessionStorage.removeItem('redirectPath');
      // Navigate to the stored path
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, location]);

  // Track page views
  useAnalytics();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/messages" element={<Dashboard />} />
            <Route path="/message/:id" element={<MessageDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router basename="/">
        <SEO />
        <AppWithAnalytics />
      </Router>
    </HelmetProvider>
  );
}

export default App;