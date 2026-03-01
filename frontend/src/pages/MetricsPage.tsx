import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Metrics } from '../types';
import { api } from '../services/api';

export function MetricsPage() {
  const { currentUser, loading: userLoading } = useUser();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser?.role !== 'STUDENT' && !userLoading) {
      loadMetrics();
    }
  }, [currentUser, userLoading]);

  const loadMetrics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    if (!metrics) return;
    
    const csv = [
      ['Metric', 'Value'].join(','),
      ['Total Requests', metrics.totalRequests].join(','),
      ['Average Resolution Time (hours)', metrics.avgResolutionHours.toFixed(2)].join(','),
      ['SLA Risk Count', metrics.slaRiskCount].join(','),
      ['', ''].join(','),
      ['Status', 'Count'].join(','),
      ...Object.entries(metrics.byStatus).map(([status, count]) => [status, count].join(',')),
      ['', ''].join(','),
      ['Category', 'Count'].join(','),
      ...Object.entries(metrics.byCategory).map(([category, count]) => [category, count].join(',')),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (userLoading || loading) {
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

  if (!metrics) {
    return (
      <div className="card-vibrant p-12 text-center">
        <p className="text-rose-600 font-semibold">Failed to load metrics.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
          Metrics Dashboard
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => loadMetrics(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 shadow transition-all flex items-center gap-2"
            title="Refresh"
          >
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {metrics && (
            <>
              <button
                onClick={handleExport}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg transition-all active:scale-95 flex items-center gap-2"
                title="Export to CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg transition-all active:scale-95 flex items-center gap-2"
                title="Print"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card-vibrant p-6 border-l-4 border-violet-500">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Requests</h3>
          <p className="text-3xl font-bold text-slate-800">{metrics.totalRequests}</p>
        </div>

        <div className="card-vibrant p-6 border-l-4 border-teal-500">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Avg Resolution Time</h3>
          <p className="text-3xl font-bold text-slate-800">
            {metrics.avgResolutionHours > 0 ? `${metrics.avgResolutionHours.toFixed(1)}h` : 'N/A'}
          </p>
        </div>

        <div className="card-vibrant p-6 border-l-4 border-rose-500">
          <h3 className="text-sm font-medium text-slate-600 mb-2">SLA Risk Count</h3>
            <p className={`text-3xl font-bold ${metrics.slaRiskCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {metrics.slaRiskCount}
          </p>
        </div>

        <div className="card-vibrant p-6 border-l-4 border-teal-500">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Categories</h3>
          <p className="text-3xl font-bold text-slate-800">
            {Object.keys(metrics.byCategory).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Status */}
        <div className="card-vibrant p-6">
          <h2 className="text-xl font-semibold mb-4">Requests by Status</h2>
          <div className="space-y-3">
            {Object.entries(metrics.byStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-slate-600">{status.replace('_', ' ')}</span>
                <span className="font-semibold text-slate-800">{count}</span>
              </div>
            ))}
            {Object.keys(metrics.byStatus).length === 0 && (
              <p className="text-slate-500">No data available</p>
            )}
          </div>
        </div>

        {/* Requests by Category */}
        <div className="card-vibrant p-6">
          <h2 className="text-xl font-semibold mb-4">Requests by Category</h2>
          <div className="space-y-3">
            {Object.entries(metrics.byCategory).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-slate-600">{category.replace('_', ' ')}</span>
                <span className="font-semibold text-slate-800">{count}</span>
              </div>
            ))}
            {Object.keys(metrics.byCategory).length === 0 && (
              <p className="text-slate-500">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
