import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFiles } from '../api/fileApi';

const Upload = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [error, setError] = useState('');

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError('');
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    }, []);

    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
    };

    const addFiles = (newFiles) => {
        const maxFiles = 10;
        const maxSize = 50 * 1024 * 1024;

        if (files.length + newFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        const validFiles = newFiles.filter(file => {
            if (file.size > maxSize) {
                setError(`${file.name} exceeds 50MB limit`);
                return false;
            }
            return true;
        });

        setFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setProgress(0);
        setError('');

        try {
            const response = await uploadFiles(files, (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percent);
            });

            setUploadedFiles(response.files);
            setFiles([]);
        } catch (error) {
            setError(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'from-emerald-400 to-green-500', shadow: 'shadow-emerald-500/30' };
        if (type.startsWith('video/')) return { icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: 'from-purple-400 to-violet-500', shadow: 'shadow-purple-500/30' };
        if (type.startsWith('audio/')) return { icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3', color: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-500/30' };
        return { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/30' };
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="animate-fade-in">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Files</h1>
                <p className="text-gray-500">Upload up to 10 files (max 50MB each)</p>
            </div>

            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-3xl p-12 text-center transition-all duration-500 animate-fade-in-up overflow-hidden group ${
                    dragActive
                        ? 'glass-blue border-2 border-indigo-400'
                        : 'glass-light border-2 border-dashed border-gray-200 hover:border-indigo-300'
                }`}
            >
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="relative space-y-6">
                    <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        dragActive
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 scale-110'
                            : 'bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:shadow-lg group-hover:shadow-indigo-500/30'
                    }`}>
                        <svg className={`w-10 h-10 transition-all duration-500 ${dragActive ? 'text-white' : 'text-indigo-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xl font-semibold text-gray-700 mb-2">
                            {dragActive ? 'Drop files here' : 'Drag and drop files here'}
                        </p>
                        <p className="text-gray-500">or <span className="text-indigo-600 font-medium">browse</span> to choose files</p>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Max 10 files
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                            50MB per file
                        </span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="glass rounded-xl p-4 border border-red-200 bg-red-50/80 flex items-center gap-3 animate-shake">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            )}

            {/* Selected Files */}
            {files.length > 0 && (
                <div className="glass-light rounded-2xl overflow-hidden animate-fade-in-up">
                    <div className="p-5 border-b border-white/20 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-800">
                                Selected Files
                            </h3>
                            <p className="text-sm text-gray-500">{files.length} of 10 files</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                    style={{ width: `${(files.length / 10) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{files.length}/10</span>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100/50 max-h-80 overflow-y-auto">
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
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
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

            {/* Progress Bar */}
            {uploading && (
                <div className="glass-light rounded-2xl p-6 animate-fade-in">
                    <div className="flex justify-between text-sm mb-3">
                        <span className="font-medium text-gray-700">Uploading files...</span>
                        <span className="font-semibold text-indigo-600">{progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Uploaded Files Success */}
            {uploadedFiles.length > 0 && (
                <div className="glass rounded-2xl overflow-hidden border border-emerald-200 animate-scale-in">
                    <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Upload Successful!</h3>
                                <p className="text-emerald-100">{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded successfully</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-white/80">
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/my-files')}
                                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/30"
                            >
                                View My Files
                            </button>
                            <button
                                onClick={() => setUploadedFiles([])}
                                className="px-6 py-3 border-2 border-emerald-200 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
                            >
                                Upload More
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;
