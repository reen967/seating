import React, { useState, useEffect } from 'react';
import { LectureTheatre, SeatingPlan, Student, ClassGroup } from '../../types';
import { storageService } from '../../services/storage';

interface SeatingAssignerProps {
  onBack: () => void;
}

export const SeatingAssigner: React.FC<SeatingAssignerProps> = ({ onBack }) => {
  const [lts, setLts] = useState<LectureTheatre[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [selectedLtId, setSelectedLtId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const [currentPlan, setCurrentPlan] = useState<SeatingPlan | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  
  // Drag state
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);

  useEffect(() => {
    setLts(storageService.getLTs());
    setClasses(storageService.getClasses());
  }, []);

  useEffect(() => {
    if (selectedLtId && selectedClassId) {
      // Load students
      setStudents(storageService.getStudentsByClass(selectedClassId));
      
      // Load existing plan or init new
      const existing = storageService.getPlan(selectedLtId, selectedClassId);
      if (existing) {
        setCurrentPlan(existing);
        setAssignments(existing.assignments);
      } else {
        setCurrentPlan({
            id: `plan_${Date.now()}`,
            ltId: selectedLtId,
            classId: selectedClassId,
            assignments: {}
        });
        setAssignments({});
      }
    } else {
      setCurrentPlan(null);
      setStudents([]);
      setAssignments({});
    }
  }, [selectedLtId, selectedClassId]);

  const selectedLt = lts.find(l => l.id === selectedLtId);

  const handleSave = () => {
    if (currentPlan) {
      storageService.savePlan({ ...currentPlan, assignments });
      alert('Seating plan saved successfully!');
    }
  };

  const handleDrop = (seatId: string) => {
    if (draggedStudentId) {
      // Remove student from other seats first
      const cleanAssignments = { ...assignments };
      Object.keys(cleanAssignments).forEach(key => {
        if (cleanAssignments[key] === draggedStudentId) delete cleanAssignments[key];
      });

      setAssignments({
        ...cleanAssignments,
        [seatId]: draggedStudentId
      });
      setDraggedStudentId(null);
    }
  };

  const removeAssignment = (seatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newAssignments = { ...assignments };
    delete newAssignments[seatId];
    setAssignments(newAssignments);
  };

  // Helper to find if student is seated
  const isSeated = (studentId: string) => Object.values(assignments).includes(studentId);

  return (
    <div className="flex flex-col h-full">
       <div className="bg-white border-b p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-medium">← Back</button>
            <h2 className="text-xl font-bold text-gray-800">Assign Seats</h2>
           </div>
           <button 
             onClick={handleSave} 
             disabled={!currentPlan}
             className="bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded font-bold"
           >
             Save Plan
           </button>
        </div>

        <div className="flex gap-4">
          <select className="border rounded p-2" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
            <option value="">Select Class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="border rounded p-2" value={selectedLtId} onChange={e => setSelectedLtId(e.target.value)}>
            <option value="">Select Lecture Theatre...</option>
            {lts.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Students Sidebar */}
        <div className="w-72 bg-white border-r flex flex-col overflow-hidden">
          <div className="p-3 bg-gray-50 border-b text-sm font-semibold text-gray-600">Students ({students.length})</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {students.length === 0 && <div className="text-center text-gray-400 mt-10">No students found</div>}
            {students.map(student => {
              const seated = isSeated(student.id);
              return (
                <div 
                  key={student.id}
                  draggable={!seated}
                  onDragStart={() => setDraggedStudentId(student.id)}
                  className={`p-2 rounded border flex items-center gap-3 ${seated ? 'opacity-50 bg-gray-100 cursor-not-allowed' : 'cursor-grab hover:bg-blue-50 bg-white shadow-sm'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                     {student.photoUrl ? <img src={student.photoUrl} alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs text-white bg-indigo-400">{student.firstName[0]}</div>}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{student.firstName} {student.lastName}</div>
                    <div className="text-xs text-gray-500">{seated ? 'Seated' : 'Unseated'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Map */}
        <div className="flex-1 bg-slate-100 overflow-auto p-8 flex justify-center">
          {selectedLt ? (
            <div className="relative bg-white shadow-lg" style={{ width: '800px', height: '600px', border: '1px solid #e2e8f0' }}>
              <div className="absolute top-2 left-0 right-0 text-center text-gray-300 font-bold text-2xl pointer-events-none select-none">FRONT OF CLASS</div>
              {selectedLt.layoutMatrix.map(seat => {
                const assignedStudentId = assignments[seat.id];
                const assignedStudent = students.find(s => s.id === assignedStudentId);

                return (
                  <div
                    key={seat.id}
                    onDragOver={(e) => e.preventDefault()} // Allow drop
                    onDrop={() => handleDrop(seat.id)}
                    className={`absolute w-12 h-12 rounded-lg flex flex-col items-center justify-center border-2 transition-all
                      ${seat.type === 'swop' ? 'border-yellow-400 bg-yellow-50' : 'border-blue-200 bg-blue-50'}
                      ${assignedStudent ? 'border-solid' : 'border-dashed opacity-80'}
                    `}
                    style={{ left: seat.x, top: seat.y }}
                  >
                    {assignedStudent ? (
                      <>
                        <div className="w-full h-full relative group">
                           {assignedStudent.photoUrl ? 
                             <img src={assignedStudent.photoUrl} className="w-full h-full object-cover rounded-md" alt="" /> :
                             <div className="w-full h-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold rounded-md">{assignedStudent.firstName[0]}{assignedStudent.lastName[0]}</div>
                           }
                           {/* Remove button on hover */}
                           <button 
                             onClick={(e) => removeAssignment(seat.id, e)}
                             className="hidden group-hover:flex absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full items-center justify-center text-xs"
                           >
                             ×
                           </button>
                           <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 rounded whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 pointer-events-none">
                             {assignedStudent.firstName}
                           </div>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 font-semibold select-none">{seat.label}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-400 h-full">Select Class and LT to begin</div>
          )}
        </div>
      </div>
    </div>
  );
};