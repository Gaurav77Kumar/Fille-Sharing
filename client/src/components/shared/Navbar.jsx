import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { path: '/my-files', label: 'My Files', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
        { path: '/upload', label: 'Upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
    ];

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${
            scrolled
                ? 'glass-light shadow-glass'
                : 'bg-white/60 backdrop-blur-md'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-gradient hidden sm:block">
                                FileShare
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    {isAuthenticated && (
                        <div className="hidden md:flex items-center space-x-2">
                            {navLinks.map((link, index) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                    className={`relative px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 animate-fade-in group ${
                                        location.pathname === link.path
                                            ? 'text-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {location.pathname === link.path && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/30"></div>
                                    )}
                                    <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                                        location.pathname !== link.path && 'group-hover:bg-gray-100/80'
                                    }`}></div>
                                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                                    </svg>
                                    <span className="relative z-10 font-medium">{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl glass hover:shadow-lg transition-all duration-300 group"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                        <img
                                            src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.fullname}&background=6366f1&color=fff`}
                                            alt="Profile"
                                            className="relative w-9 h-9 rounded-full object-cover ring-2 ring-white/50 shadow-md"
                                        />
                                    </div>
                                    <span className="hidden sm:block text-gray-700 font-medium">{user?.fullname}</span>
                                    <svg className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-64 glass-light rounded-2xl shadow-glass py-2 z-20 animate-fade-in-down overflow-hidden">
                                            <div className="px-4 py-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-white/20">
                                                <p className="font-semibold text-gray-900">{user?.fullname}</p>
                                                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                                                <p className="text-xs text-indigo-600 mt-1">@{user?.username}</p>
                                            </div>
                                            <div className="p-2">
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-indigo-50 rounded-xl transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-medium">Profile</span>
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-medium">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors rounded-xl hover:bg-white/50"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="relative px-5 py-2.5 font-medium text-white rounded-xl overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-transform group-hover:scale-105"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="relative">Sign Up</span>
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        {isAuthenticated && (
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2.5 rounded-xl glass hover:shadow-lg transition-all duration-300"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && isAuthenticated && (
                    <div className="md:hidden pb-4 space-y-2 animate-fade-in-down">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                style={{ animationDelay: `${index * 50}ms` }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl animate-slide-in-right ${
                                    location.pathname === link.path
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'glass text-gray-700 hover:bg-white/50'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                                </svg>
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
