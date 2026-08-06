// export const placeholder = () => {};


import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, AuthError } from '../errors';

// ─── WHY THIS MIDDLEWARE EXISTS ───────────────────────────────────────────
//
// Authentication (authenticate middleware) answers: "Who are you?"
// Authorization (RBAC middleware) answers: "Are you allowed to do this?"
//
// These are DIFFERENT concerns and handled by DIFFERENT middleware.
//
// Scenario:
// A VIEWER trying to delete a project → authenticated (we know who they are)
//   but NOT authorized (their role does not allow deleting)
//
// Usage in routes:
// router.delete('/:id', authenticate, requireProjectRole('admin'), handler)
// The requireProjectRole check runs AFTER authenticate confirms identity.

const ROLE_HIERARCHY: Record<string, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

// NOTE: Full RBAC with project-level roles is implemented in Week 4
// when we have the project model and membership system.
// This week we create the structure — Week 4 fills in the logic.

export const requireProjectRole = (minimumRole: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // authenticate middleware must run before this
    if (!req.user) {
      throw new AuthError('Authentication required');
    }

    // In Week 4: check req.user's role in the specific project
    // For now: just verify they are authenticated
    // The projectId will come from req.params.projectId in Week 4
    next();
  };
};

// Use this when an action requires the user to own the resource
// Example: user can only update their own profile, not others
export const requireOwnership = (
  getOwnerId: (req: Request) => string
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthError('Authentication required');
    }

    const ownerId = getOwnerId(req);

    if (req.user.userId !== ownerId) {
      throw new ForbiddenError('You do not have permission to modify this resource');
    }

    next();
  };
};