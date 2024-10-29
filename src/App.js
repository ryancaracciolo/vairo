import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './styles/App.css';
import { BusinessContext } from './objects/Context';

// Landing Components
import LandingHeader from './components/landing/Header/Header';
import LandingFooter from './components/landing/Footer/Footer';
import LandingMain from './components/landing/LandingMain/LandingMain';

// App Components
import Authentication from './pages/product/Authentication/Authentication';
import Header from './components/product/Header/Header';
import Menu from './components/product/Menu/Menu';
import Analyze from './pages/product/Analyze/Analyze';
import MyData from './pages/product/MyData/MyData';
import LoadingScreen from './components/product/LoadingScreen/LoadingScreen';

function LandingPage() {
  return (
    <div className="landing">
      <LandingHeader />
      <LandingMain />
      <LandingFooter />
    </div>
  );
}

function App() {
  const [activeMenuIndex, setActiveMenuIndex] = useState(0); // Menu active index
  const { business, setBusiness } = useContext(BusinessContext);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/app/analyze') {
      setActiveMenuIndex(0);
    } else if (location.pathname === '/app/data') {
      setActiveMenuIndex(1);
    }
  }, [location.pathname]); // Re-run whenever the location changes

  useEffect(() => {
    const storedBusiness = localStorage.getItem('business');
    if (storedBusiness) {
      setBusiness(JSON.parse(storedBusiness));
    }
    setLoading(false); // Mark loading as complete once data is retrieved
    console.log(storedBusiness);
  }, [setBusiness]);

  if (loading) {
    console.log('Loading...');
    return <LoadingScreen isLoading={loading}/>;
  }

  return (
    <div className="app">
      {business?.id ? (
          <>
            <Header />
            <main className="product-main">
              <Menu activeMenuIndex={activeMenuIndex}/>
              <Routes>
                <Route path="/app/analyze" element={<Analyze />} />
                <Route path="/app/data" element={<MyData />} />
                <Route path="*" element={<Navigate to="/app/analyze" />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/app/login" element={<Authentication setBusiness={setBusiness} />} />
            <Route path="*" element={<Navigate to="/app/login" />} />
          </Routes>
        )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </Router>
  );
}
