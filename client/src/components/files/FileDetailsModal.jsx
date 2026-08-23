import { useState } from 'react';
import { downloadFile, updateFileExpiry, updateFilePassword } from '../../api/fileApi';

const FileDetailsModal = ({ file, onClose, onDelete, onShare, onStatusChange, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);

  const [expiry, setExpiry] = useState({
    wantsExpiry: file.expiresAt !== null && file.expiresAt !== undefined,
    expiresAt: file.expiresAt
      ? new Date(file.expiresAt).toISOString().slice(0, 16)
      : '',
  });

  const [password, setPassword] = useState({
    isProtected: file.isPasswordProtected || false,
    value: '',
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setError('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const showError = (msg) => {
    setError(msg);
    setSuccessMsg('');
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await downloadFile(file._id);
      const link = document.createElement('a');
      link.href = response.file.cloudinaryUrl;
      link.download = response.file.originalName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      showError('Download failed: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleExpiryUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        expiresAt: expiry.wantsExpiry && expiry.expiresAt
          ? new Date(expiry.expiresAt).toISOString()
          : null,
      };
      const response = await updateFileExpiry(file._id, payload);
      onUpdate(response.file);
      showSuccess('Expiry updated successfully');
    } catch (err) {
      showError('Failed to update expiry');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (password.isProtected && !password.value) {
      showError('Please enter a password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await updateFilePassword(
        file._id,
        password.isProtected,
        password.isProtected ? password.value : null
      );
      onUpdate(response.file);
      setPassword((prev) => ({ ...prev, value: '' }));
      showSuccess('Password updated successfully');
    } catch (err) {
      showError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    const type = file.mimeType || '';
    if (type.startsWith('image/')) return { color: 'from-emerald-400 to-green-500', shadow: 'shadow-emerald-500/30', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' };
    if (type.startsWith('video/')) return { color: 'from-purple-400 to-violet-500', shadow: 'shadow-purple-500/30', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' };
    if (type.startsWith('audio/')) return { color: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-500/30', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' };
    return { color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/30', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' };
  };

  const isExpired =
    file.expiresAt !== null &&
    file.expiresAt !== undefined &&
    new Date(file.expiresAt) < new Date();

  const fileHasExpiry = file.expiresAt !== null && file.expiresAt !== undefined;

  const fileIcon = getFileIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />

      <div className="relative glass-light rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${fileIcon.color} rounded-xl flex items-center justify-center shadow-lg ${fileIcon.shadow}`}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={fileIcon.icon} />
                </svg>

              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-800 truncate max-w-md">
                  {file.originalName}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.size)}
                  <span className="mx-1">•</span>
                  {file.mimeType}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-xl transition-all flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-5">
            {[
              { id: 'details',  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { id: 'security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-medium capitalize transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'glass text-gray-600 hover:bg-white/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                </svg>
                {tab.id}
              </button>
            ))}
          </div>
        </div>

        {(error || successMsg) && (
          <div className={`mx-6 mt-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
            error
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                error
                  ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              } />
            </svg>
            {error || successMsg}
          </div>
        )}

        {/* Tab content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      file.status === 'active' && !isExpired ? 'bg-emerald-500' : 'bg-gray-400'
                    }`} />
                    <p className={`font-semibold capitalize ${
                      file.status === 'active' && !isExpired ? 'text-emerald-600' : 'text-gray-600'
                    }`}>
                      {isExpired ? 'Expired' : file.status}
                    </p>
                  </div>
                </div>

                <div className="glass rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Downloads</p>
                  <p className="font-semibold text-gray-800 text-xl">
                    {file.downloadCount ?? 0}
                  </p>
                </div>

                <div className="glass rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="font-semibold text-gray-800">{formatDate(file.createdAt)}</p>
                </div>

                <div className="glass rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="font-semibold text-gray-800">{formatDate(file.updatedAt)}</p>
                </div>
              </div>

              {fileHasExpiry && (
                <div className={`glass rounded-xl p-4 border ${
                  isExpired
                    ? 'border-red-200 bg-red-50/80'
                    : 'border-orange-200 bg-orange-50/80'
                }`}>
                  <p className="text-sm text-gray-500 mb-1">Expires</p>
                  <p className={`font-semibold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                    {formatDate(file.expiresAt)}
                  </p>
                </div>
              )}

              {file.isPasswordProtected && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 glass border border-amber-200 bg-amber-50/80 text-amber-700 rounded-xl text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password Protected
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">

              {/* Password protection */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">Password Protection</h4>
                    <p className="text-sm text-gray-500">Require password to download</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={password.isProtected}
                      onChange={(e) =>
                        setPassword((prev) => ({ ...prev, isProtected: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500"></div>
                  </label>
                </div>

                {password.isProtected && (
                  <div className="space-y-3">
                    <input
                      type="password"
                      value={password.value}
                      onChange={(e) =>
                        setPassword((prev) => ({ ...prev, value: e.target.value }))
                      }
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/30"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                )}

                {!password.isProtected && file.isPasswordProtected && (
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Removing...' : 'Remove Password'}
                  </button>
                )}
              </div>

              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">Expiry Date</h4>
                    <p className="text-sm text-gray-500">Set an expiration date for this file</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={expiry.wantsExpiry}
                      onChange={(e) =>
                        setExpiry((prev) => ({ ...prev, wantsExpiry: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500"></div>
                  </label>
                </div>

                {expiry.wantsExpiry && (
                  <div className="space-y-3">
                    <input
                      type="datetime-local"
                      value={expiry.expiresAt}
                      onChange={(e) =>
                        setExpiry((prev) => ({ ...prev, expiresAt: e.target.value }))
                      }
                      className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <button
                      onClick={handleExpiryUpdate}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/30"
                    >
                      {loading ? 'Updating...' : 'Update Expiry'}
                    </button>
                  </div>
                )}

                {!expiry.wantsExpiry && fileHasExpiry && (
                  <button
                    onClick={handleExpiryUpdate}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Removing...' : 'Remove Expiry'}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-3">File Status</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => onStatusChange('active')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      file.status === 'active'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'glass text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Active
                  </button>
                  <button
                    onClick={() => onStatusChange('inactive')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      file.status === 'inactive'
                        ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30'
                        : 'glass text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Inactive
                  </button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="glass rounded-xl p-5 border border-red-200/50 bg-red-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800">Danger Zone</h4>
                    {/*
                      Soft delete: server sets deletedAt, removes from Cloudinary in background.
                      Parent (MyFiles) removes this card from the list on onDelete() call.
                    */}
                    <p className="text-sm text-red-600">Delete this file and free up storage</p>
                  </div>
                </div>
                <button
                  onClick={onDelete}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/20 bg-gradient-to-r from-gray-50/80 to-gray-100/80 flex justify-between">
          <button
            onClick={onShare}
            className="px-5 py-2.5 glass text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold flex items-center gap-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          <button
            onClick={handleDownload}
            disabled={loading || file.status !== 'active' || isExpired}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {loading ? 'Loading...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileDetailsModal;