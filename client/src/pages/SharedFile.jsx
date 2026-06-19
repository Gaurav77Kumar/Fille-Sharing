import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getSharedFile,
  verifyFilePassword,
  getGuestDownloadInfo,
  guestVerifyPassword,
} from '../api/fileApi';


const SharedFile = () => {
  const { slug } = useParams();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    fetchFileInfo();
  }, [slug]);

  const fetchFileInfo = async () => {
    setLoading(true);
    setError('');
      const response = await getSharedFile(slug);
      setFile(response.file);
      setIsGuest(false);

      try {
        const guestResponse = await getGuestDownloadInfo(slug);
        setFile(guestResponse.file);
        setIsGuest(true);
      } catch (guestErr) {
        const status = guestErr?.response?.status;
        if (status === 410) {
          setError('This file has expired and is no longer available.');
        } else {
          setError('File not found or has been deleted.');
        }
      }
    
  };

  const handlePasswordVerify = async (e) => {
    e.preventDefault();
    if (!password) return;

    setVerifying(true);
    setError('');

    try {
      let response;
      if (isGuest) {
        response = await guestVerifyPassword(slug, password);
      } else {
        response = await verifyFilePassword(file.id, password);
      }
      setDownloadUrl(response.file.cloudinaryUrl);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        setError('Too many attempts. Please wait 15 minutes before trying again.');
      } else {
        setError(err.response?.data?.message || 'Incorrect password');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMinutesRemaining = (minutes) => {
    if (!minutes || minutes <= 0) return 'Expired';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };


  const isExpired = file?.expiresAt !== null &&
    file?.expiresAt !== undefined &&
    new Date(file.expiresAt) < new Date();

  const hasExpiry = file?.expiresAt !== null && file?.expiresAt !== undefined;

  const getFileIcon = () => {
    const type = file?.mimeType || '';

    if (type.startsWith('image/')) {
      return (
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-500">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    if (type.startsWith('video/')) {
      return (
        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform duration-500">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    if (type.startsWith('audio/')) {
      return (
        <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/30 group-hover:scale-110 transition-transform duration-500">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100"></div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error && !file) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50"></div>
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>
        <div className="glass-light rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">File Not Available</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100"></div>
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="glass-light rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-10 text-center group">
          <div className="flex justify-center mb-6">
            {getFileIcon()}
          </div>

          <h1 className="text-2xl font-bold text-gray-800 break-words mb-2">
            {file.originalName}
          </h1>

          <p className="text-gray-500">
            {formatFileSize(file.size)}
            <span className="mx-2">•</span>
            {file.mimeType}
          </p>

          {/* Status badges */}
          <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
            {file.isPasswordProtected && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 glass border border-amber-200 bg-amber-50/80 text-amber-700 rounded-xl text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Protected
              </span>
            )}

            {isExpired && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 glass border border-red-200 bg-red-50/80 text-red-700 rounded-xl text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Expired
              </span>
            )}

            {hasExpiry && !isExpired && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 glass border border-orange-200 bg-orange-50/80 text-orange-700 rounded-xl text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isGuest && file.minutesRemaining !== undefined
                  ? `Expires in ${formatMinutesRemaining(file.minutesRemaining)}`
                  : `Expires ${formatDate(file.expiresAt)}`
                }
              </span>
            )}

            {isGuest && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 glass border border-gray-200 bg-gray-50/80 text-gray-600 rounded-xl text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Guest upload
              </span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="p-6 pt-0">
          {isExpired ? (
            <div className="glass rounded-xl p-6 text-center border border-red-200 bg-red-50/80">
              <svg className="w-12 h-12 mx-auto text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 font-medium">
                This file has expired and is no longer available for download.
              </p>
            </div>

          ) : file.isPasswordProtected && !downloadUrl ? (
            <form onSubmit={handlePasswordVerify} className="space-y-4">
              <div className="glass rounded-xl p-4 border border-amber-200 bg-amber-50/80 flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm text-amber-700 font-medium">
                  This file is password protected. Enter the password to download.
                </p>
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-5 py-4 glass-input rounded-xl focus:ring-2 focus:ring-indigo-500/30"
              />

              {error && (
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={verifying || !password}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Unlock & Download
                  </>
                )}
              </button>
            </form>

          ) : (
            <button
              onClick={handleDownload}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-t border-white/50 text-center">
          <p className="text-sm text-gray-500">
            Shared via{' '}
            <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              FileShare
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedFile;

