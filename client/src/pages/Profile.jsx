import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../api/authApi';

const Profile = () => {
    const { user, refreshUser, logout } = useAuth();
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState(user?.username || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSave = async () => {
        if (!username.trim()) {
            setMessage({ type: 'error', text: 'Username cannot be empty' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await updateUser(user.id, { username });
            await refreshUser();
            setEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="animate-fade-in">
                <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
                <p className="text-gray-500 mt-1">Manage your account settings</p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`glass rounded-xl p-4 flex items-center gap-3 animate-shake ${
                    message.type === 'success'
                        ? 'border border-emerald-200 bg-emerald-50/80'
                        : 'border border-red-200 bg-red-50/80'
                }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                        {message.type === 'success' ? (
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <p className={message.type === 'success' ? 'text-emerald-700' : 'text-red-700'}>
                        {message.text}
                    </p>
                </div>
            )}

            {/* Profile Card */}
            <div className="glass-light rounded-2xl overflow-hidden animate-fade-in-up">
                {/* Header with Avatar */}
                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-10">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="relative flex items-center gap-5">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <img
                                src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.fullname}&background=random&size=128`}
                                alt="Profile"
                                className="relative w-24 h-24 rounded-full border-4 border-white/30 object-cover shadow-xl"
                            />
                        </div>
                        <div className="text-white">
                            <h2 className="text-2xl font-bold">{user?.fullname}</h2>
                            <p className="text-white/80 flex items-center gap-2 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {user?.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="p-6 space-y-6">
                    {/* Username */}
                    <div className="glass rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Username
                            </label>
                            {!editing && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit
                                </button>
                            )}
                        </div>
                        {editing ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="flex-1 px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-indigo-500/30"
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/30"
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setUsername(user?.username || '');
                                    }}
                                    className="px-5 py-3 glass hover:bg-white/80 rounded-xl font-medium transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <p className="text-lg font-semibold text-gray-800">@{user?.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="glass rounded-xl p-5">
                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                        </label>
                        <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
                    </div>

                    {/* Last Login */}
                    <div className="glass rounded-xl p-5">
                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Last Login
                        </label>
                        <p className="text-lg font-semibold text-gray-800">
                            {user?.lastLogin ? formatDate(user.lastLogin) : 'N/A'}
                        </p>
                    </div>

                    {/* Stats */}
                    <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-4">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Statistics
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass rounded-xl p-4 text-center group hover:-translate-y-1 transition-all">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <p className="text-2xl font-bold text-indigo-600">{user?.totalUploads || 0}</p>
                                <p className="text-sm text-gray-500">Uploads</p>
                            </div>
                            <div className="glass rounded-xl p-4 text-center group hover:-translate-y-1 transition-all">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </div>
                                <p className="text-2xl font-bold text-emerald-600">{user?.totalDownloads || 0}</p>
                                <p className="text-sm text-gray-500">Downloads</p>
                            </div>
                            <div className="glass rounded-xl p-4 text-center group hover:-translate-y-1 transition-all">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-2xl font-bold text-purple-600">{user?.imageCounts || 0}</p>
                                <p className="text-sm text-gray-500">Images</p>
                            </div>
                            <div className="glass rounded-xl p-4 text-center group hover:-translate-y-1 transition-all">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-2xl font-bold text-orange-600">{user?.videoCounts || 0}</p>
                                <p className="text-sm text-gray-500">Videos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="glass rounded-2xl overflow-hidden border border-red-200/50 animate-fade-in-up">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                            <p className="text-sm text-gray-500">
                                Once you log out, you'll need to sign in again to access your files.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
