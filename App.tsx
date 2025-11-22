import React, { useState, useEffect } from 'react';
import { ViewMode, AttendanceRecord, ClassGroup, LectureTheatre, AppSettings } from './types';
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

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({});
  const [settingsUrl, setSettingsUrl] = useState('');

  const refreshData = () => {
    setRecords(storageService.getRecords());
    setClasses(storageService.getClasses());
    setLts(storageService.getLTs());
    
    const s = storageService.getSettings();
    setSettings(s);
    setSettingsUrl(s.googleSheetUrl || '');
  };

  useEffect(() => {
    refreshData();
  }, [view]);

  const handleExport = () => {
    sheetsService.generateCSV(records, classes, lts);
  };

  const saveSettings = () => {
    const newSettings = { ...settings, googleSheetUrl: settingsUrl };
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
    setShowSettings(false);
    alert('Integration settings saved!');
  };

  const renderDashboard = () => (
    <div className="max-w-5xl mx-auto p-6 relative">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Smart Attendance</h1>
          <p className="text-slate-500">Classroom management & tracking system</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
             onClick={() => setShowSettings(true)}
             className="text-slate-500 hover:text-blue-600 transition-colors"
             title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
          <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">v1.1.0</div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Admin Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
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
          <div className="flex gap-2">
            {settings.googleSheetUrl && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">● Live Sync Active</span>}
            <button onClick={handleExport} className="text-sm text-blue-600 hover:underline font-medium">
                Download CSV
            </button>
          </div>
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b">
                 <h3 className="text-xl font-bold text-gray-800">Settings</h3>
                 <p className="text-sm text-gray-500 mt-1">Configure external integrations</p>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Google Sheet Webhook URL</label>
                    <input 
                      type="text" 
                      value={settingsUrl}
                      onChange={(e) => setSettingsUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      To enable automatic syncing, deploy a Google Apps Script as a Web App (Execute as: Me, Access: Anyone) and paste the URL here.
                      The app will POST JSON data to this URL on every submission.
                    </p>
                 </div>
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                 <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
                 <button onClick={saveSettings} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Save Settings</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;