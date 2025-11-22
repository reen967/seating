import { AttendanceRecord, ClassGroup, LectureTheatre } from "../types";

export const sheetsService = {
  syncRecord: async (record: AttendanceRecord, className: string, ltName: string): Promise<boolean> => {
    // In a real app, this would use the Google Sheets API via OAuth token.
    // const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets/...', { ... })
    
    console.log("---- SYNC TO GOOGLE SHEETS ----");
    console.log(`Timestamp: ${record.timestamp}`);
    console.log(`Class: ${className}`);
    console.log(`LT: ${ltName}`);
    console.log(`Check #: ${record.checkNumber}`);
    console.log(`Present IDs: ${record.presentStudentIds.join(', ')}`);
    console.log("-------------------------------");

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 800); // Simulate network delay
    });
  },

  generateCSV: (records: AttendanceRecord[], classes: ClassGroup[], lts: LectureTheatre[]) => {
    // Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "RecordID,Timestamp,Class,LT,CheckNumber,PresentStudentIDs\n";

    records.forEach(rec => {
      const c = classes.find(x => x.id === rec.classId)?.name || rec.classId;
      const l = lts.find(x => x.id === rec.ltId)?.name || rec.ltId;
      const row = `${rec.id},${rec.timestamp},${c},${l},${rec.checkNumber},"${rec.presentStudentIds.join('|')}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};