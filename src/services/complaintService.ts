import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  MealType,
  ComplaintCategory,
  ComplaintStatus,
  ComplaintRecord,
} from '@/types/database';

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Food Quality',
  'Taste',
  'Food Temperature',
  'Hygiene',
  'Food Shortage',
  'Other',
];

const LOCAL_STORAGE_COMPLAINTS_KEY = 'srm_mess_complaints_storage_v1';

function getLocalComplaints(): ComplaintRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COMPLAINTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load local complaints:', err);
    return [];
  }
}

function saveLocalComplaints(complaints: ComplaintRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_COMPLAINTS_KEY, JSON.stringify(complaints));
  } catch (err) {
    console.error('Failed to save local complaints:', err);
  }
}

export async function submitComplaint(params: {
  studentId: string;
  studentContact?: string;
  campusDate: string;
  mealType: MealType;
  category: ComplaintCategory;
  description: string;
}): Promise<ComplaintRecord> {
  const studentId = params.studentId.trim().toUpperCase();
  const studentContact = params.studentContact?.trim() || null;
  const campusDate = params.campusDate.trim();
  const mealType = params.mealType;
  const category = params.category;
  const description = params.description.trim();
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    try {
      const newRecord = {
        student_id: studentId,
        student_contact: studentContact,
        campus_date: campusDate,
        meal_type: mealType,
        category,
        description,
        status: 'Pending' as ComplaintStatus,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('complaints')
        .insert(newRecord)
        .select()
        .single();

      if (error) {
        console.error('Supabase submitComplaint error:', error);
        throw error;
      }

      return data as ComplaintRecord;
    } catch (err) {
      console.warn('Falling back to local storage for complaint submission:', err);
    }
  }

  // Local storage persistence
  const allComplaints = getLocalComplaints();
  const newComplaint: ComplaintRecord = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    student_id: studentId,
    student_contact: studentContact,
    campus_date: campusDate,
    meal_type: mealType,
    category,
    description,
    status: 'Pending',
    created_at: now,
    updated_at: now,
  };

  allComplaints.unshift(newComplaint);
  saveLocalComplaints(allComplaints);
  return newComplaint;
}

/**
 * Fetch complaints belonging to a specific student only (Private view)
 */
export async function fetchStudentComplaints(studentId: string): Promise<ComplaintRecord[]> {
  const normalizedId = studentId.trim().toUpperCase();
  if (!normalizedId) return [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('student_id', normalizedId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ComplaintRecord[];
    } catch (err) {
      console.warn('Falling back to local storage for student complaints:', err);
    }
  }

  const all = getLocalComplaints();
  return all.filter((c) => c.student_id.toUpperCase() === normalizedId);
}

/**
 * Fetch complaints for authorized mess managers / admin portal
 */
export async function fetchAllComplaintsForManager(): Promise<ComplaintRecord[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ComplaintRecord[];
    } catch (err) {
      console.warn('Falling back to local storage for manager complaints:', err);
    }
  }

  return getLocalComplaints();
}

/**
 * Update complaint status by mess management
 */
export async function updateComplaintStatus(
  id: string,
  newStatus: ComplaintStatus,
  adminNotes?: string
): Promise<ComplaintRecord | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    try {
      const updatePayload: Record<string, unknown> = {
        status: newStatus,
        updated_at: now,
      };
      if (adminNotes !== undefined) {
        updatePayload.admin_notes = adminNotes;
      }

      const { data, error } = await supabase
        .from('complaints')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ComplaintRecord;
    } catch (err) {
      console.warn('Falling back to local storage for status update:', err);
    }
  }

  const all = getLocalComplaints();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const updated: ComplaintRecord = {
    ...all[idx],
    status: newStatus,
    admin_notes: adminNotes !== undefined ? adminNotes : all[idx].admin_notes,
    updated_at: now,
  };
  all[idx] = updated;
  saveLocalComplaints(all);
  return updated;
}

