import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../../store/auth.store';

// ─── WHY THIS COMPONENT EXISTS ─────────────────────────────────────────
// Wraps any page that requires login. If the user is not authenticated,
// redirect to /login BEFORE the protected page ever renders — so no
// protected data or UI ever briefly flashes on screen for a logged-out
// visitor.
//
// USAGE (see App.tsx below):
// <ProtectedRoute><Dashboard /></ProtectedRoute>

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
