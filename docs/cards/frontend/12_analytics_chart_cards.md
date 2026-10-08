# Frontend Card: Analytics & Chart Cards

## 1. Overview
The **Analytics & Chart Cards** comprise the reporting hub on the **Analytics Page** (`frontend/src/pages/AnalyticsPage.tsx`). Built with **Recharts** and Tailwind CSS, these cards display network growth velocity, relationship health distribution, interaction frequency by channel, and goal completion rates.

---

## 2. Visual & Structural Specifications

```text
+-------------------------------------------------------------+
| Network Growth Velocity (Last 6 Months)                     |
| Total Connections: 128 (+14 this month)                     |
| [====================================== Line / Area Chart ] |
| Jan       Feb       Mar       Apr       May       Jun       |
+-------------------------------------------------------------+
| Relationship Health Distribution                            |
| • Strong (>=75%): 42%      • Moderate (40-74%): 38%         |
| • Needs Attention (<40%): 20%                               |
| [======================= Donut / Pie Chart ===============] |
+-------------------------------------------------------------+
```

- **Recharts Components Used:** `ResponsiveContainer`, `AreaChart`, `Area`, `BarChart`, `Bar`, `PieChart`, `Pie`, `Cell`, `XAxis`, `YAxis`, `Tooltip`.
- **Theme Palette:**
  - Growth Area: Brand Indigo (`#4F46E5` / `rgb(79, 70, 229)`)
  - Touchpoints Bar: Amber/Purple (`#8B5CF6`, `#F59E0B`)
  - Health Donut: Emerald (`#10B981`), Indigo (`#6366F1`), Rose (`#F43F5E`)

---

## 3. Data Schema & Types

```typescript
export interface AnalyticsOverview {
  stats: {
    total_contacts: number;
    active_relationships: number;
    follow_ups_due: number;
    total_goals: number;
    completed_goals: number;
    goal_completion_rate: number;
    total_interactions: number;
  };
  growth_trend: { month: string; count: number }[];
  interactions_by_type: { type: string; count: number }[];
  relationship_health: {
    strong: number;
    moderate: number;
    needs_attention: number;
  };
}
```

---

## 4. Component Code Implementation

```tsx
{/* Network Growth Chart Card */}
<div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card space-y-4">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-base font-bold text-slate-900">Network Growth Velocity</h3>
      <p className="text-xs text-slate-500 font-medium">Cumulative new relationships added over time</p>
    </div>
    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
      +12% this quarter
    </span>
  </div>

  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={analytics.growth_trend}>
        <defs>
          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#4f46e5"
          strokeWidth={2.5}
          fill="url(#growthGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
</div>
```

---

## 5. Logic & State Handlers

1. **Aggregation Pipeline:**
   - Fetched via `GET /api/analytics`.
   - SQL queries compute grouped date sums (`DATE_FORMAT(created_at, '%Y-%m')`) and relationship strength brackets without loading raw contact arrays into memory.
