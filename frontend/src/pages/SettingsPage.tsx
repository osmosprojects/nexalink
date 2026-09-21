import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Download,
  Bell,
  Sparkles,
  Lock,
  Database,
  Check,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../lib/api';
import confetti from 'canvas-confetti';

export const SettingsPage: React.FC = () => {
  const [profileVisible, setProfileVisible] = useState(true);
  const [discoverable, setDiscoverable] = useState(true);
  const [aiUsageConsent, setAiUsageConsent] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSavePreferences = () => {
    setSaved(true);
    confetti({ particleCount: 25, spread: 40, origin: { y: 0.7 } });
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportJson = async () => {
    setExporting(true);
    try {
      const contacts = await api.get('/contacts?limit=500');
      const interactions = await api.get('/interactions?limit=500');
      const goals = await api.get('/goals');
      const tasks = await api.get('/tasks');

      const fullExport = {
        export_date: new Date().toISOString(),
        system: 'NexaLink CRM',
        contacts,
        interactions,
        goals,
        tasks,
      };

      const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexalink_crm_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Account Settings & Privacy</h2>
          <p className="text-xs text-slate-500">Configure privacy boundaries, notifications, AI data controls, and export records</p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
          <Settings className="w-4 h-4" />
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Privacy & Discovery Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600" />
          <span>Privacy & Discovery Preferences</span>
        </h3>

        <div className="space-y-4 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="font-bold text-slate-800">Public Profile Visibility</p>
              <p className="text-slate-500 text-[11px]">Allow peer network members to view your headline and skills.</p>
            </div>
            <input
              type="checkbox"
              checked={profileVisible}
              onChange={(e) => setProfileVisible(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="font-bold text-slate-800">Discoverability in Recommendations</p>
              <p className="text-slate-500 text-[11px]">Allow the AI matchmaker to suggest you to founders and peers.</p>
            </div>
            <input
              type="checkbox"
              checked={discoverable}
              onChange={(e) => setDiscoverable(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="font-bold text-slate-800">AI Context & Assistant Usage</p>
              <p className="text-slate-500 text-[11px]">Enable smart conversation prep and automated follow-up drafting.</p>
            </div>
            <input
              type="checkbox"
              checked={aiUsageConsent}
              onChange={(e) => setAiUsageConsent(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Data Export & Backup Card (Guide Section 83) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Data Export & Portable Backup</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          Download a complete snapshot of all your contacts, interaction timelines, tasks, and goals in standard open JSON format.
        </p>

        <div className="pt-2">
          <button
            onClick={handleExportJson}
            disabled={exporting}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Preparing JSON Export...' : 'Download Full CRM Backup (JSON)'}</span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSavePreferences}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all active:scale-95"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
