import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './styles/App.css';
import { BusinessContext } from './objects/Context';
import { Navigate } from 'react-router-dom';

// Landing Components
import LandingHeader from './components/landing/Header/Header';
import LandingFooter from './components/landing/Footer/Footer';
import LandingMain from './components/landing/LandingMain/LandingMain';

// App Components
import Header from './components/product/Header/Header';
import Menu from './components/product/Menu/Menu';
import Threads from './pages/product/Threads/Threads';
import Dashboard from './pages/product/Dashboard/Dashboard';
import DataSources from './pages/product/DataSources/DataSources';
import Resources from './pages/product/Resources/Resources';
import LoadingScreen from './components/product/LoadingScreen/LoadingScreen';
import Authentication from './pages/product/Authentication/Authentication';

function App() {
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const { business, setBusiness } = useContext(BusinessContext);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/app/threads') {
      setActiveMenuIndex(0);
    } else if (location.pathname === '/app/dashboards') {
      setActiveMenuIndex(1);
    } else if (location.pathname === '/app/data-sources') {
      setActiveMenuIndex(2);
    } else if (location.pathname === '/app/resources') {
      setActiveMenuIndex(3);
    }
  }, [location.pathname]);

  
  useEffect(() => {
    const storedBusiness = localStorage.getItem('business');
    if (storedBusiness) {
      setBusiness(JSON.parse(storedBusiness));
    }
    setLoading(false);
  }, [setBusiness]);

  if (loading) {
    return <LoadingScreen isLoading={loading} />;
  }

  return (
    <div className="app-wrapper">
      {location.pathname.startsWith('/app') ? (
        <>
          {business?.id ? (
            <>
              <Header />
              <main className="product-main">
                <Menu activeMenuIndex={activeMenuIndex} />
                <Routes>
                  <Route path="/app/threads" element={<Threads />} />
                  <Route path="/app/dashboards" element={<Dashboard />} />
                  <Route path="/app/data-sources" element={<DataSources />} />
                  <Route path="/app/resources" element={<Resources />} />
                  <Route path="*" element={<Navigate to="/app/threads" />} />
                </Routes>
              </main>
            </>
          ) : (
            <Routes>
              <Route path="/app/login" element={<Authentication setBusiness={setBusiness} />} />
              <Route path="*" element={<Navigate to="/app/login" />} />
            </Routes>
          )}
        </>
      ) : (
        <>
          <LandingHeader />
          <LandingMain />
          <LandingFooter />
        </>
      )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
