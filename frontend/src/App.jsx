import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Layout/Header';
import BottomNav from './components/Layout/BottomNav';
import Sidebar from './components/Layout/Sidebar';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Records from './pages/Records';
import Revenue from './pages/Revenue';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};

const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  // The login screen is a standalone full-page design; it doesn't sit
  // inside the app's fixed header / bottom-nav / narrow content column.
  const isLoginRoute = location.pathname === '/login';

  if (isLoginRoute) {
    return (
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      </Routes>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      <Sidebar />
      <Header />

      <main className="flex-1 px-4 pt-[72px] pb-[100px] md:pt-10 md:pb-10 md:pl-[264px] md:pr-10 max-w-md md:max-w-none mx-auto w-full custom-scrollbar overflow-y-auto">
        <div className="md:max-w-5xl md:mx-auto">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/new-entry" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
            <Route path="/revenue" element={<ProtectedRoute><Revenue /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {isAuthenticated && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
