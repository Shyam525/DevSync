import { Router, Request, Response } from 'express';
import { projectService } from '../../services/project.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { requireProjectRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate';
import {
  createProjectSchema,
  inviteMemberSchema,
} from '../../validations/project.schema';

export const projectRouter = Router();

// router.use() applies a middleware to EVERY route defined below it
// in this file. Every single project route needs the user to be
// logged in — so we apply `authenticate` once here instead of
// repeating it on every single route.
projectRouter.use(authenticate);

// POST /api/v1/projects
// Any authenticated user can create a project — no RBAC check needed,
// there is nothing to check permissions AGAINST yet (the project
// doesn't exist until this handler runs).
projectRouter.post(
  '/',
  validate(createProjectSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const project = await projectService.createProject(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: { project } });
  })
);

// GET /api/v1/projects
// Lists only projects THIS user belongs to — no RBAC check needed,
// the service function itself filters by membership.
projectRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const projects = await projectService.getUserProjects(req.user!.userId);
    res.status(200).json({ success: true, data: { projects } });
  })
);

// GET /api/v1/projects/:id
// requireProjectRole('viewer') = the lowest role. Anyone who is any
// kind of member can VIEW the project. This is the middleware chain:
// authenticate (applied above) → requireProjectRole → asyncHandler(handler)
projectRouter.get(
  '/:id',
  requireProjectRole('viewer'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // req.project was attached by requireProjectRole — no second
    // database query needed here.
    res.status(200).json({ success: true, data: { project: req.project } });
  })
);

// POST /api/v1/projects/:id/members
// requireProjectRole('admin') — only admin or owner can invite people.
projectRouter.post(
  '/:id/members',
  requireProjectRole('admin'),
  validate(inviteMemberSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const project = await projectService.addMember(req.params.id as string, req.body);
    res.status(200).json({ success: true, data: { project } });
  })
);

// DELETE /api/v1/projects/:id/members/:userId
// requireProjectRole('admin') — only admin or owner can remove people.
projectRouter.delete(
  '/:id/members/:userId',
  requireProjectRole('admin'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const project = await projectService.removeMember(req.params.id as string, req.params.userId as string);
    res.status(200).json({ success: true, data: { project } });
  })
);
