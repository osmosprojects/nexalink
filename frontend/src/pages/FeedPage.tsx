import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Rss,
  Heart,
  Send,
  MessageCircle,
  Image as ImageIcon,
  ChevronRight,
  Sparkles,
  Plus,
  X
} from 'lucide-react';
import { useRef } from 'react';
import { api } from '../lib/api';
import { Post, CanConnectPerson } from '../types';
import { formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { CanConnectDrawer } from '../components/ui/CanConnectDrawer';
import { ProfilePreviewModal } from '../components/ui/ProfilePreviewModal';
import { WarmIntroModal } from '../components/ui/WarmIntroModal';
import { Avatar } from '../components/ui/Avatar';

// Feature flags for networking card UI
const SHOW_REACTIONS = false;
const SHOW_THREAD_CONVERSATION = false;

// Centralized Intent -> Response Action Mapping
export const NETWORKING_INTENT_ACTIONS = {
  WANTS_TO_MEET: {
    intentKey: 'WANTS_TO_MEET' as const,
    displayIntent: '🤝 wants to meet',
    intentBadgeIcon: '🤝',
    intentLabel: 'wants to meet',
    badgeStyle: 'bg-blue-800 text-white font-bold border border-blue-900',
    responseAction: '✨ Can Connect',
    responseActionIcon: '✨',
    responseType: 'CAN_CONNECT',
    respondedText: '✓ Can Connect',
    responseBtnStyle: 'bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs',
    respondedBtnStyle: 'bg-emerald-800 text-white font-bold border border-emerald-950',
    ownerSummaryText: (count: number) =>
      `${count} ${count === 1 ? 'person can' : 'people can'} help you connect`,
    ownerDrawerTitle: (target: string) => `People who can help you reach ${target}`,
    ownerDrawerSubtitle: 'People who responded to your networking request.',
  },
  CAN_CONNECT: {
    intentKey: 'CAN_CONNECT' as const,
    displayIntent: '🌟 can connect you to',
    intentBadgeIcon: '🌟',
    intentLabel: 'can connect you to',
    badgeStyle: 'bg-emerald-700 text-white font-bold border border-emerald-800',
    responseAction: '🤝 Wants to Meet',
    responseActionIcon: '🤝',
    responseType: 'WANTS_TO_MEET',
    respondedText: '✓ Wants to Meet',
    responseBtnStyle: 'bg-blue-800 hover:bg-blue-900 text-white font-bold shadow-xs',
    respondedBtnStyle: 'bg-blue-900 text-white font-bold border border-blue-950',
    ownerSummaryText: (count: number, target: string) =>
      `${count} ${count === 1 ? 'person wants' : 'people want'} to meet ${target}`,
    ownerDrawerTitle: (target: string) => `People who want to meet ${target}`,
    ownerDrawerSubtitle: 'People who responded to your networking availability.',
  },
} as const;

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
  authorAvatar?: string | null;
  replyType: 'wants to meet to' | 'can connect' | 'can connect to' | 'CAN_CONNECT' | 'WANTS_TO_MEET';
  targetPerson: string;
  content?: string | null;
  timeAgo: string;
  likesCount: number;
}

export const FeedPage: React.FC = () => {
  const [postType, setPostType] = useState<'wants to meet' | 'can connect you to'>('wants to meet');
  const [content, setContent] = useState('');
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const composerCardRef = useRef<HTMLDivElement | null>(null);

  const handleOpenPostFeature = () => {
    setIsComposerOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        setTimeout(() => {
          composerCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          composerRef.current?.focus();
        }, 150);
      }
      return nextState;
    });
  };

  // Can Connect Drawer state
  const [canConnectDrawerPost, setCanConnectDrawerPost] = useState<{
    id: number;
    targetName: string;
    isOwner: boolean;
    intentKey: 'WANTS_TO_MEET' | 'CAN_CONNECT';
  } | null>(null);

  // Profile Preview Modal state
  const [previewPerson, setPreviewPerson] = useState<CanConnectPerson | null>(null);

  // Warm Intro Modal state
  const [warmIntroUser, setWarmIntroUser] = useState<any | null>(null);

  // Interactive Reaction & Reply UI States
  const [activeReactionPicker, setActiveReactionPicker] = useState<number | null>(null);
  const [postReactions, setPostReactions] = useState<
    Record<number, { userReaction?: string; counts: Record<string, number>; total: number }>
  >({});

  const [activeReplyPostId, setActiveReplyPostId] = useState<number | null>(null);
  const [expandedThreadPostId, setExpandedThreadPostId] = useState<number | null>(null);

  // Reply Composer Form State per post
  const [replyTypeInputs, setReplyTypeInputs] = useState<Record<number, 'wants to meet to' | 'can connect' | 'can connect to'>>({});
  const [replyTargetInputs, setReplyTargetInputs] = useState<Record<number, string>>({});
  const [replyContentInputs, setReplyContentInputs] = useState<Record<number, string>>({});

  // Persisted Thread Conversations per post (synced via backend database API)
  const [postReplies, setPostReplies] = useState<Record<number, ReplyItem[]>>({});

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['feed'],
    queryFn: () => api.get<Post[]>('/feed'),
  });

  // Fetch replies from API for posts
  const fetchRepliesForPost = async (postId: number) => {
    try {
      const res = await api.get<any[]>(`/feed/${postId}/replies`);
      if (Array.isArray(res)) {
        const formatted: ReplyItem[] = res.map((r) => ({
          id: String(r.reply_id),
          authorName: r.author_name,
          authorAvatar: r.author_avatar,
          replyType: r.reply_type || 'wants to meet to',
          targetPerson: r.target_person || 'Sanjeev Sarma',
          content: r.content || null,
          timeAgo: formatDate(r.created_at, 'relative'),
          likesCount: 0,
        }));
        setPostReplies((prev) => ({ ...prev, [postId]: formatted }));
      }
    } catch (err) {
      console.warn('Failed to fetch post replies:', err);
    }
  };

  // Pre-load replies for posts when feed loads
  useEffect(() => {
    if (posts && posts.length > 0) {
      posts.forEach((p) => {
        fetchRepliesForPost(p.post_id);
      });
    }
  }, [posts]);

  const createPostMutation = useMutation({
    mutationFn: (newContent: string) => {
      const fullText = `[${postType}] ${newContent.trim()}`;
      return api.post('/feed', { content: fullText, tags: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setContent('');
      setIsComposerOpen(false);
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

  const handleRespondToPost = async (postId: number, targetPerson: string, responseType: string) => {
    try {
      await api.post(`/feed/${postId}/reply`, {
        replyType: responseType,
        targetPerson,
      });
      await fetchRepliesForPost(postId);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Failed to respond to post:', err);
    }
  };

  const handleAddThreadReply = async (postId: number, defaultTargetName: string, defaultReplyType: 'wants to meet to' | 'can connect' | 'can connect to') => {
    const selectedReplyType = replyTypeInputs[postId] || defaultReplyType;
    const targetPersonName = (replyTargetInputs[postId] || defaultTargetName || 'Sanjeev Sarma').trim();
    const commentText = (replyContentInputs[postId] || '').trim();

    try {
      await api.post(`/feed/${postId}/reply`, {
        replyType: selectedReplyType,
        targetPerson: targetPersonName,
        content: commentText || null,
      });

      await fetchRepliesForPost(postId);

      setReplyContentInputs((prev) => ({ ...prev, [postId]: '' }));
      setExpandedThreadPostId(postId);
      setActiveReplyPostId(null);
      confetti({ particleCount: 25, spread: 40, origin: { y: 0.8 } });
    } catch (err) {
      console.error('Failed to post reply to backend:', err);
    }
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
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenPostFeature}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ${
              isComposerOpen
                ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-slate-700/20'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
            }`}
            title={isComposerOpen ? 'Close / Cancel (X)' : 'Create Post / Share Update (+)'}
          >
            {isComposerOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
          <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Rss className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Share Networking Requirement & Update Composer */}
      {isComposerOpen && (
        <div ref={composerCardRef} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          {/* Profile Pic, Name, Role & Company Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar
                src={user?.avatarUrl || profile?.avatar_url}
                name={user?.displayName}
                onClick={() => navigate('/profile')}
                className="w-11 h-11 rounded-full ring-2 ring-slate-200 hover:ring-brand-500 transition-all cursor-pointer shrink-0"
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
            <button
              type="button"
              onClick={() => setIsComposerOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Close composer"
            >
              <X className="w-4 h-4" />
            </button>
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
                className={`text-xs font-bold px-3 py-2 border rounded-xl focus:outline-hidden cursor-pointer transition-colors ${
                  postType === 'can connect you to'
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-blue-800 text-white border-blue-900'
                }`}
              >
                <option value="wants to meet" className="bg-white text-slate-900">🤝 wants to meet</option>
                <option value="can connect you to" className="bg-white text-slate-900">🌟 can connect you to</option>
              </select>
            </div>

            {/* Text Area for Typing */}
            <textarea
              ref={composerRef}
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="px-3.5 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
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
        </div>
      )}

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
            const originalIntentKey = isWantToMeet ? 'WANTS_TO_MEET' : 'CAN_CONNECT';
            const intentConfig = NETWORKING_INTENT_ACTIONS[originalIntentKey];

            let details = post.content
              .replace('[wants to meet]', '')
              .replace('[I want to meet]', '')
              .replace('[can connect you to]', '')
              .replace('[I can connect You to]', '')
              .replace('[I can introduce]', '')
              .trim();

            const authorRoleTitle =
              post.author_title && post.author_title !== 'NexaLink Network Member'
                ? post.author_title
                : userSubtitle;

            const targetPersonInPost = details.split('\n')[0].split(',')[0].trim() || 'Target Connection';

            const isOwnPost = Boolean(
              (user?.userId && post.user_id && Number(user.userId) === Number(post.user_id)) ||
              (profile?.user_id && post.user_id && Number(profile.user_id) === Number(post.user_id)) ||
              (user?.displayName && post.author_name && user.displayName.trim().toLowerCase() === post.author_name.trim().toLowerCase())
            );

            const replies: ReplyItem[] = postReplies[post.post_id] || [];

            const userHasResponded = replies.some(
              (r) =>
                (user?.displayName && r.authorName.toLowerCase() === user.displayName.toLowerCase())
            );

            const reactions = postReactions[post.post_id] || {
              counts: {},
              total: post.likes_count || 0,
            };
            const topEmojis = Object.keys(reactions.counts);

            return (
              <div
                key={post.post_id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft transition-all space-y-4 relative"
              >
                {/* 1. MOBILE POST DESIGN */}
                <div className="block md:hidden space-y-3">
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

                  <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] ${intentConfig.badgeStyle}`}>
                      <span>{intentConfig.intentBadgeIcon}</span>
                      <span>{intentConfig.intentLabel}</span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 leading-relaxed pl-0.5 whitespace-pre-wrap">
                      {details}
                    </div>
                  </div>
                </div>

                {/* 2. DESKTOP POST DESIGN */}
                <div className="hidden md:flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 flex-wrap">
                    <Avatar
                      src={post.author_avatar}
                      name={post.author_name}
                      onClick={() => navigate('/profile')}
                      className="w-10 h-10 rounded-full ring-2 ring-slate-200 hover:ring-brand-500 transition-all cursor-pointer shrink-0"
                      title="View Profile"
                    />

                    <div className="flex items-center gap-2 text-xs leading-tight flex-wrap">
                      <span
                        onClick={() => navigate('/profile')}
                        className="font-bold text-slate-900 text-sm cursor-pointer hover:text-brand-600 transition-colors shrink-0"
                      >
                        {post.author_name}
                      </span>

                      <span className={`px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1 shrink-0 ${intentConfig.badgeStyle}`}>
                        <span>{intentConfig.intentBadgeIcon}</span>
                        <span>{intentConfig.intentLabel}</span>
                      </span>

                      <span className="font-semibold text-slate-700 text-xs">
                        {details}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium shrink-0">
                    {formatDate(post.created_at, 'relative')}
                  </span>
                </div>

                {/* 3. REACTION ROW (HIDDEN WHEN SHOW_REACTIONS = FALSE) */}
                {SHOW_REACTIONS && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold relative">
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
                  </div>
                )}

                {/* 4. NETWORKING CARD ACTIONS (OWNER VIEW vs VIEWER VIEW) */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isOwnPost ? (
                    /* POST OWNER VIEW: Shows responders summary & View responses button */
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {replies.length > 0 ? (
                          <div className="flex items-center -space-x-2 overflow-hidden">
                            {replies.slice(0, 3).map((r, idx) => (
                              <Avatar
                                key={idx}
                                src={r.authorAvatar}
                                name={r.authorName}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                              />
                            ))}
                            {replies.length > 3 && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white">
                                +{replies.length - 3}
                              </span>
                            )}
                          </div>
                        ) : null}
                        <span className="text-xs font-bold text-slate-700">
                          {intentConfig.ownerSummaryText(replies.length, targetPersonInPost)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCanConnectDrawerPost({
                            id: post.post_id,
                            targetName: targetPersonInPost,
                            isOwner: true,
                            intentKey: originalIntentKey,
                          });
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        View responses ({replies.length})
                      </button>
                    </div>
                  ) : (
                    /* OTHER VIEWER VIEW: Shows reactor avatars on left + intent-driven response action CTA on right */
                    <div className="flex items-center justify-between w-full">
                      <div
                        onClick={() => {
                          if (replies.length > 0) {
                            setCanConnectDrawerPost({
                              id: post.post_id,
                              targetName: targetPersonInPost,
                              isOwner: false,
                              intentKey: originalIntentKey,
                            });
                          }
                        }}
                        className={`flex items-center gap-2 ${replies.length > 0 ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      >
                        {replies.length > 0 ? (
                          <div className="flex items-center -space-x-2 overflow-hidden">
                            {replies.slice(0, 3).map((r, idx) => (
                              <Avatar
                                key={idx}
                                src={r.authorAvatar}
                                name={r.authorName}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                                title={r.authorName}
                              />
                            ))}
                            {replies.length > 3 && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white">
                                +{replies.length - 3}
                              </span>
                            )}
                          </div>
                        ) : null}
                        {replies.length > 0 && (
                          <span className="text-xs font-bold text-slate-700">
                            {replies.length} {replies.length === 1 ? 'person reacted' : 'people reacted'}
                          </span>
                        )}
                      </div>

                      {userHasResponded ? (
                        <button
                          type="button"
                          disabled
                          className={`px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-default opacity-90 ${intentConfig.respondedBtnStyle}`}
                        >
                          <span>{intentConfig.respondedText}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleRespondToPost(post.post_id, targetPersonInPost, intentConfig.responseType)
                          }
                          className={`px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${intentConfig.responseBtnStyle}`}
                        >
                          <span>{intentConfig.responseActionIcon}</span>
                          <span>{intentConfig.responseAction}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Can Connect / Responses Drawer */}
      <CanConnectDrawer
        isOpen={Boolean(canConnectDrawerPost)}
        onClose={() => setCanConnectDrawerPost(null)}
        postId={canConnectDrawerPost?.id || null}
        targetPersonName={canConnectDrawerPost?.targetName || 'Target Connection'}
        isOwner={canConnectDrawerPost?.isOwner || false}
        intentKey={canConnectDrawerPost?.intentKey || 'WANTS_TO_MEET'}
        onSelectPerson={(person) => {
          setPreviewPerson(person);
        }}
        onExploreNetwork={() => {
          navigate('/discover');
        }}
      />

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        person={previewPerson}
        isOpen={Boolean(previewPerson)}
        onClose={() => setPreviewPerson(null)}
        onViewFullProfile={(person) => {
          setPreviewPerson(null);
          if (person.contactId) {
            navigate(`/connections/${person.contactId}`);
          } else {
            navigate('/discover');
          }
        }}
        onConnect={(person) => {
          setPreviewPerson(null);
          setWarmIntroUser({
            recommended_name: person.name,
            recommended_role: person.role,
            recommended_company: person.company,
            industry: 'Networking Ecosystem',
            reason: `Direct introduction path: ${person.networkingContext}`,
          });
        }}
      />

      {/* Warm Intro Modal */}
      {warmIntroUser && (
        <WarmIntroModal
          user={warmIntroUser}
          onClose={() => setWarmIntroUser(null)}
          onSuccess={() => {
            setWarmIntroUser(null);
          }}
        />
      )}
    </div>
  );
};

