import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Rss,
  Heart,
  Send,
  Share2,
  MessageCircle,
  Image as ImageIcon,
  User as UserIcon,
  ChevronRight,
  Smile
} from 'lucide-react';
import { api } from '../lib/api';
import { Post } from '../types';
import { formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

// Emoji Reaction Map
const EMOJI_OPTIONS = [
  { emoji: '❤️', label: 'Like' },
  { emoji: '👍', label: 'Helpful' },
  { emoji: '😂', label: 'Funny' },
  { emoji: '😍', label: 'Love' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '🙌', label: 'Celebrate' },
];

interface ReplyItem {
  id: string;
  authorName: string;
  authorAvatar?: string;
  timeAgo: string;
  content: string;
  likesCount: number;
}

export const FeedPage: React.FC = () => {
  const [postType, setPostType] = useState<'wants to meet' | 'can connect you to'>('wants to meet');
  const [content, setContent] = useState('');
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Interactive Reaction & Reply UI States
  const [activeReactionPicker, setActiveReactionPicker] = useState<number | null>(null);
  const [postReactions, setPostReactions] = useState<
    Record<number, { userReaction?: string; counts: Record<string, number>; total: number }>
  >({});

  const [activeReplyPostId, setActiveReplyPostId] = useState<number | null>(null);
  const [expandedThreadPostId, setExpandedThreadPostId] = useState<number | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
  const [postReplies, setPostReplies] = useState<Record<number, ReplyItem[]>>({
    1: [
      {
        id: 'r1',
        authorName: 'Rahul Mehta',
        timeAgo: '2h ago',
        content: 'This could be really valuable for our team.',
        likesCount: 2,
      },
      {
        id: 'r2',
        authorName: 'Priya Nair',
        timeAgo: '1h ago',
        content: "Absolutely! Let's connect.",
        likesCount: 1,
      },
    ],
  });

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['feed'],
    queryFn: () => api.get<Post[]>('/feed'),
  });

  const createPostMutation = useMutation({
    mutationFn: (newContent: string) => {
      const fullText = `[${postType}] ${newContent.trim()}`;
      // Note: tags is explicitly sent as null as requested
      return api.post('/feed', { content: fullText, tags: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setContent('');
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    },
  });

  const likeMutation = useMutation({
    mutationFn: (postId: number) => api.post(`/feed/${postId}/like`),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      handleSelectReaction(postId, '❤️');
    },
  });

  const handleSelectReaction = (postId: number, selectedEmoji: string) => {
    setPostReactions((prev) => {
      const existing = prev[postId] || { counts: {}, total: 0 };
      const currentEmoji = existing.userReaction;
      const updatedCounts = { ...existing.counts };

      if (currentEmoji) {
        updatedCounts[currentEmoji] = Math.max(0, (updatedCounts[currentEmoji] || 1) - 1);
        if (updatedCounts[currentEmoji] === 0) delete updatedCounts[currentEmoji];
      }

      if (currentEmoji === selectedEmoji) {
        // Toggle off
        return {
          ...prev,
          [postId]: {
            userReaction: undefined,
            counts: updatedCounts,
            total: Math.max(0, existing.total - 1),
          },
        };
      } else {
        // Add new reaction
        updatedCounts[selectedEmoji] = (updatedCounts[selectedEmoji] || 0) + 1;
        return {
          ...prev,
          [postId]: {
            userReaction: selectedEmoji,
            counts: updatedCounts,
            total: currentEmoji ? existing.total : existing.total + 1,
          },
        };
      }
    });

    setActiveReactionPicker(null);
  };

  const handleAddReply = (postId: number) => {
    const text = (replyInputs[postId] || '').trim();
    if (!text) return;

    const newReplyItem: ReplyItem = {
      id: `rep-${Date.now()}`,
      authorName: user?.displayName || 'User',
      timeAgo: 'Just now',
      content: text,
      likesCount: 0,
    };

    setPostReplies((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newReplyItem],
    }));

    setReplyInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedThreadPostId(postId);
  };

  // User role & company subtitle
  const userSubtitle =
    profile?.headline ||
    (profile?.job_title && profile?.company
      ? `${profile.job_title} at ${profile.company}`
      : profile?.job_title || profile?.company || 'NexaLink Member');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Networking Feed</h2>
          <p className="text-xs text-slate-500">Share networking requirements, updates, and community connections</p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <Rss className="w-4 h-4" />
        </div>
      </div>

      {/* Share Networking Requirement & Update Composer */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        {/* Profile Pic, Name, Role & Company Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <img
            src={user?.avatarUrl || profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.displayName || 'User'}
            onClick={() => navigate('/profile')}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-200 hover:ring-brand-500 transition-all cursor-pointer shrink-0"
            title="View Profile"
          />
          <div className="flex-1 min-w-0">
            <h3
              onClick={() => navigate('/profile')}
              className="text-sm font-bold text-slate-900 hover:text-brand-600 cursor-pointer transition-colors leading-tight"
            >
              {user?.displayName || 'User'}
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{userSubtitle}</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Dropdown Options */}
          <div className="flex items-center gap-2">
            <label htmlFor="requirement-type" className="text-xs font-bold text-slate-700 shrink-0">
              Type:
            </label>
            <select
              id="requirement-type"
              value={postType}
              onChange={(e) => setPostType(e.target.value as 'wants to meet' | 'can connect you to')}
              className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden cursor-pointer"
            >
              <option value="wants to meet">🤝 wants to meet</option>
              <option value="can connect you to">🌟 can connect you to</option>
            </select>
          </div>

          {/* Text Area for Typing */}
          <textarea
            rows={3}
            placeholder="Name, Role, Industry — Share details of your requirement or connection..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden font-medium leading-relaxed text-slate-900 resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer">
              <ImageIcon className="w-3.5 h-3.5" /> Photo
            </span>
          </div>

          <button
            onClick={() => createPostMutation.mutate(content)}
            disabled={!content.trim() || createPostMutation.isPending}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post Update</span>
          </button>
        </div>
      </div>

      {/* Posts Stream */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <h3 className="text-base font-bold text-slate-800">No posts in feed</h3>
          <p className="text-xs text-slate-500">Share your first requirement or update above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isWantToMeet =
              post.content.startsWith('[wants to meet]') || post.content.startsWith('[I want to meet]');
            const isCanConnect =
              post.content.startsWith('[can connect you to]') ||
              post.content.startsWith('[I can connect You to]') ||
              post.content.startsWith('[I can introduce]');

            let details = post.content;
            if (isWantToMeet) {
              details = post.content.replace('[wants to meet]', '').replace('[I want to meet]', '').trim();
            }
            if (isCanConnect) {
              details = post.content
                .replace('[can connect you to]', '')
                .replace('[I can connect You to]', '')
                .replace('[I can introduce]', '')
                .trim();
            }

            const intentLabel = isCanConnect ? 'can connect you to' : 'wants to meet';
            const intentBadgeIcon = isCanConnect ? '🌟' : '🤝';

            const reactions = postReactions[post.post_id] || {
              counts: {},
              total: post.likes_count || 0,
            };
            const topEmojis = Object.keys(reactions.counts);

            const replies = postReplies[post.post_id] || [];
            const isThreadExpanded = expandedThreadPostId === post.post_id;
            const isReplyComposerActive = activeReplyPostId === post.post_id;

            return (
              <div
                key={post.post_id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft transition-all space-y-4 relative"
              >
                {/* ============================================================ */}
                {/* 1. MOBILE POST DESIGN (NO AVATARS ANYWHERE ON MOBILE) */}
                {/* ============================================================ */}
                <div className="block md:hidden space-y-3">
                  {/* Author Info (No avatar) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        onClick={() => navigate('/profile')}
                        className="text-sm font-bold text-slate-900 cursor-pointer hover:text-brand-600 transition-colors"
                      >
                        {post.author_name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">{post.author_title || 'NexaLink Member'}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{formatDate(post.created_at, 'relative')}</span>
                  </div>

                  {/* Networking Requirement Card */}
                  <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
                      <span>{intentBadgeIcon}</span>
                      <span>{intentLabel}</span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 leading-relaxed pl-0.5 whitespace-pre-wrap">
                      {details}
                    </div>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* 2. DESKTOP POST DESIGN (HORIZONTAL TWO-COLUMN LAYOUT) */}
                {/* ============================================================ */}
                <div className="hidden md:flex flex-row items-center justify-between gap-6">
                  {/* Left Column: Author Avatar + Name & Title */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <img
                      src={post.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={post.author_name}
                      onClick={() => navigate('/profile')}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 hover:ring-brand-500 transition-all cursor-pointer shrink-0"
                      title="View Profile"
                    />
                    <div className="min-w-0">
                      <h4
                        onClick={() => navigate('/profile')}
                        className="text-sm font-bold text-slate-900 cursor-pointer hover:text-brand-600 transition-colors truncate"
                      >
                        {post.author_name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {post.author_title || 'NexaLink Member'}
                      </p>
                    </div>
                  </div>

                  {/* Light Vertical Divider */}
                  <div className="h-10 w-px bg-slate-200/80 shrink-0" />

                  {/* Right Column: Intent Pill + Requirement details (NO AVATAR) */}
                  <div className="flex-1 bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3 flex flex-col items-start gap-1.5 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold shrink-0">
                      <span>{intentBadgeIcon}</span>
                      <span>{intentLabel}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 leading-snug truncate w-full">
                      {details}
                    </div>
                  </div>

                  {/* Time ago */}
                  <span className="text-[11px] text-slate-400 font-medium shrink-0 self-start mt-1">
                    {formatDate(post.created_at, 'relative')}
                  </span>
                </div>

                {/* ============================================================ */}
                {/* 3. REACTION & ACTION ROW */}
                {/* ============================================================ */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold relative">
                  {/* Reaction Button & Count */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveReactionPicker(activeReactionPicker === post.post_id ? null : post.post_id)
                      }
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
                        reactions.userReaction
                          ? 'bg-rose-50 text-rose-600 border border-rose-200 font-bold'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          reactions.userReaction ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'
                        }`}
                      />
                      {topEmojis.length > 0 && (
                        <span className="flex items-center gap-0.5 text-xs">
                          {topEmojis.map((e) => (
                            <span key={e}>{e}</span>
                          ))}
                        </span>
                      )}
                      <span>{reactions.total}</span>
                    </button>

                    {/* Popover Emoji Picker */}
                    {activeReactionPicker === post.post_id && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl flex items-center gap-1.5 z-30 animate-fadeIn select-none">
                        {EMOJI_OPTIONS.map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleSelectReaction(post.post_id, opt.emoji)}
                            className="p-1.5 text-lg hover:scale-125 transition-transform rounded-lg hover:bg-slate-100"
                            title={opt.label}
                          >
                            {opt.emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: Reply & Share */}
                  <div className="flex items-center gap-4 text-slate-500">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReplyPostId(activeReplyPostId === post.post_id ? null : post.post_id);
                        if (!isThreadExpanded && replies.length > 0) {
                          setExpandedThreadPostId(post.post_id);
                        }
                      }}
                      className="flex items-center gap-1.5 hover:text-slate-900 font-semibold cursor-pointer transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      <span>Reply</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: 'NexaLink Feed Post', text: details, url: window.location.href });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Post link copied to clipboard!');
                        }
                      }}
                      className="flex items-center gap-1.5 hover:text-slate-900 font-semibold cursor-pointer transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-slate-400" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* 4. EXISTING REPLIES PREVIEW & EXPANDABLE THREAD */}
                {/* ============================================================ */}
                {replies.length > 0 && !isThreadExpanded && (
                  <div className="bg-slate-50/80 rounded-2xl p-3 text-xs space-y-1.5 border border-slate-200/60">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
                      <span className="font-bold text-slate-700">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</span>
                      <button
                        type="button"
                        onClick={() => setExpandedThreadPostId(post.post_id)}
                        className="text-brand-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>View all {replies.length} replies</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-800 font-medium truncate">
                      <span className="font-bold text-slate-900 mr-1.5">{replies[0].authorName}:</span>
                      {replies[0].content}
                    </p>
                  </div>
                )}

                {/* Full Expanded Thread */}
                {isThreadExpanded && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-900">Thread ({replies.length})</h5>
                      <button
                        type="button"
                        onClick={() => setExpandedThreadPostId(null)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
                      >
                        Collapse
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {replies.map((rep) => (
                        <div key={rep.id} className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1 border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{rep.authorName}</span>
                            <span className="text-[10px] text-slate-400">{rep.timeAgo}</span>
                          </div>
                          <p className="text-slate-700 font-medium leading-relaxed">{rep.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline Reply Composer Input */}
                {isReplyComposerActive && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddReply(post.post_id);
                    }}
                    className="flex items-center gap-2 pt-2 animate-fadeIn"
                  >
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyInputs[post.post_id] || ''}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({ ...prev, [post.post_id]: e.target.value }))
                      }
                      className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden font-medium text-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={!(replyInputs[post.post_id] || '').trim()}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Send
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
