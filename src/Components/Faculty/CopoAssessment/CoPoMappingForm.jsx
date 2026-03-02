import React, { useState, useRef } from 'react';
import CourseOutcomeMappingRow from './CourseOutcomeMappingRow';
import api from '../../../utils/api';


// Define the POs and PSOs for table headers
const POS_Headers = Array.from({ length: 12 }, (_, i) => `PO${i + 1}`);
const PSOS_Headers = Array.from({ length: 4 }, (_, i) => `PSO${i + 1}`);

// --- Default empty state for a new CO row ---
const createDefaultOutcome = () => ({
    coIdentifier: '',
    po1: 0, po2: 0, po3: 0, po4: 0, po5: 0, po6: 0,
    po7: 0, po8: 0, po9: 0, po10: 0, po11: 0, po12: 0,
    pso1: 0, pso2: 0, pso3: 0, pso4: 0,
});
// --- ---

function CoPoMappingForm({ facultyId, subject, onSaved }) {
    const [courseOutcomes, setCourseOutcomes] = useState([createDefaultOutcome()]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [csvError, setCsvError] = useState('');
    const csvInputRef = useRef(null);

    // ── CSV Upload: parse mapping CSV ────────────────────────────────────────
    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCsvError('');
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const text = evt.target.result;
                const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
                if (lines.length < 2) { setCsvError('CSV must have a header row and at least one data row.'); return; }

                // Parse header (normalize: lowercase, strip spaces)
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
                const coIdxMap = {
                    co: headers.findIndex(h => h === 'co_identifier' || h === 'co'),
                };
                const poKeys = ['po1','po2','po3','po4','po5','po6','po7','po8','po9','po10','po11','po12'];
                const psoKeys = ['pso1','pso2','pso3','pso4'];

                if (coIdxMap.co === -1) { setCsvError('Missing "CO Identifier" column in CSV.'); return; }

                const parsed = lines.slice(1).map(line => {
                    const cols = line.split(',').map(c => c.trim());
                    const row = createDefaultOutcome();
                    row.coIdentifier = cols[coIdxMap.co] || '';
                    [...poKeys, ...psoKeys].forEach(key => {
                        const idx = headers.indexOf(key);
                        if (idx !== -1) row[key] = Math.min(3, Math.max(0, Number(cols[idx]) || 0));
                    });
                    return row;
                }).filter(r => r.coIdentifier);

                if (parsed.length === 0) { setCsvError('No valid CO rows found in CSV.'); return; }
                setCourseOutcomes(parsed);
                setCsvError('');
            } catch {
                setCsvError('Failed to parse CSV. Please use the correct format.');
            } finally {
                if (csvInputRef.current) csvInputRef.current.value = null;
            }
        };
        reader.readAsText(file);
    };


    // --- Handlers and Validation (mostly unchanged logic) ---
    const handleCourseOutcomeChange = (index, name, value) => {
        const updatedOutcomes = courseOutcomes.map((outcome, i) => {
            if (i === index) {
                return { ...outcome, [name]: value };
            }
            return outcome;
        });
        setCourseOutcomes(updatedOutcomes);
    };

    const addCourseOutcomeRow = () => {
        setCourseOutcomes([...courseOutcomes, createDefaultOutcome()]);
    };

    const removeCourseOutcomeRow = (index) => {
        if (courseOutcomes.length <= 1) {
             setError("At least one Course Outcome mapping is required.");
             setTimeout(() => setError(''), 3000);
             return;
        }
        const updatedOutcomes = courseOutcomes.filter((_, i) => i !== index);
        setCourseOutcomes(updatedOutcomes);
    };

     const validateForm = () => {
         if (!facultyId || !subject) {
            return "Please select a subject first.";
        }
        if (!courseOutcomes || courseOutcomes.length === 0) {
            return "At least one Course Outcome mapping row is required.";
        }
        for(const outcome of courseOutcomes) {
            if (!outcome.coIdentifier || outcome.coIdentifier.trim() === '') {
                return `Row ${courseOutcomes.indexOf(outcome) + 1} must have a CO Identifier (e.g., CO1).`;
            }
        }
        return null; // No validation errors
    }


    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        const validationError = validateForm();
         if (validationError) {
             setError(validationError);
             return;
         }

        const finalSemester = parseInt(subject.semester, 10);

        const formData = {
            facultyId, 
            subjectCode: subject.code, 
            subjectName: subject.name, 
            academicYear: subject.academicYear,
            semester: finalSemester, 
            branch: subject.branch, 
            section: subject.section,
            courseOutcomes: courseOutcomes.map(co => ({
                ...co,
                po1: Number(co.po1 ?? 0), po2: Number(co.po2 ?? 0), po3: Number(co.po3 ?? 0),
                po4: Number(co.po4 ?? 0), po5: Number(co.po5 ?? 0), po6: Number(co.po6 ?? 0),
                po7: Number(co.po7 ?? 0), po8: Number(co.po8 ?? 0), po9: Number(co.po9 ?? 0),
                po10: Number(co.po10 ?? 0), po11: Number(co.po11 ?? 0), po12: Number(co.po12 ?? 0),
                pso1: Number(co.pso1 ?? 0), pso2: Number(co.pso2 ?? 0), pso3: Number(co.pso3 ?? 0),
                pso4: Number(co.pso4 ?? 0),
            })),
        };

        console.log('Submitting data:', JSON.stringify(formData, null, 2));
 
        try {
           
            console.log('Payload:', JSON.stringify(formData, null, 2));

             
            const response = await api.post('/save/co-po-mappings', formData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('API Response:', response.data);
            setSuccessMessage(response.data.message || 'CO-PO Mapping saved successfully!');
            if (onSaved) onSaved(); // Notify parent to refresh the table


            // Optionally reset the form after successful submission
            // setFacultyId('');
            // setSubjectCode('');
            // setSubjectName('');
            // setAcademicYear('');
            // setSemester('');
            // setBranch('');
            // setSection('');
            // setCourseOutcomes([createDefaultOutcome()]);
            // setError(''); // Clear any previous errors

        } catch (err) {
            console.error("Submission failed:", err);
            let errorMessage = 'Submission failed. Please try again.'; // Default error

            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error Response Data:', err.response.data);
                console.error('Error Response Status:', err.response.status);
                // Use the error message from the backend if available
                errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
                if (err.response.data?.errors) {
                     errorMessage += ` Details: ${err.response.data.errors.join(', ')}`;
                }
            } else if (err.request) {
                // The request was made but no response was received
                console.error('Error Request:', err.request);
                errorMessage = 'No response received from the server. Is it running?';
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error Message:', err.message);
                errorMessage = `An error occurred: ${err.message}`;
            }
            setError(errorMessage);
            setSuccessMessage(''); // Clear any previous success message
        } finally {
            setIsLoading(false); // Stop loading indicator regardless of success/failure
        }
    };

    // --- Tailwind Classes for Inputs/Labels ---
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const numberInputClass = `${inputClass} appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;

    return (
        // Overall Form Container
        <form
            onSubmit={handleSubmit}
            className="max-w-7xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-6" // Added space-y for spacing sections
        >
            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">
                Course Outcome - Program Outcome Mapping
            </h2>

            {/* Error and Success Messages */}
            {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">
                    <span className="font-medium">Error!</span> {error}
                </div>
            )}
            {successMessage && (
                 <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-300" role="alert">
                    <span className="font-medium">Success!</span> {successMessage}
                </div>
            )}

            {/* Course Details Section - Now Read Only */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">Course Details</h3>
                <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</span>
                        <span className="mt-1 flex text-sm text-gray-900 font-semibold">{subject?.code} - {subject?.name}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Class</span>
                        <span className="mt-1 flex text-sm text-gray-900">{subject?.branch} {subject?.section} (Sem {subject?.semester})</span>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</span>
                        <span className="mt-1 flex text-sm text-gray-900">{subject?.academicYear}</span>
                    </div>
                </div>
            </div>

            {/* CO Mappings Section */}
            <div className="space-y-4">
                 <h3 className="text-lg font-medium leading-6 text-gray-900">
                    CO Mappings <span className="text-sm font-normal text-gray-500">(0=No Correlation, 1=Low, 2=Medium, 3=High)</span>
                </h3>
                 {/* Table Container with Horizontal Scroll */}
                 <div className="overflow-x-auto border border-gray-200 rounded-md">
                     <table className="min-w-full divide-y divide-gray-200 border-collapse">
                        {/* Table Header */}
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-100 z-10 border-r border-gray-300 w-[100px]"> {/* Sticky CO */}
                                    CO
                                </th>
                                {POS_Headers.map(po => (
                                     <th key={po} scope="col" className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[55px]">
                                        {po}
                                    </th>
                                ))}
                                {PSOS_Headers.map(pso => (
                                     <th key={pso} scope="col" className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[55px]">
                                        {pso}
                                    </th>
                                ))}
                                <th scope="col" className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-[90px]">
                                    Action
                                </th>
                            </tr>
                        </thead>
                         {/* Table Body */}
                         <tbody className="bg-white divide-y divide-gray-200">
                            {courseOutcomes.map((outcome, index) => (
                                <CourseOutcomeMappingRow
                                    key={index} // Consider using a more stable unique ID if available
                                    index={index}
                                    outcomeData={outcome}
                                    onChange={handleCourseOutcomeChange}
                                    onRemove={removeCourseOutcomeRow}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Toolbar: Add Row | Upload CSV | Download Sample */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                    <button
                        type="button"
                        onClick={addCourseOutcomeRow}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                    >
                        + Add CO Row
                    </button>

                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition select-none">
                        📂 Upload Mapping CSV
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={csvInputRef}
                            onChange={handleCSVUpload}
                        />
                    </label>

                    <a
                        href="/sample_copo_mapping.csv"
                        download
                        className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-600 hover:bg-gray-100 transition no-underline"
                    >
                        ⬇ Sample CSV
                    </a>

                    {csvError && <p className="text-xs text-red-600 w-full mt-1">⚠️ {csvError}</p>}
                </div>
            </div>

            {/* Form Actions (Submit Button) */}
            <div className="pt-5 border-t border-gray-200">
                 <div className="flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                        Save Mapping
                    </button>
                </div>
            </div>
        </form>
    );
}

export default CoPoMappingForm;