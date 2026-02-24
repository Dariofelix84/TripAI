import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Result from './pages/Result';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';

export default function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/result" element={
                            <ProtectedRoute><Result /></ProtectedRoute>
                        } />
                        <Route path="/trips" element={
                            <ProtectedRoute><Trips /></ProtectedRoute>
                        } />
                        <Route path="/trips/:id" element={
                            <ProtectedRoute><TripDetail /></ProtectedRoute>
                        } />
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
}
