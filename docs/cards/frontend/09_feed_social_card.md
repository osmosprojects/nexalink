# Frontend Card: Networking Feed Cards

## 1. Overview
The **Networking Feed Card** powers the social and collaborative ecosystem on the **Networking Feed Page** (`frontend/src/pages/FeedPage.tsx`). It displays peer updates, milestone celebrations, explicit requests to connect ("Wants to meet X"), and the interactive **Can-Connect** bridge drawer launcher.

---

## 2. Visual & Structural Specifications

```text
+-------------------------------------------------------------+
| [Avatar]  Sanjeev Sarma — Tech Advisor @ NexaLink           |
|           Posted 2 hours ago • #Growth #AI                  |
|-------------------------------------------------------------|
| "Excited to share that our seed portfolio company just      |
|  closed $2.5M! Looking to connect with Series-A fintech     |
|  specialists and compliance attorneys."                     |
|-------------------------------------------------------------|
| +---------------------------------------------------------+ |
| | [Handshake] Can Connect to: Series-A Fintech Specialists| |
| | 3 mutual pathways available in your network!            | |
| +---------------------------------------------------------+ |
|-------------------------------------------------------------|
| [Heart 12 Likes]      [Message 4 Replies]     [Can Connect] |
+-------------------------------------------------------------+
```

- **Interactive Bridge Banner:**
  - Emphasizes warm intro routes with a high-contrast gradient callout.
  - Clicking "Can Connect" triggers `CanConnectDrawer` with ranked mutual contacts.

---

## 3. Data Schema & Types

```typescript
export interface FeedPost {
  post_id: number;
  user_id: number;
  author_name: string;
  author_title: string | null;
  author_avatar: string | null;
  content: string;
  tags?: string[] | null;
  likes_count: number;
  created_at: string;
  is_liked?: boolean;
}

export interface PostReply {
  reply_id: number;
  post_id: number;
  user_id: number;
  author_name: string;
  author_avatar: string | null;
  reply_type: string; // e.g. "CAN_CONNECT", "wants to meet to"
  target_person: string;
  content: string | null;
  created_at: string;
}
```

---

## 4. Component Code Implementation

```tsx
{/* Networking Feed Card */}
<div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-card hover:shadow-soft transition-all space-y-4">
  {/* Post Author Header */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Avatar src={post.author_avatar} name={post.author_name} size="md" />
      <div>
        <h4 className="text-base font-bold text-slate-900">{post.author_name}</h4>
        <p className="text-xs text-slate-500 font-medium">
          {post.author_title || 'Network Member'} • {formatDate(post.created_at)}
        </p>
      </div>
    </div>
  </div>

  {/* Post Content */}
  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
    {post.content}
  </p>

  {/* Tag Chips */}
  {post.tags && post.tags.length > 0 && (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {post.tags.map((tag, idx) => (
        <span key={idx} className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-lg">
          #{tag}
        </span>
      ))}
    </div>
  )}

  {/* Can Connect Pathway Callout */}
  <div className="bg-gradient-to-r from-purple-50 to-indigo-50/60 rounded-2xl border border-purple-100 p-3.5 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
        <HeartHandshake className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs font-bold text-purple-900">Have a warm introduction?</div>
        <div className="text-[11px] text-purple-700">Help {post.author_name} connect with their target contact</div>
      </div>
    </div>
    <button
      onClick={() => onOpenCanConnectDrawer(post.post_id)}
      className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-xl shadow-sm transition-colors whitespace-nowrap"
    >
      Can Connect
    </button>
  </div>

  {/* Engagement Footer */}
  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
    <button
      onClick={() => onLike(post.post_id)}
      className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
        post.is_liked ? 'text-rose-600 bg-rose-50' : 'hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-rose-600' : ''}`} />
      <span>{post.likes_count} Likes</span>
    </button>

    <button
      onClick={() => toggleReplies(post.post_id)}
      className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors"
    >
      <MessageSquare className="w-4 h-4" />
      <span>Reply</span>
    </button>
  </div>
</div>
```

---

## 5. Logic & State Handlers

1. **Like Toggle (`POST /api/feed/:id/like`):**
   - Atomically toggles user's like state in `feed_likes` table and updates `posts.likes_count`.
2. **Can-Connect Resolution:**
   - Calls `GET /api/feed/:id/can-connect`.
   - Checks if the user is the post author (returns responders list) or viewer (returns matching CRM contacts that match the requested criteria).
