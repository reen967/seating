import { ClassGroup, Student, LectureTheatre, SeatingPlan, AttendanceRecord, SeatNode, AppSettings } from '../types';

// Keys
const KEYS = {
  CLASSES: 'sa_classes',
  STUDENTS: 'sa_students',
  LTS: 'sa_lts',
  PLANS: 'sa_plans',
  RECORDS: 'sa_records',
  SETTINGS: 'sa_settings',
};

// Seed Data
const seedClasses: ClassGroup[] = [
  { id: 'c1', name: 'MBA2027 Stream A' },
  { id: 'c2', name: 'Data Science 101' },
];

const seedStudents: Student[] = [
  { id: 's1', firstName: 'Alice', lastName: 'Smith', classId: 'c1' },
  { id: 's2', firstName: 'Bob', lastName: 'Jones', classId: 'c1' },
  { id: 's3', firstName: 'Charlie', lastName: 'Brown', classId: 'c1' },
  { id: 's4', firstName: 'Diana', lastName: 'Prince', classId: 'c1' },
  { id: 's5', firstName: 'Evan', lastName: 'Wright', classId: 'c1' },
  { id: 's6', firstName: 'Frank', lastName: 'Castle', classId: 'c2' },
];

const seedLTs: LectureTheatre[] = [
  { 
    id: 'lt1', 
    name: 'Lecture Theatre 1', 
    layoutMatrix: [
      { id: 'seat_1', label: 'A1', x: 100, y: 100, type: 'standard' },
      { id: 'seat_2', label: 'A2', x: 220, y: 100, type: 'standard' },
      { id: 'seat_3', label: 'A3', x: 340, y: 100, type: 'standard' },
      { id: 'seat_4', label: 'B1', x: 100, y: 220, type: 'standard' },
      { id: 'seat_5', label: 'B2', x: 220, y: 220, type: 'standard' },
      { id: 'seat_swop', label: 'SWOP', x: 340, y: 220, type: 'swop' },
    ] 
  }
];

const seedPlans: SeatingPlan[] = [
  {
    id: 'plan1',
    ltId: 'lt1',
    classId: 'c1',
    assignments: {
      'seat_1': 's1',
      'seat_2': 's2',
      'seat_3': 's3',
      'seat_4': 's4',
      'seat_5': 's5',
    }
  }
];

// Helpers
const get = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const set = <T>(key: string, val: T) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// API
export const storageService = {
  // Classes
  getClasses: () => get<ClassGroup[]>(KEYS.CLASSES, seedClasses),
  saveClass: (cls: ClassGroup) => {
    const list = get<ClassGroup[]>(KEYS.CLASSES, seedClasses);
    set(KEYS.CLASSES, [...list, cls]);
  },

  // Students
  getStudents: () => get<Student[]>(KEYS.STUDENTS, seedStudents),
  getStudentsByClass: (classId: string) => get<Student[]>(KEYS.STUDENTS, seedStudents).filter(s => s.classId === classId),
  saveStudent: (student: Student) => {
    const list = get<Student[]>(KEYS.STUDENTS, seedStudents);
    set(KEYS.STUDENTS, [...list, student]);
  },

  // Lecture Theatres
  getLTs: () => get<LectureTheatre[]>(KEYS.LTS, seedLTs),
  saveLT: (lt: LectureTheatre) => {
    const list = get<LectureTheatre[]>(KEYS.LTS, seedLTs);
    const idx = list.findIndex(l => l.id === lt.id);
    if (idx >= 0) {
      list[idx] = lt;
      set(KEYS.LTS, list);
    } else {
      set(KEYS.LTS, [...list, lt]);
    }
  },

  // Plans
  getPlans: () => get<SeatingPlan[]>(KEYS.PLANS, seedPlans),
  getPlan: (ltId: string, classId: string) => {
    return get<SeatingPlan[]>(KEYS.PLANS, seedPlans).find(p => p.ltId === ltId && p.classId === classId);
  },
  savePlan: (plan: SeatingPlan) => {
    const list = get<SeatingPlan[]>(KEYS.PLANS, seedPlans);
    const idx = list.findIndex(p => p.id === plan.id || (p.ltId === plan.ltId && p.classId === plan.classId));
    if (idx >= 0) {
      list[idx] = plan; // Update existing
      set(KEYS.PLANS, list);
    } else {
      set(KEYS.PLANS, [...list, plan]);
    }
  },

  // Records
  getRecords: () => get<AttendanceRecord[]>(KEYS.RECORDS, []),
  saveRecord: (record: AttendanceRecord) => {
    const list = get<AttendanceRecord[]>(KEYS.RECORDS, []);
    set(KEYS.RECORDS, [...list, record]);
  },
  
  // Settings
  getSettings: () => get<AppSettings>(KEYS.SETTINGS, {}),
  saveSettings: (settings: AppSettings) => set(KEYS.SETTINGS, settings),

  // Clear Data (Debug)
  reset: () => localStorage.clear(),
};