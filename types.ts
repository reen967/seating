export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string; // Optional URL, we will use placeholders if missing
  classId: string;
}

export interface ClassGroup {
  id: string;
  name: string;
}

export type SeatType = 'standard' | 'swop';

export interface SeatNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: SeatType;
}

export interface LectureTheatre {
  id: string;
  name: string;
  layoutMatrix: SeatNode[];
}

export interface SeatingPlan {
  id: string;
  ltId: string;
  classId: string;
  // Map seatNode.id to student.id
  assignments: Record<string, string>;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  ltId: string;
  planId: string;
  checkNumber: 1 | 2 | 3;
  timestamp: string; // ISO string
  presentStudentIds: string[];
}

export type ViewMode = 'dashboard' | 'admin-lt' | 'admin-assign' | 'facilitator' | 'report';