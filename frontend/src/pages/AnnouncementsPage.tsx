import { useState } from 'react';

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: 'general' | 'deadline' | 'policy' | 'urgent';
  createdAt: string;
  author: string;
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Spring 2026 Add/Drop Period Extended',
    body: 'The add/drop period has been extended by three business days due to system maintenance. Students can now add or drop courses until Feb 28, 2026 at 11:59 PM. Please submit any course change requests through CampusFlow.',
    category: 'deadline',
    createdAt: '2026-02-20T10:00:00Z',
    author: 'Registrar Office',
  },
  {
    id: '2',
    title: 'New Request Categories Available',
    body: 'CampusFlow now supports funding requests and research recommendation letters. Use the new templates when creating requests for faster processing. Staff will be trained on the new workflows by end of week.',
    category: 'general',
    createdAt: '2026-02-18T14:30:00Z',
    author: 'CampusFlow Admin',
  },
  {
    id: '3',
    title: 'Graduation Application Deadline: March 15',
    body: 'All students planning to graduate in Spring 2026 must submit their graduation audit request by March 15, 2026. Late submissions may delay your diploma. Use the Graduation Audit template for best results.',
    category: 'deadline',
    createdAt: '2026-02-15T09:00:00Z',
    author: 'Academic Affairs',
  },
  {
    id: '4',
    title: 'Updated Prerequisite Override Policy',
    body: 'Effective immediately, prerequisite override requests require approval from both the course instructor and your academic advisor. Please include a brief justification when submitting. Policy document is available in Resources.',
    category: 'policy',
    createdAt: '2026-02-12T16:00:00Z',
    author: 'Dean\'s Office',
  },
  {
    id: '5',
    title: 'System Maintenance: Sunday 2 AM–4 AM',
    body: 'CampusFlow will be unavailable for approximately 2 hours on Sunday, Feb 28, for planned maintenance. Please complete any urgent submissions beforehand. We apologize for the inconvenience.',
    category: 'urgent',
    createdAt: '2026-02-22T08:00:00Z',
    author: 'IT Services',
  },
];

const categoryStyles: Record<Announcement['category'], string> = {
  general: 'bg-slate-200 text-slate-700',
  deadline: 'bg-amber-600 text-amber-100',
  policy: 'bg-violet-600 text-violet-100',
  urgent: 'bg-rose-600 text-rose-100',
};

export function AnnouncementsPage() {
  const [filter, setFilter] = useState<Announcement['category'] | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_ANNOUNCEMENTS.filter((a) => {
    const matchFilter = filter === 'all' || a.category === filter;
    const matchSearch =
      !search.trim() ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
          Announcements
        </h1>
      </div>

      <div className="card-vibrant p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-vibrant flex-1 min-w-[200px] max-w-md"
            placeholder="Search announcements..."
          />
          <div className="flex flex-wrap gap-2">
            {(['all', 'general', 'deadline', 'policy', 'urgent'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  filter === f
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
        <div className="card-vibrant p-12 text-center">
          <p className="text-slate-600">No announcements match your filters.</p>
          </div>
        ) : (
          filtered.map((a) => (
            <div key={a.id} className="card-vibrant p-6 hover:border-slate-300">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${categoryStyles[a.category]}`}
                >
                  {a.category.toUpperCase()}
                </span>
                <span className="text-sm text-slate-500">
                  {new Date(a.createdAt).toLocaleDateString()} · {a.author}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">{a.title}</h2>
              <p className="text-slate-600 leading-relaxed">{a.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
