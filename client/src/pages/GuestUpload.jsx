import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { guestUpload } from '../api/fileApi';

const GuestUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileInput = (e) => {
    addFiles(Array.from(e.target.files));
  };

  const addFiles = (newFiles) => {
    const maxFiles = 3;
    const maxSize = 25 * 1024 * 1024; // 25MB

    if (files.length + newFiles.length > maxFiles) {
      setError(`Guest uploads are limited to ${maxFiles} files. Register for more.`);
      return;
    }

    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize) {
        setError(`"${file.name}" exceeds the 25MB guest limit.`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      const response = await guestUpload(files, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percent);
      });

      setUploadedFiles(response.files);
      setFiles([]);
    } catch (err) {
      const status = err?.response?.status;

      if (status === 429) {
        setError('Guest upload limit reached (3/day). Create a free account for unlimited uploads.');
      } else if (status === 413) {
        setError('One or more files exceed the 25MB guest limit.');
      } else {
        setError(err.response?.data?.message || 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getShareLink = (slug) => {
    return `${window.location.origin}/share/${slug}`;
  };

  const copyLink = (slug, index) => {
    navigator.clipboard.writeText(getShareLink(slug));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'from-emerald-400 to-green-500', shadow: 'shadow-emerald-500/30' };
    if (mimeType.startsWith('video/')) return { icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: 'from-purple-400 to-violet-500', shadow: 'shadow-purple-500/30' };
    if (mimeType.startsWith('audio/')) return { icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3', color: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-500/30' };
    return { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/30' };
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-blue-50/50 to-indigo-100/80"></div>
        <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl mb-6 shadow-2xl shadow-emerald-500/30 animate-float">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Guest Upload</h1>
          <p className="text-gray-500 text-lg">Upload files without creating an account</p>
        </div>

        <div className="glass-blue rounded-2xl p-5 mb-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-blue-800 mb-2">Guest Upload Limits</p>
            <ul className="space-y-1 text-blue-700">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                </svg>
                Maximum 3 files per upload
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                </svg>
                25MB max per file
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                </svg>
                3 uploads per day per device
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Files expire automatically after 24 hours
              </li>
            </ul>
            <p className="mt-3 text-blue-600">
              <Link to="/register" className="font-semibold hover:underline">
                Create an account
              </Link>
              {' '}for unlimited uploads and file management.
            </p>
          </div>
        </div>

        {uploadedFiles.length === 0 ? (
          <>
            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-3xl p-12 text-center transition-all duration-500 overflow-hidden group ${
                dragActive
                  ? 'glass-blue border-2 border-emerald-400'
                  : 'glass-light border-2 border-dashed border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="relative space-y-6">
                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  dragActive
                    ? 'bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg shadow-emerald-500/30 scale-110'
                    : 'bg-gradient-to-br from-emerald-100 to-blue-100 group-hover:from-emerald-500 group-hover:to-blue-500 group-hover:shadow-lg group-hover:shadow-emerald-500/30'
                }`}>
                  <svg className={`w-10 h-10 transition-all duration-500 ${dragActive ? 'text-white' : 'text-emerald-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    {dragActive ? 'Drop files here' : 'Drag and drop files here'}
                  </p>
                  <p className="text-gray-500">or <span className="text-emerald-600 font-medium">browse</span> to choose files</p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 glass rounded-xl p-4 border border-red-200 bg-red-50/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Selected files list */}
            {files.length > 0 && (
              <div className="mt-6 glass-light rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/20 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">Selected Files</h3>
                    <p className="text-sm text-gray-500">{files.length} of 3 files</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${(files.length / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{files.length}/3</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100/50 max-h-60 overflow-y-auto">
                  {files.map((file, index) => {
                    const { icon, color, shadow } = getFileIcon(file.type);
                    return (
                      <div key={index} className="flex items-center gap-4 p-4 hover:bg-white/50 transition-all group">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${shadow}`}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="p-5 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-t border-white/50">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                  >
                    {uploading ? (
                      <>
                        <div className="relative w-6 h-6">
                          <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                          <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        Uploading... {progress}%
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload {files.length} file{files.length > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Progress bar */}
            {uploading && (
              <div className="mt-4 glass-light rounded-2xl p-6">
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-medium text-gray-700">Uploading files...</span>
                  <span className="font-semibold text-emerald-600">{progress}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Success state */
          <div className="glass rounded-2xl overflow-hidden border border-emerald-200">
            <div className="p-8 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">Upload Successful!</h2>
              <p className="text-white/80 text-lg">Share the links below before they expire.</p>
            </div>

            <div className="p-6 bg-white/80">
              <div className="glass rounded-xl p-4 mb-6 flex items-center gap-3 border border-orange-200 bg-orange-50/80">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-orange-700 font-medium">
                  These files will expire in 24 hours. Save your links now.
                </p>
              </div>

              <div className="space-y-4">
                {uploadedFiles.map((file, index) => (
                  <div key={file._id} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-gray-800 truncate flex-1">
                        {file.originalName}
                      </p>
                      <span className="text-sm text-gray-500 ml-2">{formatFileSize(file.size)}</span>
                    </div>

                    {file.deduplicated && (
                      <p className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        You've uploaded this file before — reusing existing link
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      
                      <input
                        type="text"
                        value={getShareLink(file.slug)}
                        readOnly
                        className="flex-1 px-4 py-3 glass-input rounded-xl text-sm"
                      />
                      <button
                        onClick={() => copyLink(file.slug, index)}
                        className={`px-5 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                          copiedIndex === index
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'
                        }`}
                      >
                        {copiedIndex === index ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setUploadedFiles([])}
                  className="flex-1 py-3 glass border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-white/80 transition-all"
                >
                  Upload More
                </button>
                <Link
                  to="/register"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl font-semibold text-center hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg shadow-emerald-500/30"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            Have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestUpload;
