import { useMemo, useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CustomersList from './components/CustomersList';
import ProductsList from './components/ProductsList';
import OrderCreation from './components/OrderCreation';
import InventoryMovements from './components/InventoryMovements';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { clearToken, getToken } from './api/client';

export default function App() {
  const initialUser = useMemo(() => {
    const stored = localStorage.getItem('erp_user');
    return stored ? JSON.parse(stored) : null;
  }, []);

  const [user, setUser] = useState<{ full_name: string; role: string } | null>(
    initialUser
  );
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(getToken()));
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isLoggedIn) {
    if (authMode === 'register') {
      return (
        <Register
          onRegistered={() => setAuthMode('login')}
          onBackToLogin={() => setAuthMode('login')}
        />
      );
    }

    return (
      <Login
        onLogin={(nextUser) => {
          setUser(nextUser);
          setIsLoggedIn(true);
        }}
        onGoRegister={() => setAuthMode('register')}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          setSidebarOpen(false);
        }}
        onLogout={() => {
          clearToken();
          localStorage.removeItem('erp_user');
          setUser(null);
          setIsLoggedIn(false);
          setAuthMode('login');
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close menu"
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {currentScreen === 'dashboard' && <Dashboard />}
          {currentScreen === 'customers' && <CustomersList />}
          {currentScreen === 'products' && <ProductsList />}
          {currentScreen === 'orders' && <OrderCreation />}
          {currentScreen === 'inventory' && <InventoryMovements />}
        </main>
      </div>
    </div>
  );
}
