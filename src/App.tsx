import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartModal from './components/CartModal';
import Home from './pages/Home';
import Login from './pages/Login';
import MemberArea from './pages/MemberArea';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-dark-900">
                <Routes>
                    {/* Public Routes with Navbar */}
                    <Route path="/" element={
                        <>
                            <Navbar />
                            <Home />
                            <CartModal />
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
            </div>
        </Router>
    );
}
