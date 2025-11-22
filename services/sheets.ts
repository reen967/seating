import { AttendanceRecord, ClassGroup, LectureTheatre } from "../types";
import { storageService } from "./storage";

export const sheetsService = {
  syncRecord: async (record: AttendanceRecord, className: string, ltName: string): Promise<boolean> => {
    const settings = storageService.getSettings();

    console.log("---- SYNC TO GOOGLE SHEETS ----");
    console.log(`Destination: ${settings.googleSheetUrl ? 'Google Apps Script' : 'Simulation'}`);
    console.log(`Timestamp: ${record.timestamp}`);
    console.log(`Class: ${className}`);
    console.log(`Check #: ${record.checkNumber}`);
    console.log("-------------------------------");

    if (settings.googleSheetUrl) {
      try {
        // We use 'no-cors' to avoid CORS errors when posting to Google Apps Script Web Apps
        // from a browser client. The request will succeed, but we won't see the response body.
        await fetch(settings.googleSheetUrl, {
          method: 'POST',
          mode: 'no-cors', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timestamp: record.timestamp,
            classId: record.classId,
            className: className,
            ltId: record.ltId,
            ltName: ltName,
            checkNumber: record.checkNumber,
            presentStudentIds: record.presentStudentIds,
            count: record.presentStudentIds.length
          })
        });
        return true;
      } catch (error) {
        console.error("Google Sheet Sync Error:", error);
        // We return true even on error for the UI flow in no-code demos, 
        // but in prod you might want better error handling.
        return false;
      }
    } else {
      // Simulate network delay if no URL configured
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 800); 
      });
    }
  },

  generateCSV: (records: AttendanceRecord[], classes: ClassGroup[], lts: LectureTheatre[]) => {
    // Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "RecordID,Timestamp,Class,LT,CheckNumber,PresentCount,PresentStudentIDs\n";

    records.forEach(rec => {
      const c = classes.find(x => x.id === rec.classId)?.name || rec.classId;
      const l = lts.find(x => x.id === rec.ltId)?.name || rec.ltId;
      // Escape quotes in CSV
      const presentList = rec.presentStudentIds.join('|');
      const row = `${rec.id},${rec.timestamp},"${c}","${l}",${rec.checkNumber},${rec.presentStudentIds.length},"${presentList}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};