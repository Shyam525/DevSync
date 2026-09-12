import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { ForbiddenError, AuthError, NotFoundError } from '../errors';
import { asyncHandler } from '../utils/asyncHandler';

// ─── WHY THIS FILE CHANGED FROM WEEK 3 ────────────────────────────────────
//
// Week 3 version only answered: "Is this user logged in at all?"
// This version answers the REAL question: "Does this SPECIFIC user
// have SUFFICIENT ROLE on THIS SPECIFIC project to do THIS action?"
//
// That requires a database lookup — which is why this function is async.

const ROLE_HIERARCHY: Record<string, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export const requireProjectRole = (minimumRole: keyof typeof ROLE_HIERARCHY) => {
  // ─── WHY asyncHandler WRAPS THIS TOO ────────────────────────────────
  // This is not a route handler — it is middleware. But it is ASYNC
  // (it queries the database with Project.findById). The Week 2 lesson
  // applies here exactly the same way: Express does not catch errors
  // from async functions automatically. ANY async function anywhere
  // in the request chain — route or middleware — needs this wrapper.
  return asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AuthError('Authentication required');
    }

    // The route defines the param as :id (see project.routes.ts)
    const projectId = req.params.id as string;
    const project = await Project.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project');
    }

    const member = project.members.find(
      (m) => m.userId.toString() === req.user!.userId
    );

    // User is authenticated (we know WHO they are) but not a member
    // of THIS project — 403, not 401. Compare with Week 2's ForbiddenError
    // vs AuthError explanation.
    if (!member) {
      throw new ForbiddenError('You are not a member of this project');
    }

    const userLevel = ROLE_HIERARCHY[member.role];
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (userLevel < requiredLevel) {
      throw new ForbiddenError(
        `This action requires ${minimumRole} role or higher. Your role: ${member.role}`
      );
    }

    // Attach the project to req so route handlers don't need to
    // query the database AGAIN — we already have it loaded right here.
    req.project = project;

    next();
  });
};