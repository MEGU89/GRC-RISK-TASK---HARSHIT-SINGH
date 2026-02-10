import { useState } from 'react';

function RiskTable({ risks, onDelete, loading }) {
  const [sortField, setSortField] = useState('score');
  const [sortDir, setSortDir] = useState('desc');
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  const getMitigationHint = (level) => {
    const hints = {
      Low: 'Monitor',
      Medium: 'Plan mitigation',
      High: 'Prioritize action per NIST',
      Critical: 'Immediate response'
    };
    return hints[level] || 'Review';
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // Filter risks based on search query and level filter
  const filteredRisks = risks.filter(risk => {
    // Level filter
    if (levelFilter !== 'All' && risk.level !== levelFilter) return false;
    // Search filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      risk.asset.toLowerCase().includes(query) ||
      risk.threat.toLowerCase().includes(query) ||
      risk.level.toLowerCase().includes(query) ||
      String(risk.score).includes(query)
    );
  });

  const sortedRisks = [...filteredRisks].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDelete = async (id) => {
    setDeleteId(id);
    await onDelete(id);
    setDeleteId(null);
  };

  const getLevelBadge = (level) => {
    const styles = {
      Low: 'badge-low',
      Medium: 'badge-medium',
      High: 'badge-high',
      Critical: 'badge-critical'
    };
    return styles[level] || 'bg-gray-100 text-gray-800';
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-block w-4">
      {sortField === field && (
        sortDir === 'asc' ? '↑' : '↓'
      )}
    </span>
  );

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-600">Loading risks...</p>
      </div>
    );
  }

  if (risks.length === 0) {
    return (
      <div className="card p-8 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-600">No risk assessments found.</p>
        <p className="text-sm text-gray-500 mt-1">Add your first risk to get started.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Search Bar and Level Filter */}
      <div className="p-4 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by asset, threat, level, or score..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {/* Level Filter Dropdown */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="form-input sm:w-40 bg-white"
          >
            <option value="All">All Levels</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        {(searchQuery || levelFilter !== 'All') && (
          <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Found <span className="font-medium text-gray-900">{filteredRisks.length}</span> {filteredRisks.length === 1 ? 'result' : 'results'}
            {levelFilter !== 'All' && <span className="text-gray-500">(filtered by {levelFilter})</span>}
          </p>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }}>
            <tr>
              <th 
                className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-200/50"
                onClick={() => handleSort('id')}
              >
                ID<SortIcon field="id" />
              </th>
              <th 
                className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-200/50"
                onClick={() => handleSort('asset')}
              >
                Asset<SortIcon field="asset" />
              </th>
              <th 
                className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-200/50"
                onClick={() => handleSort('threat')}
              >
                Threat<SortIcon field="threat" />
              </th>
              <th 
                className="px-4 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-200/50"
                onClick={() => handleSort('likelihood')}
              >
                L<SortIcon field="likelihood" />
              </th>
              <th 
                className="px-4 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-200/50"
                onClick={() => handleSort('impact')}
              >
                I<SortIcon field="impact" />
              </th>
              <th 
                className="px-4 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-200/50"
                onClick={() => handleSort('score')}
              >
                Score<SortIcon field="score" />
              </th>
              <th 
                className="px-4 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-200/50"
                onClick={() => handleSort('level')}
              >
                Level<SortIcon field="level" />
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Action Hint
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedRisks.map((risk) => (
              <tr key={risk.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{risk.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{risk.asset}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{risk.threat}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-600">{risk.likelihood}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-600">{risk.impact}</td>
                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">{risk.score}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`badge ${getLevelBadge(risk.level)}`}>{risk.level}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{getMitigationHint(risk.level)}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(risk.id)}
                    disabled={deleteId === risk.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Delete"
                  >
                    {deleteId === risk.id ? (
                      <span className="inline-block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {sortedRisks.map((risk) => (
          <div key={risk.id} className="p-4 active:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{risk.asset}</h4>
                <p className="text-sm text-gray-600 truncate">{risk.threat}</p>
              </div>
              <span className={`badge shrink-0 ${getLevelBadge(risk.level)}`}>{risk.level}</span>
            </div>
            
            {/* Score details grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Likelihood</div>
                <div className="font-bold text-gray-900">{risk.likelihood}</div>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Impact</div>
                <div className="font-bold text-gray-900">{risk.impact}</div>
              </div>
              <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-blue-600 uppercase tracking-wide">Score</div>
                <div className="font-bold text-blue-700">{risk.score}</div>
              </div>
            </div>
            
            {/* Hint and actions */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500 flex-1">{getMitigationHint(risk.level)}</p>
              <button
                onClick={() => handleDelete(risk.id)}
                disabled={deleteId === risk.id}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 disabled:opacity-50 transition-colors touch-target"
                aria-label="Delete risk"
              >
                {deleteId === risk.id ? (
                  <span className="inline-block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RiskTable;
