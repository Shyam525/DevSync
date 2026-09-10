import { Router } from 'express';
import { authRouter } from './auth.routes';
import { projectRouter } from './project.routes';   // ← NEW

export const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/projects', projectRouter);   // ← NEW

// apiV1Router.use('/kanban', kanbanRouter);       // Week 5
// apiV1Router.use('/chat', chatRouter);           // Week 6