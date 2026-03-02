import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../utils/api';

const poHeaders = [
    'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8',
    'PO9', 'PO10', 'PO11', 'PO12', 'PSO1', 'PSO2', 'PSO3', 'PSO4'
];

// Color helper for mapping strength
const strengthColor = (v) => {
    if (v === 3) return 'bg-green-100 text-green-800 font-bold';
    if (v === 2) return 'bg-yellow-100 text-yellow-700 font-semibold';
    if (v === 1) return 'bg-blue-50 text-blue-700';
    return 'text-gray-300';
};

const CoPoMappingTable = ({ subjectCode }) => {
    const [mappingData, setMappingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!subjectCode) {
            setMappingData(null);
            setError(null);
            return;
        }

        const fetchMapping = async () => {
            setLoading(true);
            setError(null);
            setMappingData(null);
            try {
                const response = await api.get(`/read/co-po-mappings?subjectCode=${encodeURIComponent(subjectCode)}`);
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    setMappingData(response.data[0]);
                } else {
                    setError(`No CO-PO mapping saved yet for ${subjectCode}. Create one below.`);
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    setError(`No CO-PO mapping saved yet for ${subjectCode}. Create one below.`);
                } else {
                    setError('Failed to load mapping. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMapping();
    }, [subjectCode]);

    const averages = useMemo(() => {
        const avgResult = {};
        const outcomes = mappingData?.courseOutcomes || [];
        poHeaders.forEach(header => {
            const key = header.toLowerCase();
            const sum = outcomes.reduce((s, o) => {
                const v = o[key];
                return s + (typeof v === 'number' && !isNaN(v) ? v : 0);
            }, 0);
            avgResult[key] = outcomes.length > 0 ? (sum / outcomes.length).toFixed(1) : '0.0';
        });
        return avgResult;
    }, [mappingData?.courseOutcomes]);

    if (!subjectCode) return null;

    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>🗺️</span> Existing CO-PO Mapping
                    {mappingData && (
                        <span className="ml-2 text-xs font-normal text-gray-500">
                            ({mappingData.subjectCode} · {mappingData.academicYear} · Sem {mappingData.semester})
                        </span>
                    )}
                </h3>
                {loading && (
                    <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
            </div>

            {error && !loading && (
                <div className="px-4 py-3 text-sm text-amber-700 bg-amber-50 flex items-center gap-2">
                    <span>ℹ️</span> {error}
                </div>
            )}

            {mappingData && !loading && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-xs">
                        <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                            <tr>
                                <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 sticky left-0 bg-indigo-50 min-w-[120px]">CO</th>
                                {poHeaders.map(h => (
                                    <th key={h} className="border border-gray-200 px-2 py-2 text-center font-semibold text-gray-600 min-w-[44px]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(mappingData.courseOutcomes || []).map((co, i) => (
                                <tr key={co._id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="border border-gray-200 px-3 py-1.5 font-semibold text-gray-800 sticky left-0 bg-white">{co.coIdentifier}</td>
                                    {poHeaders.map(h => {
                                        const v = co[h.toLowerCase()] ?? 0;
                                        return (
                                            <td key={h} className={`border border-gray-200 px-2 py-1.5 text-center ${strengthColor(v)}`}>
                                                {v > 0 ? v : '—'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            <tr className="bg-indigo-50 font-semibold">
                                <td className="border border-gray-200 px-3 py-1.5 text-gray-700 italic">Average</td>
                                {poHeaders.map(h => (
                                    <td key={h} className="border border-gray-200 px-2 py-1.5 text-center text-indigo-700 font-bold">
                                        {averages[h.toLowerCase()]}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CoPoMappingTable;
