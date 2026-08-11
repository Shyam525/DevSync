// export * from "./v1";



import { Router } from 'express';
import { authRouter } from './auth.routes';

// ─── WHY THIS FILE EXISTS ─────────────────────────────────────────────────
//
// This is the v1 router — it mounts all feature routers at their paths.
// app.ts only needs to know ONE thing: mount apiV1Router at '/api/v1'.
// The specific routes (/auth, /projects, etc.) are hidden here.
//
// This makes app.ts clean and each feature router independent.
//
// Adding a new feature (Week 4+):
// 1. Create api/v1/project.routes.ts
// 2. Add one line here: apiV1Router.use('/projects', projectRouter)
// 3. Done — app.ts does not need to change

export const apiV1Router = Router();

// Auth routes → /api/v1/auth/...
apiV1Router.use('/auth', authRouter);

// These will be added in upcoming weeks:
// apiV1Router.use('/projects', projectRouter);   // Week 4
// apiV1Router.use('/kanban', kanbanRouter);       // Week 5
// apiV1Router.use('/chat', chatRouter);           // Week 6
// apiV1Router.use('/files', fileRouter);          // Week 7
// apiV1Router.use('/activity', activityRouter);   // Week 7
// apiV1Router.use('/webhooks', webhookRouter);    // Week 7