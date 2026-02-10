import { useState } from 'react';

function Heatmap({ risks }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  // 5x5 matrix: rows = impact (5 to 1), cols = likelihood (1 to 5)
  const matrix = Array(5).fill(null).map(() => Array(5).fill(null).map(() => []));

  risks.forEach(risk => {
    const row = 5 - risk.impact;
    const col = risk.likelihood - 1;
    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      matrix[row][col].push(risk);
    }
  });

  const getCellColor = (likelihood, impact) => {
    const score = likelihood * impact;
    if (score >= 20) return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm';
    if (score >= 12) return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-sm';
    if (score >= 6) return 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-800 shadow-sm';
    return 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-sm';
  };

  const labels = {
    likelihood: ['1 - Rare', '2 - Unlikely', '3 - Possible', '4 - Likely', '5 - Almost Certain'],
    impact: ['5 - Critical', '4 - Major', '3 - Moderate', '2 - Minor', '1 - Negligible']
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Risk Heatmap</h3>
            <p className="text-sm text-gray-500">5×5 Risk Matrix • Hover cells for details</p>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-5 overflow-x-auto scroll-touch">
        <div className="min-w-[320px] sm:min-w-[450px]">
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-5 text-xs">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full"></span>
              <span className="text-green-700 font-medium">Low</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-yellow-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5  bg-yellow-400 rounded-full"></span>
              <span className="text-yellow-700 font-medium">Medium</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-orange-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-orange-500 rounded-full"></span>
              <span className="text-orange-700 font-medium">High</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-red-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-600 rounded-full"></span>
              <span className="text-red-700 font-medium">Critical</span>
            </div>
          </div>

          <div className="flex">
            {/* Y-axis label */}
            <div className="hidden sm:flex items-center justify-center w-6 shrink-0">
              <span className="text-xs font-medium text-gray-600 -rotate-90 whitespace-nowrap">IMPACT</span>
            </div>

            {/* Y-axis values */}
            <div className="flex flex-col justify-around pr-1 sm:pr-2 shrink-0">
              {labels.impact.map((label, i) => (
                <div key={i} className="h-10 sm:h-12 flex items-center">
                  <span className="text-[10px] sm:text-xs text-gray-600 text-right w-12 sm:w-20 truncate">{label.split(' - ')[0]}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-5 gap-0.5 sm:gap-1">
                {matrix.map((row, rowIdx) =>
                  row.map((cell, colIdx) => {
                    const likelihood = colIdx + 1;
                    const impact = 5 - rowIdx;
                    const colorClass = getCellColor(likelihood, impact);
                    const cellKey = `${rowIdx}-${colIdx}`;
                    const isHovered = hoveredCell === cellKey;
                    return (
                      <div
                        key={cellKey}
                        className={`h-10 sm:h-12 rounded flex items-center justify-center text-xs sm:text-sm font-medium cursor-pointer relative select-none ${colorClass}`}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => setHoveredCell(isHovered ? null : cellKey)}
                        onTouchStart={() => setHoveredCell(isHovered ? null : cellKey)}
                      >
                        {cell.length > 0 ? cell.length : ''}
                        {/* Tooltip */}
                        {isHovered && (
                          <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 sm:w-48 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-2 pointer-events-none">
                            <div className="font-medium mb-1">
                              L{likelihood} × I{impact} = {likelihood * impact}
                            </div>
                            <div className="text-gray-300">
                              {cell.length} {cell.length === 1 ? 'risk' : 'risks'} here
                            </div>
                            {cell.length > 0 && (
                              <ul className="mt-1 border-t border-gray-700 pt-1 max-h-20 overflow-y-auto">
                                {cell.slice(0, 5).map((r, i) => (
                                  <li key={i} className="truncate text-gray-200">• {r.asset}</li>
                                ))}
                                {cell.length > 5 && (
                                  <li className="text-gray-400">+ {cell.length - 5} more...</li>
                                )}
                              </ul>
                            )}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {/* X-axis values */}
              <div className="grid grid-cols-5 gap-1 mt-1">
                {labels.likelihood.map((label, i) => (
                  <div key={i} className="text-center">
                    <span className="text-xs text-gray-600">{label.split(' - ')[0]}</span>
                  </div>
                ))}
              </div>
              {/* X-axis label */}
              <div className="text-center mt-2">
                <span className="text-xs font-medium text-gray-600">LIKELIHOOD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;
