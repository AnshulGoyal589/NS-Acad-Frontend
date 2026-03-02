import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Radar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement, Filler,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import api from '../../../utils/api';
import { getCurrentUser } from '../../../utils/auth';
import AttainmentConfig from '../../../Components/Faculty/CopoAssessment/AttainmentConfig';
import NBAReportExport from '../../../Components/Faculty/CopoAssessment/NBAReportExport';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement, Filler,
  ArcElement, Title, Tooltip, Legend
);

// ============================================================================
// Color palette
// ============================================================================
const COLORS = {
  primary: 'rgba(59, 130, 246, 0.8)',
  primaryLight: 'rgba(59, 130, 246, 0.2)',
  success: 'rgba(34, 197, 94, 0.8)',
  successLight: 'rgba(34, 197, 94, 0.2)',
  warning: 'rgba(251, 191, 36, 0.8)',
  warningLight: 'rgba(251, 191, 36, 0.2)',
  danger: 'rgba(239, 68, 68, 0.8)',
  dangerLight: 'rgba(239, 68, 68, 0.2)',
  purple: 'rgba(139, 92, 246, 0.8)',
  purpleLight: 'rgba(139, 92, 246, 0.2)',
  teal: 'rgba(20, 184, 166, 0.8)',
  tealLight: 'rgba(20, 184, 166, 0.2)',
};

const chartColors = [
  COLORS.primary, COLORS.success, COLORS.warning,
  COLORS.purple, COLORS.teal, COLORS.danger
];
const chartBgColors = [
  COLORS.primaryLight, COLORS.successLight, COLORS.warningLight,
  COLORS.purpleLight, COLORS.tealLight, COLORS.dangerLight
];

// ============================================================================
// SubjectSelector Component
// ============================================================================
const SubjectSelector = ({ user, onSubjectSelect, selectedSubject }) => {
  const classes = user?.classes || [];
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubCode, setSelectedSubCode] = useState('');

  const allSubjects = [];
  classes.forEach(cls => {
    (cls.subjects || []).forEach(sub => {
      allSubjects.push({
        code: sub.code,
        name: sub.name,
        branch: cls.branch,
        section: cls.section,
        semester: cls.semester,
        academicYear: cls.academicYear,
        classKey: `${cls.branch}-${cls.section}-Sem${cls.semester}-${cls.academicYear}`
      });
    });
  });

  const uniqueClasses = [...new Set(allSubjects.map(s => s.classKey))];

  const filteredSubjects = selectedClass
    ? allSubjects.filter(s => s.classKey === selectedClass)
    : allSubjects;

  const handleSelect = (code) => {
    setSelectedSubCode(code);
    const sub = allSubjects.find(s => s.code === code && (!selectedClass || s.classKey === selectedClass));
    if (sub) onSubjectSelect(sub);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
        <select
          value={selectedClass}
          onChange={e => { setSelectedClass(e.target.value); setSelectedSubCode(''); }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
        >
          <option value="">All Classes</option>
          {uniqueClasses.map(cl => (
            <option key={cl} value={cl}>{cl}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <select
          value={selectedSubCode}
          onChange={e => handleSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
        >
          <option value="">Select Subject</option>
          {filteredSubjects.map(s => (
            <option key={`${s.code}-${s.classKey}`} value={s.code}>
              {s.code} — {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ============================================================================
// StatCard Component
// ============================================================================
const StatCard = ({ title, value, subtitle, color = 'blue', icon }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };
  return (
    <div className={`rounded-xl bg-gradient-to-br ${colorMap[color]} p-5 text-white shadow-lg transform hover:scale-[1.02] transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-white/80">{title}</p>
        {icon && <span className="text-2xl opacity-80">{icon}</span>}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
    </div>
  );
};

// ============================================================================
// CO Attainment Bar Chart
// ============================================================================
const CoBarChart = ({ attainmentData }) => {
  if (!attainmentData || attainmentData.length === 0) return null;

  const data = {
    labels: attainmentData.map(d => d.coIdentifier),
    datasets: [
      {
        label: 'TMS',
        data: attainmentData.map(d => d.tmsAttainment),
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'TCA',
        data: attainmentData.map(d => d.tcaAttainment),
        backgroundColor: COLORS.successLight,
        borderColor: COLORS.success,
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'TES',
        data: attainmentData.map(d => d.tesAttainment),
        backgroundColor: COLORS.warningLight,
        borderColor: COLORS.warning,
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Final',
        data: attainmentData.map(d => d.finalAttainment),
        backgroundColor: COLORS.purpleLight,
        borderColor: COLORS.purple,
        borderWidth: 2,
        borderRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'CO Attainment Levels', font: { size: 16, weight: 'bold' } },
      legend: { position: 'bottom' }
    },
    scales: {
      y: {
        min: 0, max: 3,
        ticks: { stepSize: 1, callback: v => `Level ${v}` },
        title: { display: true, text: 'Attainment Level' }
      }
    }
  };

  return <Bar data={data} options={options} />;
};

// ============================================================================
// PO Attainment Radar Chart
// ============================================================================
const PoRadarChart = ({ poAttainment, psoAttainment }) => {
  if ((!poAttainment || poAttainment.length === 0) && (!psoAttainment || psoAttainment.length === 0)) return null;

  const allData = [...(poAttainment || []), ...(psoAttainment || [])];

  const data = {
    labels: allData.map(d => d.poIdentifier),
    datasets: [{
      label: 'PO/PSO Attainment',
      data: allData.map(d => d.attainmentValue),
      backgroundColor: COLORS.primaryLight,
      borderColor: COLORS.primary,
      borderWidth: 2,
      pointBackgroundColor: COLORS.primary,
      pointBorderColor: '#fff',
      pointHoverRadius: 6,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'PO/PSO Attainment Radar', font: { size: 16, weight: 'bold' } },
      legend: { position: 'bottom' }
    },
    scales: {
      r: {
        min: 0, max: 3,
        ticks: { stepSize: 1 },
        pointLabels: { font: { size: 12, weight: 'bold' } }
      }
    }
  };

  return <Radar data={data} options={options} />;
};

// ============================================================================
// Attainment Table
// ============================================================================
const AttainmentTable = ({ attainmentData, title }) => {
  if (!attainmentData || attainmentData.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-blue-800">CO</th>
            <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-blue-800">TMS</th>
            <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-blue-800">TCA</th>
            <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-blue-800">TES</th>
            <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-blue-800">Direct</th>
            <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-blue-800">Final</th>
          </tr>
        </thead>
        <tbody>
          {attainmentData.map((d, i) => (
            <tr key={d.coIdentifier} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-200 px-4 py-2 font-medium text-gray-800">{d.coIdentifier}</td>
              <td className="border border-gray-200 px-4 py-2 text-center">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${d.tmsAttainment >= 2 ? 'bg-green-100 text-green-700' : d.tmsAttainment >= 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {d.tmsAttainment}
                </span>
              </td>
              <td className="border border-gray-200 px-4 py-2 text-center">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${d.tcaAttainment >= 2 ? 'bg-green-100 text-green-700' : d.tcaAttainment >= 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {d.tcaAttainment}
                </span>
              </td>
              <td className="border border-gray-200 px-4 py-2 text-center">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${d.tesAttainment >= 2 ? 'bg-green-100 text-green-700' : d.tesAttainment >= 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {d.tesAttainment}
                </span>
              </td>
              <td className="border border-gray-200 px-4 py-2 text-center font-semibold text-blue-700">{d.directAttainment}</td>
              <td className="border border-gray-200 px-4 py-2 text-center">
                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${d.finalAttainment >= 2 ? 'bg-green-100 text-green-700 border border-green-300' : d.finalAttainment >= 1 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                  {d.finalAttainment}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// Main AttainmentDashboard Component
// ============================================================================
const AttainmentDashboard = () => {
  const [user, setUser] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attainmentData, setAttainmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  // Manual semester and academicYear overrides (since user.classes may not store them)
  const [manualSemester, setManualSemester] = useState('');
  const [manualAcademicYear, setManualAcademicYear] = useState('');
  const YEAR_OPTIONS = ['2020-2021','2021-2022','2022-2023','2023-2024','2024-2025','2025-2026','2026-2027'];


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (e) {
        console.error('Failed to fetch user:', e);
      }
    };
    fetchUser();
  }, []);

  const fetchAttainment = useCallback(async (subject, semOverride, yearOverride) => {
    if (!subject) return;
    setLoading(true);
    setError('');
    const sem = semOverride || subject.semester;
    const yr = yearOverride || subject.academicYear;
    try {
      const res = await api.get(`/api/copo/attainment/${subject.code}`, {
        params: {
          academicYear: yr,
          semester: sem,
          branch: subject.branch,
          section: subject.section
        }
      });
      setAttainmentData(res.data);
    } catch (e) {
      if (e.response?.status === 404) {
        setAttainmentData(null);
        // Not an error — just not calculated yet; show info message
      } else {
        console.error('Failed to fetch attainment:', e);
        setError('Failed to fetch attainment data.');
        setAttainmentData(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);


  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setAttainmentData(null);
    setError('');
    setSuccessMsg('');
    fetchAttainment(subject, manualSemester, manualAcademicYear);
  };


  const handleCalculate = async () => {
    if (!selectedSubject) return;
    setCalculating(true);
    setError('');
    setSuccessMsg('');

    try {
      // Use manual overrides if set
      const sem = manualSemester || selectedSubject.semester;
      const yr = manualAcademicYear || selectedSubject.academicYear;
      // Step 1: Calculate CO attainment
      const coRes = await api.post('/api/copo/calculate-co', {
        facultyId: user?._id,
        subjectCode: selectedSubject.code,
        subjectName: selectedSubject.name,
        academicYear: yr,
        semester: sem,
        branch: selectedSubject.branch,
        section: selectedSubject.section,
        department: user?.department
      });

      // Step 2: Calculate PO attainment
      const poRes = await api.post('/api/copo/calculate-po', {
        subjectCode: selectedSubject.code,
        subjectName: selectedSubject.name,
        academicYear: yr,
        semester: sem,
        branch: selectedSubject.branch,
        section: selectedSubject.section
      });

      setSuccessMsg('Attainment calculated successfully!');
      // Refresh data
      fetchAttainment(selectedSubject, sem, yr);

    } catch (e) {
      setError(e.response?.data?.error || 'Failed to calculate attainment. Make sure assessments and CO-PO mapping exist.');
      console.error('Calculate error:', e);
    } finally {
      setCalculating(false);
    }
  };

  const coData = attainmentData?.coAttainment;
  const poData = attainmentData?.poAttainment;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">COPO Attainment Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Course Outcome & Program Outcome Attainment Analysis</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dashboard" className="text-sm">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="config" className="text-sm">⚙️ Configuration</TabsTrigger>
            <TabsTrigger value="export" className="text-sm">📄 NBA Report</TabsTrigger>
          </TabsList>

          {/* =================== DASHBOARD TAB =================== */}
          <TabsContent value="dashboard">
            {/* Subject Selector */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                {user && (
                  <SubjectSelector
                    user={user}
                    onSubjectSelect={handleSubjectSelect}
                    selectedSubject={selectedSubject}
                  />
                )}
                {/* Manual semester/year overrides (since user.classes may not have these) */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester <span className="text-xs text-gray-400">(override if blank)</span></label>
                    <select
                      value={manualSemester}
                      onChange={e => setManualSemester(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">-- Semester --</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year <span className="text-xs text-gray-400">(override if blank)</span></label>
                    <select
                      value={manualAcademicYear}
                      onChange={e => setManualAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">-- Academic Year --</option>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                {selectedSubject && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 text-sm text-gray-600">
                      <span className="font-medium">{selectedSubject.code}</span> — {selectedSubject.name}
                      <span className="text-gray-400 ml-2">
                        ({selectedSubject.branch} {selectedSubject.section},
                        Sem {manualSemester || selectedSubject.semester || '?'},
                        {manualAcademicYear || selectedSubject.academicYear || '?'})
                      </span>
                    </div>
                    <button
                      onClick={handleCalculate}
                      disabled={calculating || !selectedSubject || !(manualSemester || selectedSubject.semester) || !(manualAcademicYear || selectedSubject.academicYear)}
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                    >
                      {calculating ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Calculating...
                        </span>
                      ) : '🔄 Calculate Attainment'}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>


            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                ⚠️ {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                ✅ {successMsg}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="mt-2 text-gray-500">Loading attainment data...</p>
                </div>
              </div>
            )}

            {!loading && !selectedSubject && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">📊</p>
                <p className="text-lg font-medium">Select a subject to view attainment</p>
                <p className="text-sm mt-1">Choose a class and subject from the dropdown above</p>
              </div>
            )}

            {!loading && selectedSubject && attainmentData && coData && (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    title="Overall CO Attainment"
                    value={coData.overallAttainment?.toFixed(2) || '0'}
                    subtitle="Out of 3.00"
                    color="blue"
                    icon="🎯"
                  />
                  <StatCard
                    title="Overall PO Attainment"
                    value={poData?.overallPoAttainment?.toFixed(2) || '0'}
                    subtitle="Out of 3.00"
                    color="green"
                    icon="📈"
                  />
                  <StatCard
                    title="COs Analyzed"
                    value={coData.attainmentData?.length || 0}
                    subtitle="Course Outcomes"
                    color="purple"
                    icon="📝"
                  />
                  <StatCard
                    title="POs Mapped"
                    value={poData?.poAttainment?.length || 0}
                    subtitle="Program Outcomes"
                    color="amber"
                    icon="🗺️"
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <CoBarChart attainmentData={coData.attainmentData} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <PoRadarChart
                        poAttainment={poData?.poAttainment}
                        psoAttainment={poData?.psoAttainment}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Tables */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <AttainmentTable
                      attainmentData={coData.attainmentData}
                      title="CO Attainment Details"
                    />
                  </CardContent>
                </Card>

                {poData && poData.poAttainment && poData.poAttainment.length > 0 && (
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">PO Attainment Details</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-green-50 to-green-100">
                              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-green-800">PO</th>
                              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-green-800">Attainment</th>
                              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-green-800">Contributing COs</th>
                            </tr>
                          </thead>
                          <tbody>
                            {poData.poAttainment.map((po, i) => (
                              <tr key={po.poIdentifier} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-200 px-4 py-2 font-medium">{po.poIdentifier}</td>
                                <td className="border border-gray-200 px-4 py-2 text-center">
                                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${po.attainmentValue >= 2 ? 'bg-green-100 text-green-700' : po.attainmentValue >= 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {po.attainmentValue}
                                  </span>
                                </td>
                                <td className="border border-gray-200 px-4 py-2 text-gray-600">
                                  {po.contributingCOs?.map(c =>
                                    `${c.coIdentifier}(${c.mappingStrength})`
                                  ).join(', ')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Config Used */}
                {coData.configUsed && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Configuration Used</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-500">Mark Threshold</p>
                          <p className="font-bold text-gray-800">{coData.configUsed.markThresholdPercentage}%</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-500">TCA Weight</p>
                          <p className="font-bold text-gray-800">{coData.configUsed.assessmentWeights?.tca || 0}%</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-500">TMS Weight</p>
                          <p className="font-bold text-gray-800">{coData.configUsed.assessmentWeights?.tms || 0}%</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-500">TES Weight</p>
                          <p className="font-bold text-gray-800">{coData.configUsed.assessmentWeights?.tes || 0}%</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        Calculated at: {new Date(coData.calculatedAt).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!loading && selectedSubject && !attainmentData && !error && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">🔄</p>
                <p className="text-lg font-medium">No attainment data yet</p>
                <p className="text-sm mt-1">Click "Calculate Attainment" to compute CO & PO attainment</p>
              </div>
            )}
          </TabsContent>

          {/* =================== CONFIG TAB =================== */}
          <TabsContent value="config">
            <AttainmentConfig department={user?.department} />
          </TabsContent>

          {/* =================== EXPORT TAB =================== */}
          <TabsContent value="export">
            <NBAReportExport
              user={user}
              selectedSubject={selectedSubject}
              onSubjectSelect={handleSubjectSelect}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AttainmentDashboard;
