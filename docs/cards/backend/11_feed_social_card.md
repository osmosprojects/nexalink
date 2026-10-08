# Backend Card: Networking Feed & Bridge Card

## 1. Overview
The **Networking Feed & Bridge Module** (`backend/src/controllers/FeedController.ts`, `backend/src/repositories/FeedRepository.ts`) operates the social activity feed and resolves warm network introduction pathways via the **Can Connect** endpoint.

- **Primary Source Files:**
  - Controller: `backend/src/controllers/FeedController.ts`
  - Repository: `backend/src/repositories/FeedRepository.ts`
  - Tables: `posts`, `feed_likes`, `post_replies`

---

## 2. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/feed` | List latest network feed posts with author metadata |
| `POST` | `/api/feed` | Publish a new post or milestone announcement |
| `POST` | `/api/feed/:id/like` | Toggle like state and update counter |
| `GET` | `/api/feed/:id/replies` | Get threaded discussion replies for a post |
| `POST` | `/api/feed/:id/reply` | Submit a comment or warm introduction offer |
| `GET` | `/api/feed/:id/can-connect` | Calculate candidate introduction paths for a post |

---

## 3. Can Connect Pathway Resolution Algorithm

```typescript
// backend/src/controllers/FeedController.ts (getCanConnectPaths)
static async getCanConnectPaths(req: Request, res: Response, next: NextFunction) {
  const userId = req.user!.userId;
  const postId = parseInt(String(req.params.id), 10);
  const post = await FeedRepository.findById(postId);

  // If the author is viewing their own post, return the list of respondents who offered introductions
  if (post && post.user_id === userId) {
    const replies = await FeedRepository.getRepliesForPost(postId);
    const ownerPaths = replies.map((r) => ({
      id: `reply-${r.reply_id}`,
      name: r.author_name,
      role: r.reply_type === 'CAN_CONNECT' ? 'Responded: Can Connect' : 'Responded: Wants to Meet',
      company: 'Responded to your request',
      relationshipStatus: 'Responded to your post',
      networkingContext: r.content || `Offered connection to target contact`,
      userId: r.user_id,
    }));
    return sendSuccess(res, ownerPaths);
  }

  // Otherwise, match viewer's CRM contacts against post requirements
  const contactRes = await ContactRepository.list(userId, { limit: 50 });
  const contacts = contactRes.items || [];
  
  // Ranks contacts by company/role match and relationship strength (>=50)
  // Returns synthesized candidate pathway bridges
}
```

---

## 4. Like Concurrency Protection
Likes use atomic inserts/deletes within a transaction to prevent duplicate counts or race conditions across concurrent browser taps.
