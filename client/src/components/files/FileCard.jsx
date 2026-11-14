import { useState } from 'react';
import { downloadFile } from '../../api/fileApi';



const FileCard = ({ file, onView, onShare, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isExpired =
    file.expiresAt !== null &&
    file.expiresAt !== undefined &&
    new Date(file.expiresAt) < new Date();

  const getIcon = () => {
    const mime = file.mimeType || '';
    if (mime.startsWith('image/'))
      return {
        bg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        path: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      };
    if (mime.startsWith('video/'))
      return {
        bg: 'bg-gradient-to-br from-purple-500 to-fuchsia-500',
        path: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      };
    if (mime.startsWith('audio/'))
      return {
        bg: 'bg-gradient-to-br from-pink-500 to-rose-500',
        path: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
      };
    if (mime === 'application/pdf')
      return {
        bg: 'bg-gradient-to-br from-red-500 to-orange-500',
        path: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      };
    return {
      bg: 'bg-gradient-to-br from-gray-500 to-slate-600',
      path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    };
  };

  const icon = getIcon();

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await downloadFile(file._id);
      const link = document.createElement('a');
      // backend puts the (attachment-ready) download URL under `url` — reading
      // `cloudinaryUrl` here was undefined, so the SPA rewrite served index.html
      link.href = response.file.url;
      // backend returns the filename as `name`; the fl_attachment flag in the
      // URL is what actually names the saved file (download attr is ignored
      // on cross-origin URLs)
      link.download = response.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setError('Download failed. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-light rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {error && (
        <p className="text-red-500 text-xs mb-2">{error}</p>
      )}

      {/* Header: icon + name + meta */}
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-12 h-12 ${icon.bg} rounded-xl flex items-center justify-center shadow-md`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon.path} />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-800 truncate" title={file.originalName}>
            {file.originalName}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {file.sizeFormatted || `${(file.size / 1024).toFixed(1)} KB`} · {file.mimeType || 'file'}
          </p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
            file.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${file.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
          {file.status === 'active' ? 'Active' : 'Inactive'}
        </span>
        {file.isPasswordProtected && (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
            🔒 Protected
          </span>
        )}
        {isExpired && (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600">
            Expired
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>{file.downloadCount || 0} downloads</span>
        <span>{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : ''}</span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <button
          onClick={onView}
          className="flex items-center justify-center gap-1.5 glass-input rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-indigo-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg py-2 text-sm font-medium transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 12.684a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684z" />
          </svg>
          Share
        </button>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 glass-input rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-indigo-600 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {loading ? '…' : 'Get'}
        </button>
      </div>

      <button
        onClick={onDelete}
        className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>
    </div>
  );
};

export default FileCard;
