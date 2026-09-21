import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Linkedin,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { api } from '../lib/api';
import { Contact, Tag } from '../types';
import { formatDate, getRelationshipTypeBadge } from '../lib/utils';

export const ContactsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [relationshipType, setRelationshipType] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [followUpDue, setFollowUpDue] = useState(false);
  const [sortBy, setSortBy] = useState('updated_at');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: () => void }>() || {};

  // Fetch Tags
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => api.get<Tag[]>('/contacts/tags'),
  });

  // Fetch Contacts
  const { data, isLoading } = useQuery<{ items: Contact[]; pagination: any }>({
    queryKey: ['contacts', { search, relationshipType, selectedTag, followUpDue, sortBy, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        relationship_type: relationshipType,
        tag: selectedTag,
        follow_up_due: followUpDue ? 'true' : '',
        sort_by: sortBy,
        page: page.toString(),
        limit: '24',
      });
      const res = await api.get<Contact[]>(`/contacts?${params.toString()}`);
      return { items: res, pagination: {} };
    },
  });

  const contacts = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Search/Filter Controls */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Connections Directory</h2>
            <p className="text-xs text-slate-500">Manage and cultivate your personal & professional relationships</p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => openQuickAdd?.()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, company, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          {/* Relationship Filter */}
          <div>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="all">All Relationship Types</option>
              <option value="founder">Founders</option>
              <option value="investor">Investors / VCs</option>
              <option value="mentor">Mentors</option>
              <option value="mentee">Mentees</option>
              <option value="colleague">Colleagues</option>
              <option value="client">Clients</option>
              <option value="prospect">Prospects</option>
              <option value="partner">Partners</option>
              <option value="friend">Friends</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="">All Tags</option>
              {tags.map((t) => (
                <option key={t.tag_id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Follow-up Due toggle & Sort */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFollowUpDue(!followUpDue)}
              className={`w-full text-xs py-2.5 px-2 rounded-xl border font-semibold flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
                followUpDue
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Follow-ups</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden font-medium text-slate-700 truncate"
            >
              <option value="updated_at">Updated</option>
              <option value="last_interaction_at">Last Touch</option>
              <option value="relationship_strength">Strength</option>
              <option value="first_name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Relationship Warmth Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 touch-scroll pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-semibold shrink-0 mr-1">Warmth:</span>
          {[
            { label: 'All Contacts', value: '' },
            { label: '🔥 Hot (Active)', value: '🔥 Hot' },
            { label: '☀️ Warm (15-45d)', value: '☀️ Warm' },
            { label: '❄️ Cold (Needs Touch)', value: '❄️ Cold' },
          ].map((w) => (
            <button
              key={w.label}
              onClick={() => setSelectedTag(selectedTag === w.value ? '' : w.value)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold shrink-0 transition-all ${
                selectedTag === w.value
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && contacts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No contacts found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search || selectedTag || relationshipType !== 'all'
                ? 'Try adjusting your search queries or filter criteria.'
                : 'Start building your network by adding your first professional connection.'}
            </p>
          </div>
          <button
            onClick={() => openQuickAdd?.()}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Add First Contact
          </button>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && contacts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {contacts.map((contact) => {
            const badge = getRelationshipTypeBadge(contact.relationship_type);
            return (
              <div
                key={contact.contact_id}
                onClick={() => navigate(`/connections/${contact.contact_id}`)}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft hover:border-brand-300 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={contact.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={contact.first_name}
                        className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 truncate transition-colors">
                          {contact.first_name} {contact.last_name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate font-medium">
                          {contact.job_title || 'Professional'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {contact.company || 'Network'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase shrink-0 ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Relationship Strength Bar */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Relationship Strength</span>
                      <span className="font-bold text-brand-700">{contact.relationship_strength}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-purple-600 h-1.5 rounded-full"
                        style={{ width: `${contact.relationship_strength}%` }}
                      />
                    </div>
                  </div>

                  {/* Tags & Warmth Badges */}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {contact.tags.slice(0, 4).map((t) => {
                        const isWarmth = t.name.includes('Hot') || t.name.includes('Warm') || t.name.includes('Cold');
                        return (
                          <span
                            key={t.tag_id}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                              t.name.includes('Hot')
                                ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                                : t.name.includes('Warm')
                                ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                                : t.name.includes('Cold')
                                ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isWarmth ? t.name : `#${t.name}`}
                          </span>
                        );
                      })}
                      {contact.tags.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          +{contact.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Last: {formatDate(contact.last_interaction_at, 'relative')}</span>
                  </span>
                  <span className="text-brand-600 font-bold flex items-center group-hover:translate-x-0.5 transition-transform">
                    View CRM <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {!isLoading && viewMode === 'table' && contacts.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Relationship</th>
                  <th className="px-4 py-3.5">Strength</th>
                  <th className="px-4 py-3.5">Last Interaction</th>
                  <th className="px-4 py-3.5">Next Follow-up</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {contacts.map((c) => {
                  const badge = getRelationshipTypeBadge(c.relationship_type);
                  return (
                    <tr
                      key={c.contact_id}
                      onClick={() => navigate(`/connections/${c.contact_id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={c.first_name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{c.first_name} {c.last_name}</p>
                            <p className="text-[11px] text-slate-500">{c.job_title} · {c.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand-600 h-1.5 rounded-full"
                            style={{ width: `${c.relationship_strength}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {formatDate(c.last_interaction_at, 'relative')}
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {formatDate(c.next_follow_up_at, 'short')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-brand-600 font-bold hover:underline">
                          View
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
