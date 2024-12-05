import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './styles/App.css';
import { UserContext, ActiveMenuIndexContext } from './objects/Context';
import { Navigate } from 'react-router-dom';

// App Components
import Banner from './components/Banner/Banner';
import Header from './components/Header/Header';
import Upgrade from './pages/Upgrade/Upgrade';
import PaymentProcess from './pages/Upgrade/PaymentProcess/PaymentProcess';
import StripeReturn from './pages/Upgrade/PaymentProcess/StripeReturn';
// App Main Components
import Menu from './components/Menu/Menu';
import Threads from './pages/Threads/Threads';
import Dashboard from './pages/Dashboard/Dashboard';
import DataSources from './pages/DataSources/DataSources';
import AddDataSource from './pages/DataSources/AddDataSource/AddDataSource';
import Resources from './pages/Resources/Resources';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import Authentication from './pages/Authentication/Authentication';


function App() {
  const { setActiveMenuIndex } = useContext(ActiveMenuIndexContext);
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/threads')) {
      setActiveMenuIndex(0);
    } else if (location.pathname.startsWith('/dashboards')) {
      setActiveMenuIndex(1);
    } else if (location.pathname.startsWith('/data-sources')) {
      setActiveMenuIndex(2);
    } else if (location.pathname.startsWith('/resources')) {
      setActiveMenuIndex(3);
    }
  }, [location.pathname, setActiveMenuIndex]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Stored user:', storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Parsed user:', parsedUser);
      setUser(parsedUser);
    } else {
      console.log('No user found in localStorage');
    }
    setLoading(false);
  }, [setUser]);

  if (loading) {
    return <LoadingScreen isLoading={loading} />;
  }

  return (
    <div className="app-wrapper">
          {user?.id ? (
            <>
              <Banner />
              <Header />
              {location.pathname.startsWith('/upgrade') ? (
                <Routes>
                  <Route path="/upgrade" element={<Upgrade />} />
                  <Route path="/upgrade/payment-process/:plan" element={<PaymentProcess />} />
                  <Route path="/upgrade/stripe-return" element={<StripeReturn />} />
                  /*<Route path="*" element={<Navigate to="/upgrade" />} />*/
                </Routes>
              ) : (
                <main className="product-main">
                  <Menu />
                  <Routes>
                    <Route path="/threads/action?" element={<Threads />} />
                    <Route path="/dashboards/action?" element={<Dashboard />} />
                    <Route path="/data-sources/action?" element={<DataSources />} />
                    <Route path="/data-sources/add" element={<AddDataSource />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="*" element={<Navigate to="/threads" />} />
                  </Routes>
                </main>
              )}
            </>
          ) : (
            <Routes>
              <Route path="/login" element={<Authentication />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
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
