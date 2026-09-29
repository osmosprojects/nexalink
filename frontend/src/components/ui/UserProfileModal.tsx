import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  MapPin,
  Briefcase,
  Sparkles,
  Target,
  Users,
  Building2,
  CheckCircle2,
  Send,
  Compass,
  Heart,
  Globe,
  Linkedin,
  Phone,
  Mail,
  Zap,
  Link2,
  User,
  Loader2
} from 'lucide-react';
import { api } from '../../lib/api';
import { Recommendation } from '../../types';
import { Avatar } from './Avatar';

interface UserProfileModalProps {
  user: Recommendation | any;
  onClose: () => void;
  onConnect?: (recId: number) => void;
  onRequestIntro?: (user: Recommendation) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onConnect,
  onRequestIntro,
}) => {
  const [connected, setConnected] = useState(user?.status === 'connected');
  const [fullProfile, setFullProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const targetUserId = user?.targetUserId || user?.user_id || user?.userId;

  // Fetch real profile data from backend if targetUserId is available
  useEffect(() => {
    if (targetUserId) {
      setLoadingProfile(true);
      api.get<{ success: boolean; data: any }>(`/discover/profile/${targetUserId}`)
        .then((res) => {
          if (res?.data) {
            setFullProfile(res.data);
          }
        })
        .catch(() => {
          // Fallback to locally passed recommendation object
        })
        .finally(() => {
          setLoadingProfile(false);
        });
    }
  }, [targetUserId]);

  if (!user) return null;

  // Real Profile Field Values
  const displayName = fullProfile?.displayName || user.recommended_name || user.name || 'User';
  const role = fullProfile?.jobTitle || user.recommended_role || user.role || 'Strategic Professional';
  const company = fullProfile?.company || user.recommended_company || 'NexaLink Member';
  const domain = fullProfile?.domain || user.industry || user.domain || 'Technology & Services';
  const location = fullProfile?.location || user.location || 'Mumbai, India';
  const currentCity = fullProfile?.currentCity || location;
  const bio = fullProfile?.bio || user.bio || user.servicesOffered || 'No bio or services specified.';
  const avatarUrl = fullProfile?.avatarUrl || user.avatar_url || user.avatarUrl;
  const email = fullProfile?.email || user.email;
  const phone = fullProfile?.phone || user.phone;
  const website = fullProfile?.website || user.website;
  const linkedinUrl = fullProfile?.linkedinUrl || user.linkedin_url;

  // Real Profile Lists & Bridges
  const networkingGroups: string[] = fullProfile?.networkingGroups || (Array.isArray(user.networkingGroups) ? user.networkingGroups : []);
  const hobbies: string[] = fullProfile?.hobbies || (Array.isArray(user.hobbies) ? user.hobbies : []);
  const interests: string[] = fullProfile?.interests || (Array.isArray(user.skills) ? user.skills : []);
  const targetCities: string[] = fullProfile?.targetCities || [];
  const targetBusinesses: string[] = fullProfile?.targetBusinesses || [];
  const goals: string[] = fullProfile?.goals || [];
  const connectionsOffered: any[] = fullProfile?.connectionsOffered || (Array.isArray(user.connectionsOffered) ? user.connectionsOffered : []);

  const reasonsBullets: string[] = typeof user.reason === 'string'
    ? user.reason.split('\n').map((r: string) => r.replace(/^✓\s*/, '').trim()).filter(Boolean)
    : [];

  const handleConnectClick = () => {
    if (onConnect && user.recommendation_id) {
      onConnect(user.recommendation_id);
    }
    setConnected(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 relative text-slate-900 animate-slideUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-500 hover:text-slate-800 hover:bg-white transition-all shadow-md cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Banner Cover */}
        <div className="h-28 sm:h-36 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 relative rounded-t-3xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent opacity-60" />
        </div>

        {/* Header Block: Avatar & Primary Actions */}
        <div className="px-6 pb-4 relative border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            
            {/* Profile Photo */}
            <div className="relative shrink-0">
              <Avatar
                src={avatarUrl}
                name={displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white shadow-xl"
              />
              <div className="absolute bottom-1 right-1 p-1 bg-blue-600 text-white rounded-full ring-2 ring-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-0">
              {onRequestIntro && (
                <button
                  onClick={() => onRequestIntro(user)}
                  className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  title="Request Warm Intro via mutual connection"
                >
                  <Send className="w-4 h-4 text-purple-600" />
                  <span>Request Intro</span>
                </button>
              )}

              <button
                onClick={handleConnectClick}
                disabled={connected}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 ${
                  connected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
                }`}
              >
                {connected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Member Main Title */}
          <div className="space-y-1 min-w-0">
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 truncate">
              <span>{displayName}</span>
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 inline" />
            </h3>
            <p className="text-xs font-bold text-slate-700 truncate">{role} • {company}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentCity}</span>
              </span>
              <span className="flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-md text-[11px] font-bold">
                <Compass className="w-3 h-3 text-purple-600" />
                <span>{domain}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Unified Profile Page View (Single Scrollable Content Body) */}
        <div className="p-6 space-y-6">
          
          {loadingProfile && (
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs font-bold text-purple-700 flex items-center justify-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>Syncing profile data...</span>
            </div>
          )}

          {/* WHY YOU MATCH SUMMARY CALLOUT */}
          {reasonsBullets.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50/90 to-purple-50/70 p-4 rounded-2xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-indigo-900 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Why You Match</span>
                </span>
                <span className="text-purple-700 font-extrabold bg-purple-100 px-2.5 py-0.5 rounded-full text-[11px]">
                  {user.score || 85}% Synergy
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-indigo-950 font-medium">
                {reasonsBullets.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-extrabold shrink-0 mt-0.5">✓</span>
                    <span className="leading-snug">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION 1: PERSONAL & PROFESSIONAL IDENTITY */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <User className="w-4 h-4 text-purple-600" />
              <span>Personal & Professional Identity</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Brand / Company Name</span>
                <span className="font-extrabold text-slate-900">{company}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Role</span>
                <span className="font-extrabold text-slate-900">{role}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Domain</span>
                <span className="font-extrabold text-slate-900">{domain}</span>
              </div>
            </div>

            {/* Services We Offer */}
            <div className="pt-2 border-t border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Services We Offer</span>
              <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-xl border border-slate-200/80">
                {bio}
              </p>
            </div>

            {/* Social & Web Profiles */}
            <div className="pt-2 border-t border-slate-200/70 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Social & Web Profiles</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {email && (
                  <div className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-xl border border-slate-200/60">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold truncate">{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-xl border border-slate-200/60">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold truncate">{phone}</span>
                  </div>
                )}
                {linkedinUrl && (
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/60 min-w-0">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline truncate">
                      {linkedinUrl}
                    </a>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/60 min-w-0">
                    <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <a href={website} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-600 hover:underline truncate">
                      {website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: NETWORKING LOCATIONS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Networking Locations</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">I am in city</span>
                <span className="font-bold text-slate-800">{currentCity}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">I am looking to network with people in</span>
                <span className="font-bold text-slate-800">
                  {targetCities.length > 0 ? targetCities.join(', ') : 'Open to global networking'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: NETWORKING GROUPS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Networking Groups ({networkingGroups.length})</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {networkingGroups.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No networking groups added</span>
              ) : (
                networkingGroups.map((grp, idx) => (
                  <span key={idx} className="px-3.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                    {grp}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* SECTION 4 & 5: HOBBIES & INTERESTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Hobbies */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Hobbies ({hobbies.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {hobbies.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No hobbies listed</span>
                ) : (
                  hobbies.map((hb, idx) => (
                    <span key={idx} className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-xs font-semibold">
                      {hb}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Focus Interests */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Interests ({interests.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {interests.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No focus interests listed</span>
                ) : (
                  interests.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-semibold">
                      {interest}
                    </span>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* SECTION 6: NETWORKING OBJECTIVES */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Networking Objectives</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {goals.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No networking objectives specified</span>
              ) : (
                goals.map((goal, idx) => (
                  <span key={idx} className="px-3.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
                    {goal}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* SECTION 7: TARGET INDUSTRIES & BUSINESSES */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Target Industries & Businesses</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {targetBusinesses.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No target industries or businesses specified</span>
              ) : (
                targetBusinesses.map((target, idx) => (
                  <span key={idx} className="px-3.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                    {target}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* SECTION 8: NETWORKING GOALS (Target Frequency & Quantity) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Networking Goals</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Goal Frequency</span>
                <span className="font-bold text-slate-800 capitalize">
                  {fullProfile?.networkingTargetPeriod || user?.networkingTargetPeriod || 'Weekly'} Target
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Target New Connections</span>
                <span className="font-bold text-slate-800">
                  {fullProfile?.networkingNewConnections || user?.networkingNewConnections || 5} new connections
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 9: CONNECTION BRIDGES OFFERED */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-600" />
                <span>Connection Bridges ({connectionsOffered.length})</span>
              </h4>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                Warm Introductions
              </span>
            </div>

            {connectionsOffered.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200/70 p-4 space-y-1">
                <Link2 className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No Connection Bridges Published</p>
                <p className="text-[11px] text-slate-400">This member hasn't listed specific warm introduction contacts yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 pt-1">
                {connectionsOffered.map((bridge: any, idx: number) => (
                  <div key={idx} className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100 space-y-2 hover:border-indigo-300 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {bridge.personName || bridge.name || 'Warm Contact'}
                        </h5>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                          {bridge.role || bridge.jobTitle || 'Executive'} {bridge.orgName ? `• ${bridge.orgName}` : ''}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-[10px] font-extrabold uppercase shrink-0">
                        {bridge.businessDomain || bridge.domain || 'Technology'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-indigo-100/80 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2 font-medium">
                      {bridge.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{bridge.city}</span>
                        </span>
                      )}
                      {bridge.relationship && (
                        <span className="bg-white text-indigo-900 border border-indigo-200/80 px-2.5 py-0.5 rounded-md font-semibold">
                          Relationship: {bridge.relationship}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
