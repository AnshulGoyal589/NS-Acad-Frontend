import React, { useState, useEffect } from 'react';
import CoPoMappingForm from "./CoPoMappingForm";
import CoPoMappingTable from "./CoPoMappingTable";
import AssessmentGrid from './AssessmentGrid';
import api from '../../../utils/api';

// ─── Step indicator ─────────────────────────────────────────────────────────
const StepBadge = ({ step, label, current, done }) => (
  <div className={`flex items-center gap-2 text-sm font-medium transition-all ${current ? 'text-blue-700' : done ? 'text-green-600' : 'text-gray-400'}`}>
    <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 font-bold transition-all
      ${current ? 'border-blue-600 bg-blue-600 text-white shadow-md' :
        done ? 'border-green-500 bg-green-500 text-white' :
        'border-gray-300 bg-gray-100 text-gray-400'}`}>
      {done ? '✓' : step}
    </div>
    <span className="hidden sm:inline">{label}</span>
  </div>
);

const StepDivider = ({ done }) => (
  <div className={`flex-1 h-0.5 mx-1 transition-all ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
);

// ─── Main Component ──────────────────────────────────────────────────────────
const AssessmentForm = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  // Resolved subject info passed to children
  const [resolvedSubject, setResolvedSubject] = useState(null);

  // Step 3 state
  const [activeAssessmentTab, setActiveAssessmentTab] = useState('tms');

  // Key to force CoPoMappingTable re-fetch after saving
  const [mappingRefreshKey, setMappingRefreshKey] = useState(0);
  const handleMappingSaved = () => setMappingRefreshKey(k => k + 1);

  // ─── Fetch user ─────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoadingUser(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (e) {
        console.error('Failed to fetch user:', e);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // ─── Derive classes ─────────────────────────────────────────────────────
  const userClasses = user?.classes || [];
  const uniqueClassKeys = [...new Set(userClasses.map(c => `${c.branch}|${c.section}`))];
  const subjectsForClass = selectedClass
    ? (userClasses.find(c => `${c.branch}|${c.section}` === selectedClass)?.subjects || [])
    : [];
  const selectedClassObj = userClasses.find(c => `${c.branch}|${c.section}` === selectedClass);

  useEffect(() => {
    if (selectedClassObj) {
      if (selectedClassObj.semester) setSemester(String(selectedClassObj.semester));
      if (selectedClassObj.academicYear) setAcademicYear(selectedClassObj.academicYear);
    }
  }, [selectedClass]);

  // ─── Step 1 → 2 ─────────────────────────────────────────────────────────
  const handleProceedToMapping = () => {
    const [branch, section] = selectedClass.split('|');
    const subjectObj = subjectsForClass.find(s => s.code === selectedSubjectCode);
    setResolvedSubject({
      code: selectedSubjectCode,
      name: subjectObj?.name || selectedSubjectCode,
      branch,
      section,
      semester: parseInt(semester, 10),
      academicYear,
    });
    setCurrentStep(2);
  };

  const step1Valid = selectedClass && selectedSubjectCode && semester && academicYear;

  // ─── Loading screen ─────────────────────────────────────────────────────
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-blue-500 mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 font-medium">Loading your data…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-500">
          <p className="font-semibold text-lg">Not logged in</p>
          <p className="text-sm mt-1">Please log in to access the assessment form.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">📋</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">COPO Assessment Entry</h1>
              <p className="text-sm text-gray-500">Enter CO-PO mappings and student marks for attainment calculation</p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8 bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100">
          <StepBadge step={1} label="Select Subject" current={currentStep === 1} done={currentStep > 1} />
          <StepDivider done={currentStep > 1} />
          <StepBadge step={2} label="CO-PO Mapping" current={currentStep === 2} done={currentStep > 2} />
          <StepDivider done={currentStep > 2} />
          <StepBadge step={3} label="Enter Marks" current={currentStep === 3} done={currentStep > 3} />
        </div>

        {/* ═══════════════════════ STEP 1 ═══════════════════════ */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>🎓</span> Step 1: Select Class &amp; Subject
              </h2>
              <p className="text-blue-100 text-sm mt-0.5">Choose the class you are teaching and the subject to assess</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={e => { setSelectedClass(e.target.value); setSelectedSubjectCode(''); }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  >
                    <option value="">-- Select Class --</option>
                    {uniqueClassKeys.map(key => {
                      const [br, sec] = key.split('|');
                      return <option key={key} value={key}>{br} — Section {sec}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSubjectCode}
                    onChange={e => setSelectedSubjectCode(e.target.value)}
                    disabled={!selectedClass}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select Subject --</option>
                    {subjectsForClass.map(s => (
                      <option key={s.code} value={s.code}>{s.code} — {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={semester}
                    onChange={e => setSemester(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all appearance-none"
                  >
                    <option value="">-- Select Semester --</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all appearance-none"
                  >
                    <option value="">-- Select Academic Year --</option>
                    {["2020-2021","2021-2022","2022-2023","2023-2024","2024-2025","2025-2026","2026-2027"].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedSubjectCode && semester && academicYear && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-blue-500 text-xl">ℹ️</span>
                  <div className="text-sm text-blue-800">
                    <strong>{selectedSubjectCode}</strong> — {subjectsForClass.find(s => s.code === selectedSubjectCode)?.name}
                    <span className="text-blue-500 mx-2">·</span>
                    {selectedClass.replace('|', ' Sec ')} · Sem {semester} · {academicYear}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleProceedToMapping}
                  disabled={!step1Valid}
                  className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  Next: CO-PO Mapping →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════ STEP 2 ═══════════════════════ */}
        {currentStep === 2 && resolvedSubject && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>🗺️</span> Step 2: CO-PO Mapping
              </h2>
              <p className="text-indigo-100 text-sm mt-0.5">
                {resolvedSubject.code} — {resolvedSubject.name} · {resolvedSubject.branch} Sec {resolvedSubject.section} · Sem {resolvedSubject.semester} · {resolvedSubject.academicYear}
              </p>
            </div>

            <div className="p-6">
              {/* Auto-loading mapping table */}
              <CoPoMappingTable
                key={`${resolvedSubject.code}-${mappingRefreshKey}`}
                subjectCode={resolvedSubject.code}
              />

              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Create / Update Mapping</h3>
                <CoPoMappingForm
                  facultyId={user._id}
                  subject={resolvedSubject}
                  onSaved={handleMappingSaved}
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                  Next: Enter Marks →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════ STEP 3 ═══════════════════════ */}
        {currentStep === 3 && resolvedSubject && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>📝</span> Step 3: Enter Assessment Marks
              </h2>
              <p className="text-emerald-100 text-sm mt-0.5">
                {resolvedSubject.code} — {resolvedSubject.name} · Sem {resolvedSubject.semester} · {resolvedSubject.academicYear}
              </p>
            </div>

            <div className="p-6">
              {/* Assessment tabs */}
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                {[
                  { key: 'tms', label: '📊 TMS', sub: 'Mid Sem' },
                  { key: 'tca', label: '📝 TCA', sub: 'Continuous' },
                  { key: 'tes', label: '📋 TES', sub: 'End Sem' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveAssessmentTab(tab.key)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeAssessmentTab === tab.key
                        ? 'bg-white shadow text-blue-700 font-semibold'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    <span className="hidden md:inline text-xs ml-1 opacity-70">({tab.sub})</span>
                  </button>
                ))}
              </div>

              {/* Download tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 mt-0.5">💡</span>
                  <div className="text-sm text-amber-800">
                    <strong>Tip:</strong> Upload a CSV/Excel with <code>Roll No</code> and <code>Name</code> columns to populate the student list automatically.
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a href="/sample_tms_marks.csv" download className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-800 font-medium text-xs transition-all no-underline">
                        📊 TMS Sample CSV
                      </a>
                      <a href="/sample_tca_marks.csv" download className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-800 font-medium text-xs transition-all no-underline">
                        📝 TCA Sample CSV
                      </a>
                      <a href="/sample_tes_marks.csv" download className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-800 font-medium text-xs transition-all no-underline">
                        📋 TES Sample CSV
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* AssessmentGrid — all required props passed explicitly */}
              {activeAssessmentTab === 'tms' && (
                <AssessmentGrid
                  key={`tms-${resolvedSubject.code}-${resolvedSubject.branch}-${resolvedSubject.section}-${resolvedSubject.semester}`}
                  type="tms"
                  tmsType="Tutorial"
                  facultyId={user._id}
                  subjectCode={resolvedSubject.code}
                  subjectName={resolvedSubject.name}
                  branch={resolvedSubject.branch}
                  section={resolvedSubject.section}
                  semester={resolvedSubject.semester}
                  academicYear={resolvedSubject.academicYear}
                />
              )}
              {activeAssessmentTab === 'tca' && (
                <AssessmentGrid
                  key={`tca-${resolvedSubject.code}-${resolvedSubject.branch}-${resolvedSubject.section}-${resolvedSubject.semester}`}
                  type="tca"
                  facultyId={user._id}
                  subjectCode={resolvedSubject.code}
                  subjectName={resolvedSubject.name}
                  branch={resolvedSubject.branch}
                  section={resolvedSubject.section}
                  semester={resolvedSubject.semester}
                  academicYear={resolvedSubject.academicYear}
                />
              )}
              {activeAssessmentTab === 'tes' && (
                <AssessmentGrid
                  key={`tes-${resolvedSubject.code}-${resolvedSubject.branch}-${resolvedSubject.section}-${resolvedSubject.semester}`}
                  type="tes"
                  facultyId={user._id}
                  subjectCode={resolvedSubject.code}
                  subjectName={resolvedSubject.name}
                  branch={resolvedSubject.branch}
                  section={resolvedSubject.section}
                  semester={resolvedSubject.semester}
                  academicYear={resolvedSubject.academicYear}
                />
              )}

              <div className="flex items-center justify-between pt-6 border-t mt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  ← Back to Mapping
                </button>
                <a
                  href="/copo/dashboard"
                  className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-2 no-underline"
                >
                  View Attainment Dashboard →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentForm;
