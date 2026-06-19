import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyFiles } from '../api/fileApi';

const Dashboard = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFiles: 0,
    images: 0,
    videos: 0,
    documents: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getMyFiles(1, 50, 'createdAt', 'desc');
      const userFiles = response.files || [];
      const totalFiles = response.pagination?.totalFiles ?? userFiles.length;

      setFiles(userFiles.slice(0, 5)); 

      const images = userFiles.filter((f) => f.mimeType?.startsWith('image/')).length;
      const videos = userFiles.filter((f) => f.mimeType?.startsWith('video/')).length;
      const documents = userFiles.filter((f) =>
        f.mimeType?.includes('pdf') ||
        f.mimeType?.includes('document') ||
        f.mimeType?.includes('text')
      ).length;

      setStats({ totalFiles, images, videos, documents });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    if (mimeType?.startsWith('video/')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  };

  const storageUsed = user?.storageUsed ?? 0;
  const storageLimit = user?.storageLimit ?? 524_288_000; // 500MB default
  const storagePercent = Math.min(100, ((storageUsed / storageLimit) * 100).toFixed(1));
  const storageWarning = storagePercent >= 80; 

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"></div>
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="text-white">
              <p className="text-indigo-200 mb-2 font-medium">Welcome back,</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{user?.fullname}</h1>
              <p className="text-white/70 max-w-md">
                Manage and share your files securely with advanced protection features.
              </p>

              <div className="mt-4 max-w-xs">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/80">Storage used</span>
                  <span className={`font-semibold ${storageWarning ? 'text-red-300' : 'text-white/80'}`}>
                    {formatFileSize(storageUsed)} / {formatFileSize(storageLimit)}
                  </span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      storageWarning
                        ? 'bg-gradient-to-r from-orange-400 to-red-400'
                        : 'bg-gradient-to-r from-white/60 to-white/80'
                    }`}
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
                {storageWarning && (
                  <p className="text-red-300 text-xs mt-1">
                    Storage almost full — delete files or upgrade your plan.
                  </p>
                )}
              </div>
            </div>

            <Link
              to="/upload"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-6 h-6 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="relative">Upload Files</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          {
            label: 'Total Files',
            value: stats.totalFiles,
            icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
            gradient: 'from-blue-500 to-indigo-600',
            shadow: 'shadow-blue-500/20',
          },
          {
            label: 'Images',
            value: stats.images,
            icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
            gradient: 'from-emerald-500 to-green-600',
            shadow: 'shadow-emerald-500/20',
          },
          {
            label: 'Videos',
            value: stats.videos,
            icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
            gradient: 'from-purple-500 to-violet-600',
            shadow: 'shadow-purple-500/20',
          },
          {
            label: 'Storage',
            value: formatFileSize(storageUsed),
            icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
            gradient: 'from-orange-500 to-amber-600',
            shadow: 'shadow-orange-500/20',
          },
        ].map((stat, index) => (
          <div
            key={stat.label}
            style={{ animationDelay: `${index * 100}ms` }}
            className="glass-light rounded-2xl p-5 md:p-6 hover-lift animate-fade-in-up group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                </svg>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-light rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">Storage Quota</h3>
            <p className="text-sm text-gray-500">
              {formatFileSize(storageUsed)} used of {formatFileSize(storageLimit)}
            </p>
          </div>
          <span className={`text-sm font-bold ${
            storagePercent >= 90 ? 'text-red-600' :
            storagePercent >= 80 ? 'text-orange-600' :
            'text-indigo-600'
          }`}>
            {storagePercent}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
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
        {user?.plan === 'free' && storagePercent >= 70 && (
          <p className="text-sm text-gray-500 mt-2">
            Running low?{' '}
            <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">
              Upgrade to Pro
            </span>{' '}
            for more storage.
          </p>
        )}
      </div>

      {/* Recent Files */}
      <div className="glass-light rounded-3xl overflow-hidden animate-fade-in-up animation-delay-300">
        <div className="p-6 md:p-8 border-b border-white/20 flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Recent Files</h2>
            <p className="text-gray-500 text-sm mt-1">Your latest uploads</p>
          </div>
          <Link
            to="/my-files"
            className="group flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all"
          >
            View All
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {files.length === 0 ? (
          <div className="p-12 md:p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-2">No files uploaded yet</p>
            <p className="text-gray-400 text-sm mb-6">Start by uploading your first file</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Upload your first file
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100/50">
            {files.map((file, index) => (
              <Link
                key={file._id}
                to={`/my-files?selected=${file._id}`}
                style={{ animationDelay: `${index * 50}ms` }}
                className="flex items-center gap-4 p-4 md:p-5 hover:bg-white/50 transition-all duration-300 animate-fade-in group"
              >
                {getFileIcon(file.mimeType)}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                    {file.originalName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                    <span className="text-gray-300 mx-1">•</span>
                    {formatDate(file.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {file.isPasswordProtected && (
                    <span className="p-2 bg-amber-100 rounded-lg" title="Password Protected">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                  )}
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    file.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {file.status}
                  </span>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {[
          { to: '/upload',       title: 'Upload Files',   desc: 'Upload up to 10 files at once',    icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',      gradient: 'from-blue-500 to-indigo-600',   bg: 'from-blue-500/10 to-indigo-500/10' },
          { to: '/guest-upload', title: 'Guest Upload',   desc: 'Share link for quick uploads',     icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', gradient: 'from-emerald-500 to-green-600', bg: 'from-emerald-500/10 to-green-500/10' },
          { to: '/my-files',     title: 'Manage Files',   desc: 'View, share, and organize',        icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',                                    gradient: 'from-purple-500 to-violet-600', bg: 'from-purple-500/10 to-violet-500/10' },
        ].map((action, index) => (
          <Link
            key={action.to}
            to={action.to}
            style={{ animationDelay: `${400 + index * 100}ms` }}
            className="group glass-light rounded-2xl p-6 hover-lift animate-fade-in-up overflow-hidden relative"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <div className="relative">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
