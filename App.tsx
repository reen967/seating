import React, { useState, useEffect } from 'react';
import { ViewMode, AttendanceRecord, ClassGroup, LectureTheatre } from './types';
import { LtBuilder } from './components/Admin/LtBuilder';
import { SeatingAssigner } from './components/Admin/SeatingAssigner';
import { AttendanceView } from './components/Facilitator/AttendanceView';
import { storageService } from './services/storage';
import { sheetsService } from './services/sheets';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  
  // For reporting
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [lts, setLts] = useState<LectureTheatre[]>([]);

  const refreshData = () => {
    setRecords(storageService.getRecords());
    setClasses(storageService.getClasses());
    setLts(storageService.getLTs());
  };

  useEffect(() => {
    refreshData();
  }, [view]);

  const handleExport = () => {
    sheetsService.generateCSV(records, classes, lts);
  };

  const renderDashboard = () => (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Smart Attendance</h1>
          <p className="text-slate-500">Classroom management & tracking system</p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">v1.0.0 (Mock Data)</div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Admin Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Admin Configuration</h2>
          </div>
          <p className="text-slate-600 mb-6 min-h-[48px]">Setup lecture theatre layouts and assign students to specific seats.</p>
          <div className="space-y-3">
            <button 
              onClick={() => setView('admin-lt')} 
              className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 font-medium border hover:border-indigo-200 transition-colors flex justify-between"
            >
              1. Create Lecture Theatre Layouts <span>→</span>
            </button>
            <button 
              onClick={() => setView('admin-assign')}
              className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 font-medium border hover:border-indigo-200 transition-colors flex justify-between"
            >
              2. Assign Students to Seats <span>→</span>
            </button>
          </div>
        </div>

        {/* Facilitator Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
           <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Take Attendance</h2>
          </div>
          <p className="text-slate-600 mb-6 min-h-[48px]">Conduct visual check-ins for Check 1, 2, or 3 and sync to sheets.</p>
          <button 
            onClick={() => setView('facilitator')} 
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            Start Session
          </button>
        </div>
      </div>

      {/* Recent Activity / Export */}
      <div className="mt-10 bg-white rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-700">Recent Sync History</h3>
          <button onClick={handleExport} className="text-sm text-blue-600 hover:underline font-medium">
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-800 font-semibold">
              <tr>
                <th className="p-3 rounded-l-lg">Time</th>
                <th className="p-3">Class</th>
                <th className="p-3">Venue</th>
                <th className="p-3">Check #</th>
                <th className="p-3 rounded-r-lg text-right">Present</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-400">No records submitted yet.</td></tr>
              ) : (
                records.slice().reverse().slice(0, 5).map(r => {
                  const cName = classes.find(c => c.id === r.classId)?.name || r.classId;
                  const ltName = lts.find(l => l.id === r.ltId)?.name || r.ltId;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-3">{new Date(r.timestamp).toLocaleTimeString()}</td>
                      <td className="p-3">{cName}</td>
                      <td className="p-3">{ltName}</td>
                      <td className="p-3"><span className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">{r.checkNumber}</span></td>
                      <td className="p-3 text-right font-mono">{r.presentStudentIds.length}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {view === 'dashboard' && renderDashboard()}
      {view === 'admin-lt' && <LtBuilder onBack={() => setView('dashboard')} />}
      {view === 'admin-assign' && <SeatingAssigner onBack={() => setView('dashboard')} />}
      {view === 'facilitator' && <AttendanceView onBack={() => setView('dashboard')} />}
    </div>
  );
};

export default App;