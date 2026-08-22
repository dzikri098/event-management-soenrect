-- ============================================================================
-- SOENRECT MANAGEMENT SUITE — SUPABASE DATABASE SCHEMA MIGRATION & SEED DATA
-- Copy and paste this complete SQL script into your Supabase SQL Editor.
-- Dashboard URL: https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- 1. PROJECTS TABLE
-- Schema for content_productions: Array of ContentProductionItem:
--   {
--     id: string,
--     title: string,
--     type: string,
--     resolution: string,
--     status: 'On-Progress' | 'Revision' | 'In Rendering' | 'Approved' | 'Revision Needed' | 'Implemented',
--     editorName: string,
--     fileUrl?: string,
--     qmgSignedOff?: boolean,
--     qmgSignerName?: string,
--     qmgSignDate?: string,
--     revisions: Array<{
--       id: string,
--       version: string,
--       updatedAt: string,
--       editorName: string,
--       notes: string,
--       fileSize?: string,
--       isImplemented?: boolean
--     }>
--   }
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_contact TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  event_link_maps TEXT,
  event_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Planning', 'In Production', 'Live Show', 'Completed')),
  pic_name TEXT,
  pic_phone TEXT,
  additional_notes TEXT,
  crew_list JSONB DEFAULT '[]'::jsonb,
  content_productions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREW MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.crew_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  avatar_initials TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('Available', 'On Assignment', 'On Leave')),
  assigned_projects JSONB DEFAULT '[]'::jsonb,
  passcode TEXT NOT NULL DEFAULT 'crew1234',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EQUIPMENT ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.equipment_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Projection Equipment', 'Power & Electrical', 'Camera Systems', 'Lighting Rig', 'Audio & Wireless', 'Lenses & Optics', 'Grip & Power')),
  serial_number TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('Available', 'In Use', 'Maintenance', 'Retired')),
  image_url TEXT,
  additional_notes TEXT,
  bundled_tools JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TIMELINE EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Deadline', 'Milestone', 'Event Day', 'Equipment Audit')),
  project_id TEXT,
  project_name TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  status TEXT NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  additional_description TEXT,
  is_auto_created BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SOP CHECKLISTS TABLE
CREATE TABLE IF NOT EXISTS public.sop_checklists (
  id TEXT PRIMARY KEY,
  crew_id TEXT DEFAULT 'all-crew',
  crew_name TEXT,
  crew_role TEXT,
  target_roles JSONB DEFAULT '[]'::jsonb,
  project_name TEXT NOT NULL,
  tasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MASTER CATEGORY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.category_settings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  module_key TEXT NOT NULL,
  description TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC READ ACCESS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sop_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public write access to projects" ON public.projects;
CREATE POLICY "Allow public read access to projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public write access to projects" ON public.projects FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access to crew_members" ON public.crew_members;
DROP POLICY IF EXISTS "Allow public write access to crew_members" ON public.crew_members;
CREATE POLICY "Allow public read access to crew_members" ON public.crew_members FOR SELECT USING (true);
CREATE POLICY "Allow public write access to crew_members" ON public.crew_members FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access to equipment_items" ON public.equipment_items;
DROP POLICY IF EXISTS "Allow public write access to equipment_items" ON public.equipment_items;
CREATE POLICY "Allow public read access to equipment_items" ON public.equipment_items FOR SELECT USING (true);
CREATE POLICY "Allow public write access to equipment_items" ON public.equipment_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access to timeline_events" ON public.timeline_events;
DROP POLICY IF EXISTS "Allow public write access to timeline_events" ON public.timeline_events;
CREATE POLICY "Allow public read access to timeline_events" ON public.timeline_events FOR SELECT USING (true);
CREATE POLICY "Allow public write access to timeline_events" ON public.timeline_events FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access to sop_checklists" ON public.sop_checklists;
DROP POLICY IF EXISTS "Allow public write access to sop_checklists" ON public.sop_checklists;
CREATE POLICY "Allow public read access to sop_checklists" ON public.sop_checklists FOR SELECT USING (true);
CREATE POLICY "Allow public write access to sop_checklists" ON public.sop_checklists FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access to category_settings" ON public.category_settings;
DROP POLICY IF EXISTS "Allow public write access to category_settings" ON public.category_settings;
CREATE POLICY "Allow public read access to category_settings" ON public.category_settings FOR SELECT USING (true);
CREATE POLICY "Allow public write access to category_settings" ON public.category_settings FOR ALL USING (true);

