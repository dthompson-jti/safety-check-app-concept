# Task: Footer with Lazy Loading

**Feature**: Add a table footer displaying loaded record counts and implement infinite scroll lazy loading.

**Difficulty**: Intermediate  
**Estimated Time**: 4-6 hours

---

## Prerequisites

Before starting, ensure you understand:
- [ ] React hooks (`useState`, `useEffect`, `useRef`, `useCallback`)
- [ ] Intersection Observer API basics
- [ ] How `flex: 1` + `min-height: 0` creates shrink-to-fit containers
- [ ] TypeScript interface extension

Read these files first:
1. `AGENTS.md` - Project coding standards
2. `docs/STRATEGY-CSS-Principles.md` - Layout patterns
3. `src/desktop/components/DataTable.tsx` - Current implementation

---

## Step-by-Step Implementation

### Phase 1: Expand Mock Data (30 min)

#### File: `src/desktop/mockLiveData.ts`

**Goal**: Create 8,914 mock records with first 50 being realistic, rest generated.

```typescript
// Add this helper function at the top of the file
function generateMockRows(start: number, count: number): LiveCheckRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `gen-${start + i}`,
    location: `${100 + ((start + i) % 200)}`,
    residents: [{ name: `Resident ${start + i}`, id: `r-${start + i}` }],
    status: ['pending', 'due', 'missed'][i % 3] as LiveCheckRow['status'],
    // ... other required fields
  }));
}

// Export the total count constant
export const TOTAL_LIVE_RECORDS = 8914;

// Export a pagination function
export function loadLiveChecksPage(
  cursor: number, 
  pageSize: number
): Promise<{ data: LiveCheckRow[]; nextCursor: number | null }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = mockLiveChecks.slice(cursor, cursor + pageSize);
      resolve({
        data,
        nextCursor: cursor + pageSize < TOTAL_LIVE_RECORDS ? cursor + pageSize : null,
      });
    }, 800); // Simulate network delay
  });
}
```

> [!CAUTION]
> **Common Mistake #1**: Forgetting to add all required fields to generated rows.  
> Check the `LiveCheckRow` interface in `src/desktop/types.ts` and ensure every field has a value.

> [!CAUTION]
> **Common Mistake #2**: Using synchronous data generation.  
> The `setTimeout` is intentional to simulate real API latency. Don't skip it.

---

### Phase 2: Add DataTable Props (45 min)

#### File: `src/desktop/components/DataTable.tsx`

**Goal**: Extend the component to accept lazy loading callbacks.

##### Step 2.1: Update the interface

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  getRowId?: (row: T) => string;
  totalCount?: number;
  isLoading?: boolean;
  // ADD THESE:
  hasMore?: boolean;
  onLoadMore?: () => void;
}
```

##### Step 2.2: Add the Intersection Observer

Inside the component function, add:

```typescript
const sentinelRef = useRef<HTMLTableRowElement>(null);
const scrollAreaRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // Guard: Don't observe if no callback or no more data
  if (!onLoadMore || !hasMore) return;
  
  const sentinel = sentinelRef.current;
  const scrollArea = scrollAreaRef.current;
  if (!sentinel || !scrollArea) return;

  const observer = new IntersectionObserver(
    (entries) => {
      // Only trigger when sentinel becomes visible
      if (entries[0].isIntersecting) {
        onLoadMore();
      }
    },
    {
      root: scrollArea, // IMPORTANT: Observe within scroll container, not viewport
      rootMargin: '100px', // Trigger 100px before reaching bottom
      threshold: 0,
    }
  );

  observer.observe(sentinel);
  return () => observer.disconnect();
}, [onLoadMore, hasMore]);
```

> [!CAUTION]
> **Common Mistake #3**: Forgetting the `root` option.  
> Without `root: scrollArea`, the observer uses the viewport, which won't work since our scroll is inside a nested container.

> [!CAUTION]
> **Common Mistake #4**: Not including `hasMore` in the dependency array.  
> This causes the observer to keep triggering even when all data is loaded.

##### Step 2.3: Add the ref to scrollArea div

```tsx
<div className={styles.scrollArea} ref={scrollAreaRef}>
```

##### Step 2.4: Add the sentinel row

Add this **inside the `<tbody>`**, after all data rows:

```tsx
{hasMore && (
  <tr ref={sentinelRef} className={styles.sentinelRow}>
    <td colSpan={columns.length} />
  </tr>
)}
```

> [!CAUTION]
> **Common Mistake #5**: Placing sentinel outside `<tbody>` or `<table>`.  
> Invalid HTML structure breaks table layout. The sentinel must be a `<tr>` inside `<tbody>`.

---

### Phase 3: Add Sentinel Styling (15 min)

#### File: `src/desktop/components/DataTable.module.css`

Add at the bottom:

```css
/* Invisible row that triggers load-more when scrolled into view */
.sentinelRow {
  height: 1px;
  visibility: hidden;
  /* No border or background - purely functional */
}

.sentinelRow td {
  padding: 0;
  border: none;
}
```

> [!NOTE]
> The sentinel must have `height: 1px` (not 0) or the browser won't consider it "visible" for Intersection Observer purposes.

---

### Phase 4: Update LiveMonitorView (1 hour)

#### File: `src/desktop/components/LiveMonitorView.tsx`

**Goal**: Manage pagination state and wire up the DataTable.

##### Step 4.1: Add state

```typescript
const [loadedData, setLoadedData] = useState<LiveCheckRow[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);
const [cursor, setCursor] = useState(0);
```

##### Step 4.2: Initial load

```typescript
useEffect(() => {
  // Load first page on mount
  loadLiveChecksPage(0, 50).then(({ data, nextCursor }) => {
    setLoadedData(data);
    setCursor(nextCursor ?? 0);
    setHasMore(nextCursor !== null);
  });
}, []);
```

##### Step 4.3: Load more handler

```typescript
const handleLoadMore = useCallback(() => {
  // Guard: Prevent multiple simultaneous loads
  if (isLoading || !hasMore) return;

  setIsLoading(true);
  loadLiveChecksPage(cursor, 50).then(({ data, nextCursor }) => {
    setLoadedData((prev) => [...prev, ...data]);
    setCursor(nextCursor ?? cursor);
    setHasMore(nextCursor !== null);
    setIsLoading(false);
  });
}, [cursor, isLoading, hasMore]);
```

> [!CAUTION]
> **Common Mistake #6**: Not preventing duplicate loads.  
> The `if (isLoading || !hasMore) return;` guard is critical. Without it, fast scrolling triggers multiple fetches.

> [!CAUTION]
> **Common Mistake #7**: Replacing data instead of appending.  
> Use `setLoadedData((prev) => [...prev, ...data])` NOT `setLoadedData(data)`.

##### Step 4.4: Update DataTable usage

Replace the existing `liveRows` variable usage:

```tsx
<DataTable
  data={loadedData}  // Changed from liveRows
  columns={columns}
  enableRowSelection
  rowSelection={rowSelection}
  onRowSelectionChange={handleRowSelectionChange}
  getRowId={(row) => row.id}
  totalCount={TOTAL_LIVE_RECORDS}  // ADD
  isLoading={isLoading}             // ADD
  hasMore={hasMore}                 // ADD
  onLoadMore={handleLoadMore}       // ADD
/>
```

##### Step 4.5: Update imports

```typescript
import { mockLiveChecks, loadLiveChecksPage, TOTAL_LIVE_RECORDS } from '../mockLiveData';
```

> [!CAUTION]
> **Common Mistake #8**: Forgetting to update imports after adding exports.  
> TypeScript will error, but read the error carefully - it tells you exactly what's missing.

---

### Phase 5: Copy Pattern to HistoricalReviewView (30 min)

Apply the same changes to `HistoricalReviewView.tsx`:
1. Add pagination state
2. Add initial load effect
3. Add load more handler
4. Update DataTable props
5. Update imports from `mockHistoricalData.ts`

You'll also need to update `mockHistoricalData.ts` with the same pagination helper.

---

## Testing Checklist

### Before Committing

- [ ] **Lint passes**: Run `npm run lint` - zero errors
- [ ] **Build passes**: Run `npm run build` - no TypeScript errors
- [ ] **Visual check**: Table fills viewport height (no page scroll)
- [ ] **Scroll contained**: Only table body scrolls, footer stays fixed
- [ ] **Loading state**: "Loading records..." appears when scrolling to bottom
- [ ] **Count updates**: Footer shows "50 of 8,914" then "100 of 8,914" etc.
- [ ] **Stops loading**: Once all data loaded, no more load attempts
- [ ] **Panel interaction**: Open side panel - table still works correctly
- [ ] **Fast scroll**: Scroll quickly - doesn't fire duplicate requests

---

## Common Debugging Scenarios

### "Intersection Observer never fires"

1. Check that `root: scrollAreaRef.current` is passed, not `root: null`
2. Verify `.scrollArea` has `overflow: auto` in CSS
3. Ensure sentinel row is inside `<tbody>`, not outside table
4. Check `rootMargin` - if set to far (e.g., `1000px`), it may fire immediately

### "Loading triggers infinitely"

1. Verify `hasMore` is set to `false` when `nextCursor === null`
2. Check that `isLoading` guard is at the START of `handleLoadMore`
3. Ensure `hasMore` is in the `useEffect` dependency array

### "Data disappears on second load"

1. You're replacing data instead of appending
2. Use the functional updater: `setLoadedData((prev) => [...prev, ...data])`

### "Footer shows wrong count"

1. Verify `totalCount` is passed to DataTable
2. Check that `TOTAL_LIVE_RECORDS` constant matches your expanded mock data length

### "Layout breaks when panel opens"

1. Check that no element has `width: 100vw` (use `100%` instead)
2. Verify `.tableContainer` has `min-width: 0` (prevents flex overflow)

---

## Architecture Notes

### Why Intersection Observer over scroll events?

| Approach | Performance | Accuracy |
|----------|-------------|----------|
| `scroll` event | Fires 60+ times/sec, needs throttle | Requires manual threshold math |
| Intersection Observer | Browser-optimized, fires once | Precise threshold via `rootMargin` |

### Why sentinel inside `<tbody>`?

- Valid HTML (divs outside table break layout)
- Participates in table scroll naturally
- No z-index conflicts with sticky columns

### Why `hasMore` state?

Without it, we'd check `data.length < totalCount` every render:
- ❌ Creates dependency on `data.length`
- ❌ Risk of off-by-one errors
- ✅ Boolean flag is simpler and explicit

---

## Files Changed Summary

| File | Change Type |
|------|-------------|
| `src/desktop/mockLiveData.ts` | Add pagination helper, expand data |
| `src/desktop/mockHistoricalData.ts` | Add pagination helper, expand data |
| `src/desktop/components/DataTable.tsx` | Add Intersection Observer, new props |
| `src/desktop/components/DataTable.module.css` | Add sentinel row styles |
| `src/desktop/components/LiveMonitorView.tsx` | Add pagination state & handlers |
| `src/desktop/components/HistoricalReviewView.tsx` | Add pagination state & handlers |
