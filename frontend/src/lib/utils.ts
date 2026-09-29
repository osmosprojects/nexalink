import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined, formatType: 'short' | 'long' | 'relative' = 'short'): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    if (formatType === 'relative') {
      const diffMs = Date.now() - d.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays > 1 && diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 0) {
        const futureDays = Math.abs(diffDays);
        if (futureDays === 1) return 'Tomorrow';
        return `in ${futureDays} days`;
      }
    }

    if (formatType === 'long') {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getRelationshipTypeBadge(type: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    mentor: { bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-800', label: 'Mentor' },
    mentee: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-800', label: 'Mentee' },
    founder: { bg: 'bg-purple-100 text-purple-800 border-purple-200', text: 'text-purple-800', label: 'Founder' },
    investor: { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-800', label: 'Investor / VC' },
    colleague: { bg: 'bg-sky-100 text-sky-800 border-sky-200', text: 'text-sky-800', label: 'Colleague' },
    client: { bg: 'bg-pink-100 text-pink-800 border-pink-200', text: 'text-pink-800', label: 'Client' },
    prospect: { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', text: 'text-indigo-800', label: 'Prospect' },
    friend: { bg: 'bg-teal-100 text-teal-800 border-teal-200', text: 'text-teal-800', label: 'Friend' },
    partner: { bg: 'bg-violet-100 text-violet-800 border-violet-200', text: 'text-violet-800', label: 'Partner' },
    recruiter: { bg: 'bg-orange-100 text-orange-800 border-orange-200', text: 'text-orange-800', label: 'Recruiter' },
    other: { bg: 'bg-slate-100 text-slate-800 border-slate-200', text: 'text-slate-800', label: 'Contact' },
  };
  return map[type] || map.other;
}

export function formatFullName(firstName?: string | null, lastName?: string | null): string {
  const first = firstName ? firstName.trim() : '';
  const last = lastName && lastName.trim() !== '.' ? lastName.trim() : '';
  if (first && last) return `${first} ${last}`;
  return first || last || 'Connection';
}

export interface ExtendedContactNotes {
  whereMet?: string | null;
  businessFocus?: string | null;
  otherNetworks?: string[];
  connectablePersons?: Array<{
    personName?: string;
    company?: string;
    businessDomain?: string;
    role?: string;
  }>;
  wantToMeetPersons?: Array<{
    personName?: string;
    company?: string;
    businessDomain?: string;
    role?: string;
  }>;
  personalDetails?: string[];
  hobbies?: string[];
  milestones?: Array<{
    type?: string;
    date?: string;
    note?: string;
  }>;
  meetingIntelligence?: string | null;
  followUpTask?: string | null;
}

export function parseContactNotes(notesStr?: string | null): {
  cleanNotes: string;
  extendedData: ExtendedContactNotes | null;
} {
  if (!notesStr) return { cleanNotes: '', extendedData: null };

  let extendedData: ExtendedContactNotes | null = null;
  let text = notesStr;

  const jsonStartIndex = notesStr.indexOf('{');
  const jsonEndIndex = notesStr.lastIndexOf('}');
  if (jsonStartIndex !== -1 && jsonEndIndex > jsonStartIndex) {
    const possibleJson = notesStr.substring(jsonStartIndex, jsonEndIndex + 1);
    try {
      const parsed = JSON.parse(possibleJson);
      if (typeof parsed === 'object' && parsed !== null) {
        extendedData = parsed;
        text = (notesStr.substring(0, jsonStartIndex) + notesStr.substring(jsonEndIndex + 1)).trim();
      }
    } catch {
      // Not valid JSON
    }
  }

  if (extendedData) {
    const lines = text.split(/\n+/).filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (/^\[(Meeting Intelligence|Where Met|Business Focus|Personal Details|Hobbies)\]:/.test(trimmed)) {
        return false;
      }
      return true;
    });
    text = lines.join('\n\n');
  }

  return {
    cleanNotes: text.trim(),
    extendedData,
  };
}
