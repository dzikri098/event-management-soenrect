/* ==========================================================================
   MASTER CATEGORY MANAGEMENT STORE & SERVICE
   Centralized category manager for form dropdowns across all modules
   (Equipment, Content Assets, SOP Checklists, Timeline Events, Crew Roles).
   ========================================================================== */

import { supabase, isSupabaseConfigured } from './supabaseClient';

export type CategoryModuleKey = 'equipment' | 'content' | 'sop' | 'timeline' | 'crew';

export interface MasterCategoryGroup {
  id: string;
  name: string;
  moduleKey: CategoryModuleKey;
  description: string;
  items: string[];
}

export class CategoryStoreService {
  private static STORAGE_KEY = 'soenrect_master_categories_v1';

  private static defaultCategoryGroups: MasterCategoryGroup[] = [
    {
      id: 'group-eq',
      name: 'Equipment Inventory Categories',
      moduleKey: 'equipment',
      description: 'Used in Equipment Inventory dropdowns and sidebar category subtabs.',
      items: [
        'Projection Equipment',
        'Power & Electrical',
        'Camera Systems',
        'Lighting Rig',
        'Audio & Wireless',
        'Lenses & Optics',
        'Grip & Power'
      ]
    },
    {
      id: 'group-content',
      name: 'Content Media Asset Types',
      moduleKey: 'content',
      description: 'Used in Content Production Assets and Media Upload form dropdowns.',
      items: ['Video', 'Graphics', 'Audio', 'Photo', 'Doc']
    },
    {
      id: 'group-sop',
      name: 'Crew SOP Checklist Categories',
      moduleKey: 'sop',
      description: 'Used in Crew Event Day Checklist & SOP Manager step categories.',
      items: ['Pre-Event', 'Showtime', 'Post-Show Safety']
    },
    {
      id: 'group-timeline',
      name: 'Timeline Schedule Event Types',
      moduleKey: 'timeline',
      description: 'Used in Timeline Schedule & Event Deadlines dropdowns.',
      items: ['Event Day', 'Deadline', 'Milestone', 'Equipment Audit']
    },
    {
      id: 'group-crew',
      name: 'Crew Roles & Specializations',
      moduleKey: 'crew',
      description: 'Used in Crew Member Registration and Directory dropdowns.',
      items: [
        'Director of Photography',
        'Sound Engineer',
        'Lighting Director',
        'Stage Manager',
        'Gaffer',
        'Production Assistant',
        'Video Editor'
      ]
    }
  ];

  public static async initialize(): Promise<void> {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.saveCategoryGroups(this.defaultCategoryGroups);
    }
    await this.fetchFromSupabase();
  }

  public static async fetchFromSupabase(): Promise<MasterCategoryGroup[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('category_settings').select('*');

        if (error) {
          console.warn('Supabase category fetch error, using local data:', error.message);
          return this.getCategoryGroups();
        }

        if (data && data.length > 0) {
          const groups: MasterCategoryGroup[] = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            moduleKey: row.module_key as CategoryModuleKey,
            description: row.description || '',
            items: Array.isArray(row.items) ? row.items : []
          }));
          this.saveCategoryGroups(groups);
          console.info('Categories synced from Supabase:', groups.length, 'groups.');
          return groups;
        } else {
          console.info('Seeding Supabase category_settings with defaults...');
          for (const group of this.defaultCategoryGroups) {
            await this.syncToSupabase(group);
          }
          this.saveCategoryGroups(this.defaultCategoryGroups);
          return this.defaultCategoryGroups;
        }
      } catch (err) {
        console.warn('Failed to sync categories with Supabase, using local cache.', err);
      }
    }
    return this.getCategoryGroups();
  }

  private static async syncToSupabase(group: MasterCategoryGroup): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('category_settings').upsert({
          id: group.id,
          name: group.name,
          module_key: group.moduleKey,
          description: group.description,
          items: group.items
        });
        if (error) {
          console.error('Failed to push category update to Supabase:', error.message);
          return false;
        }
        return true;
      } catch (err) {
        console.warn('Failed to push category settings update to Supabase.', err);
        return false;
      }
    }
    return true;
  }

  public static getCategoryGroups(): MasterCategoryGroup[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback if localStorage fails
    }
    return this.defaultCategoryGroups;
  }

  private static saveCategoryGroups(groups: MasterCategoryGroup[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(groups));
    } catch {
      // Ignore storage errors
    }
  }

  public static getCategories(moduleKey: CategoryModuleKey): string[] {
    const groups = this.getCategoryGroups();
    const group = groups.find((g) => g.moduleKey === moduleKey);
    return group ? group.items : [];
  }

  public static async addCategory(moduleKey: CategoryModuleKey, newCategoryName: string): Promise<boolean> {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return false;

    const groups = this.getCategoryGroups();
    const group = groups.find((g) => g.moduleKey === moduleKey);
    if (group) {
      const exists = group.items.some((i) => i.toLowerCase() === trimmed.toLowerCase());
      if (!exists) {
        group.items.push(trimmed);
        this.saveCategoryGroups(groups);
        await this.syncToSupabase(group);
        return true;
      }
    }
    return false;
  }

  public static async removeCategory(moduleKey: CategoryModuleKey, categoryName: string): Promise<boolean> {
    const groups = this.getCategoryGroups();
    const group = groups.find((g) => g.moduleKey === moduleKey);
    if (group) {
      const initialLength = group.items.length;
      group.items = group.items.filter((i) => i.toLowerCase() !== categoryName.toLowerCase());
      if (group.items.length !== initialLength) {
        this.saveCategoryGroups(groups);
        await this.syncToSupabase(group);
        return true;
      }
    }
    return false;
  }

  public static async resetDefaults(): Promise<void> {
    this.saveCategoryGroups(this.defaultCategoryGroups);
    if (isSupabaseConfigured() && supabase) {
      for (const group of this.defaultCategoryGroups) {
        await this.syncToSupabase(group);
      }
    }
  }
}
