import { useState } from 'react';

function RiskForm({ onSubmit, onSuccess }) {
  const [formData, setFormData] = useState({
    asset: '',
    threat: '',
    likelihood: 3,
    impact: 3
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
  const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Critical'];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'range' ? parseInt(value) : value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.asset.trim() || !formData.threat.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await onSubmit(formData);

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setFormData({ asset: '', threat: '', likelihood: 3, impact: 3 });
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } else {
      setError(result.error || 'Failed to submit risk assessment.');
    }
  };

  const calculatedScore = formData.likelihood * formData.impact;
  const getRiskLevel = (score) => {
    if (score >= 20) return { level: 'Critical', class: 'text-red-600', bgClass: 'bg-red-50 border border-red-200' };
    if (score >= 12) return { level: 'High', class: 'text-orange-600', bgClass: 'bg-orange-50 border border-orange-200' };
    if (score >= 6) return { level: 'Medium', class: 'text-amber-600', bgClass: 'bg-amber-50 border border-amber-200' };
    return { level: 'Low', class: 'text-green-600', bgClass: 'bg-green-50 border border-green-200' };
  };
  const riskInfo = getRiskLevel(calculatedScore);

  return (
    <form onSubmit={handleSubmit} className="card w-full max-w-2xl mx-auto">
      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
        {error && (
          <div className="alert alert-danger">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Risk assessment submitted successfully!</span>
          </div>
        )}

        {/* Asset */}
        <div>
          <label htmlFor="asset" className="block text-sm font-medium text-gray-700 mb-1">
            Asset <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="asset"
            name="asset"
            value={formData.asset}
            onChange={handleChange}
            placeholder="e.g., Customer Database, API Server"
            className="form-input"
            required
          />
          <p className="text-xs text-gray-500 mt-1">The system, data, or resource at risk</p>
        </div>

        {/* Threat */}
        <div>
          <label htmlFor="threat" className="block text-sm font-medium text-gray-700 mb-1">
            Threat <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="threat"
            name="threat"
            value={formData.threat}
            onChange={handleChange}
            placeholder="e.g., SQL Injection, Phishing Attack"
            className="form-input"
            required
          />
          <p className="text-xs text-gray-500 mt-1">The potential threat or vulnerability</p>
        </div>

        {/* Likelihood */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <label htmlFor="likelihood" className="text-sm font-semibold text-gray-700">
              Likelihood
            </label>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 self-start sm:self-auto">
              {formData.likelihood} - {likelihoodLabels[formData.likelihood - 1]}
            </span>
          </div>
          <input
            type="range"
            id="likelihood"
            name="likelihood"
            min="1"
            max="5"
            value={formData.likelihood}
            onChange={handleChange}
            className="range-slider touch-target"
          />
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-400">
            <span>Rare</span>
            <span className="hidden sm:inline">Unlikely</span>
            <span className="sm:hidden">2</span>
            <span className="hidden sm:inline">Possible</span>
            <span className="sm:hidden">3</span>
            <span className="hidden sm:inline">Likely</span>
            <span className="sm:hidden">4</span>
            <span>Certain</span>
          </div>
        </div>

        {/* Impact */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <label htmlFor="impact" className="text-sm font-semibold text-gray-700">
              Impact
            </label>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 self-start sm:self-auto">
              {formData.impact} - {impactLabels[formData.impact - 1]}
            </span>
          </div>
          <input
            type="range"
            id="impact"
            name="impact"
            min="1"
            max="5"
            value={formData.impact}
            onChange={handleChange}
            className="range-slider touch-target"
          />
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-400">
            <span>Negligible</span>
            <span className="hidden sm:inline">Minor</span>
            <span className="sm:hidden">2</span>
            <span className="hidden sm:inline">Moderate</span>
            <span className="sm:hidden">3</span>
            <span className="hidden sm:inline">Major</span>
            <span className="sm:hidden">4</span>
            <span>Critical</span>
          </div>
        </div>

        {/* Preview */}
        <div className="preview-box">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h4 className="text-sm font-semibold text-gray-700">Risk Assessment Preview</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{calculatedScore}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Risk Score</div>
            </div>
            <div className={`rounded-lg p-4 text-center ${riskInfo.bgClass}`}>
              <div className={`text-3xl font-bold mb-1 ${riskInfo.class}`}>{riskInfo.level}</div>
              <div className="text-xs opacity-75 uppercase tracking-wide">Risk Level</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="font-medium">Likelihood ({formData.likelihood})</span>
            <span>×</span>
            <span className="font-medium">Impact ({formData.impact})</span>
            <span>=</span>
            <span className="font-bold text-gray-900">{calculatedScore}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary flex-1 sm:flex-none"
        >
          {submitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Submitting...
            </>
          ) : (
            'Submit Risk Assessment'
          )}
        </button>
        <button
          type="button"
          onClick={() => setFormData({ asset: '', threat: '', likelihood: 3, impact: 3 })}
          className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

export default RiskForm;
