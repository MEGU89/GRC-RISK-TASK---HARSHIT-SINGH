function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      label: 'Total Risks',
      value: stats.total || 0,
      bgGradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-400/30',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      label: 'Avg Score',
      value: stats.average_score?.toFixed(1) || '0.0',
      bgGradient: 'from-slate-500 to-slate-600',
      iconBg: 'bg-slate-400/30',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      label: 'Critical',
      value: stats.by_level?.Critical || 0,
      bgGradient: 'from-red-500 to-red-600',
      iconBg: 'bg-red-400/30',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      label: 'High',
      value: stats.by_level?.High || 0,
      bgGradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-400/30',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      label: 'Medium',
      value: stats.by_level?.Medium || 0,
      bgGradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-400/30',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Low',
      value: stats.by_level?.Low || 0,
      bgGradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-400/30',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${card.bgGradient} text-white shadow-lg`}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-white/10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 -ml-4 -mb-4 rounded-full bg-black/5"></div>
          
          {/* Content */}
          <div className="relative">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${card.iconBg} mb-3`}>
              {card.icon}
            </div>
            <div className="text-2xl font-bold mb-1">{card.value}</div>
            <div className="text-xs font-medium uppercase tracking-wider opacity-80">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
