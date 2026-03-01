import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Request, RequestStatus } from '../types';
import { api } from '../services/api';

const statusColors: Record<RequestStatus, string> = {
  [RequestStatus.SUBMITTED]: 'bg-amber-200 text-amber-900 font-bold',
  [RequestStatus.IN_REVIEW]: 'bg-teal-200 text-teal-900 font-bold',
  [RequestStatus.NEEDS_INFO]: 'bg-orange-200 text-orange-900 font-bold',
  [RequestStatus.APPROVED]: 'bg-teal-300 text-teal-900 font-bold',
  [RequestStatus.REJECTED]: 'bg-rose-300 text-rose-900 font-bold',
};

export function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      loadRequest();
    }
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const data = await api.getRequest(id!);
      setRequest(data);
    } catch (error) {
      console.error('Failed to load request:', error);
      alert('Failed to load request. Redirecting...');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (!id) return;
    try {
      setUpdatingStatus(true);
      const updated = await api.updateRequestStatus(id, newStatus);
      setRequest(updated);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;

    try {
      setSubmittingComment(true);
      await api.addComment(id, commentText);
      setCommentText('');
      loadRequest(); // Reload to get updated comments and audit log
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleExport = () => {
    if (!request) return;
    
    const content = `
REQUEST DETAILS
===============
Title: ${request.title}
Status: ${request.status}
Category: ${request.category || 'N/A'}
Created: ${new Date(request.createdAt).toLocaleString()}
Updated: ${new Date(request.updatedAt).toLocaleString()}
Created By: ${request.createdBy.name} (${request.createdBy.email})
${request.assignedTo ? `Assigned To: ${request.assignedTo.name} (${request.assignedTo.email})` : ''}

DESCRIPTION
-----------
${request.description}

${request.aiSummary ? `AI SUMMARY\n-----------\n${request.aiSummary}\n\n` : ''}COMMENTS
--------
${request.comments && request.comments.length > 0
  ? request.comments
      .map(
        (c) =>
          `${c.author.name} (${new Date(c.createdAt).toLocaleString()}):\n${c.message}\n`
      )
      .join('\n')
  : 'No comments'}

AUDIT LOG
---------
${request.auditLogs && request.auditLogs.length > 0
  ? request.auditLogs
      .map(
        (log) =>
          `${new Date(log.createdAt).toLocaleString()} - ${log.action} by ${log.actor.name}`
      )
      .join('\n')
  : 'No activity'}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `request-${request.id}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    alert('Request link copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: request?.title || 'Request',
          text: request?.description || '',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="card-vibrant p-12 text-center">
        <p className="text-rose-600 font-semibold">Request not found.</p>
      </div>
    );
  }

  const canComment = currentUser?.role !== 'STUDENT' || 
    (currentUser?.role === 'STUDENT' && request.createdById === currentUser.id);
  const canChangeStatus = currentUser?.role !== 'STUDENT';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={loadRequest}
            className="px-3 py-1.5 rounded-xl font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 shadow transition-all active:scale-95 flex items-center gap-2 text-sm"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg transition-all active:scale-95 flex items-center gap-2 text-sm"
            title="Export"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg transition-all active:scale-95 flex items-center gap-2 text-sm"
            title="Print"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg transition-all active:scale-95 flex items-center gap-2 text-sm"
            title="Copy Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Link
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg transition-all active:scale-95 flex items-center gap-2 text-sm"
            title="Share"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.885 12.938 9 12.482 9 12c0-.482-.115-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* Request Header */}
      <div className="card-vibrant p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{request.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Created by: {request.createdBy.name}</span>
              <span>•</span>
              <span>{new Date(request.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-4 py-1.5 text-sm font-semibold rounded-xl ${statusColors[request.status]}`}>
              {request.status.replace('_', ' ')}
            </span>
            {canChangeStatus && (
              <select
                value={request.status}
                onChange={(e) => handleStatusChange(e.target.value as RequestStatus)}
                disabled={updatingStatus}
                className="input-vibrant text-sm"
              >
                {Object.values(RequestStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {request.category && (
          <div className="mb-4">
            <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-800 rounded-xl text-sm font-bold">
              Category: {request.category.replace('_', ' ')}
            </span>
          </div>
        )}

        {request.aiSummary && (
          <div className="mb-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">AI Summary</h3>
            <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans">
              {request.aiSummary}
            </pre>
          </div>
        )}

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{request.description}</p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card-vibrant p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        {request.comments && request.comments.length > 0 ? (
          <div className="space-y-4 mb-6">
            {request.comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-violet-400 bg-violet-50 rounded-r-xl pl-4 py-2">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-900">{comment.author.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-6">No comments yet.</p>
        )}

        {canComment && (
          <form onSubmit={handleAddComment}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input-vibrant mb-2"
              rows={3}
              placeholder="Add a comment..."
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-50 shadow transition-all active:scale-95"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
              <button
                type="button"
                onClick={() => setCommentText('')}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Audit Log */}
      <div className="card-vibrant p-6">
        <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>
        {request.auditLogs && request.auditLogs.length > 0 ? (
          <div className="space-y-3">
            {request.auditLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                <div className="flex-shrink-0 w-3 h-3 bg-violet-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-900">{log.action.replace('_', ' ')}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    by {log.actor.name} ({log.actor.role})
                  </div>
                  {log.meta && Object.keys(log.meta).length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {JSON.stringify(log.meta, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No activity recorded.</p>
        )}
      </div>
    </div>
  );
}
