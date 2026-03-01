import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

export function StaffDashboard() {
  const { currentUser, loading: userLoading } = useUser();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser?.role !== 'STUDENT' && !userLoading) {
      loadRequests();
    }
  }, [currentUser, statusFilter, categoryFilter, userLoading]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;
      const data = await api.getRequests(filters);
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...requests];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.title.toLowerCase().includes(query) ||
          req.description.toLowerCase().includes(query) ||
          req.createdBy.name.toLowerCase().includes(query) ||
          (req.category && req.category.toLowerCase().includes(query))
      );
    }
    
    setFilteredRequests(filtered);
  }, [searchQuery, requests]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(new Set(filteredRequests.map((r) => r.id)));
    } else {
      setSelectedRequests(new Set());
    }
  };

  const handleSelectRequest = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRequests);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRequests(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkAction || selectedRequests.size === 0) return;
    
    try {
      const promises = Array.from(selectedRequests).map((id) =>
        api.updateRequestStatus(id, bulkAction as RequestStatus)
      );
      await Promise.all(promises);
      setSelectedRequests(new Set());
      setShowBulkActions(false);
      setBulkAction('');
      loadRequests();
      alert(`Updated ${selectedRequests.size} request(s) successfully!`);
    } catch (error) {
      console.error('Failed to update requests:', error);
      alert('Failed to update some requests. Please try again.');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Title', 'Student', 'Category', 'Status', 'Created', 'SLA Risk'].join(','),
      ...filteredRequests.map((req) =>
        [
          `"${req.title.replace(/"/g, '""')}"`,
          `"${req.createdBy.name.replace(/"/g, '""')}"`,
          req.category || 'N/A',
          req.status,
          new Date(req.createdAt).toLocaleDateString(),
          isSLARisk(req) ? 'Yes' : 'No',
        ].join(',')
      ),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `request-queue-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToClipboard = async () => {
    const text = filteredRequests
      .map(
        (req) =>
          `${req.title} - ${req.createdBy.name} - ${req.status} - Created: ${new Date(req.createdAt).toLocaleDateString()}`
      )
      .join('\n');
    await navigator.clipboard.writeText(text);
    alert('Requests copied to clipboard!');
  };

  const isSLARisk = (request: Request) => {
    const hoursSinceCreation = (Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60);
    return request.status === RequestStatus.SUBMITTED && hoursSinceCreation > 24;
  };

  if (userLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  if (currentUser?.role === 'STUDENT') {
    return (
      <div className="card-vibrant p-12 text-center">
        <p className="text-rose-600 font-semibold">Access denied. This page is for staff members only.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Hero */}
      <div className="mb-8 animate-fade-in-up">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-violet-500/10 to-purple-500/5 border border-violet-200/50 p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'Staff'}!
            </h1>
            <p className="text-slate-600 text-lg">
              Review and manage student requests. Stay on top of your queue.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 animate-fade-in-up [animation-delay:150ms] [animation-fill-mode:both]">
        <h2 className="text-2xl font-bold text-slate-800">Request Queue</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadRequests}
            className="btn-animate-secondary px-4 py-2 rounded-xl font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 shadow transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          {filteredRequests.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="btn-animate px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg hover:shadow-glow-teal transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                title="Export to CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={handlePrint}
                className="btn-animate px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg hover:shadow-glow-violet transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                title="Print"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="btn-animate px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-glow-violet transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                title="Copy to Clipboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-slate-100 border-2 border-slate-200 rounded-xl p-4 mb-6 animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium text-slate-700">
                {selectedRequests.size} request(s) selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="input-vibrant"
              >
                <option value="">Select action...</option>
                {Object.values(RequestStatus).map((status) => (
                  <option key={status} value={status}>
                    Change status to {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkStatusUpdate}
                disabled={!bulkAction}
                className="btn-animate px-4 py-2 rounded-xl font-semibold text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-50 shadow hover:shadow-glow-violet transition-all duration-300 hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                Apply
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedRequests(new Set());
                setShowBulkActions(false);
                setBulkAction('');
              }}
              className="text-violet-600 hover:text-violet-700"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="card-vibrant p-4 mb-6 animate-fade-in-up [animation-delay:200ms] [animation-fill-mode:both] transition-all duration-300 hover:shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Search Requests
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-vibrant"
              placeholder="Search by title, student, category..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-vibrant"
            >
              <option value="">All Statuses</option>
              {Object.values(RequestStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Filter by Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-vibrant"
            >
              <option value="">All Categories</option>
              <option value="COURSE_OVERRIDE">Course Override</option>
              <option value="ADD_DROP">Add/Drop</option>
              <option value="GRADUATION_AUDIT">Graduation Audit</option>
              <option value="RECOMMENDATION">Recommendation</option>
              <option value="FUNDING">Funding</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
        </div>
        {filteredRequests.length !== requests.length && (
          <div className="text-sm text-slate-600">
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card-vibrant p-12 text-center">
          <p className="text-slate-600">No requests found matching your filters.</p>
        </div>
      ) : (
        <div className="card-vibrant overflow-hidden animate-fade-in-up transition-all duration-300 hover:shadow-lg">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRequests.size === filteredRequests.length && filteredRequests.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-violet-500 focus:ring-violet-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className={`hover:bg-slate-50 transition-all duration-200 hover:shadow-sm ${selectedRequests.has(request.id) ? 'bg-violet-50' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRequests.has(request.id)}
                      onChange={(e) => handleSelectRequest(request.id, e.target.checked)}
                      className="rounded border-slate-300 text-violet-500 focus:ring-violet-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-800">{request.title}</div>
                    {isSLARisk(request) && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-rose-300 text-rose-900 rounded-lg">
                        SLA Risk
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {request.createdBy.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {request.category || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-xl ${statusColors[request.status]}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/requests/${request.id}`}
                      className="font-semibold text-violet-600 hover:text-violet-700 transition-all duration-200 hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
