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
  ChevronRight,
  UserCheck,
  Link2
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

export interface ReplyItem {
  id: string;
  authorName: string;
  replyType: 'wants to meet to' | 'can connect to';
  targetPerson: string;
  content?: string;
  timeAgo: string;
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

  // Reply Composer Form State per post
  const [replyTypeInputs, setReplyTypeInputs] = useState<Record<number, 'wants to meet to' | 'can connect to'>>({});
  const [replyTargetInputs, setReplyTargetInputs] = useState<Record<number, string>>({});
  const [replyContentInputs, setReplyContentInputs] = useState<Record<number, string>>({});

  // Thread Conversations per post (default seeded with Vinay & Devyani thread)
  const [postReplies, setPostReplies] = useState<Record<number, ReplyItem[]>>({
    1: [
      {
        id: 'r1',
        authorName: 'Vinay',
        replyType: 'wants to meet to',
        targetPerson: 'Sanjeev Sarma',
        timeAgo: '2h ago',
        likesCount: 2,
      },
      {
        id: 'r2',
        authorName: 'Devyani',
        replyType: 'can connect to',
        targetPerson: 'Sanjeev Sarma',
        timeAgo: '1h ago',
        likesCount: 3,
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
      return api.post('/feed', { content: fullText, tags: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setContent('');
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
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
        return {
          ...prev,
          [postId]: {
            userReaction: undefined,
            counts: updatedCounts,
            total: Math.max(0, existing.total - 1),
          },
        };
      } else {
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

  const handleAddThreadReply = (postId: number, defaultTargetName: string) => {
    const selectedReplyType = replyTypeInputs[postId] || 'wants to meet to';
    const targetPersonName = (replyTargetInputs[postId] || defaultTargetName || 'Sanjeev Sarma').trim();
    const commentText = (replyContentInputs[postId] || '').trim();

    const newReplyItem: ReplyItem = {
      id: `rep-${Date.now()}`,
      authorName: user?.displayName || 'User',
      replyType: selectedReplyType,
      targetPerson: targetPersonName,
      content: commentText,
      timeAgo: 'Just now',
      likesCount: 0,
    };

    setPostReplies((prev) => {
      const currentReplies = prev[postId] || [
        {
          id: `r1-${postId}`,
          authorName: 'Vinay',
          replyType: 'wants to meet to',
          targetPerson: targetPersonName,
          timeAgo: '2h ago',
          likesCount: 2,
        },
        {
          id: `r2-${postId}`,
          authorName: 'Devyani',
          replyType: 'can connect to',
          targetPerson: targetPersonName,
          timeAgo: '1h ago',
          likesCount: 3,
        },
      ];
      return {
        ...prev,
        [postId]: [...currentReplies, newReplyItem],
      };
    });

    setReplyContentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedThreadPostId(postId);
    setActiveReplyPostId(null);
  };

  // Logged-in user role & company subtitle
  const userSubtitle =
    profile?.headline ||
    (profile?.job_title && profile?.company
      ? `${profile.job_title} at ${profile.company}`
      : profile?.job_title || profile?.company || 'Employee at Osmos Multimedia Pvt Ltd');

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
              {user?.displayName || 'Abhishek Tiwari'}
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

            // Author role & company subtitle fix (ensures "Employee at Osmos Multimedia Pvt Ltd" instead of generic fallback)
            const authorRoleTitle =
              post.author_title && post.author_title !== 'NexaLink Network Member'
                ? post.author_title
                : userSubtitle;

            // Extract target name for thread replies (e.g. Sanjeev Sarma)
            const targetPersonInPost = details.split('\n')[0].split(',')[0].trim() || 'Sanjeev Sarma';

            const reactions = postReactions[post.post_id] || {
              counts: {},
              total: post.likes_count || 0,
            };
            const topEmojis = Object.keys(reactions.counts);

            // Fetch or seed default thread replies for conversation
            const replies: ReplyItem[] = postReplies[post.post_id] || [
              {
                id: `r1-${post.post_id}`,
                authorName: 'Vinay',
                replyType: 'wants to meet to',
                targetPerson: targetPersonInPost,
                timeAgo: '2h ago',
                likesCount: 2,
              },
              {
                id: `r2-${post.post_id}`,
                authorName: 'Devyani',
                replyType: 'can connect to',
                targetPerson: targetPersonInPost,
                timeAgo: '1h ago',
                likesCount: 3,
              },
            ];

            const isThreadExpanded = expandedThreadPostId === post.post_id;
            const isReplyComposerActive = activeReplyPostId === post.post_id;
            const currentReplyType = replyTypeInputs[post.post_id] || 'wants to meet to';

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
                      <p className="text-xs text-slate-500 font-medium">{authorRoleTitle}</p>
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
                      src={post.author_avatar || profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
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
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{authorRoleTitle}</p>
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
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
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
                            className="p-1.5 text-lg hover:scale-125 transition-transform rounded-lg hover:bg-slate-100 cursor-pointer"
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
                        if (!isThreadExpanded) {
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
                {/* 4. REPLY THREAD PREVIEW & CONVERSATION VIEW */}
                {/* ============================================================ */}
                {replies.length > 0 && !isThreadExpanded && (
                  <div className="bg-slate-50/80 rounded-2xl p-3 text-xs space-y-2 border border-slate-200/60">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
                      <span className="font-bold text-slate-700">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'} in Thread</span>
                      <button
                        type="button"
                        onClick={() => setExpandedThreadPostId(post.post_id)}
                        className="text-brand-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>View thread conversation</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Compact preview of first reply */}
                    <div className="flex items-center gap-2 pt-1 text-slate-800">
                      <span className="font-bold text-slate-900">{replies[0].authorName}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {replies[0].replyType === 'can connect to' ? '🌟 can connect to' : '🤝 wants to meet to'} {replies[0].targetPerson}
                      </span>
                    </div>
                  </div>
                )}

                {/* Full Expanded Thread Conversation UI */}
                {isThreadExpanded && (
                  <div className="space-y-3 pt-3 border-t border-slate-100 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-brand-600" />
                        <span>Thread Conversation ({replies.length})</span>
                      </h5>
                      <button
                        type="button"
                        onClick={() => setExpandedThreadPostId(null)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Collapse Thread
                      </button>
                    </div>

                    {/* Thread Items Conversation List */}
                    <div className="relative pl-3 space-y-3 border-l-2 border-brand-200/60 ml-2">
                      {replies.map((rep) => (
                        <div
                          key={rep.id}
                          className="bg-slate-50 p-3.5 rounded-2xl text-xs space-y-2 border border-slate-200/80 shadow-xs relative"
                        >
                          {/* Thread node indicator */}
                          <div className="absolute -left-[19px] top-4 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-white" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs">{rep.authorName}</span>
                              <span
                                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                                  rep.replyType === 'can connect to'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {rep.replyType === 'can connect to' ? '🌟 can connect to' : '🤝 wants to meet to'}{' '}
                                {rep.targetPerson}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">{rep.timeAgo}</span>
                          </div>

                          {rep.content && (
                            <p className="text-slate-700 font-medium leading-relaxed pt-0.5">{rep.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline Thread Reply Composer Input */}
                {isReplyComposerActive && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddThreadReply(post.post_id, targetPersonInPost);
                    }}
                    className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-xs font-bold text-slate-800">Add Thread Reply</span>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-slate-600">Intent:</label>
                        <select
                          value={currentReplyType}
                          onChange={(e) =>
                            setReplyTypeInputs((prev) => ({
                              ...prev,
                              [post.post_id]: e.target.value as 'wants to meet to' | 'can connect to',
                            }))
                          }
                          className="text-[11px] font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-brand-500 cursor-pointer"
                        >
                          <option value="wants to meet to">🤝 wants to meet to</option>
                          <option value="can connect to">🌟 can connect to</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 shrink-0">
                        {user?.displayName || 'User'} {currentReplyType}:
                      </span>
                      <input
                        type="text"
                        placeholder={`Target Person (e.g. ${targetPersonInPost})`}
                        value={replyTargetInputs[post.post_id] ?? targetPersonInPost}
                        onChange={(e) =>
                          setReplyTargetInputs((prev) => ({ ...prev, [post.post_id]: e.target.value }))
                        }
                        className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Optional comment details..."
                        value={replyContentInputs[post.post_id] || ''}
                        onChange={(e) =>
                          setReplyContentInputs((prev) => ({ ...prev, [post.post_id]: e.target.value }))
                        }
                        className="flex-1 text-xs px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        Reply to Thread
                      </button>
                    </div>
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
