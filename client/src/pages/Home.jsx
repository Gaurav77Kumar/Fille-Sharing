import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const [activeFeature, setActiveFeature] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 6);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
            title: 'Password Protection',
            description: 'Secure your files with password protection. Only people with the password can download.',
            color: 'from-blue-400 to-blue-600',
            shadow: 'shadow-blue-500/30',
            bgLight: 'bg-blue-50'
        },
        {
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            title: 'Expiry Dates',
            description: 'Set expiration dates for your shared files. They\'ll automatically become unavailable.',
            color: 'from-emerald-400 to-emerald-600',
            shadow: 'shadow-emerald-500/30',
            bgLight: 'bg-emerald-50'
        },
        {
            icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
            title: 'QR Code Sharing',
            description: 'Generate QR codes for easy mobile sharing. Perfect for in-person file transfers.',
            color: 'from-purple-400 to-purple-600',
            shadow: 'shadow-purple-500/30',
            bgLight: 'bg-purple-50'
        },
        {
            icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            title: 'Email Sharing',
            description: 'Send files directly via email with a custom message. Recipients get a secure download link.',
            color: 'from-orange-400 to-orange-600',
            shadow: 'shadow-orange-500/30',
            bgLight: 'bg-orange-50'
        },
        {
            icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
            title: 'Guest Uploads',
            description: 'No account needed for quick uploads. Guest files expire after 24 hours automatically.',
            color: 'from-pink-400 to-pink-600',
            shadow: 'shadow-pink-500/30',
            bgLight: 'bg-pink-50'
        },
        {
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            title: 'Download Analytics',
            description: 'Track how many times your files have been downloaded. Monitor engagement easily.',
            color: 'from-indigo-400 to-indigo-600',
            shadow: 'shadow-indigo-500/30',
            bgLight: 'bg-indigo-50'
        }
    ];

    const steps = [
        {
            number: '01',
            title: 'Upload Your Files',
            description: 'Drag & drop or select files up to 50MB. Upload multiple files at once.',
            icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            number: '02',
            title: 'Configure Settings',
            description: 'Add password protection, set expiry dates, or keep it simple.',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
            color: 'from-purple-500 to-pink-500'
        },
        {
            number: '03',
            title: 'Share Instantly',
            description: 'Get a link, QR code, or send directly via email. Your choice.',
            icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
            color: 'from-emerald-500 to-green-500'
        }
    ];

    const comparisons = [
        { feature: 'File Upload', guest: true, registered: true },
        { feature: 'Max Files per Upload', guest: '5', registered: '10' },
        { feature: 'File Size Limit', guest: '50MB', registered: '50MB' },
        { feature: 'File Expiry', guest: '24 hours', registered: 'Customizable' },
        { feature: 'Password Protection', guest: false, registered: true },
        { feature: 'Email Sharing', guest: false, registered: true },
        { feature: 'QR Code Generation', guest: false, registered: true },
        { feature: 'Download Analytics', guest: false, registered: true },
        { feature: 'File Management', guest: false, registered: true }
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/50"></div>
                <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                <div className="absolute top-2/3 left-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            {/* Hero Section */}
            <div className="relative pt-16 pb-24 lg:pt-24 lg:pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6 animate-fade-in">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-sm font-medium text-gray-600">100% Free & Secure</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in leading-tight">
                                Share Files{' '}
                                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                                    Securely
                                </span>
                                <br />
                                <span className="text-4xl md:text-5xl lg:text-6xl text-gray-700">in Seconds</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-xl mb-10 animate-fade-in-up">
                                Upload, protect, and share your files with advanced security features. Password protection, expiry dates, QR codes, and more.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up">
                                {isAuthenticated ? (
                                    <Link
                                        to="/dashboard"
                                        className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/register"
                                            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Get Started Free
                                        </Link>
                                        <Link
                                            to="/guest-upload"
                                            className="px-10 py-4 glass-light text-gray-700 rounded-2xl font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            Upload as Guest
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Trust Badges */}
                            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start animate-fade-in-up">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">No Sign-up Required</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">End-to-End Secure</span>
                                </div>
                            </div>
                        </div>

                        {/* Hero Illustration */}
                        <div className="hidden lg:block relative">
                            <div className="relative">
                                {/* Main Card */}
                                <div className="glass-light rounded-3xl p-8 shadow-2xl animate-float">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">Upload Complete</h3>
                                            <p className="text-gray-500 text-sm">project-files.zip</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
                                            <span className="text-gray-600 text-sm">Password</span>
                                            <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Protected
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
                                            <span className="text-gray-600 text-sm">Expires</span>
                                            <span className="text-gray-800 text-sm font-medium">7 days</span>
                                        </div>
                                        <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
                                            <span className="text-gray-600 text-sm">Downloads</span>
                                            <span className="text-gray-800 text-sm font-medium">24</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute -top-6 -right-6 glass rounded-2xl p-4 shadow-xl animate-bounce-slow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Link Copied!</span>
                                    </div>
                                </div>

                                <div className="absolute -bottom-4 -left-6 glass rounded-2xl p-4 shadow-xl animate-float animation-delay-2000">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">QR Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="glass-light rounded-3xl p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative">
                        {[
                            { value: '50MB', label: 'Max File Size', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                            { value: '10', label: 'Files per Upload', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                            { value: '24h', label: 'Guest File Expiry', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                            { value: '100%', label: 'Free to Use', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
                        ].map((stat, index) => (
                            <div key={index} className="animate-fade-in group" style={{ animationDelay: `${index * 150}ms` }}>
                                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                                    </svg>
                                </div>
                                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {stat.value}
                                </p>
                                <p className="text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 glass rounded-full text-sm font-medium text-indigo-600 mb-4">Simple Process</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
                        How It Works
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Share your files in three simple steps
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-30"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                            <div className="glass-light rounded-3xl p-8 text-center hover-lift h-full">
                                <div className="relative inline-block mb-6">
                                    <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-xl mx-auto`}>
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.icon} />
                                        </svg>
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-800 shadow-lg">
                                        {step.number.slice(-1)}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 glass rounded-full text-sm font-medium text-indigo-600 mb-4">Powerful Features</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
                        Everything you need
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Powerful features to help you upload, manage, and share files securely
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Feature Showcase */}
                    <div className="glass-light rounded-3xl p-8 lg:p-10">
                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    onClick={() => setActiveFeature(index)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                                        activeFeature === index
                                            ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200'
                                            : 'hover:bg-white/50'
                                    }`}
                                >
                                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg ${feature.shadow} flex-shrink-0`}>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-semibold ${activeFeature === index ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            {feature.title}
                                        </h3>
                                        {activeFeature === index && (
                                            <p className="text-gray-600 text-sm mt-1 animate-fade-in">{feature.description}</p>
                                        )}
                                    </div>
                                    <svg className={`w-5 h-5 transition-transform ${activeFeature === index ? 'text-indigo-600 rotate-90' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`glass-light rounded-2xl p-6 hover-lift group transition-all ${
                                    activeFeature === index ? 'ring-2 ring-indigo-500/50 scale-105' : ''
                                }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                    {feature.title}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comparison Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 glass rounded-full text-sm font-medium text-indigo-600 mb-4">Compare Plans</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
                        Guest vs Registered
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Choose what works best for you
                    </p>
                </div>

                <div className="glass-light rounded-3xl overflow-hidden">
                    <div className="grid grid-cols-3 gap-px bg-gray-200/50">
                        <div className="bg-white/80 p-6">
                            <span className="text-gray-600 font-medium">Feature</span>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center">
                            <span className="text-gray-800 font-semibold">Guest</span>
                            <p className="text-xs text-gray-500 mt-1">No account needed</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 text-center">
                            <span className="text-indigo-700 font-semibold">Registered</span>
                            <p className="text-xs text-indigo-500 mt-1">Full access</p>
                        </div>
                    </div>
                    {comparisons.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 gap-px bg-gray-200/30">
                            <div className="bg-white/60 p-4 flex items-center">
                                <span className="text-gray-700">{item.feature}</span>
                            </div>
                            <div className="bg-white/40 p-4 flex items-center justify-center">
                                {typeof item.guest === 'boolean' ? (
                                    item.guest ? (
                                        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )
                                ) : (
                                    <span className="text-gray-600">{item.guest}</span>
                                )}
                            </div>
                            <div className="bg-indigo-50/50 p-4 flex items-center justify-center">
                                {typeof item.registered === 'boolean' ? (
                                    item.registered ? (
                                        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )
                                ) : (
                                    <span className="text-indigo-700 font-medium">{item.registered}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="relative overflow-hidden rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"></div>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                    {/* Floating Icons */}
                    <div className="absolute top-10 left-10 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm animate-float">
                        <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div className="absolute bottom-10 right-10 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm animate-float animation-delay-2000">
                        <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </div>

                    <div className="relative p-12 md:p-20 text-center text-white">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to start sharing?</h2>
                        <p className="text-white/80 mb-10 max-w-xl mx-auto text-lg">
                            Create a free account to upload unlimited files and access all features.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 px-10 py-4 bg-white text-indigo-600 rounded-2xl font-semibold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Create Free Account
                            </Link>
                            <Link
                                to="/guest-upload"
                                className="inline-flex items-center gap-2 px-10 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-2xl font-semibold hover:bg-white/20 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Try as Guest
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-200/50 py-12 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-gray-800">FileShare</span>
                            </div>
                            <p className="text-gray-500 max-w-md">
                                Secure file sharing platform with password protection, expiry dates, QR codes, and more. Share files safely with anyone, anywhere.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link to="/login" className="text-gray-500 hover:text-indigo-600 transition-colors">Login</Link></li>
                                <li><Link to="/register" className="text-gray-500 hover:text-indigo-600 transition-colors">Register</Link></li>
                                <li><Link to="/guest-upload" className="text-gray-500 hover:text-indigo-600 transition-colors">Guest Upload</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Features</h4>
                            <ul className="space-y-2">
                                <li className="text-gray-500">Password Protection</li>
                                <li className="text-gray-500">Expiry Dates</li>
                                <li className="text-gray-500">QR Code Sharing</li>
                                <li className="text-gray-500">Email Sharing</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-500 text-sm">
                            {new Date().getFullYear()} FileShare. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-gray-500 text-sm">
                                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Secure & Encrypted
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
