import { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Send,
  CheckCircle,
  CircleAlert,
  Clock,
  ShieldCheck,
  Search,
  CheckCheck,
  FileText,
  Lock,
  Database,
} from 'lucide-react';
import {
  MealType,
  ComplaintCategory,
  ComplaintStatus,
  ComplaintRecord,
} from '@/types/database';
import {
  COMPLAINT_CATEGORIES,
  submitComplaint,
  fetchStudentComplaints,
  fetchAllComplaintsForManager,
  updateComplaintStatus,
} from '@/services/complaintService';
import {
  getIndiaDate,
  formatDateISO,
  getActiveMealIndex,
  MESS_TIMINGS,
} from '@/data/messData';
import { isSupabaseConfigured } from '@/lib/supabase';

const MEALS: MealType[] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const STUDENT_STORAGE_KEY = 'srm_mess_student_id';

export default function ComplaintSection() {
  const isConnected = useMemo(() => isSupabaseConfigured(), []);
  const todayISO = useMemo(() => formatDateISO(getIndiaDate()), []);
  const initialActiveMeal = useMemo<MealType>(() => {
    const idx = getActiveMealIndex();
    if (idx >= 0 && idx < MESS_TIMINGS.length) {
      return MESS_TIMINGS[idx].type;
    }
    return 'Lunch';
  }, []);

  // Mode: 'file' | 'track' | 'manager'
  const [activeTab, setActiveTab] = useState<'file' | 'track' | 'manager'>('file');

  // Form State
  const [campusDate, setCampusDate] = useState<string>(todayISO);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialActiveMeal);
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>('Food Quality');
  const [description, setDescription] = useState('');
  const [studentId, setStudentId] = useState<string>(() => {
    return localStorage.getItem(STUDENT_STORAGE_KEY) || '';
  });
  const [studentContact, setStudentContact] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<ComplaintRecord | null>(null);

  // Student Tracked Complaints
  const [myComplaints, setMyComplaints] = useState<ComplaintRecord[]>([]);
  const [isLoadingMyComplaints, setIsLoadingMyComplaints] = useState(false);

  // Manager Portal
  const [managerComplaints, setManagerComplaints] = useState<ComplaintRecord[]>([]);
  const [isLoadingManager, setIsLoadingManager] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load student's own complaints when viewing 'track' tab
  const loadMyComplaints = async (sid: string) => {
    if (!sid.trim()) {
      setMyComplaints([]);
      return;
    }
    setIsLoadingMyComplaints(true);
    try {
      const records = await fetchStudentComplaints(sid);
      setMyComplaints(records);
    } catch (err) {
      console.error('Failed to load student complaints:', err);
    } finally {
      setIsLoadingMyComplaints(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'track' && studentId.trim()) {
      loadMyComplaints(studentId);
    }
  }, [activeTab, studentId]);

  // Load manager complaints when viewing 'manager' tab
  const loadManagerComplaints = async () => {
    setIsLoadingManager(true);
    try {
      const records = await fetchAllComplaintsForManager();
      setManagerComplaints(records);
    } catch (err) {
      console.error('Failed to load manager complaints:', err);
    } finally {
      setIsLoadingManager(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'manager') {
      loadManagerComplaints();
    }
  }, [activeTab]);

  function handleStudentIdChange(val: string) {
    const uppercase = val.toUpperCase();
    setStudentId(uppercase);
    localStorage.setItem(STUDENT_STORAGE_KEY, uppercase);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitSuccess(null);
    setSubmitError(null);
    setSubmittedComplaint(null);

    // Form validations
    if (!studentId.trim()) {
      setSubmitError('Please enter your Student ID / Roll Number.');
      return;
    }
    if (!campusDate) {
      setSubmitError('Please select a valid campus date.');
      return;
    }
    if (!selectedMeal) {
      setSubmitError('Please select the affected meal session.');
      return;
    }
    if (!selectedCategory) {
      setSubmitError('Please choose a complaint category.');
      return;
    }
    if (description.trim().length < 10) {
      setSubmitError('Please describe the issue in more detail (minimum 10 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await submitComplaint({
        studentId,
        studentContact,
        campusDate,
        mealType: selectedMeal,
        category: selectedCategory,
        description,
      });

      setSubmittedComplaint(created);
      setSubmitSuccess(
        `Complaint registered successfully! Reference ID: #${created.id.slice(0, 8)} with initial status: ${created.status}.`
      );
      // Reset description
      setDescription('');
    } catch (err) {
      console.error('Complaint submission failed:', err);
      setSubmitError('Failed to record complaint. Please verify your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: ComplaintStatus) {
    setUpdatingId(id);
    try {
      await updateComplaintStatus(id, newStatus);
      await loadManagerComplaints();
    } catch (err) {
      console.error('Failed to update complaint status:', err);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredManagerComplaints = useMemo(() => {
    if (statusFilter === 'All') return managerComplaints;
    return managerComplaints.filter((c) => c.status === statusFilter);
  }, [managerComplaints, statusFilter]);

  const statusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-cinema-amber border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Search className="w-3 h-3" />
            Under Review
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30">
            <CheckCheck className="w-3 h-3" />
            Resolved
          </span>
        );
    }
  };

  return (
    <section id="complaints" className="relative py-20 md:py-28 px-4 md:px-6 bg-cinema-bg border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-8 reveal-hidden">
          <span className="section-eyebrow">Quality Assurance</span>
          <h2 className="section-heading mt-3">Mess Food Complaints</h2>
          <p className="section-subtitle">
            Voice issues with hygiene, quality, taste, shortage, or temperature. Confidential and monitored.
          </p>
        </div>

        {/* Privacy Notice & Persistence Status Banner */}
        <div className="mb-8 reveal-hidden reveal-hidden-delay-1 space-y-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-cinema-amber flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-semibold text-cinema-text">
                  Confidential Student Grievance Protection
                </p>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400">
                    <Database className="w-3 h-3" />
                    Supabase Persistent Storage
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-cinema-amber">
                    <Database className="w-3 h-3" />
                    Local Demo Storage
                  </span>
                )}
              </div>
              <p className="text-cinema-secondary leading-relaxed">
                Your identity and complaint description are confidential. Public students cannot view your
                submissions. Only verified campus mess managers and hostel authorities have access to review
                and resolve complaints.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 mb-8 gap-2 reveal-hidden reveal-hidden-delay-1">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'file'
                ? 'border-cinema-amber text-cinema-amber'
                : 'border-transparent text-cinema-secondary hover:text-cinema-text'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            File a Complaint
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'track'
                ? 'border-cinema-amber text-cinema-amber'
                : 'border-transparent text-cinema-secondary hover:text-cinema-text'
            }`}
          >
            <FileText className="w-4 h-4" />
            Track My Complaints
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manager')}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ml-auto ${
              activeTab === 'manager'
                ? 'border-cinema-amber text-cinema-amber'
                : 'border-transparent text-cinema-secondary hover:text-cinema-text'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Manager Portal
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: FILE A COMPLAINT */}
        {/* ========================================================================= */}
        {activeTab === 'file' && (
          <form
            onSubmit={handleSubmit}
            className="cinema-card p-6 md:p-8 space-y-6 reveal-hidden reveal-hidden-delay-2"
          >
            <div className="border-b border-white/10 pb-4">
              <h3 className="font-serif text-xl font-bold text-cinema-text">
                Submit Food Grievance
              </h3>
              <p className="text-xs text-cinema-secondary mt-1">
                Fill in the details below. All fields marked with * are required.
              </p>
            </div>

            {/* Student ID & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="complaint-student-id"
                  className="block text-xs font-semibold text-cinema-text mb-1.5"
                >
                  Student ID / Roll Number <span className="text-red-400">*</span>
                </label>
                <input
                  id="complaint-student-id"
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => handleStudentIdChange(e.target.value)}
                  placeholder="e.g. AP21110010001"
                  className="w-full bg-cinema-bg/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-cinema-text font-mono uppercase focus:outline-none focus:border-cinema-amber transition-colors"
                />
                <span className="text-[10px] text-cinema-secondary/60 mt-1 block">
                  Private — used by mess authorities for tracking and status updates.
                </span>
              </div>

              <div>
                <label
                  htmlFor="complaint-contact"
                  className="block text-xs font-semibold text-cinema-text mb-1.5"
                >
                  Contact Email / Phone <span className="text-cinema-secondary font-normal">(optional)</span>
                </label>
                <input
                  id="complaint-contact"
                  type="text"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                  placeholder="student@srmap.edu.in or mobile"
                  className="w-full bg-cinema-bg/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-cinema-text focus:outline-none focus:border-cinema-amber transition-colors"
                />
                <span className="text-[10px] text-cinema-secondary/60 mt-1 block">
                  Only if you want the mess committee to follow up directly.
                </span>
              </div>
            </div>

            {/* Campus Date & Meal Session */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="complaint-date"
                  className="block text-xs font-semibold text-cinema-text mb-1.5"
                >
                  Campus Date <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="complaint-date"
                    type="date"
                    required
                    value={campusDate}
                    onChange={(e) => setCampusDate(e.target.value)}
                    className="w-full bg-cinema-bg/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-cinema-text focus:outline-none focus:border-cinema-amber transition-colors"
                  />
                </div>
                <span className="text-[10px] text-cinema-secondary/60 mt-1 block">
                  Defaults to current date in Asia/Kolkata timezone.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cinema-text mb-1.5">
                  Meal Session <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {MEALS.map((meal) => {
                    const isSelected = selectedMeal === meal;
                    return (
                      <button
                        key={meal}
                        type="button"
                        onClick={() => setSelectedMeal(meal)}
                        className={`py-2 px-1 text-center rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-cinema-amber border-cinema-amber text-cinema-bg font-bold'
                            : 'bg-cinema-bg/40 border-white/10 text-cinema-secondary hover:text-cinema-text hover:bg-cinema-bg/80'
                        }`}
                      >
                        {meal}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Complaint Categories */}
            <div>
              <label className="block text-xs font-semibold text-cinema-text mb-2">
                Complaint Category <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMPLAINT_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`py-2.5 px-3 rounded-xl border text-xs text-left font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-cinema-amber/15 border-cinema-amber text-cinema-amber font-bold'
                          : 'bg-cinema-bg/40 border-white/10 text-cinema-secondary hover:text-cinema-text hover:border-white/20'
                      }`}
                    >
                      <span>{cat}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cinema-amber" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="complaint-desc"
                  className="block text-xs font-semibold text-cinema-text"
                >
                  Description of Issue <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-cinema-secondary/60">
                  {description.length}/1000 characters (min 10)
                </span>
              </div>
              <textarea
                id="complaint-desc"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                rows={4}
                placeholder="Provide specific details: which mess counter (Counter 1-4), which specific dish, what exact issue was found, and the approximate time..."
                className="w-full bg-cinema-bg/50 border border-white/10 rounded-xl px-4 py-3 text-xs md:text-sm text-cinema-text placeholder:text-cinema-secondary/40 focus:outline-none focus:border-cinema-amber/50 focus:bg-cinema-bg/80 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Alerts */}
            {submitSuccess && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs md:text-sm flex items-start gap-2.5 animate-fade-in">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{submitSuccess}</p>
                  {submittedComplaint && (
                    <p className="text-[11px] text-green-400/80">
                      You can monitor resolution progress in the &quot;Track My Complaints&quot; tab using your student ID ({studentId}).
                    </p>
                  )}
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs md:text-sm flex items-start gap-2.5 animate-fade-in">
                <CircleAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{submitError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-amber w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-cinema-bg/30 border-t-cinema-bg rounded-full animate-spin" />
                  Submitting Complaint…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Complaint
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRACK MY COMPLAINTS (Student Private View) */}
        {/* ========================================================================= */}
        {activeTab === 'track' && (
          <div className="cinema-card p-6 md:p-8 space-y-6 reveal-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="font-serif text-xl font-bold text-cinema-text">
                  Your Submitted Complaints
                </h3>
                <p className="text-xs text-cinema-secondary mt-0.5">
                  Track the status of grievances filed under your student roll number.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => handleStudentIdChange(e.target.value)}
                  placeholder="Enter Student ID"
                  className="bg-cinema-bg/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-cinema-text font-mono uppercase focus:outline-none focus:border-cinema-amber"
                />
                <button
                  type="button"
                  onClick={() => loadMyComplaints(studentId)}
                  className="px-3 py-1.5 rounded-lg bg-cinema-amber text-cinema-bg text-xs font-bold hover:bg-cinema-amber/90 transition-colors"
                >
                  Lookup
                </button>
              </div>
            </div>

            {isLoadingMyComplaints ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 border-2 border-cinema-amber/30 border-t-cinema-amber rounded-full animate-spin mb-3" />
                <p className="text-xs text-cinema-secondary">Checking complaint status…</p>
              </div>
            ) : !studentId.trim() ? (
              <div className="py-12 text-center text-cinema-secondary text-xs">
                Please enter your Student ID / Roll Number above to view your complaints.
              </div>
            ) : myComplaints.length === 0 ? (
              /* Useful Empty State */
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-green-400/60" />
                </div>
                <h4 className="font-serif text-lg text-cinema-text font-semibold">
                  No complaints on record
                </h4>
                <p className="text-xs text-cinema-secondary max-w-sm mt-1 leading-relaxed">
                  No grievances have been registered under student ID{' '}
                  <span className="font-mono text-cinema-amber">{studentId}</span>. Dining standards
                  are currently clear!
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-cinema-text hover:border-cinema-amber hover:text-cinema-amber transition-colors"
                >
                  File a new grievance
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myComplaints.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl bg-cinema-bg/60 border border-white/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-semibold text-cinema-amber px-2.5 py-0.5 rounded-md bg-cinema-amber/10 border border-cinema-amber/20">
                          {item.category}
                        </span>
                        <span className="text-xs text-cinema-text font-medium">
                          {item.meal_type} on {item.campus_date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(item.status)}
                        <span className="text-[10px] text-cinema-secondary font-mono">
                          #{item.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-cinema-text/90 leading-relaxed font-sans">
                      {item.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-cinema-secondary/60 gap-1 pt-1">
                      <span>
                        Submitted:{' '}
                        {new Date(item.created_at).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      {item.admin_notes && (
                        <span className="text-cinema-amber">
                          Mess Manager Note: {item.admin_notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MANAGER PORTAL (Staff Evaluation View) */}
        {/* ========================================================================= */}
        {activeTab === 'manager' && (
          <div className="cinema-card p-6 md:p-8 space-y-6 reveal-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-cinema-text">
                    Campus Mess Administration Portal
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                    Staff Restricted
                  </span>
                </div>
                <p className="text-xs text-cinema-secondary mt-0.5">
                  Review student grievances, examine private details, and advance status to Under Review or Resolved.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['All', 'Pending', 'Under Review', 'Resolved'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      statusFilter === st
                        ? 'bg-cinema-amber border-cinema-amber text-cinema-bg font-bold'
                        : 'bg-cinema-bg/50 border-white/10 text-cinema-secondary hover:text-cinema-text'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingManager ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 border-2 border-cinema-amber/30 border-t-cinema-amber rounded-full animate-spin mb-3" />
                <p className="text-xs text-cinema-secondary">Loading manager dashboard…</p>
              </div>
            ) : filteredManagerComplaints.length === 0 ? (
              <div className="py-12 text-center text-cinema-secondary text-xs">
                No complaints found matching status &quot;{statusFilter}&quot;.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredManagerComplaints.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl bg-cinema-bg/70 border border-white/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-cinema-amber px-2 py-0.5 rounded bg-cinema-amber/10 border border-cinema-amber/20">
                          {item.category}
                        </span>
                        <span className="text-xs text-cinema-text font-medium">
                          {item.meal_type} ({item.campus_date})
                        </span>
                        <span className="text-[11px] font-mono text-cinema-secondary bg-white/5 px-2 py-0.5 rounded">
                          Student: {item.student_id} {item.student_contact ? `(${item.student_contact})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(item.status)}
                      </div>
                    </div>

                    <p className="text-xs text-cinema-text leading-relaxed">
                      {item.description}
                    </p>

                    {/* Action Bar for Status Updates */}
                    <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/5">
                      <span className="text-[10px] text-cinema-secondary/60">
                        Received:{' '}
                        {new Date(item.created_at).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        })}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-cinema-secondary font-medium">
                          Set Status:
                        </span>
                        {(['Pending', 'Under Review', 'Resolved'] as ComplaintStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            disabled={updatingId === item.id || item.status === st}
                            onClick={() => handleStatusChange(item.id, st)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              item.status === st
                                ? 'bg-white/15 border-white/30 text-white'
                                : 'bg-cinema-bg border-white/10 text-cinema-secondary hover:text-cinema-amber hover:border-cinema-amber/40'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
