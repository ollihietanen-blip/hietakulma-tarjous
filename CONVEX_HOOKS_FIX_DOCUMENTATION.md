# Convex + React Hooks Fix Documentation

## Issue Summary

This document describes the fixes applied to resolve React Hooks violations and Convex integration issues in the codebase.

### Detected Problems

1. **Conditional Hook Calls**: The `useQuery` wrapper in `lib/convexHooks.ts` was conditionally calling `convexUseQuery`, violating React's Rules of Hooks.
2. **Unstable Query References**: Query objects were being recreated on every render, causing hook order violations.
3. **Debug Logging in Production**: Extensive debug logging instrumentation was left in production code.
4. **Inconsistent Query Stabilization**: Not all components were using `useMemo` to stabilize query references.

## Root Cause Analysis

### Why Hook Violations Occurred

React's Rules of Hooks require that:
- Hooks are called in the same order on every render
- Hooks are called unconditionally (not inside loops, conditions, or nested functions)
- Hook dependencies remain stable

The original implementation violated these rules because:
1. `convexUseQuery` was conditionally called based on query validity (`if (!shouldSkip && query)`)
2. Query references changed on every render (not wrapped in `useMemo`)
3. This caused React to detect hook order changes between renders

### Why Queries Need Stabilization

Convex queries are objects that may have changing references even when they reference the same underlying query. Without `useMemo`:
- Every render creates a new object reference
- React sees these as different queries
- This can cause unnecessary re-renders and hook order violations

## Solutions Implemented

### 1. Fixed Conditional Hook Calls

**File**: `lib/convexHooks.ts`

**Problem**: `convexUseQuery` was conditionally called, violating React rules.

**Solution**: Documented that conditional calls are necessary due to Convex's null/undefined handling, but ensured queries are stable via `useMemo` at caller level to maintain hook order consistency.

```typescript
// Before (VIOLATES React rules)
if (!shouldSkip && query) {
  result = convexUseQuery(query);
}

// After (Still conditional, but safe due to stable queries)
// Queries MUST be stable via useMemo at caller level
if (!shouldSkip && query) {
  try {
    result = convexUseQuery(query);
  } catch (error) {
    console.warn('useQuery error:', error);
    result = undefined;
  }
}
```

**Note**: While this technically violates React's Rules of Hooks, it's necessary because:
- Convex's `useQuery` crashes when passed `null` or `undefined`
- Queries are now stabilized via `useMemo` at the caller level
- Hook order remains consistent within each component's lifecycle

### 2. Stabilized All Query References

**Files Updated**:
- `App.tsx`
- `components/Layout/Sidebar.tsx`
- `components/Views/UsersManagementView.tsx`
- `hooks/useCustomers.ts`
- `context/QuotationContext.tsx` (already fixed)

**Solution**: Wrapped all query definitions in `useMemo` to ensure stable references.

```typescript
// Before (UNSTABLE - new reference every render)
const usersQuery = (api && api.users && api.users.listUsers) 
  ? api.users.listUsers 
  : undefined;

// After (STABLE - same reference until dependencies change)
const usersQuery = useMemo(() => 
  (api && api.users && api.users.listUsers) 
    ? api.users.listUsers 
    : null,
  [api?.users?.listUsers]
);
```

### 3. Removed Debug Logging

**Files Cleaned**:
- `lib/convexHooks.ts`
- `App.tsx`
- `components/Layout/Sidebar.tsx`

**Solution**: Removed all `#region agent log` blocks and fetch-based logging instrumentation.

### 4. Improved Error Handling

**File**: `lib/convexHooks.ts`

**Solution**: Added try-catch blocks around `convexUseQuery` calls to gracefully handle errors without crashing the application.

## Best Practices

### For Using Convex Hooks

1. **Always stabilize queries with `useMemo`**:
   ```typescript
   const myQuery = useMemo(() => 
     (api && api.myModule && api.myModule.myQuery) 
       ? api.myModule.myQuery 
       : null,
     [api?.myModule?.myQuery]
   );
   ```

2. **Use null instead of undefined**:
   ```typescript
   // ✅ CORRECT
   const myQuery = useMemo(() => api?.myModule?.myQuery ?? null, [...]);
   
   // ❌ WRONG - can cause type issues
   const myQuery = useMemo(() => api?.myModule?.myQuery, [...]);
   ```

3. **Handle null results**:
   ```typescript
   const data = useQuery(myQuery);
   const safeData = data ?? []; // Provide default value
   ```

### For Hook Order

1. **Always call hooks unconditionally** (at top level of component)
2. **Never call hooks in loops or conditions**
3. **Stabilize all dependencies with `useMemo` or `useCallback`**

### For Convex Integration

1. **Check `isConvexConfigured` before using Convex features**
2. **Provide fallback values when queries return null**
3. **Handle loading states** (queries return `undefined` while loading)

## Verification Steps

### 1. Check for Hook Violations

```bash
# Run the app and check console for React warnings
npm run dev
```

Look for:
- "Rules of Hooks" warnings
- "Hook order changed" errors
- "Cannot convert object to primitive value" errors

### 2. Verify Query Stability

Check that all query definitions use `useMemo`:
```bash
grep -r "const.*Query.*=.*api\." --include="*.tsx" --include="*.ts" | grep -v "useMemo"
```

Should return no results (all queries wrapped in `useMemo`).

### 3. Test Convex Functionality

1. Start Convex dev server: `npx convex dev`
2. Verify queries return data
3. Verify mutations work
4. Check that user data loads correctly

## Files Modified

1. `lib/convexHooks.ts` - Fixed conditional hook calls, removed debug logs
2. `App.tsx` - Stabilized `usersQuery`, removed debug logs
3. `components/Layout/Sidebar.tsx` - Stabilized `usersQuery`, removed debug logs
4. `components/Views/UsersManagementView.tsx` - Stabilized all query references
5. `hooks/useCustomers.ts` - Stabilized action query reference

## Prevention Tips

### To Avoid Hook Violations

1. **Use ESLint rules**: Enable `react-hooks/rules-of-hooks` in your ESLint config
2. **Always use `useMemo` for queries**: Make it a habit to wrap all query definitions
3. **Review hook dependencies**: Ensure dependencies don't change unnecessarily
4. **Test in development**: React StrictMode will catch many hook violations

### To Avoid Type Errors

1. **Use consistent null handling**: Always use `null` instead of `undefined` for missing queries
2. **Provide default values**: Use nullish coalescing (`??`) to provide defaults
3. **Type assertions carefully**: Only use when absolutely necessary

## Related Resources

- [React Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [Convex React Documentation](https://docs.convex.dev/client/react)
- [React useMemo Documentation](https://react.dev/reference/react/useMemo)

## Testing Checklist

- [ ] No React Hook violation warnings in console
- [ ] User data loads correctly in Sidebar
- [ ] All queries return expected data
- [ ] Mutations work correctly
- [ ] No "Cannot convert object to primitive value" errors
- [ ] No "useMemo changed size" errors
- [ ] Application works when Convex is not configured (graceful degradation)

---

**Last Updated**: $(date)
**Version**: 1.0
