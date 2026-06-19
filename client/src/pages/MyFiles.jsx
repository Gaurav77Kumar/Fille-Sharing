import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMyFiles, searchFiles, deleteFile, updateFileStatus } from '../api/fileApi';
import { useAuth } from '../context/AuthContext';
import FileCard from '../components/files/FileCard';
import FileDetailsModal from '../components/files/FileDetailsModal';
import ShareModal from '../components/files/ShareModal';

const MyFiles = () => {
  const [searchParams] = useSearchParams();
  const { user, updateStorageUsed } = useAuth(); 

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); 
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalFiles: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [pagination.currentPage, sortBy, sortOrder]);

  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && files.length > 0) {
      const file = files.find((f) => f._id === selectedId);
      if (file) {
        setSelectedFile(file);
        setShowDetailsModal(true);
      }
    }
  }, [searchParams, files]);

  const fetchFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyFiles(
        pagination.currentPage,
        10,
        sortBy,
        sortOrder
      );
      setFiles(response.files || []);
      setPagination(
        response.pagination || { currentPage: 1, totalPages: 1, totalFiles: 0 }
      );
    } catch (err) {
      setError('Failed to load files. Please try again.');
      console.error('Failed to fetch files:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithFilters = async (query = searchQuery, status = filterStatus) => {
    if (!query.trim() && !status) {
      fetchFiles();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await searchFiles(query, null, status);
      setFiles(response.files || []);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchWithFilters();

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    setError('');
    try {
      await deleteFile(fileId);

      const deletedFile = files.find((f) => f._id === fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      setShowDetailsModal(false);
      setSelectedFile(null);

      if (deletedFile && user) {
        updateStorageUsed(Math.max(0, user.storageUsed - deletedFile.size));
      }
    } catch (err) {
      setError('Failed to delete file. Please try again.');
      console.error('Delete failed:', err);
    }
  };

  const handleStatusChange = async (fileId, status) => {
    setError('');
    try {
      await updateFileStatus(fileId, status);
      setFiles((prev) =>
        prev.map((f) => (f._id === fileId ? { ...f, status } : f))
      );
      if (selectedFile?._id === fileId) {
        setSelectedFile((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      setError('Failed to update file status. Please try again.');
      console.error('Status update failed:', err);
    }
  };

  const handleShare = (file) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  const handleViewDetails = (file) => {
    setSelectedFile(file);
    setShowDetailsModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Files</h1>
          <p className="text-gray-500 mt-1">
            {pagination.totalFiles} file{pagination.totalFiles !== 1 ? 's' : ''} in your library
          </p>
        </div>
        <div className="glass-light px-4 py-2 rounded-xl flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          <span className="font-semibold text-gray-700">{pagination.totalFiles}</span>
        </div>
      </div>

      {/* Inline error banner */}
      {error && (
        <div className="glass rounded-xl p-4 border border-red-200 bg-red-50/80 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 text-sm font-medium">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="glass-light rounded-2xl p-5 animate-fade-in-up">
        <div className="flex flex-col md:flex-row gap-4">

          {/* Search input */}
          <div className="flex-1 relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search files..."
              className="w-full pl-12 pr-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              const newStatus = e.target.value;
              setFilterStatus(newStatus);
              fetchWithFilters(searchQuery, newStatus);
            }}
            className="px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by);
              setSortOrder(order);
            }}
            className="px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="originalName-asc">Name A–Z</option>
            <option value="originalName-desc">Name Z–A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
        </div>

      ) : files.length === 0 ? (
        <div className="glass-light rounded-2xl p-16 text-center animate-fade-in-up">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No files found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterStatus ? 'Try a different search or filter' : 'Upload your first file to get started'}
          </p>
          {!searchQuery && !filterStatus && (
            <a
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Files
            </a>
          )}
        </div>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {files.map((file, index) => (
            <div
              key={file._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <FileCard
                file={file}
                onView={() => handleViewDetails(file)}
                onShare={() => handleShare(file)}
                onDelete={() => handleDelete(file._id)}
                onStatusChange={(status) => handleStatusChange(file._id, status)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 animate-fade-in">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))
            }
            disabled={pagination.currentPage === 1}
            className="p-3 glass-light rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="glass-light px-6 py-3 rounded-xl">
            <span className="text-gray-600">Page </span>
            <span className="font-semibold text-indigo-600">{pagination.currentPage}</span>
            <span className="text-gray-600"> of </span>
            <span className="font-semibold text-gray-800">{pagination.totalPages}</span>
          </div>

          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))
            }
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-3 glass-light rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Details modal */}
      {showDetailsModal && selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedFile(null);
          }}
          onDelete={() => handleDelete(selectedFile._id)}
          onShare={() => {
            setShowDetailsModal(false);
            setShowShareModal(true);
          }}
          onStatusChange={(status) => handleStatusChange(selectedFile._id, status)}
          onUpdate={(updatedFile) => {
            setFiles((prev) =>
              prev.map((f) => (f._id === updatedFile._id ? updatedFile : f))
            );
            setSelectedFile(updatedFile);
          }}
        />
      )}

      {/* Share modal */}
      {showShareModal && selectedFile && (
        <ShareModal
          file={selectedFile}
          onClose={() => {
            setShowShareModal(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
};

export default MyFiles;