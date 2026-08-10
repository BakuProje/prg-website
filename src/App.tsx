import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

// Code-split heavy routes & modals
const CartModal = lazy(() => import('./components/CartModal'));
const Login = lazy(() => import('./pages/Login'));
const MemberArea = lazy(() => import('./pages/MemberArea'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function PageLoader() {
    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-dark-900">
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public Routes with Navbar */}
                        <Route path="/" element={
                            <>
                                <Navbar />
                                <Home />
                                <Suspense fallback={null}>
                                    <CartModal />
                                </Suspense>
                            </>
                        } />
                        
                        {/* Auth Routes */}
                        <Route path="/login" element={<Login />} />
                        
                        {/* Role Redirector */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Protected Member Routes */}
                        <Route path="/member" element={<MemberArea />} />
                        <Route path="/player" element={<MemberArea />} />
                        <Route path="/subscriber" element={<MemberArea />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                </Suspense>
            </div>
        </Router>
    );
}
