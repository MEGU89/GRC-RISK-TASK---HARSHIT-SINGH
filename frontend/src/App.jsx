import { useState, useEffect, useCallback } from 'react';
import RiskForm from './components/RiskForm.jsx';
import Dashboard from './components/Dashboard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [risks, setRisks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchRisks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/risks`);
      if (!response.ok) throw new Error('Failed to fetch risks');
      const data = await response.json();
      setRisks(data);
      setError(null);
    } catch (err) {
      setError('Unable to connect to server. Please ensure the backend is running.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/risks/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error:', err);
    }
  }, []);

  const submitRisk = async (riskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assess-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riskData),
      });
      if (!response.ok) throw new Error('Failed to submit risk');
      await fetchRisks();
      await fetchStats();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteRisk = async (riskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/risks/${riskId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await fetchRisks();
      await fetchStats();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const exportToCSV = () => {
    if (risks.length === 0) return;
    const headers = ['ID', 'Asset', 'Threat', 'Likelihood', 'Impact', 'Score', 'Level'];
    const csvContent = [
      headers.join(','),
      ...risks.map(r => [r.id, `"${r.asset}"`, `"${r.threat}"`, r.likelihood, r.impact, r.score, r.level].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `risk-assessment-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  useEffect(() => {
    fetchRisks();
    fetchStats();
  }, [fetchRisks, fetchStats]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">GRC Risk Assessment</span>
                <span className="hidden sm:inline text-blue-200/80 text-sm ml-2 font-medium">| NIST SP 800-30</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'dashboard' 
                    ? 'bg-white text-blue-900 shadow-md' 
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Dashboard
                </span>
              </button>
              <button
                onClick={() => handleTabChange('add-risk')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'add-risk' 
                    ? 'bg-white text-blue-900 shadow-md' 
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Risk
                </span>
              </button>
              {risks.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="ml-1 px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200"
                  title="Export CSV"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-1">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`w-full px-4 py-2.5 rounded-lg text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                  activeTab === 'dashboard' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Dashboard
              </button>
              <button
                onClick={() => handleTabChange('add-risk')}
                className={`w-full px-4 py-2.5 rounded-lg text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                  activeTab === 'add-risk' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Risk
              </button>
              {risks.length > 0 && (
                <button
                  onClick={() => { exportToCSV(); setMobileMenuOpen(false); }}
                  className="w-full px-4 py-2.5 rounded-lg text-left text-sm font-medium flex items-center gap-3 text-white/80 hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {error && (
          <div className="alert alert-danger mb-4 sm:mb-6">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="flex-1 text-sm sm:text-base">{error}</span>
            <button onClick={() => { fetchRisks(); fetchStats(); }} className="btn btn-sm btn-danger">
              Retry
            </button>
          </div>
        )}

        {activeTab === 'add-risk' ? (
          <div>
            <div className="section-header mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Risk Assessment</h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">Evaluate and document potential risks to your assets</p>
            </div>
            <RiskForm onSubmit={submitRisk} onSuccess={() => setActiveTab('dashboard')} />
          </div>
        ) : (
          <Dashboard
            risks={risks}
            stats={stats}
            loading={loading}
            onDelete={deleteRisk}
            onRefresh={() => { fetchRisks(); fetchStats(); }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-800 safe-area-inset-bottom" style={{ background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-gray-400 text-xs sm:text-sm">GRC Risk Assessment Tool</span>
            </div>
            <div className="text-gray-500 text-xs sm:text-sm text-center sm:text-right">
              Aligned with <span className="text-gray-400">NIST SP 800-30</span> • {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
