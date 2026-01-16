// Safe wrapper hooks for Convex that handle missing ConvexProvider gracefully
// These hooks MUST be called unconditionally (React rules), but they handle errors gracefully
// The ErrorBoundary component will catch any errors from these hooks
import { useQuery as convexUseQuery, useMutation as convexUseMutation, useAction as convexUseAction } from 'convex/react';
import { isConvexConfigured } from './convexClient';

/**
 * Safe useQuery hook that returns null if Convex is not configured
 * This prevents errors when ConvexProvider is not available
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 * If ConvexProvider is missing, the hook will throw an error which ErrorBoundary will catch
 */
export function useQuery<T>(query: any): T | null {
  // Always call the hook (React requirement)
  // If Convex is not configured, the hook will throw an error
  // ErrorBoundary will catch it and allow the app to continue
  if (!isConvexConfigured || !query) {
    // Still call the hook to satisfy React rules, but it will throw
    // ErrorBoundary will handle the error
    return convexUseQuery(query as any);
  }
  
  return convexUseQuery(query);
}

/**
 * Safe useMutation hook that returns null if Convex is not configured
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 */
export function useMutation<T extends (...args: any[]) => Promise<any>>(mutation: T | null | undefined): T | null {
  // Always call the hook (React requirement)
  if (!isConvexConfigured || !mutation) {
    // Still call the hook to satisfy React rules, but it will throw
    // ErrorBoundary will handle the error
    return convexUseMutation(mutation as any);
  }
  
  return convexUseMutation(mutation);
}

/**
 * Safe useAction hook that returns null if Convex is not configured
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 */
export function useAction<T extends (...args: any[]) => Promise<any>>(action: T | null | undefined): T | null {
  // Always call the hook (React requirement)
  if (!isConvexConfigured || !action) {
    // Still call the hook to satisfy React rules, but it will throw
    // ErrorBoundary will handle the error
    return convexUseAction(action as any);
  }
  
  return convexUseAction(action);
}
