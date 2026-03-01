import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ActivityItem } from '../types';
function formatAction(item: ActivityItem): string {
  const title = item.request?.title || 'Unknown request';
  switch (item.action) {
    case 'REQUEST_CREATED':
      return `Created request "${title}"`;
    case 'STATUS_CHANGED': {
      const from = (item.meta?.from as string) || '?';
      const to = (item.meta?.to as string) || '?';
      return `Status changed: ${from} → ${to} on "${title}"`;
    }
    case 'COMMENT_ADDED':
      return `Added a comment on "${title}"`;
    case 'ASSIGNMENT_CHANGED':
      return `Assignment updated for "${title}"`;
    default:
      return `Activity on "${title}"`;
  }
}

const actionStyles: Record<string, string> = {
  REQUEST_CREATED: 'bg-teal-600/20 text-teal-400 border-teal-600/50',
  STATUS_CHANGED: 'bg-violet-600/20 text-violet-400 border-violet-600/50',
  COMMENT_ADDED: 'bg-amber-600/20 text-amber-400 border-amber-600/50',
  ASSIGNMENT_CHANGED: 'bg-rose-600/20 text-rose-400 border-rose-600/50',
};

export function ActivityFeedPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const { items: data } = await api.getActivity(40);
      setItems(data);
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
          Activity Feed
        </h1>
        <button
          onClick={loadActivity}
          className="px-4 py-2 rounded-xl font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card-vibrant p-12 text-center">
          <p className="text-slate-600">No activity yet. Create or interact with requests to see activity here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card-vibrant p-6 hover:border-slate-300">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${
                      actionStyles[item.action] || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {item.action.replace(/_/g, ' ')}
                  </span>
                  <p className="text-slate-800 mt-2">{formatAction(item)}</p>
                  <p className="text-slate-500 text-sm mt-1">
                    {item.actor?.name || 'System'} · {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                {item.request && (
                  <Link
                    to={`/requests/${item.request.id}`}
                    className="px-4 py-2 rounded-xl font-semibold text-violet-600 hover:text-violet-700 hover:bg-violet-50 transition-all shrink-0"
                  >
                    View →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
