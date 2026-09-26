import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { useCartStore } from './store/cartStore';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

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

function PublicHome() {
    const isCartOpen = useCartStore((state) => state.isCartOpen);

    return (
        <>
            <Navbar />
            <Home />
            {isCartOpen && (
                <Suspense fallback={null}>
                    <CartModal />
                </Suspense>
            )}
        </>
    );
}

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-dark-900">
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<PublicHome />} />
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/member"
                            element={
                                <ProtectedRoute>
                                    <MemberArea />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/player"
                            element={
                                <ProtectedRoute>
                                    <MemberArea />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/subscriber"
                            element={
                                <ProtectedRoute>
                                    <MemberArea />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />
                    </Routes>
                </Suspense>
            </div>
        </Router>
    );
}

