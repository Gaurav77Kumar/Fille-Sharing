import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../api/authApi';

const Profile = () => {
  const { user, refreshUser, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    username: user?.username || '',
    fullname: user?.fullname || '',
    bio:      user?.bio      || '',
  });

  const handleSave = async () => {
    if (!form.username.trim()) {
      setMessage({ type: 'error', text: 'Username cannot be empty' });
      return;
    }
    if (!form.fullname.trim()) {
      setMessage({ type: 'error', text: 'Full name cannot be empty' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateUser(user.id, {
        username: form.username,
        fullname: form.fullname,
        bio:      form.bio,
      });
      await refreshUser(); 
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      username: user?.username || '',
      fullname: user?.fullname || '',
      bio:      user?.bio      || '',
    });
    setMessage({ type: '', text: '' });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long', year: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const storageUsed    = user?.storageUsed    ?? 0;
  const storageLimit   = user?.storageLimit   ?? 524_288_000;
  const storagePercent = Math.min(100, ((storageUsed / storageLimit) * 100).toFixed(1));
  const storageWarning = storagePercent >= 80;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* Feedback message */}
      {message.text && (
        <div className={`glass rounded-xl p-4 flex items-center gap-3 ${
          message.type === 'success'
            ? 'border border-emerald-200 bg-emerald-50/80'
            : 'border border-red-200 bg-red-50/80'
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
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
          <p className={`flex-1 ${message.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
            {message.text}
          </p>
          <button onClick={() => setMessage({ type: '', text: '' })} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Profile card */}
      <div className="glass-light rounded-2xl overflow-hidden animate-fade-in-up">

        {/* Avatar banner */}
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
              {/* Plan badge */}
              <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold ${
                user?.plan === 'pro'
                  ? 'bg-amber-400/30 text-amber-200 border border-amber-400/30'
                  : 'bg-white/20 text-white/80 border border-white/20'
              }`}>
                {user?.plan === 'pro' ? '⭐ Pro' : 'Free plan'}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-5">

          {editing ? (
            <div className="glass rounded-xl p-5 space-y-4">
              <h4 className="font-semibold text-gray-800 mb-1">Edit Profile</h4>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.fullname}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullname: e.target.value }))}
                  className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="your_username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">
                  Bio <span className="text-gray-400">(optional, max 200 chars)</span>
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-indigo-500/30 resize-none"
                  placeholder="A short bio..."
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/200</p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/30"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-5 py-3 glass hover:bg-white/80 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Username display */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Username
                  </label>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
                <p className="text-lg font-semibold text-gray-800">@{user?.username}</p>
              </div>

              {/* Bio — only show if set */}
              {user?.bio && (
                <div className="glass rounded-xl p-5">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Bio</label>
                  <p className="text-gray-700">{user.bio}</p>
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div className="glass rounded-xl p-5">
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </label>
            <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
          </div>

          {/* Last login */}
          <div className="glass rounded-xl p-5">
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last Login
            </label>
            <p className="text-lg font-semibold text-gray-800">
              {user?.lastLogin ? formatDate(user.lastLogin) : 'N/A'}
            </p>
          </div>

          {/* Member since */}
          {user?.createdAt && (
            <div className="glass rounded-xl p-5">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Member Since
              </label>
              <p className="text-lg font-semibold text-gray-800">{formatDateShort(user.createdAt)}</p>
            </div>
          )}

          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Storage
              </label>
              <span className={`text-sm font-bold ${
                storagePercent >= 90 ? 'text-red-600' :
                storagePercent >= 80 ? 'text-orange-600' :
                'text-indigo-600'
              }`}>
                {storagePercent}%
              </span>
            </div>

            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  storagePercent >= 90
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : storagePercent >= 80
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${storagePercent}%` }}
              />
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatFileSize(storageUsed)} used</span>
              <span>{formatFileSize(storageLimit)} total</span>
            </div>

            {storageWarning && (
              <p className="text-xs text-orange-600 mt-2">
                Storage almost full.{' '}
                {user?.plan === 'free' && (
                  <span className="font-semibold cursor-pointer hover:underline">
                    Upgrade to Pro for more storage.
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Danger zone */}
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
