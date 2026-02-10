import StatsCards from './StatsCards.jsx';
import Heatmap from './Heatmap.jsx';
import RiskTable from './RiskTable.jsx';

function Dashboard({ risks, stats, loading, onDelete, onRefresh }) {
  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="section-header text-xl sm:text-2xl">Risk Dashboard</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Real-time overview of your organization's risk posture</p>
        </div>
        <button
          onClick={onRefresh}
          className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 inline-flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden xs:inline">Refresh</span>
          <span className="xs:hidden">Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Charts & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Heatmap risks={risks} />
        
        {/* Distribution Card */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Risk Distribution</h3>
                <p className="text-sm text-gray-500">Breakdown by severity level</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            {stats && stats.by_level ? (
              <div className="space-y-5">
                {[
                  { level: 'Critical', color: 'bg-gradient-to-r from-red-500 to-red-600', dotColor: 'bg-red-500', count: stats.by_level.Critical || 0 },
                  { level: 'High', color: 'bg-gradient-to-r from-orange-400 to-orange-500', dotColor: 'bg-orange-500', count: stats.by_level.High || 0 },
                  { level: 'Medium', color: 'bg-gradient-to-r from-yellow-400 to-yellow-500', dotColor: 'bg-yellow-500', count: stats.by_level.Medium || 0 },
                  { level: 'Low', color: 'bg-gradient-to-r from-green-400 to-green-500', dotColor: 'bg-green-500', count: stats.by_level.Low || 0 }
                ].map((item) => {
                  const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                  return (
                    <div key={item.level}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.dotColor}`}></span>
                          {item.level}
                        </span>
                        <span className="text-gray-600 font-medium">{item.count} <span className="text-gray-400">({percentage.toFixed(0)}%)</span></span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Risk Table */}
      <div>
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              All Risk Assessments
            </h2>
            <p className="text-sm text-gray-500 mt-1">Click column headers to sort • Use filters to refine results</p>
          </div>
        </div>
        <RiskTable risks={risks} onDelete={onDelete} loading={loading} />
      </div>
    </div>
  );
}

export default Dashboard;
