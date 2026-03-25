import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyFiles from './pages/MyFiles';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import GuestUpload from './pages/GuestUpload';
import SharedFile from './pages/SharedFile';

// Components
import Layout from './components/shared/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

import './App.css';

// Wrapper for redirecting authenticated users away from login/register
const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={
                <PublicOnlyRoute>
                    <Login />
                </PublicOnlyRoute>
            } />
            <Route path="/register" element={
                <PublicOnlyRoute>
                    <Register />
                </PublicOnlyRoute>
            } />
            <Route path="/guest-upload" element={<GuestUpload />} />
            <Route path="/share/:shortUrl" element={<SharedFile />} />

            {/* Protected Routes with Layout */}
            <Route element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-files" element={<MyFiles />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
