import { useState } from 'react';
import { getShareLink, generateQRCode, sendFileEmail } from '../../api/fileApi';

const ShareModal = ({ file, onClose }) => {
    const [activeTab, setActiveTab] = useState('link');
    const [loading, setLoading] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState({
        recipient: '',
        message: ''
    });
    const [emailSent, setEmailSent] = useState(false);

    const handleGetLink = async () => {
        setLoading(true);
        try {
            const response = await getShareLink(file._id);
            setShareLink(response.shareLink);
        } catch (error) {
            alert('Failed to generate share link');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerateQR = async () => {
        setLoading(true);
        try {
            const response = await generateQRCode(file._id);
            setQrCode(response.qrCode);
            setShareLink(response.shareLink);
        } catch (error) {
            alert('Failed to generate QR code');
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        if (!email.recipient) {
            alert('Please enter recipient email');
            return;
        }
        setLoading(true);
        try {
            await sendFileEmail(file._id, email.recipient, email.message);
            setEmailSent(true);
            setEmail({ recipient: '', message: '' });
        } catch (error) {
            alert('Failed to send email: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                onClick={onClose}
            />
            <div className="relative glass-light rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Share File</h2>
                                <p className="text-sm text-gray-500 truncate max-w-[200px]">{file.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-xl transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-5">
                        {[
                            { id: 'link', label: 'Link', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101', color: 'from-blue-500 to-indigo-500' },
                            { id: 'qr', label: 'QR Code', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', color: 'from-purple-500 to-pink-500' },
                            { id: 'email', label: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'from-emerald-500 to-green-500' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 px-3 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                                    activeTab === tab.id
                                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                                        : 'glass text-gray-600 hover:bg-white/50'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                                </svg>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'link' && (
                        <div className="space-y-4">
                            {!shareLink ? (
                                <button
                                    onClick={handleGetLink}
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                            </svg>
                                            Generate Share Link
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={shareLink}
                                            readOnly
                                            className="flex-1 px-4 py-3 glass-input rounded-xl text-sm"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className={`px-5 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                                                copied
                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/30'
                                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30'
                                            }`}
                                        >
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    {file.isPasswordProtected && (
                                        <div className="glass rounded-xl p-4 border border-amber-200 bg-amber-50/80 flex items-center gap-3">
                                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <p className="text-sm text-amber-700 font-medium">
                                                This file is password protected
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'qr' && (
                        <div className="space-y-4 text-center">
                            {!qrCode ? (
                                <button
                                    onClick={handleGenerateQR}
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/30"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                            Generate QR Code
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="glass rounded-2xl p-6 inline-block">
                                        <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto rounded-lg" />
                                    </div>
                                    <p className="text-sm text-gray-500">Scan this QR code to access the file</p>
                                    <a
                                        href={qrCode}
                                        download={`${file.name}-qr.png`}
                                        className="inline-flex items-center gap-2 px-5 py-3 glass text-gray-700 rounded-xl font-semibold hover:bg-white/80 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download QR Code
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div>
                            {emailSent ? (
                                <div className="text-center py-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-xl mb-2">Email Sent!</h3>
                                    <p className="text-gray-500 mb-6">The file link has been sent successfully</p>
                                    <button
                                        onClick={() => setEmailSent(false)}
                                        className="text-indigo-600 hover:text-indigo-700 font-semibold"
                                    >
                                        Send to another recipient
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSendEmail} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Recipient Email
                                        </label>
                                        <input
                                            type="email"
                                            value={email.recipient}
                                            onChange={(e) => setEmail(prev => ({ ...prev, recipient: e.target.value }))}
                                            placeholder="email@example.com"
                                            className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Message (optional)
                                        </label>
                                        <textarea
                                            value={email.message}
                                            onChange={(e) => setEmail(prev => ({ ...prev, message: e.target.value }))}
                                            placeholder="Add a personal message..."
                                            rows={3}
                                            className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-emerald-500/30 resize-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Send Email
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
