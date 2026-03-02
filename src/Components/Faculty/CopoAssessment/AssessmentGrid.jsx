import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import api from '../../../utils/api';

const AssessmentGrid = ({
  type, // 'tms', 'TCA', or 'TES'
  assessmentNumber, // For TCA (1,2,3) - Note: TCA structure seems fixed to 1 and 2 in the code
  tmsType, // For tms ('Tutorial', 'MiniProject', 'SurpriseTest')
  config, // Can hold max marks, weightage etc. passed from parent
  subjectCode,
  subjectName,
  branch,
  section,
  semester,
  academicYear,
  facultyId
}) => {
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state
  const [numberOfStudents, setNumberOfStudents] = useState(0); // Start with 0, update on fetch/upload
  const [students, setStudents] = useState([]);
  const [assessmentData, setAssessmentData] = useState(null); // Raw fetched assessment data
  // Ref to always have latest initializeStudentMarks without adding it to fetchAssessmentData deps
  const initStudentMarksRef = React.useRef(null);

  const [selectedCOs, setSelectedCOs] = useState(() => {
      const initial = {};
      for (let i = 1; i <= 5; i++) {
          initial[i] = { partA: 'CO1', partB: 'CO1', partC: 'CO1' };
      }
      return initial;
  });
  const [tcaSelectedCOs, setTcaSelectedCOs] = useState({
    1: { co1: true, co2: false, co3: false, co4: false, co5: false, co6: false }, // CT1-Q1
    3: { co1: false, co2: false, co3: true, co4: false, co5: false, co6: false }, // CT1-Q2 (Using key 3 for uniqueness)
    2: { co1: false, co2: true, co3: false, co4: true, co5: false, co6: false }  // CT2-Q1 (Using key 2)
  });

  const cos = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'CO6'];

  // --- Data Initialization ---
  const initializeStudentMarks = useCallback((student) => {
    const newStudent = { ...student, marks: student.marks || {} }; // Ensure marks obj exists

    if (type === 'tms') {
      if (!newStudent.tmsMarks || newStudent.tmsMarks.length === 0) {
        newStudent.tmsMarks = [{
          type: tmsType,
          questions: Array(5).fill().map((_, idx) => ({
            partA: { maxMarks: 5, coNumber: selectedCOs[idx + 1]?.partA || 'CO1', marksObtained: undefined },
            partB: { maxMarks: 5, coNumber: selectedCOs[idx + 1]?.partB || 'CO1', marksObtained: undefined }
          }))
        }];
      }
       // Ensure each question/part exists even if data is partially loaded
      newStudent.tmsMarks[0].questions = newStudent.tmsMarks[0].questions || [];
       for(let i = 0; i < 5; i++) {
         if (!newStudent.tmsMarks[0].questions[i]) {
           newStudent.tmsMarks[0].questions[i] = {
             partA: { maxMarks: 5, coNumber: selectedCOs[i + 1]?.partA || 'CO1', marksObtained: undefined },
             partB: { maxMarks: 5, coNumber: selectedCOs[i + 1]?.partB || 'CO1', marksObtained: undefined }
           };
         } else {
            newStudent.tmsMarks[0].questions[i].partA = newStudent.tmsMarks[0].questions[i].partA || { maxMarks: 5, coNumber: selectedCOs[i + 1]?.partA || 'CO1', marksObtained: undefined };
            newStudent.tmsMarks[0].questions[i].partB = newStudent.tmsMarks[0].questions[i].partB || { maxMarks: 5, coNumber: selectedCOs[i + 1]?.partB || 'CO1', marksObtained: undefined };
         }
       }

    } else if (type === 'tes') {
      if (!newStudent.tesMarks || newStudent.tesMarks.length === 0) {
        newStudent.tesMarks = [{
          questions: Array(5).fill().map((_, idx) => ({
            partA: { maxMarks: 7, coNumber: selectedCOs[idx + 1]?.partA || 'CO1', marksObtained: undefined },
            partB: { maxMarks: 7, coNumber: selectedCOs[idx + 1]?.partB || 'CO1', marksObtained: undefined },
            partC: { maxMarks: 6, coNumber: selectedCOs[idx + 1]?.partC || 'CO1', marksObtained: undefined }
          }))
        }];
      }
      // Ensure structure exists
      newStudent.tesMarks[0].questions = newStudent.tesMarks[0].questions || [];
      for(let i = 0; i < 5; i++) {
          if (!newStudent.tesMarks[0].questions[i]) {
              newStudent.tesMarks[0].questions[i] = {
                  partA: { maxMarks: 7, coNumber: selectedCOs[i + 1]?.partA || 'CO1', marksObtained: undefined },
                  partB: { maxMarks: 7, coNumber: selectedCOs[i + 1]?.partB || 'CO1', marksObtained: undefined },
                  partC: { maxMarks: 6, coNumber: selectedCOs[i + 1]?.partC || 'CO1', marksObtained: undefined }
              };
          } else {
              newStudent.tesMarks[0].questions[i].partA = newStudent.tesMarks[0].questions[i].partA || { maxMarks: 7, coNumber: selectedCOs[i + 1]?.partA || 'CO1', marksObtained: undefined };
              newStudent.tesMarks[0].questions[i].partB = newStudent.tesMarks[0].questions[i].partB || { maxMarks: 7, coNumber: selectedCOs[i + 1]?.partB || 'CO1', marksObtained: undefined };
              newStudent.tesMarks[0].questions[i].partC = newStudent.tesMarks[0].questions[i].partC || { maxMarks: 6, coNumber: selectedCOs[i + 1]?.partC || 'CO1', marksObtained: undefined };
          }
      }
    } else if (type === 'tca') {
        if (!newStudent.tcaMarks) {
            newStudent.tcaMarks = [];
        }
        // Ensure both assessments structure exist
        let ct1 = newStudent.tcaMarks.find(m => m.assessmentNumber === 1);
        if (!ct1) {
            ct1 = { assessmentNumber: 1, marks: {} };
            newStudent.tcaMarks.push(ct1);
        } else {
             ct1.marks = ct1.marks || {}; // Ensure marks object exists
        }

        let ct2 = newStudent.tcaMarks.find(m => m.assessmentNumber === 2);
        if (!ct2) {
            ct2 = { assessmentNumber: 2, marks: {} };
            newStudent.tcaMarks.push(ct2);
        } else {
             ct2.marks = ct2.marks || {}; // Ensure marks object exists
        }

        // Ensure specific part structures exist (optional, handled in updateTCAMark too)
        const partsToEnsure = ['q1p1', 'q1p2', 'q2p1', 'q2p2']; // CT1 parts
        partsToEnsure.forEach(part => {
            if (!ct1.marks[part]) ct1.marks[part] = { value: undefined, coDistribution: {} };
        });
        const partsToEnsureCt2 = ['q1p1', 'q1p2']; // CT2 parts
        partsToEnsureCt2.forEach(part => {
            if (!ct2.marks[part]) ct2.marks[part] = { value: undefined, coDistribution: {} };
        });
    }

    return newStudent;
  }, [type, tmsType, selectedCOs]); // Dependencies for initialization logic

  // Keep ref in sync with latest initializeStudentMarks without triggering fetch loop
  React.useEffect(() => { initStudentMarksRef.current = initializeStudentMarks; }, [initializeStudentMarks]);

  // --- Fetch Data ---
  const fetchAssessmentData = useCallback(async () => {
    if (!facultyId || !subjectCode || !academicYear || !semester || !branch || !section || !type) {
        console.log("Missing necessary info for fetch");
        return; // Don't fetch if essential props are missing
    }
    setLoading(true);
    setSaveStatus('');
    try {
      const params = {
        type,
        subjectCode,
        branch,
        section,
        semester,
        academicYear,
      };
      if (type === 'tca') {
        // TCA data is usually fetched as a whole, not per assessmentNumber,
        // as the grid shows both CT1 and CT2. We'll filter/find specific assessment data later if needed.
        // If your backend *requires* assessmentNumber for GET, adjust this.
      } else if (type === 'tms' && tmsType) {
        params.tmsType = tmsType;
      }

      // Corrected URL
      const response = await api.get(`/api/assessments/${facultyId}`, { params });

      if (response.data) {
        const fetchedData = response.data;
        setAssessmentData(fetchedData); // Store the raw fetched data if needed elsewhere

        // Populate CO selections from fetched config if available
        if (type === 'tms' && fetchedData.tmsConfig?.coMapping) {
          const newSelectedCOs = { ...selectedCOs };
          fetchedData.tmsConfig.coMapping.forEach(map => {
            if (newSelectedCOs[map.questionNumber]) {
              newSelectedCOs[map.questionNumber].partA = map.partA.coNumber;
              newSelectedCOs[map.questionNumber].partB = map.partB.coNumber;
            }
          });
          setSelectedCOs(newSelectedCOs);
        } else if (type === 'tes' && fetchedData.tesConfig?.coMapping) {
          const newSelectedCOs = { ...selectedCOs };
           fetchedData.tesConfig.coMapping.forEach(map => {
            if (newSelectedCOs[map.questionNumber]) {
              newSelectedCOs[map.questionNumber].partA = map.partA.coNumber;
              newSelectedCOs[map.questionNumber].partB = map.partB.coNumber;
              if (map.partC) { // Check if partC exists
                 newSelectedCOs[map.questionNumber].partC = map.partC.coNumber;
              }
            }
          });
          setSelectedCOs(newSelectedCOs);
        } else if (type === 'tca' && fetchedData.tcaConfig?.assessments) {
            const newTcaSelectedCOs = { ...tcaSelectedCOs };
            // Helper to parse CO string like "CO1+CO2" into the state format
            const parseCOString = (coStr) => {
                const selected = { co1: false, co2: false, co3: false, co4: false, co5: false, co6: false };
                if (coStr) {
                    coStr.split('+').forEach(co => {
                        const key = co.toLowerCase(); // co1, co2 etc.
                        if (selected.hasOwnProperty(key)) {
                            selected[key] = true;
                        }
                    });
                }
                return selected;
            };

            fetchedData.tcaConfig.assessments.forEach(asm => {
                 asm.questions?.forEach(q => {
                    if (asm.assessmentNumber === 1) {
                        if (q.questionNumber === 1) newTcaSelectedCOs[1] = parseCOString(q.coNumber);
                        if (q.questionNumber === 2) newTcaSelectedCOs[3] = parseCOString(q.coNumber); // Key 3 for CT1-Q2
                    } else if (asm.assessmentNumber === 2) {
                        if (q.questionNumber === 1) newTcaSelectedCOs[2] = parseCOString(q.coNumber); // Key 2 for CT2-Q1
                    }
                 });
            });
            setTcaSelectedCOs(newTcaSelectedCOs);
        }

        // Initialize marks structure for each student from fetched data
        const initializer = initStudentMarksRef.current || initializeStudentMarks;
        const initializedStudents = fetchedData.students?.map(initializer) || [];
        setStudents(initializedStudents);
        setNumberOfStudents(initializedStudents.length || 0); // Set count based on fetched data

      } else {
        // No data found, initialize with empty students based on count?
        // Or just show 0 students until uploaded/added manually.
        // Let's clear existing state if fetch returns null.
        setStudents([]);
        setNumberOfStudents(0);
        setAssessmentData(null);
        // Reset COs to default if desired when no data is found
        // setSelectedCOs(...)
        // setTcaSelectedCOs(...)
      }
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      setSaveStatus('Error fetching data');
      setStudents([]); // Clear students on error
      setNumberOfStudents(0);
    } finally {
      setLoading(false);
    }
  }, [facultyId, type, assessmentNumber, tmsType, subjectCode, branch, section, semester, academicYear]);
  // NOTE: intentionally excluding initializeStudentMarks from deps to prevent
  // setSelectedCOs (called inside fetch) from triggering an infinite re-fetch cycle.

  useEffect(() => {
    fetchAssessmentData();
  }, [fetchAssessmentData]); // Use the memoized fetch function


  // --- File Upload (parses marks for TMS/TCA/TES from CSV) ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    // Helper: find column key case-insensitively ignoring spaces/underscores/dashes
    const findKey = (row, ...aliases) => Object.keys(row).find(k =>
      aliases.some(a => k.toLowerCase().replace(/[\s_\-]/g,'') === a.toLowerCase().replace(/[\s_\-]/g,''))
    );

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
          const data = evt.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const excelData = XLSX.utils.sheet_to_json(firstSheet, { raw: true, defval: '' });

          const uploadedStudents = excelData.map(row => {
            const rollNoKey = findKey(row, 'rollno', 'rollnumber', 'roll no', 'roll_no');
            const nameKey   = findKey(row, 'name', 'studentname');

            const student = {
              rollNo: rollNoKey ? String(row[rollNoKey]).trim() : '',
              name:   nameKey   ? String(row[nameKey]).trim()   : '',
            };
            if (!student.rollNo || !student.name) return null;

            // ── TMS: Q1_PartA, Q1_PartB … Q5_PartA, Q5_PartB ──────────────
            if (type === 'tms') {
              const entry = { type: tmsType, questions: [] };
              for (let q = 1; q <= 5; q++) {
                const aKey = findKey(row, `Q${q}_PartA`, `Q${q}PartA`, `Q${q}_A`);
                const bKey = findKey(row, `Q${q}_PartB`, `Q${q}PartB`, `Q${q}_B`);
                entry.questions.push({
                  partA: { maxMarks: 5, coNumber: selectedCOs[q]?.partA || 'CO1', marksObtained: aKey ? (Number(row[aKey]) || undefined) : undefined },
                  partB: { maxMarks: 5, coNumber: selectedCOs[q]?.partB || 'CO1', marksObtained: bKey ? (Number(row[bKey]) || undefined) : undefined },
                });
              }
              student.tmsMarks = [entry];

            // ── TES: Q1_A, Q1_B, Q1_C … Q5_A, Q5_B, Q5_C ─────────────────
            } else if (type === 'tes') {
              const entry = { questions: [] };
              for (let q = 1; q <= 5; q++) {
                const aKey = findKey(row, `Q${q}_A`, `Q${q}A`, `Q${q}_PartA`);
                const bKey = findKey(row, `Q${q}_B`, `Q${q}B`, `Q${q}_PartB`);
                const cKey = findKey(row, `Q${q}_C`, `Q${q}C`, `Q${q}_PartC`);
                entry.questions.push({
                  partA: { maxMarks: 7, coNumber: selectedCOs[q]?.partA || 'CO1', marksObtained: aKey ? (Number(row[aKey]) || undefined) : undefined },
                  partB: { maxMarks: 7, coNumber: selectedCOs[q]?.partB || 'CO1', marksObtained: bKey ? (Number(row[bKey]) || undefined) : undefined },
                  partC: { maxMarks: 6, coNumber: selectedCOs[q]?.partC || 'CO1', marksObtained: cKey ? (Number(row[cKey]) || undefined) : undefined },
                });
              }
              student.tesMarks = [entry];

            // ── TCA: CT1_Q1_P1, CT1_Q1_P2, CT1_Q2_P1, CT1_Q2_P2, CT2_Q1_P1, CT2_Q1_P2
            } else if (type === 'tca') {
              const mk = (k) => k ? (Number(row[k]) || undefined) : undefined;
              const mkDist = (k, qKey) => {
                const v = mk(k);
                if (v === undefined) return { value: undefined, coDistribution: {} };
                const selected = tcaSelectedCOs[qKey] || {};
                const coKeys = Object.entries(selected).filter(([,s])=>s).map(([co])=>co);
                const dist = {};
                if (coKeys.length > 0) coKeys.forEach(co => { dist[co.toUpperCase()] = v / coKeys.length; });
                return { value: v, coDistribution: dist };
              };
              student.tcaMarks = [
                { assessmentNumber: 1, marks: {
                    q1p1: mkDist(findKey(row, 'CT1_Q1_P1', 'ct1q1p1'), 1),
                    q1p2: mkDist(findKey(row, 'CT1_Q1_P2', 'ct1q1p2'), 1),
                    q2p1: mkDist(findKey(row, 'CT1_Q2_P1', 'ct1q2p1'), 3),
                    q2p2: mkDist(findKey(row, 'CT1_Q2_P2', 'ct1q2p2'), 3),
                }},
                { assessmentNumber: 2, marks: {
                    q1p1: mkDist(findKey(row, 'CT2_Q1_P1', 'ct2q1p1'), 2),
                    q1p2: mkDist(findKey(row, 'CT2_Q1_P2', 'ct2q1p2'), 2),
                }},
              ];
            }

            return initializeStudentMarks(student);
          }).filter(Boolean);

          setStudents(uploadedStudents);
          setNumberOfStudents(uploadedStudents.length);
          setSaveStatus(`✅ ${uploadedStudents.length} students loaded with marks.`);

          setTimeout(() => setSaveStatus(''), 4000);
      } catch (error) {
          console.error('Error processing file:', error);
          setSaveStatus('Error reading file — check the CSV format.');
          setTimeout(() => setSaveStatus(''), 4000);
      } finally {
          setLoading(false);
      }
    };
    reader.onerror = () => { setSaveStatus('Error reading file.'); setLoading(false); };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };


  // --- UI Handlers ---
  const handleStudentCountChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    const newCount = Math.max(0, Math.min(count, 150)); // Allow 0, max 150
    setNumberOfStudents(newCount);

    // Adjust students array size
    setStudents(prevStudents => {
      const currentStudents = [...prevStudents];
      if (newCount > currentStudents.length) {
        // Add new empty student objects, initialized
        for (let i = currentStudents.length; i < newCount; i++) {
          currentStudents.push(initializeStudentMarks({ rollNo: '', name: '' }));
        }
      } else {
        // Remove students from the end
        currentStudents.length = newCount;
      }
      return currentStudents;
    });
  };

  const updateStudent = (index, field, value) => {
    setStudents(prevStudents => {
      const updatedStudents = [...prevStudents];
      if (!updatedStudents[index]) {
        // Should ideally not happen if count change initializes correctly
        updatedStudents[index] = initializeStudentMarks({ rollNo: '', name: '' });
      }
      updatedStudents[index] = { ...updatedStudents[index], [field]: value };
      return updatedStudents;
    });
  };

  // Update TMS or TES marks
  const updateStudentMark = (index, field, value) => {
    // Field format: "questionNum-Part" e.g., "1-A"
    const [questionNumStr, part] = field.split('-');
    const questionNum = parseInt(questionNumStr, 10);
    const questionIndex = questionNum - 1;

    setStudents(prevStudents => {
        const updatedStudents = [...prevStudents];
        if (!updatedStudents[index]) return prevStudents; // Should not happen

        // Ensure the student has the correct marks structure (using initializer is robust)
        let student = updatedStudents[index];
        if ((type === 'tms' && !student.tmsMarks?.[0]?.questions?.[questionIndex]) ||
            (type === 'tes' && !student.tesMarks?.[0]?.questions?.[questionIndex])) {
            student = initializeStudentMarks(student); // Re-initialize if structure is missing
        }

        const marksValue = value === '' ? undefined : Number(value);

        if (type === 'tms') {
            const tmsMark = student.tmsMarks[0].questions[questionIndex];
            if (part === 'A' && tmsMark?.partA) {
                tmsMark.partA.marksObtained = marksValue;
                tmsMark.partA.coNumber = selectedCOs[questionNum]?.partA || 'CO1'; // Ensure CO is set
            } else if (part === 'B' && tmsMark?.partB) {
                tmsMark.partB.marksObtained = marksValue;
                tmsMark.partB.coNumber = selectedCOs[questionNum]?.partB || 'CO1';
            }
        } else if (type === 'tes') {
            const tesMark = student.tesMarks[0].questions[questionIndex];
            if (part === 'A' && tesMark?.partA) {
                tesMark.partA.marksObtained = marksValue;
                tesMark.partA.coNumber = selectedCOs[questionNum]?.partA || 'CO1';
            } else if (part === 'B' && tesMark?.partB) {
                tesMark.partB.marksObtained = marksValue;
                tesMark.partB.coNumber = selectedCOs[questionNum]?.partB || 'CO1';
            } else if (part === 'C' && tesMark?.partC) {
                tesMark.partC.marksObtained = marksValue;
                tesMark.partC.coNumber = selectedCOs[questionNum]?.partC || 'CO1';
            }
        }

        updatedStudents[index] = student; // Place the updated student back
        return updatedStudents;
    });
};


  // Update TCA marks and handle CO distribution
  const updateTCAMark = (index, assessmentNumber, partIdentifier, value) => {
     // partIdentifier is 'q1p1', 'q1p2', 'q2p1', 'q2p2' (for CT1) or 'q1p1', 'q1p2' (for CT2)
     const marksValue = value === '' ? undefined : Number(value);

     setStudents(prevStudents => {
        const updatedStudents = [...prevStudents];
        if (!updatedStudents[index]) return prevStudents; // Should not happen

        let student = updatedStudents[index];
        // Ensure TCA structure exists
        if (!student.tcaMarks) student = initializeStudentMarks(student);

        const tcaIndex = student.tcaMarks.findIndex(m => m.assessmentNumber === assessmentNumber);
        if (tcaIndex === -1) {
             console.error(`TCA Assessment ${assessmentNumber} not found for student index ${index}`);
             return prevStudents; // Should be initialized, but safety check
        }

        const currentTCA = student.tcaMarks[tcaIndex];
        if (!currentTCA.marks) currentTCA.marks = {}; // Ensure marks object exists

        // Initialize part structure if it doesn't exist
        if (!currentTCA.marks[partIdentifier]) {
            currentTCA.marks[partIdentifier] = { value: undefined, coDistribution: {} };
        }

        // Update the raw value
        currentTCA.marks[partIdentifier].value = marksValue;

        // Determine the relevant question key for CO mapping (1, 2, or 3)
        let questionKey;
        if (assessmentNumber === 1) {
            questionKey = partIdentifier.startsWith('q1') ? 1 : 3;
        } else { // assessmentNumber === 2
            questionKey = 2;
        }

        // Redistribute marks to selected COs
        const selectedCOsForQuestion = tcaSelectedCOs[questionKey];
        const selectedCOKeys = Object.entries(selectedCOsForQuestion)
                                      .filter(([_, isSelected]) => isSelected)
                                      .map(([key, _]) => key); // ['co1', 'co2', ...]
        const selectedCOCount = selectedCOKeys.length;

        // Clear previous distribution for this part
        currentTCA.marks[partIdentifier].coDistribution = {};

        if (selectedCOCount > 0 && marksValue !== undefined && !isNaN(marksValue)) {
            const marksPerCO = marksValue / selectedCOCount;
            selectedCOKeys.forEach(coKey => {
                // Store distribution, mapping 'co1' -> 'CO1' etc. if needed by backend
                 currentTCA.marks[partIdentifier].coDistribution[coKey.toUpperCase()] = marksPerCO;
            });
        }

        updatedStudents[index] = student;
        return updatedStudents;
     });
  };

  const handleCOChange = (questionNum, part, value) => {
    // Update the central CO selection state
    setSelectedCOs(prev => ({
      ...prev,
      [questionNum]: {
        ...prev[questionNum],
        [`part${part}`]: value
      }
    }));

    // Update CO number for all existing students for that specific question/part
    setStudents(prevStudents => prevStudents.map(student => {
      if (!student) return student;
      const updatedStudent = { ...student }; // Shallow copy

      if (type === 'tms' && updatedStudent.tmsMarks?.[0]?.questions?.[questionNum - 1]?.[`part${part}`]) {
         // Deep copy needed parts to avoid mutation
         const newTmsMarks = [{ ...updatedStudent.tmsMarks[0], questions: [...updatedStudent.tmsMarks[0].questions] }];
         newTmsMarks[0].questions[questionNum - 1] = { ...newTmsMarks[0].questions[questionNum - 1] };
         newTmsMarks[0].questions[questionNum - 1][`part${part}`] = { ...newTmsMarks[0].questions[questionNum - 1][`part${part}`], coNumber: value };
         updatedStudent.tmsMarks = newTmsMarks;

      } else if (type === 'tes' && updatedStudent.tesMarks?.[0]?.questions?.[questionNum - 1]?.[`part${part}`]) {
         const newTesMarks = [{ ...updatedStudent.tesMarks[0], questions: [...updatedStudent.tesMarks[0].questions] }];
         newTesMarks[0].questions[questionNum - 1] = { ...newTesMarks[0].questions[questionNum - 1] };
         newTesMarks[0].questions[questionNum - 1][`part${part}`] = { ...newTesMarks[0].questions[questionNum - 1][`part${part}`], coNumber: value };
         updatedStudent.tesMarks = newTesMarks;
      }
      return updatedStudent;
    }));
  };

  const handleTcaCOChange = (questionKey, coKey, checked) => {
     // 1. Update the central TCA CO selection state
     const updatedTcaSelectedCOs = {
        ...tcaSelectedCOs,
        [questionKey]: {
            ...tcaSelectedCOs[questionKey],
            [coKey]: checked
        }
     };
     setTcaSelectedCOs(updatedTcaSelectedCOs); // Update state first

     // 2. Update all students to redistribute marks based on the *new* selection
     setStudents(prevStudents => {
        return prevStudents.map((student) => {
            if (!student?.tcaMarks) return student; // Skip if no TCA marks

            const newStudent = { ...student, tcaMarks: [] }; // Start fresh tcaMarks array

            // Deep copy necessary to avoid mutation issues
            student.tcaMarks.forEach(asm => {
                newStudent.tcaMarks.push({ ...asm, marks: asm.marks ? JSON.parse(JSON.stringify(asm.marks)) : {} });
            });


            // Determine which assessment number and parts this change affects
            let assessmentNumber;
            let partsToUpdate;
            if (questionKey === 1) { // CT1-Q1
                assessmentNumber = 1;
                partsToUpdate = ['q1p1', 'q1p2'];
            } else if (questionKey === 3) { // CT1-Q2
                assessmentNumber = 1;
                partsToUpdate = ['q2p1', 'q2p2'];
            } else if (questionKey === 2) { // CT2-Q1
                assessmentNumber = 2;
                partsToUpdate = ['q1p1', 'q1p2'];
            } else {
                return student; // Should not happen
            }

            const tcaIndex = newStudent.tcaMarks.findIndex(m => m.assessmentNumber === assessmentNumber);
            if (tcaIndex === -1 || !newStudent.tcaMarks[tcaIndex].marks) {
                 return student; // Skip if assessment or marks missing
            }

            const currentTCA = newStudent.tcaMarks[tcaIndex];
            const selectedCOsForQuestion = updatedTcaSelectedCOs[questionKey]; // Use the latest state
            const selectedCOKeys = Object.entries(selectedCOsForQuestion)
                                            .filter(([_, isSelected]) => isSelected)
                                            .map(([key, _]) => key);
            const selectedCOCount = selectedCOKeys.length;

            // Redistribute marks for each affected part
            partsToUpdate.forEach(partIdentifier => {
                const partMark = currentTCA.marks[partIdentifier];
                if (!partMark || partMark.value === undefined || isNaN(partMark.value)) {
                   // If no marks entered, just ensure distribution is empty
                    if (partMark) partMark.coDistribution = {};
                    return;
                }

                // Clear previous distribution
                partMark.coDistribution = {};

                if (selectedCOCount > 0) {
                    const marksPerCO = partMark.value / selectedCOCount;
                    selectedCOKeys.forEach(coKey => {
                         partMark.coDistribution[coKey.toUpperCase()] = marksPerCO;
                    });
                }
            });
            return newStudent; // Return the updated student
        });
     });
 };


  // --- Calculation Helpers ---
  const calculateTCATotal = (studentIndex, assessmentNumber, questionKey) => {
    const student = students[studentIndex];
    const assessment = student?.tcaMarks?.find(m => m.assessmentNumber === assessmentNumber);
    if (!assessment?.marks) return 0;

    let parts = [];
    if (assessmentNumber === 1) {
      parts = (questionKey === 1) ? ['q1p1', 'q1p2'] : (questionKey === 3 ? ['q2p1', 'q2p2'] : []);
    } else if (assessmentNumber === 2) {
      parts = (questionKey === 2) ? ['q1p1', 'q1p2'] : [];
    }

    return parts.reduce((sum, part) => sum + (Number(assessment.marks[part]?.value) || 0), 0);
  };

  const calculateTotalTCAMarks = (studentIndex) => {
    const student = students[studentIndex];
    if (!student?.tcaMarks) return 0;
    let total = 0;
    student.tcaMarks.forEach(assessment => {
      if (assessment?.marks) {
        total += Object.values(assessment.marks).reduce((sum, part) => sum + (Number(part?.value) || 0), 0);
      }
    });
    return total;
  };

  const calculateTotalMarks = (studentIndex) => { // TMS Total
    const student = students[studentIndex];
    if (!student?.tmsMarks?.[0]?.questions) return 0;
    return student.tmsMarks[0].questions.reduce((total, q) => {
      const partA = Number(q.partA?.marksObtained) || 0;
      const partB = Number(q.partB?.marksObtained) || 0;
      // Ensure -1 isn't added for TMS (should only be 0 or positive)
      return total + (partA > 0 ? partA : 0) + (partB > 0 ? partB : 0);
    }, 0);
  };

  const calculateTESTotal = (studentIndex) => { // TES Total (Best 4 out of 5)
    const student = students[studentIndex];
    if (!student?.tesMarks?.[0]?.questions) return 0;

    const questionTotals = student.tesMarks[0].questions.map(q => {
      // Treat undefined/empty marks as 0 for calculation, handle -1 specifically
      const partA = q.partA?.marksObtained;
      const partB = q.partB?.marksObtained;
      const partC = q.partC?.marksObtained;

      // If any part is -1 (not attempted), the question score is 0 for 'best of' calculation
      if (partA === -1 || partB === -1 || partC === -1) {
        return 0;
      }

      // Otherwise, sum the valid marks (treating undefined/null as 0)
      const markA = Number(partA) || 0;
      const markB = Number(partB) || 0;
      const markC = Number(partC) || 0;
      return (markA > 0 ? markA : 0) + (markB > 0 ? markB : 0) + (markC > 0 ? markC : 0);

    }).sort((a, b) => b - a); // Sort descending

    // Sum the top 4 scores
    return questionTotals.slice(0, 4).reduce((sum, score) => sum + score, 0);
  };


  // --- Save Data ---
  const saveAssessmentData = async () => {
    setLoading(true);
    setSaveStatus('Saving...');

    // Ensure students have the initialized structure before saving
    const validStudents = students
        .filter(student => student && student.rollNo && student.name)
        .map(initializeStudentMarks); // Ensure structure is consistent

    if (validStudents.length !== numberOfStudents) {
       console.warn("Mismatch between student count and valid student entries.")
       // Decide how to handle: Save only valid ones, or alert user?
       // Saving only valid ones:
       // setNumberOfStudents(validStudents.length); // Optional: update count state
    }

    const assessmentPayload = {
      type,
      // assessmentNumber: (type === 'tca' ? assessmentNumber : undefined), // Usually TCA is saved as a whole
      tmsType: (type === 'tms' ? tmsType : undefined),
      subject: { code: subjectCode, name: subjectName },
      academicYear,
      semester,
      branch,
      section,
      facultyId,
      numberOfStudents: validStudents.length,
      students: validStudents, // Send the potentially cleaned/initialized students
      // Add Configs based on type
    };

    // Helper to create CO string like "CO1+CO3" from the state object
    const createCOString = (coSelectionObject) => {
        return Object.entries(coSelectionObject)
               .filter(([_, isSelected]) => isSelected)
               .map(([key, _]) => key.toUpperCase()) // CO1, CO2 etc.
               .sort() // Consistent order
               .join('+') || null; // Return null if none selected
    }

    switch (type) {
      case 'tms':
        assessmentPayload.tmsConfig = {
          type: tmsType,
          maxMarks: config?.maxMarks || 50, // Example default, get from prop if available
          weightage: config?.weightage || 10, // Example default
          coMapping: Object.entries(selectedCOs).map(([qNum, cos]) => ({
            questionNumber: parseInt(qNum),
            partA: { coNumber: cos.partA },
            partB: { coNumber: cos.partB }
          }))
        };
        break;

      case 'tca':
        assessmentPayload.tcaConfig = {
          numberOfAssessments: 2, // Fixed for this structure
          weightage: config?.weightage || 10, // Example default
          assessments: [
            { // Class Test 1 or Assignment
              assessmentNumber: 1,
              name: "Class Test 1 or Assignment", // Make dynamic?
              questions: [
                { // Question 1 (mapped by key 1 in tcaSelectedCOs)
                  questionNumber: 1,
                  coNumber: createCOString(tcaSelectedCOs[1]), // Dynamic CO string
                  maxMarks: 3, // Sum of parts
                  // parts definition might be useful for display/validation but less critical for calculation storage here
                },
                { // Question 2 (mapped by key 3 in tcaSelectedCOs)
                  questionNumber: 2,
                  coNumber: createCOString(tcaSelectedCOs[3]), // Dynamic CO string
                  maxMarks: 3,
                }
              ]
            },
            { // Class Test 2
              assessmentNumber: 2,
              name: "Class Test 2",
              questions: [
                { // Question 1 (mapped by key 2 in tcaSelectedCOs)
                  questionNumber: 1,
                  coNumber: createCOString(tcaSelectedCOs[2]), // Dynamic CO string
                  maxMarks: 6,
                }
              ]
            }
          ]
        };
        break;

      case 'tes':
        assessmentPayload.tesConfig = {
          numberOfQuestions: 5, // Fixed
          weightage: config?.weightage || 30, // Example default
          coMapping: Object.entries(selectedCOs).map(([qNum, cos]) => ({
            questionNumber: parseInt(qNum),
            partA: { coNumber: cos.partA },
            partB: { coNumber: cos.partB },
            partC: { coNumber: cos.partC }
          }))
        };
        break;
       default:
          console.error("Invalid assessment type for saving config");
    }
    console.log('Saving assessment data:', JSON.stringify(assessmentPayload, null, 2)); // Log payload for debugging

    try {
      // Use the POST route defined in Express
      const response = await api.post('/api/assessments', assessmentPayload);

      setSaveStatus('Saved successfully!');
      // Optionally refetch data after save or update state based on response
      // fetchAssessmentData();
      setAssessmentData(response.data.assessment); // Update local state with saved data (including _id etc)

    } catch (error) {
      console.error('Error saving assessment:', error.response?.data || error.message);
      setSaveStatus(`Error saving: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 5000); // Keep status longer
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Loading Indicator */}
       {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
             <p className="text-lg font-semibold text-blue-600">Loading...</p>
          </div>
       )}

      {/* File Upload Section */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start">
         <div className='flex-grow'>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Student List (Excel)
            </label>
            <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border rounded-md p-1"
                aria-describedby="file-help"
                disabled={loading}
            />
            <p id="file-help" className="mt-1 text-xs text-gray-500">
                Columns: "Roll No"/"RollNo"/"Roll Number", "Name"/"Student Name".
            </p>
         </div>

         <div className="flex items-center gap-2 pt-2 sm:pt-6">
            <label htmlFor="student-count" className="font-medium text-gray-700 text-sm whitespace-nowrap">No. of Students:</label>
            <input
                id="student-count"
                type="number"
                min="0"
                max="150"
                value={numberOfStudents}
                onChange={handleStudentCountChange}
                className="w-20 p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm"
                disabled={loading}
                aria-label="Number of Students"
            />
         </div>
      </div>


      {/* --- TCA Specific Grid --- */}
      {type === 'tca' && (
        <div className="space-y-6">
          {/* CO Mapping Checkboxes */}
          <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-3 text-base">TCA Course Outcome (CO) Mapping</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  {/* CT1-Q1 (Key 1) */}
                  <div>
                      <h4 className="font-medium text-gray-700 mb-2 text-sm">Class Test 1 - Q1 (Max: 3)</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {cos.map((co, idx) => (
                              <label key={`ct1-q1-${idx}`} className="flex items-center space-x-1.5 text-sm">
                                  <input
                                      type="checkbox"
                                      checked={!!tcaSelectedCOs[1]?.[`co${idx + 1}`]}
                                      onChange={(e) => handleTcaCOChange(1, `co${idx + 1}`, e.target.checked)}
                                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                      disabled={loading}
                                  />
                                  <span>{co}</span>
                              </label>
                          ))}
                      </div>
                  </div>
                  {/* CT1-Q2 (Key 3) */}
                  <div>
                      <h4 className="font-medium text-gray-700 mb-2 text-sm">Class Test 1 - Q2 (Max: 3)</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {cos.map((co, idx) => (
                              <label key={`ct1-q2-${idx}`} className="flex items-center space-x-1.5 text-sm">
                                  <input
                                      type="checkbox"
                                      checked={!!tcaSelectedCOs[3]?.[`co${idx + 1}`]}
                                      onChange={(e) => handleTcaCOChange(3, `co${idx + 1}`, e.target.checked)}
                                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                      disabled={loading}
                                  />
                                  <span>{co}</span>
                              </label>
                          ))}
                      </div>
                  </div>
                  {/* CT2-Q1 (Key 2) */}
                  <div>
                      <h4 className="font-medium text-gray-700 mb-2 text-sm">Class Test 2 - Q1 (Max: 6)</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {cos.map((co, idx) => (
                              <label key={`ct2-q1-${idx}`} className="flex items-center space-x-1.5 text-sm">
                                  <input
                                      type="checkbox"
                                      checked={!!tcaSelectedCOs[2]?.[`co${idx + 1}`]}
                                      onChange={(e) => handleTcaCOChange(2, `co${idx + 1}`, e.target.checked)}
                                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                      disabled={loading}
                                  />
                                  <span>{co}</span>
                              </label>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          {/* TCA Marks Table */}
          <div className="overflow-x-auto w-full rounded-lg shadow-sm border border-gray-200">
             <table className="min-w-full border-collapse text-sm">
                 <thead className="bg-gray-50 sticky top-0 z-10">
                     <tr>
                         <th rowSpan="2" className="border-b p-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-20" style={{ minWidth: '150px' }}>Roll No</th>
                         <th rowSpan="2" className="border-b border-l p-3 text-left font-semibold text-gray-700 sticky left-[150px] bg-gray-50 z-20" style={{ minWidth: '180px' }}>Name</th>
                         <th colSpan="5" className="border-b border-l p-3 text-center font-semibold text-gray-700">Class Test 1 or Assignment</th>
                         <th colSpan="3" className="border-b border-l p-3 text-center font-semibold text-gray-700">Class Test 2</th>
                         <th rowSpan="2" className="border-b border-l p-3 text-center font-semibold text-gray-700 sticky right-0 bg-gray-50 z-20" style={{ minWidth: '80px' }}>Total (12)</th>
                     </tr>
                     <tr>
                         <th colSpan="2" className="border-b border-l p-2 text-center font-medium text-gray-600">Q1 (3)</th>
                         <th className="border-b border-l p-2 text-center font-medium text-gray-600 bg-gray-100">Total</th>
                         <th colSpan="2" className="border-b border-l p-2 text-center font-medium text-gray-600">Q2 (3)</th>
                         <th colSpan="2" className="border-b border-l p-2 text-center font-medium text-gray-600">Q1 (6)</th>
                         <th className="border-b border-l p-2 text-center font-medium text-gray-600 bg-gray-100">Total</th>
                     </tr>
                     <tr>
                         <th className="border-b p-0 h-0 sticky left-0 bg-gray-50 z-20" style={{ minWidth: '150px' }}></th>
                         <th className="border-b border-l p-0 h-0 sticky left-[150px] bg-gray-50 z-20" style={{ minWidth: '180px' }}></th>
                         <th className="border-b border-l p-2 text-center font-normal text-gray-500">P1 (1.5)</th>
                         <th className="border-b border-l p-2 text-center font-normal text-gray-500">P2 (1.5)</th>
                         <th className="border-b border-l p-2 bg-gray-100"></th>
                         <th className="border-b border-l p-2 text-center font-normal text-gray-500">P1 (1.5)</th>
                         <th className="border-b border-l p-2 text-center font-normal text-gray-500">P2 (1.5)</th>
                         <th className="border-b border-l p-2 text-center font-normal text-gray-500">P1 (3)</th>
                         <th className="border-b border-l p-2 text-center font-normal text-gray-500">P2 (3)</th>
                         <th className="border-b border-l p-2 bg-gray-100"></th>
                         <th className="border-b border-l p-0 h-0 sticky right-0 bg-gray-50 z-20" style={{ minWidth: '80px' }}></th>
                     </tr>
                 </thead>
                 <tbody>
                     {Array.from({ length: numberOfStudents }).map((_, index) => {
                        const student = students[index] || {};
                        const ct1Marks = student.tcaMarks?.find(m => m.assessmentNumber === 1)?.marks || {};
                        const ct2Marks = student.tcaMarks?.find(m => m.assessmentNumber === 2)?.marks || {};
                        return (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="border-b border-l p-1 sticky left-0 bg-white hover:bg-gray-50 z-10" style={{ minWidth: '150px' }}>
                                    <input
                                        type="text"
                                        value={student.rollNo || ''}
                                        onChange={(e) => updateStudent(index, 'rollNo', e.target.value)}
                                        className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm"
                                        disabled={loading} aria-label={`Roll No for student ${index + 1}`}
                                    />
                                </td>
                                <td className="border-b border-l p-1 sticky left-[150px] bg-white hover:bg-gray-50 z-10" style={{ minWidth: '180px' }}>
                                    <input
                                        type="text"
                                        value={student.name || ''}
                                        onChange={(e) => updateStudent(index, 'name', e.target.value)}
                                        className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm"
                                        disabled={loading} aria-label={`Name for student ${index + 1}`}
                                    />
                                </td>
                                {/* CT1-Q1-P1 */}
                                <td className="border-b border-l p-1" style={{ minWidth: '70px' }}>
                                    <input
                                        type="number" min="0" max="1.5" step="0.1"
                                        value={ct1Marks.q1p1?.value ?? ''}
                                        onChange={(e) => updateTCAMark(index, 1, 'q1p1', e.target.value)}
                                        className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm text-center"
                                        disabled={loading} aria-label={`CT1 Q1 Part 1 for student ${index + 1}`}
                                    />
                                </td>
                                {/* CT1-Q1-P2 */}
                                <td className="border-b border-l p-1" style={{ minWidth: '70px' }}>
                                    <input
                                        type="number" min="0" max="1.5" step="0.1"
                                        value={ct1Marks.q1p2?.value ?? ''}
                                        onChange={(e) => updateTCAMark(index, 1, 'q1p2', e.target.value)}
                                        className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm text-center"
                                        disabled={loading} aria-label={`CT1 Q1 Part 2 for student ${index + 1}`}
                                    />
                                </td>
                                {/* CT1 Q1 Total */}
                                <td className="border-b border-l p-2 text-center font-medium text-gray-700 bg-gray-100" style={{ minWidth: '70px' }}>
                                    {calculateTCATotal(index, 1, 1)}
                                </td>
                                {/* CT1-Q2-P1 */}
                                <td className="border-b border-l p-1" style={{ minWidth: '70px' }}>
                                    <input
                                        type="number" min="0" max="1.5" step="0.1"
                                        value={ct1Marks.q2p1?.value ?? ''}
                                        onChange={(e) => updateTCAMark(index, 1, 'q2p1', e.target.value)}
                                        className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm text-center"
                                        disabled={loading} aria-label={`CT1 Q2 Part 1 for student ${index + 1}`}
                                    />
                                </td>
                                {/* CT1-Q2-P2 */}
                                <td className="border-b border-l p-1" style={{ minWidth: '70px' }}>
                                    <input
                                        type="number" min="0" max="1.5" step="0.1"
                                        value={ct1Marks.q2p2?.value ?? ''}
                                        onChange={(e) => updateTCAMark(index, 1, 'q2p2', e.target.value)}
                                        className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm text-center"
                                        disabled={loading} aria-label={`CT1 Q2 Part 2 for student ${index + 1}`}
                                    />
                                </td>
                                {/* CT1 Q2 Total - Merged display into CT2 Q1 */}
                                {/* <td className="border-b border-l p-2 text-center font-medium text-gray-700 bg-gray-100" style={{ minWidth: '70px' }}>
                                    {calculateTCATotal(index, 1, 3)}
                                </td> */}
                                {/* CT2-Q1-P1 */}
                                <td className="border-b border-l p-1" style={{ minWidth: '70px' }}>
                                    <input
                                        type="number" min="0" max="3" step="0.1"
                                        value={ct2Marks.q1p1?.value ?? ''}
                                        onChange={(e) => updateTCAMark(index, 2, 'q1p1', e.target.value)}
                                        className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm text-center"
                                        disabled={loading} aria-label={`CT2 Q1 Part 1 for student ${index + 1}`}
                                    />
                                </td>
                                {/* CT2-Q1-P2 */}
                                <td className="border-b border-l p-1" style={{ minWidth: '70px' }}>
                                    <input
                                        type="number" min="0" max="3" step="0.1"
                                        value={ct2Marks.q1p2?.value ?? ''}
                                        onChange={(e) => updateTCAMark(index, 2, 'q1p2', e.target.value)}
                                        className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm text-center"
                                        disabled={loading} aria-label={`CT2 Q1 Part 2 for student ${index + 1}`}
                                    />
                                </td>
                                {/* CT2 Q1 Total */}
                                <td className="border-b border-l p-2 text-center font-medium text-gray-700 bg-gray-100" style={{ minWidth: '70px' }}>
                                    {calculateTCATotal(index, 2, 2)}
                                </td>
                                {/* Overall Total */}
                                <td className="border-b border-l p-2 text-center font-semibold text-gray-800 sticky right-0 bg-gray-100 hover:bg-gray-200 z-10" style={{ minWidth: '80px' }}>
                                    {calculateTotalTCAMarks(index)}
                                </td>
                            </tr>
                        );
                     })}
                 </tbody>
             </table>
         </div>
         {/* Optional: CO Distribution Summary could go here if needed */}
        </div>
      )}


      {/* --- TMS/TES Specific Grid --- */}
      {(type === 'tms' || type === 'tes') && (
        <div className="space-y-6">
          {/* CO Selection Row */}
          <div className="overflow-x-auto w-full rounded-lg shadow-sm border border-gray-200 mb-4">
             <table className="min-w-full border-collapse text-sm">
                 <thead className="bg-gray-50">
                     <tr>
                         {/* Empty cells for Roll No/Name columns */}
                         <th className="border-b p-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-20" style={{ minWidth: '150px' }}></th>
                         <th className="border-b border-l p-3 text-left font-semibold text-gray-700 sticky left-[150px] bg-gray-50 z-20" style={{ minWidth: '180px' }}></th>
                         {/* Question Headers */}
                         {[1, 2, 3, 4, 5].map(qNum => (
                             <th key={`q${qNum}-header`} colSpan={type === 'tes' ? 3 : 2} className="border-b border-l p-3 text-center font-semibold text-gray-700">
                                 Question {qNum}
                             </th>
                         ))}
                         {/* Empty cell for Total column */}
                         <th className="border-b border-l p-3 text-center font-semibold text-gray-700 sticky right-0 bg-gray-50 z-20" style={{ minWidth: '80px' }}></th>
                     </tr>
                     <tr>
                         {/* Sticky placeholders */}
                          <th className="border-b p-0 h-0 sticky left-0 bg-gray-50 z-20" style={{ minWidth: '150px' }}></th>
                          <th className="border-b border-l p-0 h-0 sticky left-[150px] bg-gray-50 z-20" style={{ minWidth: '180px' }}></th>
                          {/* CO Selectors */}
                         {[1, 2, 3, 4, 5].map(qNum => (
                             <React.Fragment key={`co-select-${qNum}`}>
                                 <td className="border-b border-l p-2" style={{ minWidth: '100px' }}>
                                     <div className="text-center mb-1 text-xs font-medium text-gray-600">Part A CO</div>
                                     <select
                                         value={selectedCOs[qNum]?.partA || 'CO1'}
                                         onChange={(e) => handleCOChange(qNum, 'A', e.target.value)}
                                         className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-xs"
                                         disabled={loading} aria-label={`Question ${qNum} Part A CO`}
                                     >
                                         {cos.map(co => <option key={`${qNum}-A-${co}`} value={co}>{co}</option>)}
                                     </select>
                                 </td>
                                 <td className="border-b border-l p-2" style={{ minWidth: '100px' }}>
                                     <div className="text-center mb-1 text-xs font-medium text-gray-600">Part B CO</div>
                                     <select
                                         value={selectedCOs[qNum]?.partB || 'CO1'}
                                         onChange={(e) => handleCOChange(qNum, 'B', e.target.value)}
                                         className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-xs"
                                         disabled={loading} aria-label={`Question ${qNum} Part B CO`}
                                     >
                                         {cos.map(co => <option key={`${qNum}-B-${co}`} value={co}>{co}</option>)}
                                     </select>
                                 </td>
                                 {type === 'tes' && (
                                     <td className="border-b border-l p-2" style={{ minWidth: '100px' }}>
                                         <div className="text-center mb-1 text-xs font-medium text-gray-600">Part C CO</div>
                                         <select
                                             value={selectedCOs[qNum]?.partC || 'CO1'}
                                             onChange={(e) => handleCOChange(qNum, 'C', e.target.value)}
                                             className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-xs"
                                             disabled={loading} aria-label={`Question ${qNum} Part C CO`}
                                         >
                                             {cos.map(co => <option key={`${qNum}-C-${co}`} value={co}>{co}</option>)}
                                         </select>
                                     </td>
                                 )}
                             </React.Fragment>
                         ))}
                         {/* Sticky placeholder */}
                         <th className="border-b border-l p-0 h-0 sticky right-0 bg-gray-50 z-20" style={{ minWidth: '80px' }}></th>
                     </tr>
                 </thead>
             </table>
         </div>

          {/* Marks Input Table */}
          <div className="overflow-x-auto w-full rounded-lg shadow-sm border border-gray-200">
             <table className="min-w-full border-collapse text-sm">
                 <thead className="bg-gray-50 sticky top-0 z-10"> {/* Adjust top value based on header above */}
                     <tr>
                         <th className="border-b p-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-20" style={{ minWidth: '150px' }}>Roll No</th>
                         <th className="border-b border-l p-3 text-left font-semibold text-gray-700 sticky left-[150px] bg-gray-50 z-20" style={{ minWidth: '180px' }}>Name</th>
                         {[1, 2, 3, 4, 5].map(qNum => (
                             <React.Fragment key={`marks-header-${qNum}`}>
                                 <th className="border-b border-l p-2 text-center font-medium text-gray-600" style={{ minWidth: '100px' }}>
                                     A ({type === 'tes' ? 7 : 5}) {type === 'tes' && <span className="text-xs font-light block">(NA: -1)</span>}
                                     </th>
                                 <th className="border-b border-l p-2 text-center font-medium text-gray-600" style={{ minWidth: '100px' }}>
                                     B ({type === 'tes' ? 7 : 5}) {type === 'tes' && <span className="text-xs font-light block">(NA: -1)</span>}
                                     </th>
                                 {type === 'tes' && (
                                     <th className="border-b border-l p-2 text-center font-medium text-gray-600" style={{ minWidth: '100px' }}>
                                        C (6) <span className="text-xs font-light block">(NA: -1)</span>
                                        </th>
                                 )}
                             </React.Fragment>
                         ))}
                         <th className="border-b border-l p-3 text-center font-semibold text-gray-700 sticky right-0 bg-gray-50 z-20" style={{ minWidth: '80px' }}>
                             Total ({type === 'tes' ? '80' : '50'}) {type === 'tes' && <span className='text-xs font-light block'>(Best 4)</span>}
                         </th>
                     </tr>
                 </thead>
                 <tbody>
                     {Array.from({ length: numberOfStudents }).map((_, index) => {
                        const student = students[index] || {};
                        const marksData = type === 'tms' ? student.tmsMarks?.[0]?.questions : student.tesMarks?.[0]?.questions;
                        return (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="border-b border-l p-1 sticky left-0 bg-white hover:bg-gray-50 z-10" style={{ minWidth: '150px' }}>
                                    <input
                                        type="text"
                                        value={student.rollNo || ''}
                                        onChange={(e) => updateStudent(index, 'rollNo', e.target.value)}
                                        className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm"
                                        disabled={loading} aria-label={`Roll No for student ${index + 1}`}
                                    />
                                </td>
                                <td className="border-b border-l p-1 sticky left-[150px] bg-white hover:bg-gray-50 z-10" style={{ minWidth: '180px' }}>
                                    <input
                                        type="text"
                                        value={student.name || ''}
                                        onChange={(e) => updateStudent(index, 'name', e.target.value)}
                                        className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm"
                                        disabled={loading} aria-label={`Name for student ${index + 1}`}
                                    />
                                </td>
                                {[1, 2, 3, 4, 5].map(qNum => {
                                  const qIndex = qNum - 1;
                                  const qData = marksData?.[qIndex];
                                  return (
                                      <React.Fragment key={`marks-input-${index}-${qNum}`}>
                                          <td className="border-b border-l p-1" style={{ minWidth: '100px' }}>
                                              <input
                                                  type="number"
                                                  min={type === 'tes' ? -1 : 0}
                                                  max={type === 'tes' ? 7 : 5}
                                                  step={type === 'tes' ? 1 : 0.5} // Allow half marks for TMS?
                                                  value={qData?.partA?.marksObtained ?? ''}
                                                  onChange={(e) => updateStudentMark(index, `${qNum}-A`, e.target.value)}
                                                  className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm text-center"
                                                  placeholder={type === 'tes' ? "-1" : ""}
                                                  disabled={loading} aria-label={`Question ${qNum} Part A for student ${index + 1}`}
                                              />
                                          </td>
                                          <td className="border-b border-l p-1" style={{ minWidth: '100px' }}>
                                              <input
                                                  type="number"
                                                  min={type === 'tes' ? -1 : 0}
                                                  max={type === 'tes' ? 7 : 5}
                                                  step={type === 'tes' ? 1 : 0.5}
                                                  value={qData?.partB?.marksObtained ?? ''}
                                                  onChange={(e) => updateStudentMark(index, `${qNum}-B`, e.target.value)}
                                                  className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm text-center"
                                                  placeholder={type === 'tes' ? "-1" : ""}
                                                  disabled={loading} aria-label={`Question ${qNum} Part B for student ${index + 1}`}
                                              />
                                          </td>
                                          {type === 'tes' && (
                                              <td className="border-b border-l p-1" style={{ minWidth: '100px' }}>
                                                  <input
                                                      type="number"
                                                      min={-1}
                                                      max={6}
                                                      step={1}
                                                      value={qData?.partC?.marksObtained ?? ''}
                                                      onChange={(e) => updateStudentMark(index, `${qNum}-C`, e.target.value)}
                                                      className="w-full p-1.5 border rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-sm text-sm text-center"
                                                      placeholder="-1"
                                                      disabled={loading} aria-label={`Question ${qNum} Part C for student ${index + 1}`}
                                                  />
                                              </td>
                                          )}
                                      </React.Fragment>
                                  );
                                })}
                                <td className="border-b border-l p-2 text-center font-semibold text-gray-800 sticky right-0 bg-gray-100 hover:bg-gray-200 z-10" style={{ minWidth: '80px' }}>
                                    {type === 'tms' ? calculateTotalMarks(index) : calculateTESTotal(index)}
                                </td>
                            </tr>
                        );
                     })}
                 </tbody>
             </table>
          </div>
        </div>
      )}

      {/* Save Button and Status */}
      <div className="mt-6 flex justify-end items-center gap-4">
         {saveStatus && (
             <span className={`text-sm font-medium ${saveStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                 {saveStatus}
             </span>
         )}
        <button
          onClick={saveAssessmentData}
          disabled={loading || numberOfStudents === 0}
          className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading || numberOfStudents === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Saving...' : 'Save Assessment Data'}
        </button>
      </div>
    </div>
  );
};

export default AssessmentGrid;