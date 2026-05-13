import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../utils/api';

// ── Tiny chart components (no external chart lib needed) ─────────────────────
const BarChart = ({ data, maxVal, colorFn, height = 120 }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height, padding: '0 4px' }}>
    {data.map((d, i) => {
      const h = maxVal > 0 ? (d.value / maxVal) * (height - 20) : 0;
      return (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>{Math.round(d.value)}</span>
          <div style={{
            width: '100%', maxWidth: 32, height: Math.max(2, h), borderRadius: 4,
            background: colorFn ? colorFn(d, i) : `hsl(${220 + i * 15}, 70%, 55%)`,
            transition: 'height 0.6s cubic-bezier(.4,0,.2,1)',
          }} />
          <span style={{ fontSize: 8, color: '#94a3b8', textAlign: 'center', lineHeight: 1.1 }}>{d.label}</span>
        </div>
      );
    })}
  </div>
);

const DonutChart = ({ value, max, color, size = 100, label }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{ marginTop: -size/2 - 12, fontSize: 22, fontWeight: 800, color }}>{Math.round(pct)}%</div>
      <div style={{ fontSize: 10, color: '#64748b', marginTop: 22 }}>{label}</div>
    </div>
  );
};

const ScatterPlot = ({ points, width = 280, height = 180 }) => {
  if (!points.length) return null;
  const pad = 30;
  const w = width - pad * 2, h = height - pad * 2;
  const xMax = Math.max(...points.map(p => p.x), 100);
  const yMax = Math.max(...points.map(p => p.y), 100);
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {/* axes */}
      <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="#cbd5e1" strokeWidth={1} />
      {/* diagonal reference */}
      <line x1={pad} y1={height-pad} x2={width-pad} y2={pad} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4" />
      {/* points */}
      {points.map((p, i) => {
        const cx = pad + (p.x / xMax) * w;
        const cy = height - pad - (p.y / yMax) * h;
        const col = p.color || '#3b82f6';
        return <circle key={i} cx={cx} cy={cy} r={4} fill={col} opacity={0.8} stroke="#fff" strokeWidth={1}>
          <title>{p.label}: Actual={Math.round(p.x)}%, Predicted={Math.round(p.y)}%</title>
        </circle>;
      })}
      <text x={width/2} y={height - 4} textAnchor="middle" fontSize={9} fill="#94a3b8">Actual Score %</text>
      <text x={8} y={height/2} textAnchor="middle" fontSize={9} fill="#94a3b8" transform={`rotate(-90,8,${height/2})`}>Predicted %</text>
    </svg>
  );
};

// ── Risk Badge ───────────────────────────────────────────────────────────────
const RiskBadge = ({ category }) => {
  const styles = {
    'At-Risk': { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    'Average': { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    'Excellent': { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  };
  const s = styles[category] || styles['Average'];
  return (
    <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {category}
    </span>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const AIAnalytics = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [deptScore, setDeptScore] = useState(null);
  const [mlData, setMlData] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlHealth, setMlHealth] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => {});
    api.get('/api/analytics/department-score?department=CSE&academicYear=2025-2026')
      .then(r => setDeptScore(r.data)).catch(() => {});
    api.get('/api/analytics/ml/health').then(r => setMlHealth(r.data)).catch(() => setMlHealth({ status: 'offline' }));
  }, []);

  const classes = user?.classes || [];
  const uniqueClassKeys = [...new Set(classes.map(c => `${c.branch}|${c.section}|${c.semester}|${c.academicYear}`))];
  const selectedClassObj = useMemo(() => {
    if (!selectedClass) return null;
    const [branch, section, sem, ay] = selectedClass.split('|');
    return classes.find(c => c.branch === branch && c.section === section && String(c.semester) === sem && c.academicYear === ay);
  }, [selectedClass, classes]);
  const subjects = selectedClassObj?.subjects || [];

  const runAnalysis = async () => {
    if (!selectedClass || !selectedSubject) return;
    const [branch, section, sem, ay] = selectedClass.split('|');
    const subj = subjects.find(s => s.code === selectedSubject);
    setLoading(true); setError(''); setAnalytics(null); setMlData(null);
    const body = {
      facultyId: user._id, subjectCode: selectedSubject, subjectName: subj?.name,
      academicYear: ay, semester: sem, branch, section,
    };
    try {
      const [jsRes, mlRes] = await Promise.allSettled([
        api.post('/api/analytics/predict', body),
        api.post('/api/analytics/ml/predict', body),
      ]);
      if (jsRes.status === 'fulfilled') setAnalytics(jsRes.value.data);
      if (mlRes.status === 'fulfilled') setMlData(mlRes.value.data);
      if (jsRes.status === 'rejected') setError(jsRes.reason?.response?.data?.error || 'Analysis failed');
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const handleRetrain = async () => {
    if (!selectedClass) {
      setError('Please select a Class to retrain with its data.');
      return;
    }
    const [branch, section, sem, ay] = selectedClass.split('|');
    setLoading(true); setError('');
    try {
      const res = await api.post('/api/analytics/ml/retrain', {
        academicYear: ay, semester: sem, branch, section, facultyId: user._id
      });
      alert(`Model successfully retrained! Status: ${res.data.status}. Samples: ${res.data.samples || 500}`);
      runAnalysis(); // re-run analysis to show updated predictions
    } catch (e) {
      setError(e.response?.data?.error || 'Retraining failed');
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (cat) => cat === 'At-Risk' ? '#ef4444' : cat === 'Excellent' ? '#22c55e' : '#f59e0b';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', marginTop: '10vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>🧠</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI-Powered Analytics</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Machine Learning predictions, risk analysis & smart recommendations</p>
        </div>
      </div>

      {/* NIRF-style Department Score */}
      {deptScore && (
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 16, padding: 24, marginBottom: 24, color: '#fff', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#94a3b8', marginBottom: 8 }}>Department Health Score</div>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {deptScore.nirfIndicators.overallScore}<span style={{ fontSize: 20 }}>/100</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#94a3b8' }}>Estimated NIRF Band: <strong style={{ color: '#60a5fa' }}>{deptScore.nirfIndicators.estimatedBand}</strong></div>
          </div>
          {[
            { label: 'Teaching & Learning', val: deptScore.nirfIndicators.teachingLearning, col: '#60a5fa' },
            { label: 'Outcome Index', val: deptScore.nirfIndicators.outcomeIndex, col: '#a78bfa' },
            { label: 'Graduate Outcome', val: deptScore.nirfIndicators.graduateOutcome, col: '#34d399' },
            { label: 'Perception', val: deptScore.nirfIndicators.perception, col: '#fbbf24' },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: 'center', flex: '0 0 auto' }}>
              <DonutChart value={m.val} max={100} color={m.col} size={80} label="" />
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{m.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: m.col }}>{m.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Subject Selector */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Class</label>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); }}
            className="w-full p-2.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">-- Select --</option>
            {uniqueClassKeys.map(k => {
              const [b, s, sem, ay] = k.split('|');
              return <option key={k} value={k}>{b}-{s} Sem {sem} ({ay})</option>;
            })}
          </select>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedClass}
            className="w-full p-2.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50">
            <option value="">-- Select --</option>
            {subjects.map(s => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={runAnalysis} disabled={!selectedClass || !selectedSubject || loading}
            style={{
              padding: '10px 28px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              transition: 'all 0.2s', opacity: (!selectedClass || !selectedSubject) ? 0.5 : 1,
            }}>
            {loading ? '⏳...' : '🧠 Run Analysis'}
          </button>
          
          <button onClick={handleRetrain} disabled={!selectedClass || loading}
            style={{
              padding: '10px 28px', borderRadius: 10, border: '1px solid #8b5cf6', cursor: 'pointer',
              background: '#fff', color: '#8b5cf6', fontWeight: 700, fontSize: 14,
              transition: 'all 0.2s', opacity: (!selectedClass) ? 0.5 : 1,
            }}>
            {loading ? '⏳...' : '🔄 Retrain with this Data'}
          </button>
        </div>
      </div>

      {error && <div style={{ padding: 16, borderRadius: 12, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', marginBottom: 24, fontSize: 14 }}>❌ {error}</div>}

      {/* ── RESULTS ── */}
      {analytics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {[
              { label: 'Students', val: analytics.summary.total, icon: '👥', col: '#3b82f6', bg: '#eff6ff' },
              { label: 'At-Risk', val: analytics.summary.atRisk, icon: '🚨', col: '#ef4444', bg: '#fef2f2' },
              { label: 'Average', val: analytics.summary.average, icon: '📊', col: '#f59e0b', bg: '#fffbeb' },
              { label: 'Excellent', val: analytics.summary.excellent, icon: '⭐', col: '#22c55e', bg: '#f0fdf4' },
              { label: 'Class Avg', val: `${analytics.summary.classAverage}%`, icon: '📈', col: '#6366f1', bg: '#eef2ff' },
              { label: 'Model R²', val: analytics.modelMetrics.accuracy, icon: '🧠', col: '#8b5cf6', bg: '#f5f3ff' },
            ].map((c, i) => (
              <div key={i} style={{ background: c.bg, borderRadius: 14, padding: '16px 18px', border: `1px solid ${c.col}22` }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: c.col }}>{c.val}</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {/* Prediction Scatter */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>📊 Performance Prediction</h3>
              <p style={{ margin: '0 0 12px', fontSize: 11, color: '#94a3b8' }}>Linear Regression: Mid-Sem + Continuous → End-Sem prediction</p>
              <ScatterPlot points={analytics.students.map(s => ({
                x: s.tesPercent, y: s.predictedTes, label: s.name,
                color: riskColor(s.riskCategory),
              }))} width={320} height={200} />
              <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'center' }}>
                {['At-Risk', 'Average', 'Excellent'].map(c => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: riskColor(c) }} />
                    <span style={{ color: '#64748b' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CO Attainment Gaps */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>🎯 CO Attainment Gap Analysis</h3>
              <p style={{ margin: '0 0 12px', fontSize: 11, color: '#94a3b8' }}>Current attainment vs target (2.0/3.0)</p>
              {analytics.attainmentGaps.length > 0 ? (
                <BarChart
                  data={analytics.attainmentGaps.map(g => ({ value: g.current * 33.33, label: g.co }))}
                  maxVal={100}
                  colorFn={(d, i) => {
                    const g = analytics.attainmentGaps[i];
                    return g.status === 'Achieved' ? '#22c55e' : g.status === 'Needs Improvement' ? '#f59e0b' : '#ef4444';
                  }}
                  height={160}
                />
              ) : <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>Calculate attainment first on COPO Dashboard</p>}
            </div>
          </div>

          {/* AI Recommendations */}
          {analytics.recommendations.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>💡 AI-Generated Recommendations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analytics.recommendations.map((r, i) => {
                  const bgMap = { critical: '#fef2f2', warning: '#fffbeb', info: '#eff6ff', success: '#f0fdf4' };
                  const borderMap = { critical: '#fecaca', warning: '#fde68a', info: '#bfdbfe', success: '#bbf7d0' };
                  return (
                    <div key={i} style={{ padding: '12px 16px', borderRadius: 12, background: bgMap[r.type] || '#f8fafc', border: `1px solid ${borderMap[r.type] || '#e2e8f0'}`, fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                      <span>{r.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student Table */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>👥 Student-Wise Prediction & Risk Analysis</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  {['Roll No', 'Name', 'TMS %', 'TCA %', 'TES %', 'Predicted TES %', 'Overall %', 'Risk'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analytics.students.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>{s.rollNo}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e293b' }}>{s.name}</td>
                    <td style={{ padding: '8px 12px' }}>{s.tmsPercent.toFixed(1)}</td>
                    <td style={{ padding: '8px 12px' }}>{s.tcaPercent.toFixed(1)}</td>
                    <td style={{ padding: '8px 12px' }}>{s.tesPercent.toFixed(1)}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#6366f1' }}>{s.predictedTes.toFixed(1)}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>{s.overallPercent.toFixed(1)}</td>
                    <td style={{ padding: '8px 12px' }}><RiskBadge category={s.riskCategory} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ══════ PYTHON ML SECTION ══════ */}
          {mlData && (
            <div style={{ border: '2px solid #8b5cf6', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', padding: '20px 24px', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>🐍</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Python ML Models (scikit-learn + XGBoost)</h3>
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Real trained models: Random Forest, XGBoost, Gradient Boosting, Linear Regression</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: 24, background: '#faf5ff' }}>
                {/* Model Comparison */}
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Model Performance Comparison</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                  {Object.entries(mlData.model_metrics || {}).map(([name, m]) => (
                    <div key={name} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e9d5ff', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>{name}</div>
                      {m.r2 !== undefined && <div style={{ fontSize: 12, color: '#475569' }}>R²: <strong>{m.r2}</strong></div>}
                      {m.rmse !== undefined && <div style={{ fontSize: 12, color: '#475569' }}>RMSE: <strong>{m.rmse}</strong></div>}
                      {m.mae !== undefined && <div style={{ fontSize: 12, color: '#475569' }}>MAE: <strong>{m.mae}</strong></div>}
                      {m.cv_r2_mean !== undefined && <div style={{ fontSize: 12, color: '#475569' }}>CV R² (5-fold): <strong>{m.cv_r2_mean} ± {m.cv_r2_std}</strong></div>}
                      {m.accuracy !== undefined && <div style={{ fontSize: 12, color: '#475569' }}>Accuracy: <strong style={{ color: '#16a34a' }}>{(m.accuracy * 100).toFixed(1)}%</strong></div>}
                    </div>
                  ))}
                </div>

                {/* Feature Importance */}
                {mlData.feature_importance && (
                  <>
                    <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Feature Importance (What drives predictions?)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 20 }}>
                      {Object.entries(mlData.feature_importance).map(([model, features]) => (
                        <div key={model} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e9d5ff' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>{model}</div>
                          {Object.entries(features).sort((a, b) => b[1] - a[1]).map(([feat, imp]) => (
                            <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <div style={{ width: 80, fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{feat.replace(/_/g, ' ')}</div>
                              <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${imp * 100}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #2563eb)', borderRadius: 4, transition: 'width 0.8s ease' }} />
                              </div>
                              <div style={{ width: 36, fontSize: 10, color: '#475569', fontWeight: 600 }}>{(imp * 100).toFixed(1)}%</div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Ensemble method */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e9d5ff', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 4 }}>Ensemble Method</div>
                  <div style={{ fontSize: 13, color: '#475569' }}>{mlData.ensemble_method}</div>
                </div>

                {/* ML Predictions Table */}
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Per-Student ML Predictions</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e9d5ff' }}>
                        {['Roll No', 'Name', 'RF', 'XGB', 'GB', 'LR', 'Ensemble', 'Category', 'Confidence'].map(h => (
                          <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(mlData.predictions || []).map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f5f3ff' }}>
                          <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontSize: 11 }}>{s.rollNo}</td>
                          <td style={{ padding: '6px 10px', fontWeight: 600 }}>{s.name}</td>
                          <td style={{ padding: '6px 10px' }}>{s.predictions?.random_forest}</td>
                          <td style={{ padding: '6px 10px' }}>{s.predictions?.xgboost}</td>
                          <td style={{ padding: '6px 10px' }}>{s.predictions?.gradient_boosting}</td>
                          <td style={{ padding: '6px 10px' }}>{s.predictions?.linear_regression}</td>
                          <td style={{ padding: '6px 10px', fontWeight: 800, color: '#7c3aed' }}>{s.predictions?.ensemble}</td>
                          <td style={{ padding: '6px 10px' }}>
                            <RiskBadge category={s.risk_classification?.random_forest || 'Average'} />
                          </td>
                          <td style={{ padding: '6px 10px', fontWeight: 600, color: '#16a34a' }}>{s.risk_classification?.confidence}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Health Score */}
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, padding: 24, color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7, marginBottom: 8 }}>Subject Health Score</div>
            <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1 }}>{analytics.healthScore.score}<span style={{ fontSize: 24 }}>/100</span></div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>Grade: {analytics.healthScore.grade}</div>
          </div>
        </div>
      )}

      {/* ML Service Status */}
      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
        Python ML Service: {' '}
        <span style={{ color: mlHealth?.status === 'ok' ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
          {mlHealth?.status === 'ok' ? 'Online (Flask + scikit-learn + XGBoost)' : 'Offline — run: cd ml-service && python app.py'}
        </span>
      </div>
    </div>
  );
};

export default AIAnalytics;

