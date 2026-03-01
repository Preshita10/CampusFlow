import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'form' | 'policy' | 'guide' | 'contact';
}

const MOCK_RESOURCES: Resource[] = [
  { id: '1', title: 'Course Override Request Form', description: 'PDF form for manual submission if CampusFlow is unavailable.', url: '#', type: 'form' },
  { id: '2', title: 'Add/Drop Policy', description: 'Official university policy on add/drop deadlines and procedures.', url: '#', type: 'policy' },
  { id: '3', title: 'Graduation Checklist', description: 'Step-by-step guide for graduation application and audit.', url: '#', type: 'guide' },
  { id: '4', title: 'Recommendation Letter Guidelines', description: 'How to request recommendation letters from faculty.', url: '#', type: 'guide' },
  { id: '5', title: 'Funding Request Policy', description: 'Eligibility and process for funding requests.', url: '#', type: 'policy' },
  { id: '6', title: 'Academic Integrity Policy', description: 'University standards and consequences.', url: '#', type: 'policy' },
  { id: '7', title: 'Advisor Contact Directory', description: 'Find your assigned advisor by department.', url: '__/directory', type: 'contact' },
  { id: '8', title: 'CampusFlow User Guide', description: 'How to create, track, and manage your requests.', url: '#', type: 'guide' },
];

const typeStyles: Record<Resource['type'], string> = {
  form: 'bg-amber-600/20 text-amber-400 border-amber-600/50',
  policy: 'bg-violet-600/20 text-violet-400 border-violet-600/50',
  guide: 'bg-teal-600/20 text-teal-400 border-teal-600/50',
  contact: 'bg-rose-600/20 text-rose-400 border-rose-600/50',
};

const typeIcons: Record<Resource['type'], string> = {
  form: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  policy: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  guide: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  contact: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
};

export function ResourcesPage() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<Resource['type'] | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_RESOURCES.filter((r) => {
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchSearch =
      !search.trim() ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleOpen = (r: Resource) => {
    if (r.url === '__/directory') {
      navigate('/directory');
    } else if (r.url.startsWith('/')) {
      navigate(r.url);
    } else {
      window.open(r.url, '_blank');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
          Resources & Help
        </h1>
      </div>

      <div className="card-vibrant p-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-vibrant w-full max-w-md mb-3"
          placeholder="Search resources..."
        />
        <div className="flex flex-wrap gap-2">
          {(['all', 'form', 'policy', 'guide', 'contact'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                typeFilter === t ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="card-vibrant p-6 hover:border-slate-300 cursor-pointer transition-all"
            onClick={() => handleOpen(r)}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl border ${typeStyles[r.type]} shrink-0`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcons[r.type]} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${typeStyles[r.type]}`}>
                  {r.type}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{r.title}</h3>
                <p className="text-slate-600 text-sm mt-1">{r.description}</p>
              </div>
              <svg className="w-5 h-5 text-slate-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card-vibrant p-12 text-center">
          <p className="text-slate-600">No resources match your search.</p>
        </div>
      )}
    </div>
  );
}
