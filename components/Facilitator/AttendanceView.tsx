import React, { useState, useEffect } from 'react';
import { LectureTheatre, SeatingPlan, Student, ClassGroup, AttendanceRecord } from '../../types';
import { storageService } from '../../services/storage';
import { sheetsService } from '../../services/sheets';

interface AttendanceViewProps {
  onBack: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ onBack }) => {
  const [lts, setLts] = useState<LectureTheatre[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  
  // Selection State
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedLtId, setSelectedLtId] = useState('');
  
  // Loaded Data State
  const [plan, setPlan] = useState<SeatingPlan | null>(null);
  const [lt, setLt] = useState<LectureTheatre | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Attendance State
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());
  const [checkNumber, setCheckNumber] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLts(storageService.getLTs());
    setClasses(storageService.getClasses());
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedLtId) {
      const p = storageService.getPlan(selectedLtId, selectedClassId);
      const l = storageService.getLTs().find(x => x.id === selectedLtId);
      const s = storageService.getStudentsByClass(selectedClassId);
      
      setPlan(p || null);
      setLt(l || null);
      setStudents(s);
      setPresentIds(new Set()); // Reset on load
    } else {
      setPlan(null);
      setLt(null);
      setStudents([]);
    }
  }, [selectedClassId, selectedLtId]);

  const togglePresence = (studentId: string) => {
    const next = new Set(presentIds);
    if (next.has(studentId)) {
      next.delete(studentId);
    } else {
      next.add(studentId);
    }
    setPresentIds(next);
  };

  const handleSubmit = async () => {
    if (!plan || !lt) return;
    
    setIsSubmitting(true);
    const record: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      classId: selectedClassId,
      ltId: selectedLtId,
      planId: plan.id,
      checkNumber: checkNumber,
      timestamp: new Date().toISOString(),
      presentStudentIds: Array.from(presentIds),
    };

    // Save Local
    storageService.saveRecord(record);
    
    // Sync Google Sheet
    const cName = classes.find(c => c.id === selectedClassId)?.name || 'Unknown Class';
    await sheetsService.syncRecord(record, cName, lt.name);

    setIsSubmitting(false);
    alert(`Check ${checkNumber} Submitted Successfully!`);
    
    // Optional: Auto increment check number or reset
    if (checkNumber < 3) setCheckNumber((checkNumber + 1) as 1|2|3);
  };

  const selectStyle = "block w-full p-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none";

  if (!selectedClassId || !selectedLtId) {
    return (
      <div className="p-6 max-w-md mx-auto mt-10">
        <button onClick={onBack} className="mb-4 text-gray-500">← Dashboard</button>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Start Attendance Check</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select className={selectStyle} value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
              <option value="">Choose a class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Venue</label>
            <select className={selectStyle} value={selectedLtId} onChange={e => setSelectedLtId(e.target.value)}>
              <option value="">Choose a lecture theatre...</option>
              {lts.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (!plan || !lt) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">No Seating Plan Found</h2>
        <p className="text-gray-600 mb-4">The Admin has not assigned a seating plan for this Class in this Venue yet.</p>
        <button onClick={() => { setSelectedClassId(''); setSelectedLtId(''); }} className="text-blue-600 underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-md p-4 z-10 sticky top-0">
        <div className="flex justify-between items-center mb-2">
            <button onClick={() => { setSelectedClassId(''); setSelectedLtId(''); }} className="text-sm text-gray-500">← Change Class</button>
            <h2 className="font-bold text-lg text-center">{classes.find(c => c.id === selectedClassId)?.name}</h2>
            <div className="w-20"></div> {/* Spacer */}
        </div>
        
        <div className="flex gap-2 justify-center items-center">
           <div className="flex bg-gray-100 rounded-lg p-1">
              {[1, 2, 3].map(num => (
                <button
                  key={num}
                  onClick={() => setCheckNumber(num as 1|2|3)}
                  className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${checkNumber === num ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Check {num}
                </button>
              ))}
           </div>
           <div className="text-sm font-semibold text-gray-600 ml-4">
             Present: <span className="text-green-600">{presentIds.size}</span> / {Object.keys(plan.assignments).length}
           </div>
        </div>
      </div>

      {/* Interactive Map - Mobile First Optimizations: Touch targets large, easy scrolling */}
      <div className="flex-1 overflow-auto p-4">
        <div className="relative bg-white shadow mx-auto transition-transform origin-top" style={{ width: '800px', height: '600px' }}>
           <div className="absolute top-2 w-full text-center text-gray-200 font-bold text-4xl pointer-events-none">SCREEN</div>
           {lt.layoutMatrix.map(seat => {
             const studentId = plan.assignments[seat.id];
             const student = students.find(s => s.id === studentId);
             const isPresent = studentId && presentIds.has(studentId);
             const isAssigned = !!student;

             return (
               <button
                 key={seat.id}
                 disabled={!isAssigned}
                 onClick={() => studentId && togglePresence(studentId)}
                 className={`absolute w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 shadow-sm transition-all duration-200
                    ${!isAssigned ? 'opacity-30 border-gray-200 bg-gray-50' : ''}
                    ${isPresent ? 'border-green-500 bg-green-50 ring-2 ring-green-200 transform scale-105 z-10' : 'border-gray-300 bg-white hover:border-gray-400'}
                 `}
                 style={{ left: seat.x, top: seat.y }}
               >
                 {student ? (
                   <>
                     {student.photoUrl ? 
                        <img src={student.photoUrl} className="w-full h-full object-cover rounded-lg opacity-90" alt="" /> 
                        : <div className={`font-bold text-sm ${isPresent ? 'text-green-700' : 'text-gray-600'}`}>{student.firstName}</div>
                     }
                     {/* Indicator Dot */}
                     <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isPresent ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                   </>
                 ) : (
                   <span className="text-xs text-gray-300">{seat.label}</span>
                 )}
               </button>
             )
           })}
        </div>
        <p className="text-center text-gray-400 text-xs mt-4">Scroll to view full room</p>
      </div>

      {/* Sticky Action Footer */}
      <div className="bg-white border-t p-4 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
         <button 
           onClick={handleSubmit}
           disabled={isSubmitting}
           className={`w-full text-lg font-bold text-white py-4 rounded-xl shadow-lg transition-all active:scale-95
             ${isSubmitting ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}
           `}
         >
           {isSubmitting ? 'Syncing to Sheets...' : `Submit Check ${checkNumber}`}
         </button>
      </div>
    </div>
  );
};