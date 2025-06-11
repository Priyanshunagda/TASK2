import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { authService } from './services/authService'
import CreateRole from './components/CreateRole'
import CreateEmployee from './components/CreateEmployee'
import ProtectedLayout from './components/ProtectedLayout'
import 'react-toastify/dist/ReactToastify.css'
import './styles/CreateRole.css'
import './App.css'

import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import OTPVerify from './pages/OTPVerify'
import Dashboard from './pages/Dashboard'
import EmployeeList from './components/EmployeeList'
import './styles/EmployeeList.css'

const PrivateRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home isLoggedIn={authService.isAuthenticated()} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp-verify" element={<OTPVerify />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <ProtectedLayout email={authService.getUserEmail()} onLogout={handleLogout} />
          </PrivateRoute>
        }>
          <Route path="dashboard" element={<Dashboard email={authService.getUserEmail()} />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/create" element={<CreateEmployee />} />
          <Route path="employees/edit/:id" element={<CreateEmployee editMode={true} />} />
          {authService.getUserRole() === 'Admin' && (
            <Route path="roles/create" element={<CreateRole />} />
          )}
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
