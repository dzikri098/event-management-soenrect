/* ==========================================================================
   SUPABASE-READY DATABASE TYPES & SCHEMAS
   These interfaces strictly mirror future Supabase PostgreSQL database tables.
   ========================================================================== */

export interface MetricRecord {
  id: string;
  title: string;
  category: string;
  currentValue: number;
  formattedValue: string;
  previousValue: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
  timeframe: string;
  history: number[];
  targetValue?: number;
  unit?: string;
}

export interface ChartDataPoint {
  timestamp: string;
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
}

export interface ChartSeriesData {
  timeframe: '24h' | '7d' | '30d' | '1y';
  points: ChartDataPoint[];
  summary: {
    total: number;
    formattedTotal: string;
    peak: number;
    average: number;
  };
}

export interface ManagementRecord {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Product Architect' | 'Data Lead' | 'Member';
  status: 'Active' | 'Pending' | 'Suspended' | 'Archived';
  volume: number;
  formattedVolume: string;
  healthScore: number; // 0 - 100
  lastActive: string;
  avatarUrl?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
}

export interface AgendaAttendee {
  name: string;
  role: string;
  avatarInitials: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  category: 'Architecture' | 'Security Audit' | 'Deployment' | 'Team Sync' | 'Client Demo';
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  attendees: AgendaAttendee[];
  meetingLink?: string;
}

/* ==========================================================================
   EVENT & PRODUCTION MANAGEMENT SCHEMAS
   ========================================================================== */

export interface EquipmentUsageHistory {
  id: string;
  equipmentId: string;
  responsiblePerson: string;
  responsibleRole: string;
  responsiblePhone: string;
  projectName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  notes?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category:
    | 'Projection Equipment'
    | 'Power & Electrical'
    | 'Camera Systems'
    | 'Lighting Rig'
    | 'Audio & Wireless'
    | 'Lenses & Optics'
    | 'Grip & Power';
  serialNumber: string;
  quantity: number; // Stock quantity (e.g. 2 units, 4 units)
  status: 'Available' | 'In Use' | 'Maintenance' | 'Retired';
  imageUrl?: string;
  additionalNotes?: string;
  bundledTools?: string[]; // Additional tools/accessories bundled with equipment (e.g. Remote, HDMI, Power Cable)
  history: EquipmentUsageHistory[];
}

export interface ProjectCrewAssignment {
  crewId: string;
  name: string;
  role: string;
  phone: string;
  assignedEquipmentIds: string[]; // Linked to EquipmentItem.id
  sopCompleted: boolean;
}

export interface ContentRevisionHistory {
  id: string;
  version: string; // e.g. "v1.2", "v1.1", "v1.0"
  updatedAt: string; // YYYY-MM-DD
  editorName: string;
  notes: string;
  fileSize?: string;
  isImplemented?: boolean;
}

export interface ContentProductionItem {
  id: string;
  title: string;
  type: '3D Motion Graphics' | 'LED Visual Loop' | 'Sponsor Reel' | 'Live Camera Overlay';
  resolution: string;
  status: 'Approved' | 'In Rendering' | 'Revision Needed' | 'Revision' | 'Implemented';
  editorName: string;
  fileUrl?: string; // Optional external file link (Google Drive, Dropbox, Preview Link)
  revisions?: ContentRevisionHistory[];
  qmgSignedOff?: boolean;
  qmgSignerName?: string;
  qmgSignDate?: string;
}

export interface ProjectRecord {
  id: string;
  projectName: string;
  clientName: string;
  clientContact: string;
  venueName: string;
  venueAddress: string;
  eventLinkMaps?: string; // Optional Google Maps link
  eventDate: string; // YYYY-MM-DD or YYYY-MM-DD to YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: 'Planning' | 'In Production' | 'Live Show' | 'Completed';
  picName?: string;
  picPhone?: string;
  additionalNotes?: string; // Optional project notes used for timeline description
  crewList: ProjectCrewAssignment[];
  contentProductions?: ContentProductionItem[];
}

export interface TimelineScheduleEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'Deadline' | 'Milestone' | 'Event Day' | 'Equipment Audit';
  projectId?: string;
  projectName?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  additionalDescription?: string;
  isAutoCreated?: boolean; // True if automatically generated from Project Data
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  address: string;
  avatarInitials: string;
  avatarUrl?: string;
  status: 'Available' | 'On Assignment' | 'On Leave';
  assignedProjects: string[];
  passcode: string;
}

export interface SopTask {
  id: string;
  title: string;
  category: 'Pre-Event' | 'Showtime' | 'Post-Show Safety';
  isCompleted: boolean;
}

export interface CrewSopChecklist {
  id: string;
  crewId: string;
  crewName: string;
  crewRole: string;
  targetRoles?: string[];
  projectName: string;
  tasks: SopTask[];
}
