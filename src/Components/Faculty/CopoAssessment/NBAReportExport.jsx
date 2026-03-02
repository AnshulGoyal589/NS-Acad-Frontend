import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import api from '../../../utils/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const NBAReportExport = ({ user, selectedSubject, onSubjectSelect }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReportData = async () => {
    if (!selectedSubject) {
      setError('Please select a subject from the Dashboard tab first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/copo/report/${selectedSubject.code}`, {
        params: {
          academicYear: selectedSubject.academicYear,
          semester: selectedSubject.semester,
          branch: selectedSubject.branch,
          section: selectedSubject.section
        }
      });
      setReportData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to fetch report data. Calculate attainment first.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // PDF Export
  // ============================================================================
  const exportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF('l', 'mm', 'a4'); // landscape
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('NBA CO-PO Attainment Report', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Subject: ${reportData.subjectCode} — ${reportData.subjectName}`, 14, y);
    y += 5;
    doc.text(`Branch: ${reportData.branch} | Section: ${reportData.section} | Semester: ${reportData.semester} | Academic Year: ${reportData.academicYear}`, 14, y);
    y += 5;
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
    y += 10;

    // CO-PO Mapping Matrix
    if (reportData.copoMapping && reportData.copoMapping.length > 0) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('1. CO-PO Mapping Matrix', 14, y);
      y += 5;

      const poHeaders = ['CO', ...Array.from({length: 12}, (_, i) => `PO${i+1}`), ...Array.from({length: 4}, (_, i) => `PSO${i+1}`)];
      const mappingRows = reportData.copoMapping.map(co => {
        const row = [co.coIdentifier];
        for (let i = 1; i <= 12; i++) row.push(co[`po${i}`] || '-');
        for (let i = 1; i <= 4; i++) row.push(co[`pso${i}`] || '-');
        return row;
      });

      doc.autoTable({
        head: [poHeaders],
        body: mappingRows,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], fontSize: 7 },
        styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
        columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // CO Attainment Table
    if (reportData.coAttainment && reportData.coAttainment.length > 0) {
      if (y > 170) { doc.addPage(); y = 15; }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('2. CO Attainment', 14, y);
      y += 5;

      const coHeaders = ['CO', 'TMS', 'TCA', 'TES', 'Direct', 'Indirect', 'Final'];
      const coRows = reportData.coAttainment.map(co => [
        co.coIdentifier,
        co.tmsAttainment,
        co.tcaAttainment,
        co.tesAttainment,
        co.directAttainment,
        co.indirectAttainment,
        co.finalAttainment
      ]);
      coRows.push(['Overall', '', '', '', '', '', reportData.overallCoAttainment]);

      doc.autoTable({
        head: [coHeaders],
        body: coRows,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
        columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // PO Attainment Table
    if (reportData.poAttainment && reportData.poAttainment.length > 0) {
      if (y > 170) { doc.addPage(); y = 15; }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('3. PO Attainment', 14, y);
      y += 5;

      const poHeaders = ['PO', 'Attainment', 'Contributing COs'];
      const poRows = reportData.poAttainment.map(po => [
        po.poIdentifier,
        po.attainmentValue,
        (po.contributingCOs || []).map(c => `${c.coIdentifier}(${c.mappingStrength})`).join(', ')
      ]);
      poRows.push(['Overall PO', reportData.overallPoAttainment, '']);

      doc.autoTable({
        head: [poHeaders],
        body: poRows,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'center' } }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // PSO Attainment
    if (reportData.psoAttainment && reportData.psoAttainment.length > 0) {
      if (y > 170) { doc.addPage(); y = 15; }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('4. PSO Attainment', 14, y);
      y += 5;

      const psoHeaders = ['PSO', 'Attainment', 'Contributing COs'];
      const psoRows = reportData.psoAttainment.map(pso => [
        pso.poIdentifier,
        pso.attainmentValue,
        (pso.contributingCOs || []).map(c => `${c.coIdentifier}(${c.mappingStrength})`).join(', ')
      ]);
      psoRows.push(['Overall PSO', reportData.overallPsoAttainment, '']);

      doc.autoTable({
        head: [psoHeaders],
        body: psoRows,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'center' } }
      });
    }

    // Config Used
    if (reportData.configUsed) {
      doc.addPage();
      y = 15;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('5. Configuration Used', 14, y);
      y += 7;
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(`Mark Threshold: ${reportData.configUsed.markThresholdPercentage}%`, 14, y); y += 5;
      doc.text(`Assessment Weights — TCA: ${reportData.configUsed.assessmentWeights?.tca}%, TMS: ${reportData.configUsed.assessmentWeights?.tms}%, TES: ${reportData.configUsed.assessmentWeights?.tes}%`, 14, y); y += 5;
      doc.text(`Direct Weight: ${reportData.configUsed.directWeight}% | Indirect Weight: ${reportData.configUsed.indirectWeight}%`, 14, y); y += 5;
      const levels = reportData.configUsed.attainmentLevels || [];
      levels.forEach(l => {
        doc.text(`Level ${l.level}: ≥ ${l.minStudentPercentage}% students`, 14, y); y += 5;
      });
    }

    doc.save(`NBA_Report_${reportData.subjectCode}_${reportData.academicYear}.pdf`);
  };

  // ============================================================================
  // Excel Export
  // ============================================================================
  const exportExcel = () => {
    if (!reportData) return;

    const wb = XLSX.utils.book_new();

    // Sheet 1: CO-PO Mapping
    if (reportData.copoMapping && reportData.copoMapping.length > 0) {
      const mappingData = reportData.copoMapping.map(co => {
        const row = { CO: co.coIdentifier };
        for (let i = 1; i <= 12; i++) row[`PO${i}`] = co[`po${i}`] || 0;
        for (let i = 1; i <= 4; i++) row[`PSO${i}`] = co[`pso${i}`] || 0;
        return row;
      });
      const ws1 = XLSX.utils.json_to_sheet(mappingData);
      XLSX.utils.book_append_sheet(wb, ws1, 'CO-PO Mapping');
    }

    // Sheet 2: CO Attainment
    if (reportData.coAttainment && reportData.coAttainment.length > 0) {
      const coData = reportData.coAttainment.map(co => ({
        CO: co.coIdentifier,
        TMS_Attainment: co.tmsAttainment,
        TCA_Attainment: co.tcaAttainment,
        TES_Attainment: co.tesAttainment,
        Direct_Attainment: co.directAttainment,
        Indirect_Attainment: co.indirectAttainment,
        Final_Attainment: co.finalAttainment,
        TMS_Students_Above: co.stats?.tms?.studentsAboveThreshold || 0,
        TMS_Total_Students: co.stats?.tms?.totalStudents || 0,
        TMS_Percentage: co.stats?.tms?.percentageAboveThreshold || 0,
        TCA_Students_Above: co.stats?.tca?.studentsAboveThreshold || 0,
        TCA_Total_Students: co.stats?.tca?.totalStudents || 0,
        TCA_Percentage: co.stats?.tca?.percentageAboveThreshold || 0,
        TES_Students_Above: co.stats?.tes?.studentsAboveThreshold || 0,
        TES_Total_Students: co.stats?.tes?.totalStudents || 0,
        TES_Percentage: co.stats?.tes?.percentageAboveThreshold || 0,
      }));
      coData.push({ CO: 'Overall', Final_Attainment: reportData.overallCoAttainment });
      const ws2 = XLSX.utils.json_to_sheet(coData);
      XLSX.utils.book_append_sheet(wb, ws2, 'CO Attainment');
    }

    // Sheet 3: PO Attainment
    if (reportData.poAttainment && reportData.poAttainment.length > 0) {
      const poData = reportData.poAttainment.map(po => ({
        PO: po.poIdentifier,
        Attainment: po.attainmentValue,
        Contributing_COs: (po.contributingCOs || []).map(c => `${c.coIdentifier}(${c.mappingStrength})`).join(', ')
      }));
      poData.push({ PO: 'Overall', Attainment: reportData.overallPoAttainment });
      const ws3 = XLSX.utils.json_to_sheet(poData);
      XLSX.utils.book_append_sheet(wb, ws3, 'PO Attainment');
    }

    // Sheet 4: PSO Attainment
    if (reportData.psoAttainment && reportData.psoAttainment.length > 0) {
      const psoData = reportData.psoAttainment.map(pso => ({
        PSO: pso.poIdentifier,
        Attainment: pso.attainmentValue,
        Contributing_COs: (pso.contributingCOs || []).map(c => `${c.coIdentifier}(${c.mappingStrength})`).join(', ')
      }));
      psoData.push({ PSO: 'Overall', Attainment: reportData.overallPsoAttainment });
      const ws4 = XLSX.utils.json_to_sheet(psoData);
      XLSX.utils.book_append_sheet(wb, ws4, 'PSO Attainment');
    }

    XLSX.writeFile(wb, `NBA_Report_${reportData.subjectCode}_${reportData.academicYear}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">NBA Report Export</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Generate comprehensive NBA accreditation reports including CO-PO mapping, attainment tables, and statistics.
          </p>

          {!selectedSubject && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm">
              ⚠️ Please select a subject from the <strong>Dashboard</strong> tab first, then return here to generate the report.
            </div>
          )}

          {selectedSubject && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                <span className="font-semibold text-gray-800">{selectedSubject.code}</span> — {selectedSubject.name}
                <span className="text-gray-400 ml-2">
                  ({selectedSubject.branch} {selectedSubject.section}, Sem {selectedSubject.semester})
                </span>
              </div>
              <button
                onClick={fetchReportData}
                disabled={loading}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all text-sm font-medium"
              >
                {loading ? 'Loading...' : '📋 Load Report Data'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Preview & Export */}
      {reportData && (
        <>
          {/* Export Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={exportPDF}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all text-sm font-medium flex items-center gap-2"
                >
                  📄 Export as PDF
                </button>
                <button
                  onClick={exportExcel}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all text-sm font-medium flex items-center gap-2"
                >
                  📊 Export as Excel
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Preview: CO-PO Mapping */}
          {reportData.copoMapping && reportData.copoMapping.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CO-PO Mapping Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="border border-gray-200 px-2 py-2 text-left font-semibold">CO</th>
                        {Array.from({length: 12}, (_, i) => (
                          <th key={`po${i+1}`} className="border border-gray-200 px-2 py-2 text-center font-semibold">PO{i+1}</th>
                        ))}
                        {Array.from({length: 4}, (_, i) => (
                          <th key={`pso${i+1}`} className="border border-gray-200 px-2 py-2 text-center font-semibold bg-purple-50">PSO{i+1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.copoMapping.map((co, idx) => (
                        <tr key={co.coIdentifier} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-200 px-2 py-1 font-medium">{co.coIdentifier}</td>
                          {Array.from({length: 12}, (_, i) => {
                            const val = co[`po${i+1}`] || 0;
                            return (
                              <td key={i} className={`border border-gray-200 px-2 py-1 text-center ${val === 3 ? 'bg-green-100 font-bold' : val === 2 ? 'bg-yellow-50' : val === 1 ? 'bg-orange-50' : ''}`}>
                                {val || '-'}
                              </td>
                            );
                          })}
                          {Array.from({length: 4}, (_, i) => {
                            const val = co[`pso${i+1}`] || 0;
                            return (
                              <td key={`pso${i}`} className={`border border-gray-200 px-2 py-1 text-center ${val > 0 ? 'bg-purple-50' : ''}`}>
                                {val || '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview: CO Attainment */}
          {reportData.coAttainment && reportData.coAttainment.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CO Attainment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="border border-gray-200 px-3 py-2 text-left">CO</th>
                        <th className="border border-gray-200 px-3 py-2 text-center">TMS</th>
                        <th className="border border-gray-200 px-3 py-2 text-center">TCA</th>
                        <th className="border border-gray-200 px-3 py-2 text-center">TES</th>
                        <th className="border border-gray-200 px-3 py-2 text-center">Direct</th>
                        <th className="border border-gray-200 px-3 py-2 text-center font-bold">Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.coAttainment.map((co, i) => (
                        <tr key={co.coIdentifier} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-200 px-3 py-1 font-medium">{co.coIdentifier}</td>
                          <td className="border border-gray-200 px-3 py-1 text-center">{co.tmsAttainment}</td>
                          <td className="border border-gray-200 px-3 py-1 text-center">{co.tcaAttainment}</td>
                          <td className="border border-gray-200 px-3 py-1 text-center">{co.tesAttainment}</td>
                          <td className="border border-gray-200 px-3 py-1 text-center">{co.directAttainment}</td>
                          <td className="border border-gray-200 px-3 py-1 text-center font-bold">{co.finalAttainment}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-bold">
                        <td className="border border-gray-200 px-3 py-2">Overall</td>
                        <td colSpan={4} className="border border-gray-200"></td>
                        <td className="border border-gray-200 px-3 py-2 text-center text-blue-700">{reportData.overallCoAttainment}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview: PO Attainment */}
          {reportData.poAttainment && reportData.poAttainment.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">PO Attainment Summary (Overall: {reportData.overallPoAttainment})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {reportData.poAttainment.map(po => (
                    <div key={po.poIdentifier} className={`rounded-lg p-3 text-center border ${po.attainmentValue >= 2 ? 'bg-green-50 border-green-200' : po.attainmentValue >= 1 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-xs font-medium text-gray-500">{po.poIdentifier}</p>
                      <p className={`text-2xl font-bold ${po.attainmentValue >= 2 ? 'text-green-700' : po.attainmentValue >= 1 ? 'text-yellow-700' : 'text-red-700'}`}>
                        {po.attainmentValue}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default NBAReportExport;
