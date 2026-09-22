'use client';

import React, { useState, useEffect } from 'react';
import { reminderStore, DeadlineReminder, schemeStore } from '@/lib/storage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Bell, Calendar, Plus, Trash2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function RemindersPage() {
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<DeadlineReminder[]>([]);
  const [schemeId, setSchemeId] = useState('scheme_001');
  const [reminderType, setReminderType] = useState<'30_days_before' | '7_days_before' | '1_day_before' | 'custom'>('7_days_before');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = () => {
    setReminders(reminderStore.getReminders());
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const scheme = schemeStore.getSchemeById(schemeId);
    if (!scheme) return;

    const deadline = scheme.deadline || '2026-11-30';
    reminderStore.addReminder({
      userId: 'citizen_demo_01',
      schemeId: scheme.schemeId,
      schemeName: scheme.name,
      deadline,
      reminderDate: deadline,
      reminderType,
      notes: notes || `Application deadline reminder for ${scheme.name}`,
    });

    setNotes('');
    loadReminders();
  };

  const handleDismiss = (id: string) => {
    reminderStore.dismissReminder(id);
    loadReminders();
  };

  const schemes = schemeStore.getAllSchemes().filter(s => s.deadline !== null);

  return (
    <div className="space-y-8 py-2">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-600" />
            <span>My Jan-Setu Reminders</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track verified application deadlines and schedule timely reminders before registration windows close.
          </p>
        </div>

        <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-xl">
          {reminders.filter(r => r.status === 'active').length} Active Scheduled Reminders
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Reminder Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-purple-600" />
            <span>Schedule New Deadline Reminder</span>
          </h3>

          <form onSubmit={handleCreateReminder} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Select Scheme</label>
              <select
                value={schemeId}
                onChange={(e) => setSchemeId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium"
              >
                {schemes.map(s => (
                  <option key={s.schemeId} value={s.schemeId}>
                    {s.name} (Deadline: {s.deadline})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Reminder Timing</label>
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium"
              >
                <option value="7_days_before">7 Days Before Deadline</option>
                <option value="30_days_before">30 Days Before Deadline</option>
                <option value="1_day_before">1 Day Before Deadline</option>
                <option value="custom">Custom Date</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Notes / Action Checklist</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Renew income certificate at Meeseva"
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Bell className="w-4 h-4" />
              <span>Add Reminder</span>
            </button>
          </form>
        </div>

        {/* Reminders List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Scheduled Reminders Roster</h3>

          {reminders.length > 0 ? (
            <div className="space-y-3">
              {reminders.map(rem => (
                <div
                  key={rem.id}
                  className={`bg-white p-4 rounded-xl border shadow-xs flex items-center justify-between gap-4 transition-all ${
                    rem.status === 'active' ? 'border-purple-200 hover:border-purple-300' : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rem.schemeName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {rem.notes || 'Application readiness deadline reminder'}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-purple-800 font-semibold mt-1">
                        <span>Target Deadline: {rem.deadline}</span>
                        <span>•</span>
                        <span>Alert: {rem.reminderType.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {rem.status === 'active' ? (
                      <button
                        onClick={() => handleDismiss(rem.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100"
                      >
                        Dismiss
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Dismissed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
              <Bell className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Reminders Scheduled</h3>
              <p className="text-xs text-slate-500">
                Select a scheme from the left to set deadline reminders.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
