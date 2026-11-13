'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getUnifiedReminders, 
  addUnifiedReminder, 
  reminderStore,
  schemeStore, 
  DeadlineReminder 
} from '@/lib/storage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Bell, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Loader2,
  ShieldCheck
} from 'lucide-react';

export default function RemindersPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [reminders, setReminders] = useState<DeadlineReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [schemeId, setSchemeId] = useState('scheme_001');
  const [reminderType, setReminderType] = useState<'30_days_before' | '7_days_before' | '1_day_before' | 'custom'>('7_days_before');
  const [customDate, setCustomDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadReminders();
  }, [user]);

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const list = await getUnifiedReminders(user?.uid);
      setReminders(list);
    } catch (err) {
      console.error('Error loading reminders:', err);
      setErrorMsg('Failed to load reminders from local storage.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const scheme = schemeStore.getSchemeById(schemeId);
    if (!scheme) {
      setErrorMsg('Please select a valid scheme.');
      return;
    }

    if (reminderType === 'custom' && !customDate) {
      setErrorMsg('Please select a custom alert date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const deadline = scheme.deadline || scheme.applicationDeadline || '2026-11-30';
      let remDate = deadline;

      if (reminderType === 'custom' && customDate) {
        remDate = customDate;
      } else if (reminderType === '30_days_before') {
        const d = new Date(deadline);
        d.setDate(d.getDate() - 30);
        remDate = d.toISOString().split('T')[0];
      } else if (reminderType === '7_days_before') {
        const d = new Date(deadline);
        d.setDate(d.getDate() - 7);
        remDate = d.toISOString().split('T')[0];
      } else if (reminderType === '1_day_before') {
        const d = new Date(deadline);
        d.setDate(d.getDate() - 1);
        remDate = d.toISOString().split('T')[0];
      }

      const assignedUid = user?.uid || 'guest_user';

      await addUnifiedReminder({
        userId: assignedUid,
        schemeId: scheme.schemeId,
        schemeName: scheme.name,
        deadline,
        reminderDate: remDate,
        reminderType,
        notes: notes.trim() || `Submit documents & complete registration for ${scheme.name}`,
      }, user?.uid);

      setNotes('');
      if (reminderType === 'custom') {
        setCustomDate('');
      }
      setSuccessMsg(`Deadline alert scheduled for "${scheme.name}" on ${remDate}.`);
      await loadReminders();
    } catch (err: any) {
      console.error('Error creating reminder:', err);
      setErrorMsg(err.message || 'Failed to save reminder to local storage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async (id: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      reminderStore.dismissReminder(id, user?.uid);
      setSuccessMsg('Reminder status marked as dismissed.');
      await loadReminders();
    } catch (err: any) {
      console.error('Error dismissing reminder:', err);
      setErrorMsg('Failed to dismiss reminder.');
    }
  };

  const handleDelete = async (id: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (confirm('Delete this deadline reminder permanently?')) {
      try {
        reminderStore.deleteReminder(id, user?.uid);
        setSuccessMsg('Reminder removed permanently.');
        await loadReminders();
      } catch (err: any) {
        console.error('Error deleting reminder:', err);
        setErrorMsg('Failed to delete reminder.');
      }
    }
  };

  const schemes = schemeStore.getAllSchemes();

  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <div className="space-y-6 py-2">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-700" />
            <span>Application Deadline Reminders</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user 
              ? `Personalized deadline alerts for ${user.email} (saved locally in browser)` 
              : 'Guest Mode — reminders stored in this browser session'}
          </p>
        </div>

        <span className="text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-xl">
          {reminders.filter(r => r.status === 'active').length} Active Scheduled Alerts
        </span>
      </div>

      {/* Status Alerts */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button 
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button 
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-500 hover:text-emerald-700 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Reminder Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Plus className="w-4 h-4 text-purple-700" />
            <span>Schedule Deadline Alert</span>
          </h3>

          <form onSubmit={handleCreateReminder} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Select Scheme *</label>
              <select
                value={schemeId}
                onChange={(e) => setSchemeId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-slate-900"
              >
                {schemes.map(s => (
                  <option key={s.schemeId} value={s.schemeId}>
                    {s.name} ({s.deadline ? `Deadline: ${s.deadline}` : 'Rolling Enrollment'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Reminder Schedule *</label>
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-slate-900"
              >
                <option value="7_days_before">7 Days Before Deadline</option>
                <option value="30_days_before">30 Days Before Deadline</option>
                <option value="1_day_before">1 Day Before Deadline</option>
                <option value="custom">Custom Specified Date</option>
              </select>
            </div>

            {reminderType === 'custom' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Custom Alert Date</label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Notes / Submission Checklist</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Get Income Certificate renewed at Meeseva"
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Schedule Reminder</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Reminders List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Active & Scheduled Alerts Roster</h3>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500 mt-2">Loading reminders from local storage...</p>
            </div>
          ) : reminders.length > 0 ? (
            <div className="space-y-3">
              {reminders.map(rem => (
                <div
                  key={rem.id}
                  className={`bg-white p-4 rounded-xl border shadow-xs flex items-center justify-between gap-4 transition-all ${
                    rem.status === 'active' ? 'border-purple-200 hover:border-purple-300' : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{rem.schemeName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {rem.notes || 'Application readiness deadline reminder'}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-purple-800 font-semibold mt-1">
                        <span>Deadline: {rem.deadline}</span>
                        <span>•</span>
                        <span>Alert Date: {rem.reminderDate} ({rem.reminderType.replace(/_/g, ' ')})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {rem.status === 'active' ? (
                      <button
                        onClick={() => handleDismiss(rem.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100"
                      >
                        Dismiss
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Dismissed</span>
                    )}

                    <button
                      onClick={() => handleDelete(rem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
              <Bell className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Active Reminders</h3>
              <p className="text-xs text-slate-500">
                Select a government scheme to set deadline reminders.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
