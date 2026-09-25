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
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['feed'],
    queryFn: () => api.get<Post[]>('/feed'),
  });

  const createPostMutation = useMutation({
    mutationFn: (newContent: string) => api.post('/feed', { content: newContent, tags: ['Networking', 'SFTech'] }),
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

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-12">
      {/* Main Feed Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Networking Feed</h2>
            <p className="text-xs text-slate-500">Shared milestone updates, industry insights, and network thoughts</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Rss className="w-4 h-4" />
          </div>
        </div>

        {/* Share Update Composer */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt="User"
              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
            />
            <input
              type="text"
              placeholder="Share a milestone, event update, or networking takeaway..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden font-medium"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer"><ImageIcon className="w-3.5 h-3.5" /> Photo</span>
              <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer"><Sparkles className="w-3.5 h-3.5 text-purple-500" /> AI Polish</span>
            </div>

            <button
              onClick={() => createPostMutation.mutate(content)}
              disabled={!content.trim() || createPostMutation.isPending}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
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
            <p className="text-xs text-slate-500">Share your first update above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.post_id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft transition-all space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={post.author_name}
                      className="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{post.author_name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{post.author_title || 'NexaLink Member'}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{formatDate(post.created_at, 'relative')}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                  {post.content}
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
                    className="flex items-center gap-1.5 hover:text-rose-600 font-bold transition-colors"
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
            ))}
          </div>
        )}
      </div>

      {/* Desktop Right Sidebar Column */}
      <div className="hidden lg:flex flex-col space-y-6 sticky top-20">
        {/* Trending Network Topics Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Trending Topics</h3>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Live
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['#SaaS', '#AI', '#Founders', '#RaisingCapital', '#ProductGrowth', '#TechEvents', '#Hiring'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-200/80 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Network Matchmaking Promo Widget */}
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <h3 className="text-sm font-bold text-white">Network Matchmaking</h3>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            Expand your strategic network by finding mentors, advisors, or co-founders with shared business domain focus.
          </p>
          <button
            onClick={() => navigate('/discover')}
            className="w-full py-2.5 px-4 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <Compass className="w-4 h-4 text-purple-600" />
            <span>Discover Strategic Matches</span>
          </button>
        </div>
      </div>
    </div>
  );
};
