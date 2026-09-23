import React, { useState } from 'react';
import {
  X,
  UserPlus,
  MessageSquare,
  MoreHorizontal,
  MapPin,
  Briefcase,
  Sparkles,
  Target,
  Users,
  Building,
  CheckCircle2,
  Calendar,
  Share2,
  Award
} from 'lucide-react';
import { Recommendation } from '../../types';

interface UserProfileModalProps {
  user: Recommendation | any;
  onClose: () => void;
  onConnect?: (recId: number) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onConnect,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'interests' | 'more'>('overview');
  const [connected, setConnected] = useState(user.status === 'connected');

  if (!user) return null;

  const initials = user.recommended_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const skillsList: string[] = Array.isArray(user.skills) ? user.skills : [];
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
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 relative text-slate-900 animate-slideUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-500 hover:text-slate-800 hover:bg-white transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Cover Banner */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative rounded-t-3xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-60" />
        </div>

        {/* Profile Card Header Info */}
        <div className="px-6 pb-4 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            <div className="relative">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.recommended_name)}&background=3b82f6&color=fff`}
                alt={user.recommended_name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-xl bg-white"
              />
              <div className="absolute bottom-1 right-1 p-1 bg-blue-600 text-white rounded-full ring-2 ring-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Action Buttons Header */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-0">
              <button
                onClick={handleConnectClick}
                disabled={connected}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 ${
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

              <button
                onClick={() => alert(`Opening message thread with ${user.recommended_name}...`)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <span>Message</span>
              </button>

              <button className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Details Headline */}
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-1.5">
              <span>{user.recommended_name}</span>
              <span className="text-blue-600 font-normal">
                <CheckCircle2 className="w-4 h-4 inline" />
              </span>
            </h3>
            <p className="text-xs font-bold text-slate-700">{user.recommended_role} • {user.recommended_company}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.location || 'Mumbai, India'}</span>
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-600">
                <Briefcase className="w-3 h-3 text-slate-500" />
                <span>8+ years experience</span>
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 mt-5 space-x-6 text-xs font-bold text-slate-500">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'experience'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              Experience
            </button>
            <button
              onClick={() => setActiveTab('interests')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'interests'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              Interests
            </button>
            <button
              onClick={() => setActiveTab('more')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'more'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              More
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 pt-2 space-y-5">
          {activeTab === 'overview' && (
            <>
              {/* Why Match Explanation Callout */}
              {reasonsBullets.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Why You Match ({user.score || 92}% Match)</span>
                  </div>
                  <ul className="space-y-1 text-xs text-blue-950 font-medium">
                    {reasonsBullets.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* About Section */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">About</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  Tech entrepreneur with 8+ years of experience in building scalable SaaS products and driving business growth. Passionate about AI, innovation, and creating meaningful partnerships in the technology ecosystem.
                </p>
              </div>

              {/* Networking Goals */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Networking Goals</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold">
                    Strategic Partnerships
                  </span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold">
                    Mentorship & Growth
                  </span>
                </div>
              </div>

              {/* Looking For */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Looking For</h4>
                <div className="flex flex-wrap gap-2">
                  {['Founders', 'Investors', 'Growth Leaders', 'AI Advisors'].map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Can Offer */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Can Offer</h4>
                <div className="flex flex-wrap gap-2">
                  {['Product Strategy', 'SaaS Experience', 'Investor Network', 'GTM Execution'].map((offer, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
                      {offer}
                    </span>
                  ))}
                </div>
              </div>

              {/* Focus Interests */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Focus Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {(skillsList.length > 0 ? skillsList : ['AI', 'SaaS', 'Digital Transformation', 'Startups']).map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details Grid */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Details</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">Location</span>
                    <span className="font-bold text-slate-800">{user.location || 'Mumbai, India'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">Industry</span>
                    <span className="font-bold text-slate-800">{user.industry || 'Technology & SaaS'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">Experience</span>
                    <span className="font-bold text-slate-800">8+ years</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">Company</span>
                    <span className="font-bold text-slate-800">{user.recommended_company}</span>
                  </div>
                </div>
              </div>

              {/* Mutual Connections */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <div>
                    <h5 className="text-xs font-bold text-indigo-950">Mutual Connections</h5>
                    <p className="text-[11px] text-indigo-700">3 people in your common network</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline">View</span>
              </div>
            </>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-4 text-xs">
              <div className="border-l-2 border-brand-500 pl-4 space-y-1">
                <h5 className="font-bold text-slate-900 text-sm">{user.recommended_role}</h5>
                <p className="font-semibold text-slate-600">{user.recommended_company}</p>
                <p className="text-[11px] text-slate-400">2021 - Present • 3+ yrs</p>
                <p className="text-slate-600 pt-1">Leading product strategy and scaling enterprise revenue.</p>
              </div>
            </div>
          )}

          {activeTab === 'interests' && (
            <div className="flex flex-wrap gap-2 text-xs">
              {['Artificial Intelligence', 'SaaS Scale', 'Angel Investing', 'Product Growth', 'Cloud Architecture'].map((item, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-800 rounded-xl font-semibold border border-purple-100">
                  {item}
                </span>
              ))}
            </div>
          )}

          {activeTab === 'more' && (
            <div className="text-xs space-y-2 text-slate-600">
              <p>Verified profile parameters synced with NexaLink Matchmaking Engine.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
