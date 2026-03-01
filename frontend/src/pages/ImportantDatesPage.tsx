import { useState } from 'react';

interface ImportantDate {
  id: string;
  title: string;
  date: string;
  category: 'academic' | 'financial' | 'graduation' | 'other';
  description?: string;
}

const MOCK_DATES: ImportantDate[] = [
  { id: '1', title: 'Add/Drop Deadline', date: '2026-02-28', category: 'academic', description: 'Last day to add or drop courses without penalty' },
  { id: '2', title: 'Graduation Application Due', date: '2026-03-15', category: 'graduation', description: 'Submit graduation audit request' },
  { id: '3', title: 'Midterm Grades Due', date: '2026-03-20', category: 'academic' },
  { id: '4', title: 'Financial Aid Disbursement', date: '2026-03-01', category: 'financial', description: 'Spring semester disbursement' },
  { id: '5', title: 'Withdrawal Deadline', date: '2026-04-10', category: 'academic', description: 'Last day to withdraw with W grade' },
  { id: '6', title: 'Final Exam Period', date: '2026-05-05', category: 'academic', description: 'May 5–12, 2026' },
  { id: '7', title: 'Commencement', date: '2026-05-17', category: 'graduation' },
  { id: '8', title: 'Tuition Payment Due', date: '2026-02-25', category: 'financial' },
];

const categoryStyles: Record<ImportantDate['category'], string> = {
  academic: 'bg-violet-600/20 text-violet-400 border-violet-600/50',
  financial: 'bg-amber-600/20 text-amber-400 border-amber-600/50',
  graduation: 'bg-teal-600/20 text-teal-400 border-teal-600/50',
  other: 'bg-slate-600/20 text-slate-400 border-slate-600/50',
};

function formatDate(d: string) {
  const date = new Date(d);
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let badge = '';
  if (diff < 0) badge = 'Past';
  else if (diff === 0) badge = 'Today';
  else if (diff <= 7) badge = 'This week';
  else if (diff <= 30) badge = 'Upcoming';
  return { formatted: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }), badge, diff };
}

export function ImportantDatesPage() {
  const [filter, setFilter] = useState<ImportantDate['category'] | 'all'>('all');

  const filtered = MOCK_DATES.filter((d) => filter === 'all' || d.category === filter);
  const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
          Important Dates
        </h1>
      </div>

      <div className="card-vibrant p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'academic', 'financial', 'graduation', 'other'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                filter === f ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {sorted.map((d) => {
          const { formatted, badge, diff } = formatDate(d.date);
          return (
            <div key={d.id} className="card-vibrant p-6 flex flex-wrap gap-4 items-start hover:border-slate-300">
              <div className="shrink-0 w-20 text-center">
                <div className="text-2xl font-bold text-violet-600">
                  {new Date(d.date).getDate()}
                </div>
                <div className="text-xs text-slate-500 uppercase">
                  {new Date(d.date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                {badge && (
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      diff < 0 ? 'bg-slate-200 text-slate-600' : diff === 0 ? 'bg-amber-500 text-white' : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${categoryStyles[d.category]}`}>
                  {d.category}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{d.title}</h3>
                {d.description && <p className="text-slate-600 text-sm mt-1">{d.description}</p>}
                <p className="text-slate-500 text-sm mt-2">{formatted}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
