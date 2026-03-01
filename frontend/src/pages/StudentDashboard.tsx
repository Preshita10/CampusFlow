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

export function StudentDashboard() {
  const { currentUser, loading: userLoading } = useUser();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const REQUEST_TEMPLATES = [
    { label: 'Course Override', title: 'Prerequisite Override Request', description: 'I am requesting a prerequisite override for [COURSE CODE]. I have completed [REQUIRED COURSE/EQUIVALENT] with a grade of [GRADE]. I believe I have the necessary background to succeed in this course. Additional context: [YOUR REASONING].' },
    { label: 'Add/Drop', title: 'Add/Drop Course Request', description: 'I would like to [ADD/DROP] the following course: [COURSE CODE - SECTION]. Reason: [BRIEF EXPLANATION]. I understand the add/drop deadline is [DATE] and am submitting within the allowed period.' },
    { label: 'Graduation Audit', title: 'Graduation Audit Request', description: 'I am planning to graduate in [SEMESTER YEAR] and request a graduation audit. My anticipated graduation date is [DATE]. I have completed all required coursework and would like to verify my eligibility. Questions: [ANY SPECIFIC CONCERNS].' },
    { label: 'Recommendation', title: 'Recommendation Letter Request', description: 'I am requesting a recommendation letter for [PURPOSE - e.g. graduate school, scholarship, internship]. Program/position: [DETAILS]. Deadline: [DATE]. I have attached my resume and transcript. Thank you for your consideration.' },
    { label: 'Funding', title: 'Funding Request', description: 'I am requesting funding support for [PURPOSE - e.g. conference travel, research materials]. Amount requested: $[AMOUNT]. Justification: [EXPLANATION]. I have explored other funding sources: [YES/NO - DETAILS].' },
  ];
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (currentUser?.role === 'STUDENT' && !userLoading) {
      loadRequests();
    }
  }, [currentUser, userLoading]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getRequests();
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
          (req.category && req.category.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, requests]);

  const handleExport = () => {
    const csv = [
      ['Title', 'Category', 'Status', 'Created', 'Updated'].join(','),
      ...filteredRequests.map((req) =>
        [
          `"${req.title.replace(/"/g, '""')}"`,
          req.category || 'N/A',
          req.status,
          new Date(req.createdAt).toLocaleDateString(),
          new Date(req.updatedAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-requests-${new Date().toISOString().split('T')[0]}.csv`;
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
          `${req.title} - ${req.status} - Created: ${new Date(req.createdAt).toLocaleDateString()}`
      )
      .join('\n');
    await navigator.clipboard.writeText(text);
    alert('Requests copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    try {
      setSubmitting(true);
      await api.createRequest(formData);
      setFormData({ title: '', description: '' });
      setShowForm(false);
      loadRequests();
    } catch (error) {
      console.error('Failed to create request:', error);
      alert('Failed to create request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  if (currentUser?.role !== 'STUDENT') {
    return (
      <div className="card-vibrant p-12 text-center">
        <p className="text-rose-600 font-semibold">Access denied. Please switch to Student role.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Hero */}
      <div className="mb-8 animate-fade-in-up">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/5 border border-violet-200/50 p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-slate-600 text-lg">
              Manage your academic requests and track their progress in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 animate-fade-in-up [animation-delay:150ms] [animation-fill-mode:both]">
        <h2 className="text-2xl font-bold text-slate-800">My Requests</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadRequests}
            className="btn-animate btn-animate-secondary px-4 py-2 rounded-xl font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 shadow transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
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
                className="btn-animate px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-glow-violet transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                title="Print"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="btn-animate px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-glow-violet transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                title="Copy to Clipboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-animate px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-glow-violet transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {showForm ? 'Cancel' : '+ New Request'}
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card-vibrant p-4 mb-6 animate-fade-in-up [animation-delay:200ms] [animation-fill-mode:both] transition-all duration-300 hover:shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Search Requests
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-vibrant"
              placeholder="Search by title, description, or category..."
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
        </div>
        {filteredRequests.length !== requests.length && (
          <div className="mt-2 text-sm text-slate-600">
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
        )}
      </div>

      {/* Request Templates */}
      {!showForm && (
        <div className="card-vibrant p-6 mb-6 animate-fade-in-up transition-all duration-300 hover:shadow-lg">
          <h2 className="text-lg font-bold text-slate-700 mb-3">Quick Templates</h2>
          <p className="text-slate-600 text-sm mb-4">Use a template to pre-fill your request form.</p>
          <div className="flex flex-wrap gap-2">
            {REQUEST_TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setFormData({ title: t.title, description: t.description });
                  setShowForm(true);
                }}
                className="btn-animate px-4 py-2 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-violet-500 hover:text-white border border-slate-200 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="card-vibrant p-6 mb-6 animate-scale-in">
          <h2 className="text-xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Create New Request
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Title
            </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-vibrant"
                placeholder="e.g., Request to Override Prerequisite for CS 662"
                required
              />
            </div>
            <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Description
            </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-vibrant"
                rows={5}
                placeholder="Describe your request in detail..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-animate px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 shadow-lg hover:shadow-glow-violet transition-all duration-300 hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card-vibrant p-12 text-center">
          {requests.length === 0 ? (
            <>
              <p className="mb-6 text-slate-600 font-medium">You haven't created any requests yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-animate px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-glow-violet transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Create Your First Request
              </button>
            </>
          ) : (
            <p className="text-slate-600">No requests match your search criteria.</p>
          )}
        </div>
      ) : (
        <div className="card-vibrant overflow-hidden animate-fade-in-up transition-all duration-300 hover:shadow-lg">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Title
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
              {filteredRequests.map((request, i) => (
                <tr key={request.id} className="hover:bg-slate-50 transition-all duration-200 hover:shadow-sm" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-800">{request.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{request.category || 'N/A'}</span>
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
