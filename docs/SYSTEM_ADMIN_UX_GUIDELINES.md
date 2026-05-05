# AmisiMedOS System Admin UX Guidelines

## Core Principles

### 1. Critical Info Always Visible
- System health status permanently in top bar
- Critical alerts show as red badges on bell icon
- Failed payments visible on billing dashboard within 1 click
- Suspended tenants highlighted in tenant list

### 2. Progressive Disclosure
- Show summary first, details on demand
- Use expandable sections for complex configurations
- Module dependencies hidden until user clicks "Dependency Map"
- Audit log details expand onClick (show timestamp, actor, changes)

### 3. Avoid Overwhelming Screens
- Max 10 items in lists before pagination
- Dashboard shows max 6 metric cards
- Sidebar limited to 8 top-level items
- Context panel limited to 3 tabs (Actions, Logs, Insights)

### 4. Bulk Actions
- Module management: "Enable All" / "Disable All" per category
- Tenant list: Bulk select for suspension/activation
- Audit logs: Bulk export with date range
- Feature flags: Bulk toggle for tenant groups

### 5. Confirm Destructive Actions
- Suspend tenant: Modal with reason input
- Terminate tenant: Double confirmation required
- Delete admin: Confirmation with admin name typing
- Reset settings: Warning about data loss

---

## Interaction Patterns

### Toggle Switches
```
Enabled:  Blue-600 background, white circle positioned right
Disabled: Gray-700 background, white circle positioned left
```
- Always accompanied by label
- Immediate save on toggle (with undo toast)

### Status Badges
```
Healthy/Active:   bg-green-900/30 text-green-400
Warning/Degraded: bg-yellow-900/30 text-yellow-400
Critical/Error:   bg-red-900/30 text-red-400
Info/Neutral:    bg-blue-900/30 text-blue-400
```

### Tables
- Zebra striping with hover highlight (hover:bg-gray-800/30)
- Actions column right-aligned
- Sortable headers (future enhancement)
- Inline editing for quick changes

### Forms
- Labels above inputs (not beside)
- Placeholder text for format hints
- Inline validation (red border + message below)
- Required fields marked with asterisk

---

## Color System

### Status Colors
| Status | Background | Text | Use Case |
|--------|-------------|------|----------|
| Healthy | `bg-green-900/30` | `text-green-400` | Active services, completed payments |
| Warning | `bg-yellow-900/30` | `text-yellow-400` | Degraded performance, expiring subs |
| Critical | `bg-red-900/30` | `text-red-400` | Failed syncs, suspended tenants |
| Info | `bg-blue-900/30` | `text-blue-400` | General information, tips |

### Role Colors
| Role | Color | Badge |
|------|-------|--------|
| SUPER_ADMIN | Purple | `bg-purple-900/30 text-purple-400` |
| OPERATIONS_ADMIN | Blue | `bg-blue-900/30 text-blue-400` |
| FINANCE_ADMIN | Green | `bg-green-900/30 text-green-400` |
| SUPPORT_ENGINEER | Yellow | `bg-yellow-900/30 text-yellow-400` |

---

## Responsive Behavior

### Desktop (>1024px)
- Full 4-zone layout (sidebar, topbar, workspace, context panel)
- Context panel visible by default (320px width)
- Tables show all columns

### Tablet (768px-1024px)
- Sidebar collapses to icons only (64px width)
- Context panel hidden by default, toggle to show
- Tables scroll horizontally

### Mobile (<768px)
- Sidebar hidden, hamburger menu to show
- Context panel full-screen overlay
- Tables stack vertically (card layout)

---

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys in tables (future enhancement)

### Screen Readers
- All icons have `aria-label` or `title` attribute
- Status badges include context: "Status: Active" not just "Active"
- Tables have proper `scope` on headers
- Form inputs have associated `<label>` elements

### Focus Indicators
- Visible focus ring: `focus:ring-2 focus:ring-blue-500`
- Skip navigation link at top of page
- Focus order matches visual order

---

## Loading States

### Skeleton Screens
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
  <div className="h-4 bg-gray-800 rounded w-1/2 mt-2"></div>
</div>
```

### Inline Loading
- Buttons show spinner icon on click
- Tables show overlay with "Loading..." text
- Metric cards pulse gently during data fetch

---

## Error Handling

### Toast Notifications
```
Success: Green left border, check icon
Error: Red left border, X icon  
Warning: Yellow left border, triangle icon
```

### Form Errors
- Red border on invalid fields: `border-red-500`
- Error message below field in red text
- Summary at top of form for multiple errors

### Empty States
- Icon representing the content type
- Helpful message: "No tenants found. Create your first tenant..."
- Action button to resolve: "Create Tenant"

---

## Audit Trail Requirements

### Every Action Must Log
1. **Who**: `actorId`, `actorName`, `actorRole`
2. **What**: `action` (TENANT_SUSPEND, MODULE_TOGGLE, etc.)
3. **Where**: `tenantId` (or "system" for global)
4. **When**: `timestamp` (automatic)
5. **Details**: `oldValue`, `newValue` (JSON)
6. **Context**: `ipAddress`, `userAgent`

### Audit Log Display
- Most recent first (descending timestamp)
- Color-coded by action type
- Filterable by all fields
- Exportable to CSV/PDF

---

## Performance Guidelines

### Data Loading
- Initial page load: < 2 seconds
- Subsequent navigation: < 500ms
- Table pagination: 10-25 items per page
- Infinite scroll for logs (future enhancement)

### Caching Strategy
- tRPC with React Query defaults
- Stale time: 5 minutes for lists
- Immediate invalidation on mutations
- Optimistic updates for toggles

---

## Security Considerations

### CSRF Protection
- All mutations use tRPC (built-in CSRF protection)
- Cookies set with `SameSite=Strict`

### XSS Prevention
- All user input sanitized by default
- Use `textContent` not `innerHTML`
- React escapes by default

### Sensitive Data
- API keys masked after creation: `ak_live_*****x7f9`
- Toggle to show/hide secrets
- Copy to clipboard (not visible in DOM)

### Session Management
- 1 hour timeout for admin sessions
- Re-authentication required for destructive actions
- Concurrent session detection (future enhancement)

---

## Component Checklist

When building new admin pages, ensure:

- [ ] Uses `SystemAdminLayout` wrapper
- [ ] Implements role-based access check
- [ ] All actions logged to audit system
- [ ] Responsive down to 320px width
- [ ] Loading states for all async operations
- [ ] Error boundaries present
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA
- [ ] Status badges use semantic colors
- [ ] Tables have proper ARIA labels
- [ ] Forms have associated labels
