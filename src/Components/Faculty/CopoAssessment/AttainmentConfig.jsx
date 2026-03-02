import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import api from '../../../utils/api';

const AttainmentConfig = ({ department }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [academicYear, setAcademicYear] = useState('2024-2025');

  useEffect(() => {
    fetchConfig();
  }, [department, academicYear]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/copo/config', {
        params: { department: department || 'default', academicYear }
      });
      setConfig(res.data);
    } catch (e) {
      console.error('Failed to fetch config:', e);
      setConfig({
        markThresholdPercentage: 50,
        attainmentLevels: [
          { level: 3, minStudentPercentage: 70 },
          { level: 2, minStudentPercentage: 60 },
          { level: 1, minStudentPercentage: 50 }
        ],
        assessmentWeights: { tca: 40, tms: 20, tes: 40 },
        directWeight: 80,
        indirectWeight: 20
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/api/copo/config', {
        department: department || 'default',
        academicYear,
        markThresholdPercentage: config.markThresholdPercentage,
        attainmentLevels: config.attainmentLevels,
        assessmentWeights: config.assessmentWeights,
        directWeight: config.directWeight,
        indirectWeight: config.indirectWeight
      });
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const updateLevel = (levelNum, value) => {
    setConfig(prev => ({
      ...prev,
      attainmentLevels: prev.attainmentLevels.map(l =>
        l.level === levelNum ? { ...l, minStudentPercentage: Number(value) } : l
      )
    }));
  };

  const updateWeight = (key, value) => {
    setConfig(prev => ({
      ...prev,
      assessmentWeights: { ...prev.assessmentWeights, [key]: Number(value) }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!config) return null;

  const totalWeight = (config.assessmentWeights?.tca || 0) + (config.assessmentWeights?.tms || 0) + (config.assessmentWeights?.tes || 0);
  const directIndirectSum = (config.directWeight || 0) + (config.indirectWeight || 0);

  return (
    <div className="space-y-6">
      {/* Academic Year */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-2">
            <label className="text-sm font-medium text-gray-700 min-w-[120px]">Academic Year</label>
            <select
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </select>
            <span className="text-sm text-gray-500">Department: {department || 'default'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Mark Threshold */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mark Threshold</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            A student must score ≥ this percentage of max marks for a CO to be counted as "attained".
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={config.markThresholdPercentage}
              onChange={e => setConfig(p => ({ ...p, markThresholdPercentage: Number(e.target.value) }))}
              className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="w-16 text-center text-lg font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
              {config.markThresholdPercentage}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Attainment Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attainment Level Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            If ≥ X% of students clear the mark threshold → that attainment level is assigned.
          </p>
          <div className="space-y-4">
            {config.attainmentLevels?.sort((a, b) => b.level - a.level).map(lvl => (
              <div key={lvl.level} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${
                  lvl.level === 3 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  lvl.level === 2 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  L{lvl.level}
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={lvl.minStudentPercentage}
                    onChange={e => updateLevel(lvl.level, e.target.value)}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                      lvl.level === 3 ? 'accent-green-600 bg-green-200' :
                      lvl.level === 2 ? 'accent-yellow-600 bg-yellow-200' :
                      'accent-red-600 bg-red-200'
                    }`}
                  />
                </div>
                <span className="w-16 text-center font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                  ≥{lvl.minStudentPercentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Assessment Type Weights
            <span className={`text-sm font-normal px-3 py-1 rounded-full ${totalWeight === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              Total: {totalWeight}% {totalWeight === 100 ? '✓' : '(must be 100)'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'tca', label: 'TCA (Class Tests)', color: 'blue' },
              { key: 'tms', label: 'TMS (Tutorial/Mini-Project/Surprise)', color: 'purple' },
              { key: 'tes', label: 'TES (End Semester)', color: 'amber' }
            ].map(item => (
              <div key={item.key} className="flex items-center gap-4">
                <span className="w-48 text-sm font-medium text-gray-700">{item.label}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={config.assessmentWeights?.[item.key] || 0}
                  onChange={e => updateWeight(item.key, e.target.value)}
                  className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-${item.color}-600 bg-${item.color}-200`}
                />
                <span className="w-16 text-center font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                  {config.assessmentWeights?.[item.key] || 0}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Direct vs Indirect */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Direct vs Indirect Attainment
            <span className={`text-sm font-normal px-3 py-1 rounded-full ${directIndirectSum === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              Total: {directIndirectSum}% {directIndirectSum === 100 ? '✓' : '(must be 100)'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-48 text-sm font-medium text-gray-700">Direct (Assessments)</span>
              <input
                type="range" min={0} max={100} step={5}
                value={config.directWeight || 80}
                onChange={e => setConfig(p => ({ ...p, directWeight: Number(e.target.value), indirectWeight: 100 - Number(e.target.value) }))}
                className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="w-16 text-center font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                {config.directWeight}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-48 text-sm font-medium text-gray-700">Indirect (Surveys)</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-lg"></div>
              <span className="w-16 text-center font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                {config.indirectWeight}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {message.text && (
          <div className={`px-4 py-2 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving || totalWeight !== 100}
          className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
        >
          {saving ? 'Saving...' : '💾 Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default AttainmentConfig;
