import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import MessageDetail from './pages/MessageDetail';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import SEO from './components/SEO';
import { useAnalytics } from './hooks/useAnalytics';

// Analytics wrapper component
function AppWithAnalytics() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have a redirect path from 404.html
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      // Clear the redirect path
      sessionStorage.removeItem('redirectPath');
      // Navigate to the stored path
      navigate(redirectPath);
    }
  }, [navigate]);

  // Handle 404 redirects
  useEffect(() => {
    const handle404Redirect = () => {
      const path = location.pathname;
      if (path.startsWith('/message/')) {
        const messageId = path.split('/message/')[1];
        // Check if message exists
        fetch(`/data/messages/${messageId}.json`)
          .then(response => {
            if (!response.ok) {
              navigate('/404');
            }
          })
          .catch(() => {
            navigate('/404');
          });
      }
    };

    handle404Redirect();
  }, [location, navigate]);

  useAnalytics(); // This will track page views automatically
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="flex-grow">
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