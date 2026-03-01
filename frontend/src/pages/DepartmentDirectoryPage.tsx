import { Link } from 'react-router-dom';
import { useState } from 'react';

interface DirectoryEntry {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  specialties?: string[];
}

const MOCK_DIRECTORY: DirectoryEntry[] = [
  { id: '1', name: 'Dr. Sarah Chen', role: 'Senior Advisor', email: 's.chen@gmu.edu', department: 'Computer Science', specialties: ['Course Override', 'Graduation Audit'] },
  { id: '2', name: 'Prof. James Miller', role: 'Department Admin', email: 'j.miller@gmu.edu', department: 'Computer Science', specialties: ['Add/Drop', 'Recommendations'] },
  { id: '3', name: 'Dr. Lisa Park', role: 'Advisor', email: 'l.park@gmu.edu', department: 'Engineering', specialties: ['Funding', 'Course Override'] },
  { id: '4', name: 'Michael Torres', role: 'Advisor', email: 'm.torres@gmu.edu', department: 'Business', specialties: ['Graduation Audit', 'General'] },
  { id: '5', name: 'advisor@gmu.edu', role: 'Advisor', email: 'advisor@gmu.edu', department: 'General', specialties: ['All request types'] },
];

export function DepartmentDirectoryPage() {
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const departments = Array.from(new Set(MOCK_DIRECTORY.map((d) => d.department)));

  const filtered = MOCK_DIRECTORY.filter((d) => {
    const matchDept = deptFilter === 'all' || d.department === deptFilter;
    const matchSearch =
      !search.trim() ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
          Department Directory
        </h1>
        <Link
          to="/resources"
          className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-all"
        >
          ← Resources
        </Link>
      </div>

      <div className="card-vibrant p-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-vibrant w-full max-w-md mb-3"
          placeholder="Search by name, email, or department..."
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDeptFilter('all')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm ${
              deptFilter === 'all' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All
          </button>
          {departments.map((d) => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm ${
                deptFilter === d ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((entry) => (
          <div key={entry.id} className="card-vibrant p-6 hover:border-slate-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold shrink-0">
                {entry.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-800">{entry.name}</h3>
                <p className="text-sm text-amber-600 font-medium">{entry.role}</p>
                <p className="text-sm text-slate-600">{entry.department}</p>
                <a
                  href={`mailto:${entry.email}`}
                  className="text-sm text-violet-600 hover:text-violet-700 mt-2 inline-block"
                >
                  {entry.email}
                </a>
                {entry.specialties && entry.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.specialties.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card-vibrant p-12 text-center">
          <p className="text-slate-600">No contacts match your search.</p>
        </div>
      )}
    </div>
  );
}
