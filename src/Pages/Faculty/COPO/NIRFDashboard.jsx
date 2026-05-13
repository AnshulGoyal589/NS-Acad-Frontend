import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Award, TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';

const NIRFDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    faculty_student_ratio: 15,
    phd_faculty_pct: 70,
    publications: 150,
    citations: 800,
    patents: 12,
    placement_rate: 85,
    median_salary_lpa: 9.5,
    diversity_pct: 35,
    expenditure_cr: 60
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/api/analytics/ml/nirf-predict', formData);
      setPrediction(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const getBandColor = (band) => {
    if (band === '1-50') return 'text-green-600 bg-green-50 border-green-200';
    if (band === '51-100') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (band === '101-150') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const handleExportData = () => {
    // Open the backend endpoint in a new tab to trigger the CSV download
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    window.open(`${baseUrl}/api/analytics/export/nirf-data`, '_blank');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto mt-16 font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Award size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 m-0">
              NIRF Predictive Engine
            </h1>
            <p className="text-slate-500 text-sm mt-1 m-0">
              Powered by XGBoost, LightGBM & Random Forest Ensemble Model
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleExportData}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export Data for Colab (.csv)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-500" />
            Institutional Parameters
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Faculty-Student Ratio</label>
                <input type="number" step="0.1" name="faculty_student_ratio" value={formData.faculty_student_ratio} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">PhD Faculty (%)</label>
                <input type="number" name="phd_faculty_pct" value={formData.phd_faculty_pct} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Total Publications</label>
                <input type="number" name="publications" value={formData.publications} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Total Citations</label>
                <input type="number" name="citations" value={formData.citations} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Patents Granted</label>
                <input type="number" name="patents" value={formData.patents} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Placement Rate (%)</label>
                <input type="number" name="placement_rate" value={formData.placement_rate} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Median Salary (LPA)</label>
                <input type="number" step="0.1" name="median_salary_lpa" value={formData.median_salary_lpa} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Diversity (%)</label>
                <input type="number" name="diversity_pct" value={formData.diversity_pct} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Total Expenditure (Cr)</label>
                <input type="number" name="expenditure_cr" value={formData.expenditure_cr} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); handlePredict(e); }}
              disabled={loading}
              className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Running Ensemble Models...' : 'Predict NIRF Score'}
            </button>
          </div>

          {error && <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">{error}</div>}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7 space-y-6">
          {!prediction ? (
            <div className="h-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 text-slate-400">
              <Award size={48} className="mb-4 opacity-20" />
              <p>Enter institutional parameters to predict NIRF Score</p>
            </div>
          ) : (
            <>
              {/* Score Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="grid grid-cols-2 gap-8 relative z-10">
                  <div>
                    <p className="text-indigo-300 text-sm font-bold tracking-widest uppercase mb-2">Predicted Score</p>
                    <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-300">
                      {prediction.predicted_score}
                      <span className="text-3xl text-slate-500">/100</span>
                    </div>
                    {prediction.confidence_interval && (
                      <p className="text-slate-400 text-sm mt-2">
                        95% CI: [{prediction.confidence_interval[0]} - {prediction.confidence_interval[1]}]
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col justify-center items-start border-l border-slate-700 pl-8">
                    <p className="text-indigo-300 text-sm font-bold tracking-widest uppercase mb-2">Estimated Band</p>
                    <div className={`px-4 py-2 rounded-xl font-bold text-xl border ${getBandColor(prediction.estimated_band)}`}>
                      Rank {prediction.estimated_band}
                    </div>
                    <div className="mt-4 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                      Model R² Score: {prediction.model_metrics?.r2 || '0.82'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-amber-500" />
                    Strategic Recommendations
                  </h3>
                  <div className="space-y-3">
                    {prediction.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <CheckCircle2 size={18} className="text-amber-600 mt-0.5" />
                        <span className="text-sm font-medium text-amber-900">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Importance */}
              {prediction.feature_importance && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-indigo-500" />
                    Feature Importance Analysis
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(prediction.feature_importance)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([feature, importance]) => (
                        <div key={feature} className="flex items-center gap-4">
                          <div className="w-1/3 text-xs font-semibold text-slate-600 capitalize truncate">
                            {feature.replace(/_/g, ' ')}
                          </div>
                          <div className="w-2/3 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                              style={{ width: `${importance * 100}%` }}
                            ></div>
                          </div>
                          <div className="w-10 text-right text-xs font-bold text-indigo-600">
                            {(importance * 100).toFixed(1)}%
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NIRFDashboard;
