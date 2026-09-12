import { Router } from 'express';
import { authRouter } from './auth.routes';
import { projectRouter } from './project.routes';

export const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/projects', projectRouter);
