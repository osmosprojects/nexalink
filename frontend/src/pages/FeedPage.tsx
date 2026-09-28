import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Rss,
  Heart,
  Send,
  Sparkles,
  Share2,
  MessageCircle,
  TrendingUp,
  Image as ImageIcon,
  Compass,
  Users,
  Flame,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { Post } from '../types';
import { formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const FeedPage: React.FC = () => {
  const [postType, setPostType] = useState<'wants to meet' | 'can connect you to'>('wants to meet');
  const [content, setContent] = useState('');
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['feed'],
    queryFn: () => api.get<Post[]>('/feed'),
  });

  const createPostMutation = useMutation({
    mutationFn: (newContent: string) => {
      const fullText = `[${postType}] ${newContent.trim()}`;
      return api.post('/feed', { content: fullText, tags: [postType, 'Networking'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setContent('');
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    },
  });

  const likeMutation = useMutation({
    mutationFn: (postId: number) => api.post(`/feed/${postId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  // Calculate current user role & company subtitle
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
            const isWantToMeet = post.content.startsWith('[wants to meet]') || post.content.startsWith('[I want to meet]');
            const isCanConnect =
              post.content.startsWith('[can connect you to]') ||
              post.content.startsWith('[I can connect You to]') ||
              post.content.startsWith('[I can introduce]');
            
            let displayContent = post.content;
            if (isWantToMeet) {
              displayContent = post.content.replace('[wants to meet]', '').replace('[I want to meet]', '').trim();
            }
            if (isCanConnect) {
              displayContent = post.content
                .replace('[can connect you to]', '')
                .replace('[I can connect You to]', '')
                .replace('[I can introduce]', '')
                .trim();
            }

            return (
              <div
                key={post.post_id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft transition-all space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-3 cursor-pointer group"
                    title="View Profile"
                  >
                    <img
                      src={post.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={post.author_name}
                      className="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-200 group-hover:ring-brand-500 transition-all"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {post.author_name}
                        </h4>
                        {isWantToMeet && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                            🤝 wants to meet
                          </span>
                        )}
                        {isCanConnect && (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                            🌟 can connect you to
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{post.author_title || 'NexaLink Member'}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{formatDate(post.created_at, 'relative')}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                  {displayContent}
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <button
                    onClick={() => likeMutation.mutate(post.post_id)}
                    className="flex items-center gap-1.5 hover:text-rose-600 font-bold transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-50" />
                    <span>{post.likes_count} Likes</span>
                  </button>

                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-slate-600 font-medium">
                      <MessageCircle className="w-4 h-4" /> Reply
                    </span>
                    <span className="flex items-center gap-1 cursor-pointer hover:text-slate-600 font-medium">
                      <Share2 className="w-4 h-4" /> Share
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
