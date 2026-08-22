/* ==========================================================================
   SUPABASE DATA ADAPTER LAYER (MOCK REPOSITORY PROVIDER)
   This service mirrors Supabase JS Client async calls (Promise-based).
   When ready to integrate Supabase, swap mock logic with supabase.from('table').select().
   ========================================================================== */

import {
  MetricRecord,
  ChartSeriesData,
  ManagementRecord,
  NotificationItem,
  AgendaItem,
  EquipmentItem,
  ProjectRecord,
  TimelineScheduleEvent,
  CrewMember,
  CrewSopChecklist
} from '../types/database';
import { TableFilterParams, PaginatedResult } from '../types/ui';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Mock Initial Data Sets (Empty Repository Arrays)
const MOCK_METRICS: MetricRecord[] = [];
const MOCK_RECORDS: ManagementRecord[] = [];
const MOCK_NOTIFICATIONS: NotificationItem[] = [];
const MOCK_AGENDAS: AgendaItem[] = [];
const MOCK_EQUIPMENT: EquipmentItem[] = [];
const MOCK_PROJECTS: ProjectRecord[] = [];
const MOCK_TIMELINE_EVENTS: TimelineScheduleEvent[] = [];
const MOCK_CREW_MEMBERS: CrewMember[] = [];
const MOCK_SOP_CHECKLISTS: CrewSopChecklist[] = [
  {
    id: 'sop-101',
    crewId: 'all-crew',
    crewName: 'Camera & Visual Production SOP',
    crewRole: 'Camera Operator / VJ',
    targetRoles: ['Camera Operator', 'Visual Operator'],
    projectName: 'Standard Multi-Cam Live Event SOP',
    tasks: [
      { id: 't1', title: 'Verify sensor cleanliness, lens focus & optical coating check', category: 'Pre-Event', isCompleted: true },
      { id: 't2', title: 'Confirm wireless video transmission feed with OB Van switcher', category: 'Pre-Event', isCompleted: false },
      { id: 't3', title: 'Maintain target framing, ISO exposure & white balance consistency during live show', category: 'Showtime', isCompleted: false },
      { id: 't4', title: 'Secure lens caps, battery packdown & case latch verification post-show', category: 'Post-Show Safety', isCompleted: false }
    ]
  },
  {
    id: 'sop-102',
    crewId: 'all-crew',
    crewName: 'Audio Engineering & Signal Route SOP',
    crewRole: 'Sound Engineer / Audio Ops',
    targetRoles: ['Sound Engineer', 'Audio Technician'],
    projectName: 'Main Stage Live Audio Audit SOP',
    tasks: [
      { id: 't5', title: 'Frequency spectrum scan for IEM & wireless mic interference check', category: 'Pre-Event', isCompleted: true },
      { id: 't6', title: 'Line check digital snake routing to FOH & Monitor console', category: 'Pre-Event', isCompleted: true },
      { id: 't7', title: 'Monitor decibel SPL headroom & multi-track backup recorder status', category: 'Showtime', isCompleted: false }
    ]
  }
];

export class DataService {
  /**
   * Fetch Dashboard KPIs
   */
  static async getMetrics(): Promise<MetricRecord[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_METRICS]), 150);
    });
  }

  /**
   * Fetch Analytics Chart Series Data
   */
  static async getChartSeries(timeframe: '24h' | '7d' | '30d' | '1y' = '30d'): Promise<ChartSeriesData> {
    return new Promise((resolve) => {
      let pointsCount = 12;
      if (timeframe === '24h') pointsCount = 24;
      if (timeframe === '7d') pointsCount = 7;
      if (timeframe === '30d') pointsCount = 30;
      if (timeframe === '1y') pointsCount = 12;

      const points = Array.from({ length: pointsCount }, (_, i) => {
        const base = Math.floor(Math.sin(i * 0.5) * 200 + 400);
        return {
          timestamp: `T-${pointsCount - i}`,
          label: timeframe === '24h' ? `${i}:00` : `Day ${i + 1}`,
          value: base + Math.floor(Math.random() * 80),
          secondaryValue: Math.floor(base * 0.6 + Math.random() * 40)
        };
      });

      const total = points.reduce((acc, p) => acc + p.value, 0);

      resolve({
        timeframe,
        points,
        summary: {
          total,
          formattedTotal: `$${total.toLocaleString()}`,
          peak: Math.max(...points.map((p) => p.value)),
          average: Math.round(total / points.length)
        }
      });
    });
  }

  /**
   * Fetch Paginated Data Table Records with Filter Parameters
   */
  static async getManagementRecords(params: TableFilterParams): Promise<PaginatedResult<ManagementRecord>> {
    return new Promise((resolve) => {
      let filtered = [...MOCK_RECORDS];

      if (params.searchQuery.trim()) {
        const q = params.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
        );
      }

      if (params.roleFilter && params.roleFilter !== 'ALL') {
        filtered = filtered.filter((r) => r.role === params.roleFilter);
      }

      if (params.statusFilter && params.statusFilter !== 'ALL') {
        filtered = filtered.filter((r) => r.status === params.statusFilter);
      }

      // Sorting
      if (params.sortBy) {
        filtered.sort((a, b) => {
          const valA = (a as any)[params.sortBy];
          const valB = (b as any)[params.sortBy];
          if (valA < valB) return params.sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return params.sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      const totalRecords = filtered.length;
      const totalPages = Math.ceil(totalRecords / params.pageSize) || 1;
      const startIndex = (params.page - 1) * params.pageSize;
      const paginatedData = filtered.slice(startIndex, startIndex + params.pageSize);

      resolve({
        data: paginatedData,
        totalRecords,
        page: params.page,
        pageSize: params.pageSize,
        totalPages
      });
    });
  }

  /**
   * Fetch System Notifications
   */
  static async getNotifications(): Promise<NotificationItem[]> {
    return new Promise((resolve) => {
      resolve([...MOCK_NOTIFICATIONS]);
    });
  }

  /**
   * Fetch Scheduled Agendas
   */
  static async getAgendaItems(): Promise<AgendaItem[]> {
    return new Promise((resolve) => {
      resolve([...MOCK_AGENDAS]);
    });
  }

  /**
   * Fetch Equipment Inventory List with Usage History
   */
  static async getEquipmentList(): Promise<EquipmentItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('equipment_items').select('*');
        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            serialNumber: row.serial_number || row.serialNumber,
            quantity: row.quantity || 1,
            status: row.status,
            imageUrl: row.image_url || row.imageUrl,
            additionalNotes: row.additional_notes || row.additionalNotes,
            bundledTools: row.bundled_tools || row.bundledTools || [],
            history: row.history || []
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed for equipment_items, using mock fallback.', err);
      }
    }
    return [...MOCK_EQUIPMENT];
  }

  /**
   * Fetch Project Records with Crew & Assigned Equipment
   */
  /**
   * Fetch Project Records with Crew & Assigned Equipment
   */
  static async getProjects(): Promise<ProjectRecord[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('projects').select('*');
        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            projectName: row.project_name || row.projectName,
            clientName: row.client_name || row.clientName,
            clientContact: row.client_contact || row.clientContact,
            venueName: row.venue_name || row.venueName,
            venueAddress: row.venue_address || row.venueAddress,
            eventLinkMaps: row.event_link_maps || row.eventLinkMaps || '',
            eventDate: row.event_date || row.eventDate,
            startTime: row.start_time || row.startTime,
            endTime: row.end_time || row.endTime,
            status: row.status,
            picName: row.pic_name || row.picName,
            picPhone: row.pic_phone || row.picPhone,
            additionalNotes: row.additional_notes || row.additionalNotes || '',
            crewList: row.crew_list || row.crewList || [],
            contentProductions: row.content_productions || row.contentProductions || []
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed for projects, using mock fallback.', err);
      }
    }
    return [...MOCK_PROJECTS];
  }

  /**
   * Fetch Timeline Schedule Events & Deadlines (Including Auto-Created Project Events)
   */
  static async getTimelineEvents(): Promise<TimelineScheduleEvent[]> {
    let explicitEvents: TimelineScheduleEvent[] = [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('timeline_events').select('*');
        if (!error && data) {
          explicitEvents = data.map((row: any) => ({
            id: row.id,
            date: row.date,
            title: row.title,
            type: row.type,
            projectId: row.project_id || row.projectId,
            projectName: row.project_name || row.projectName,
            priority: row.priority,
            status: row.status,
            additionalDescription: row.additional_description || row.additionalDescription,
            isAutoCreated: row.is_auto_created || row.isAutoCreated || false
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed for timeline_events, using mock fallback.', err);
      }
    } else {
      explicitEvents = [...MOCK_TIMELINE_EVENTS];
    }

    // Auto-generate timeline events from Project Data
    const projects = await DataService.getProjects();
    const autoProjectEvents: TimelineScheduleEvent[] = projects
      .filter((p) => p.projectName && p.eventDate)
      .map((p) => ({
        id: `auto-proj-evt-${p.id}`,
        date: p.eventDate,
        title: `Event Day: ${p.projectName}`,
        type: 'Event Day' as const,
        projectId: p.id,
        projectName: p.projectName,
        priority: 'High' as const,
        status: p.status === 'Completed' ? 'Completed' : p.status === 'Live Show' ? 'In Progress' : 'Pending',
        additionalDescription: p.additionalNotes ? p.additionalNotes : (p.venueName ? `Location: ${p.venueName}` : 'Auto-generated Project Event'),
        isAutoCreated: true
      }));

    const existingIds = new Set(explicitEvents.map((e) => e.id));
    const combined = [...explicitEvents];

    autoProjectEvents.forEach((ae) => {
      if (!existingIds.has(ae.id)) {
        combined.push(ae);
      }
    });

    return combined;
  }

  /**
   * Fetch Crew Members Roster
   */
  static async getCrewMembers(): Promise<CrewMember[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('crew_members').select('*');
        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            name: row.name,
            role: row.role,
            phone: row.phone,
            email: row.email,
            address: row.address,
            avatarInitials: row.avatar_initials || row.avatarInitials,
            avatarUrl: row.avatar_url || row.avatarUrl,
            status: row.status,
            assignedProjects: row.assigned_projects || row.assignedProjects || [],
            passcode: row.passcode || 'crew1234'
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed for crew_members, using mock fallback.', err);
      }
    }
    return [...MOCK_CREW_MEMBERS];
  }

  /**
   * Fetch Crew SOP Checklists
   */
  static async getSopChecklists(): Promise<CrewSopChecklist[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('sop_checklists').select('*');
        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            crewId: row.crew_id || row.crewId,
            crewName: row.crew_name || row.crewName,
            crewRole: row.crew_role || row.crewRole,
            targetRoles: row.target_roles || row.targetRoles || [],
            projectName: row.project_name || row.projectName,
            tasks: row.tasks || []
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed for sop_checklists, using mock fallback.', err);
      }
    }
    return [...MOCK_SOP_CHECKLISTS];
  }

  // ==========================================================================
  // CREATE / UPDATE / DELETE MUTATION METHODS FOR SUPABASE & MOCK FALLBACK
  // ==========================================================================

  // --- PROJECTS CRUD ---
  static async createProject(proj: Partial<ProjectRecord>): Promise<ProjectRecord> {
    const newProj: ProjectRecord = {
      id: proj.id || `proj-${Date.now()}`,
      projectName: proj.projectName || 'New Production Event',
      clientName: proj.clientName || 'General Client',
      clientContact: proj.clientContact || 'contact@client.com',
      venueName: proj.venueName || 'Main Arena',
      venueAddress: proj.venueAddress || 'Jakarta',
      eventLinkMaps: proj.eventLinkMaps || '',
      eventDate: proj.eventDate || new Date().toISOString().split('T')[0],
      startTime: proj.startTime || '09:00',
      endTime: proj.endTime || '18:00',
      status: proj.status || 'Planning',
      picName: proj.picName || '',
      picPhone: proj.picPhone || '',
      additionalNotes: proj.additionalNotes || '',
      crewList: proj.crewList || [],
      contentProductions: proj.contentProductions || []
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('projects').insert([{
          id: newProj.id,
          project_name: newProj.projectName || 'New Event',
          client_name: newProj.clientName || '-',
          client_contact: newProj.clientContact || '-',
          venue_name: newProj.venueName || '-',
          venue_address: newProj.venueAddress || '-',
          event_link_maps: newProj.eventLinkMaps || '',
          event_date: newProj.eventDate || new Date().toISOString().split('T')[0],
          start_time: newProj.startTime || '00:00',
          end_time: newProj.endTime || '00:00',
          status: newProj.status || 'Planning',
          pic_name: newProj.picName || '',
          pic_phone: newProj.picPhone || '',
          additional_notes: newProj.additionalNotes || '',
          crew_list: newProj.crewList || [],
          content_productions: newProj.contentProductions || []
        }]);

        if (error) {
          console.error('Supabase createProject Error:', error);
          if (error.code === '22007') {
            alert('⚠️ SUPABASE DATABASE MIGRATION REQUIRED:\n\nPostgreSQL menolak format Date Range ("2026-08-27 to 2026-08-29") karena kolom event_date di database Supabase Anda masih bertipe DATE.\n\nSilakan buka Supabase SQL Editor dan jalankan query berikut:\n\nALTER TABLE public.projects ALTER COLUMN event_date TYPE TEXT;');
          } else {
            alert(`⚠️ Supabase Database Error (${error.code}):\n${error.message}\n${error.hint || ''}`);
          }
        }
      } catch (err) {
        console.warn('Supabase createProject failed, using local fallback.', err);
      }
    }

    MOCK_PROJECTS.unshift(newProj);
    return newProj;
  }

  static async updateProject(id: string, updates: Partial<ProjectRecord>): Promise<ProjectRecord | null> {
    const found = MOCK_PROJECTS.find((p) => p.id === id);
    if (found) {
      Object.assign(found, updates);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: any = {};
        if (updates.projectName !== undefined) payload.project_name = updates.projectName;
        if (updates.clientName !== undefined) payload.client_name = updates.clientName || '-';
        if (updates.clientContact !== undefined) payload.client_contact = updates.clientContact || '-';
        if (updates.venueName !== undefined) payload.venue_name = updates.venueName || '-';
        if (updates.venueAddress !== undefined) payload.venue_address = updates.venueAddress || '-';
        if (updates.eventLinkMaps !== undefined) payload.event_link_maps = updates.eventLinkMaps || '';
        if (updates.eventDate !== undefined) payload.event_date = updates.eventDate;
        if (updates.startTime !== undefined) payload.start_time = updates.startTime || '00:00';
        if (updates.endTime !== undefined) payload.end_time = updates.endTime || '00:00';
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.picName !== undefined) payload.pic_name = updates.picName;
        if (updates.picPhone !== undefined) payload.pic_phone = updates.picPhone;
        if (updates.additionalNotes !== undefined) payload.additional_notes = updates.additionalNotes || '';
        if (updates.crewList !== undefined) payload.crew_list = updates.crewList;
        if (updates.contentProductions !== undefined) payload.content_productions = updates.contentProductions;

        const { error } = await supabase.from('projects').update(payload).eq('id', id);
        if (error) {
          console.error('Supabase updateProject Error:', error);
          if (error.code === '22007') {
            alert('⚠️ SUPABASE DATABASE MIGRATION REQUIRED:\n\nPostgreSQL menolak format Date Range karena kolom event_date di database Supabase Anda masih bertipe DATE.\n\nSilakan buka Supabase SQL Editor dan jalankan query berikut:\n\nALTER TABLE public.projects ALTER COLUMN event_date TYPE TEXT;');
          }
        }
      } catch (err) {
        console.warn('Supabase updateProject failed, using local fallback.', err);
      }
    }

    return found || null;
  }

  static async deleteProject(id: string): Promise<boolean> {
    const idx = MOCK_PROJECTS.findIndex((p) => p.id === id);
    if (idx !== -1) MOCK_PROJECTS.splice(idx, 1);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteProject failed, using local fallback.', err);
      }
    }

    return true;
  }

  // --- CREW MEMBERS CRUD ---
  static async createCrewMember(crew: Partial<CrewMember>): Promise<CrewMember> {
    const nameStr = crew.name || 'New Technical Officer';
    const initials = nameStr.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'TO';

    const newCrew: CrewMember = {
      id: crew.id || `crew-${Date.now()}`,
      name: nameStr,
      role: crew.role || '',
      phone: crew.phone || '',
      email: crew.email || '',
      address: crew.address || '',
      avatarInitials: initials,
      status: crew.status || 'Available',
      assignedProjects: crew.assignedProjects || [],
      passcode: crew.passcode || 'crew1234'
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('crew_members').insert([{
          id: newCrew.id,
          name: newCrew.name,
          role: newCrew.role,
          phone: newCrew.phone,
          email: newCrew.email,
          address: newCrew.address,
          avatar_initials: newCrew.avatarInitials,
          status: newCrew.status,
          assigned_projects: newCrew.assignedProjects,
          passcode: newCrew.passcode
        }]);
      } catch (err) {
        console.warn('Supabase createCrewMember failed, using local fallback.', err);
      }
    }

    MOCK_CREW_MEMBERS.unshift(newCrew);
    return newCrew;
  }

  static async updateCrewMember(id: string, updates: Partial<CrewMember>): Promise<CrewMember | null> {
    const found = MOCK_CREW_MEMBERS.find((c) => c.id === id);
    if (found) {
      Object.assign(found, updates);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.role !== undefined) payload.role = updates.role;
        if (updates.phone !== undefined) payload.phone = updates.phone;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.address !== undefined) payload.address = updates.address;
        if (updates.avatarInitials !== undefined) payload.avatar_initials = updates.avatarInitials;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.assignedProjects !== undefined) payload.assigned_projects = updates.assignedProjects;
        if (updates.passcode !== undefined) payload.passcode = updates.passcode;

        await supabase.from('crew_members').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateCrewMember failed, using local fallback.', err);
      }
    }

    return found || null;
  }

  static async deleteCrewMember(id: string): Promise<boolean> {
    const idx = MOCK_CREW_MEMBERS.findIndex((c) => c.id === id);
    if (idx !== -1) MOCK_CREW_MEMBERS.splice(idx, 1);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('crew_members').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteCrewMember failed, using local fallback.', err);
      }
    }

    return true;
  }

  // --- EQUIPMENT ITEMS CRUD ---
  static async createEquipment(item: Partial<EquipmentItem>): Promise<EquipmentItem> {
    const newItem: EquipmentItem = {
      id: item.id || `eq-${Date.now()}`,
      name: item.name || 'New Technical Equipment',
      category: item.category || 'Camera Systems',
      serialNumber: item.serialNumber || `SN-REC-${Math.floor(100 + Math.random() * 900)}`,
      quantity: item.quantity || 1,
      status: item.status || 'Available',
      imageUrl: item.imageUrl || '',
      additionalNotes: item.additionalNotes || '',
      bundledTools: item.bundledTools || [],
      history: item.history || []
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('equipment_items').insert([{
          id: newItem.id,
          name: newItem.name,
          category: newItem.category,
          serial_number: newItem.serialNumber,
          quantity: newItem.quantity,
          status: newItem.status,
          image_url: newItem.imageUrl,
          additional_notes: newItem.additionalNotes,
          bundled_tools: newItem.bundledTools,
          history: newItem.history
        }]);
      } catch (err) {
        console.warn('Supabase createEquipment failed, using local fallback.', err);
      }
    }

    MOCK_EQUIPMENT.unshift(newItem);
    return newItem;
  }

  static async updateEquipment(id: string, updates: Partial<EquipmentItem>): Promise<EquipmentItem | null> {
    const found = MOCK_EQUIPMENT.find((e) => e.id === id);
    if (found) {
      Object.assign(found, updates);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.serialNumber !== undefined) payload.serial_number = updates.serialNumber;
        if (updates.quantity !== undefined) payload.quantity = updates.quantity;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.additionalNotes !== undefined) payload.additional_notes = updates.additionalNotes;
        if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
        if (updates.bundledTools !== undefined) payload.bundled_tools = updates.bundledTools;
        if (updates.history !== undefined) payload.history = updates.history;

        await supabase.from('equipment_items').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateEquipment failed, using local fallback.', err);
      }
    }

    return found || null;
  }

  static async deleteEquipment(id: string): Promise<boolean> {
    const idx = MOCK_EQUIPMENT.findIndex((e) => e.id === id);
    if (idx !== -1) MOCK_EQUIPMENT.splice(idx, 1);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('equipment_items').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteEquipment failed, using local fallback.', err);
      }
    }

    return true;
  }

  // --- TIMELINE EVENTS CRUD ---
  static async createTimelineEvent(event: Partial<TimelineScheduleEvent>): Promise<TimelineScheduleEvent> {
    const newEvt: TimelineScheduleEvent = {
      id: event.id || `evt-${Date.now()}`,
      date: event.date || new Date().toISOString().split('T')[0],
      title: event.title || 'New Production Deadline',
      type: event.type || 'Deadline',
      projectName: event.projectName || 'General Timeline',
      priority: event.priority || 'Medium',
      status: event.status || 'Pending',
      additionalDescription: event.additionalDescription || ''
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('timeline_events').insert([{
          id: newEvt.id,
          date: newEvt.date,
          title: newEvt.title,
          type: newEvt.type,
          project_name: newEvt.projectName,
          priority: newEvt.priority,
          status: newEvt.status,
          additional_description: newEvt.additionalDescription
        }]);
      } catch (err) {
        console.warn('Supabase createTimelineEvent failed, using local fallback.', err);
      }
    }

    MOCK_TIMELINE_EVENTS.unshift(newEvt);
    return newEvt;
  }

  static async deleteTimelineEvent(id: string): Promise<boolean> {
    const idx = MOCK_TIMELINE_EVENTS.findIndex((t) => t.id === id);
    if (idx !== -1) MOCK_TIMELINE_EVENTS.splice(idx, 1);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('timeline_events').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteTimelineEvent failed, using local fallback.', err);
      }
    }

    return true;
  }

  // --- SOP CHECKLISTS CRUD ---
  static async createSopChecklist(sop: Partial<CrewSopChecklist>): Promise<CrewSopChecklist> {
    const newSop: CrewSopChecklist = {
      id: sop.id || `sop-${Date.now()}`,
      crewId: sop.crewId || 'all-crew',
      crewName: sop.crewName || 'General Crew SOP',
      crewRole: sop.crewRole || 'All Roles',
      targetRoles: sop.targetRoles || ['All Roles'],
      projectName: sop.projectName || 'General Event SOP Template',
      tasks: sop.tasks || []
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('sop_checklists').insert([{
          id: newSop.id,
          crew_id: newSop.crewId,
          crew_name: newSop.crewName,
          crew_role: newSop.crewRole,
          target_roles: newSop.targetRoles,
          project_name: newSop.projectName,
          tasks: newSop.tasks
        }]);
      } catch (err) {
        console.warn('Supabase createSopChecklist failed, using local fallback.', err);
      }
    }

    MOCK_SOP_CHECKLISTS.unshift(newSop);
    return newSop;
  }

  static async updateSopChecklist(sop: Partial<CrewSopChecklist> & { id: string }): Promise<CrewSopChecklist | null> {
    const idx = MOCK_SOP_CHECKLISTS.findIndex((s) => s.id === sop.id);
    let updated: CrewSopChecklist;
    if (idx !== -1) {
      MOCK_SOP_CHECKLISTS[idx] = { ...MOCK_SOP_CHECKLISTS[idx], ...sop };
      updated = MOCK_SOP_CHECKLISTS[idx];
    } else {
      updated = {
        id: sop.id,
        crewId: sop.crewId || 'all-crew',
        crewName: sop.crewName || 'General Crew SOP',
        crewRole: sop.crewRole || 'All Roles',
        targetRoles: sop.targetRoles || ['All Roles'],
        projectName: sop.projectName || 'General Event SOP Template',
        tasks: sop.tasks || []
      };
      MOCK_SOP_CHECKLISTS.unshift(updated);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('sop_checklists').update({
          crew_id: updated.crewId,
          crew_name: updated.crewName,
          crew_role: updated.crewRole,
          target_roles: updated.targetRoles,
          project_name: updated.projectName,
          tasks: updated.tasks
        }).eq('id', updated.id);
      } catch (err) {
        console.warn('Supabase updateSopChecklist failed, using local fallback.', err);
      }
    }

    return updated;
  }

  static async deleteSopChecklist(id: string): Promise<boolean> {
    const idx = MOCK_SOP_CHECKLISTS.findIndex((s) => s.id === id);
    if (idx !== -1) MOCK_SOP_CHECKLISTS.splice(idx, 1);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('sop_checklists').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteSopChecklist failed, using local fallback.', err);
      }
    }

    return true;
  }
}
