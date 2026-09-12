import mongoose from 'mongoose';
import { Project, IProject } from '../models/Project';
import { User } from '../models/User';
import { NotFoundError, ValidationError, ForbiddenError } from '../errors';
import { logger } from '../logger';

interface CreateProjectInput {
  name: string;
  description?: string;
}

interface InviteMemberInput {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export const projectService = {
  createProject: async (userId: string, input: CreateProjectInput): Promise<IProject> => {
    const project = await Project.create({
      name: input.name,
      description: input.description,
      createdBy: userId,
      members: [
        {
          userId: new mongoose.Types.ObjectId(userId),
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });

    logger.info({ projectId: project._id, userId }, 'Project created');
    return project;
  },

  getUserProjects: async (userId: string): Promise<IProject[]> => {
    return Project.find({ 'members.userId': userId }).sort({ createdAt: -1 });
  },

  getProjectById: async (projectId: string): Promise<IProject> => {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }
    return project;
  },

  addMember: async (projectId: string, input: InviteMemberInput): Promise<IProject> => {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    const userToAdd = await User.findOne({ email: input.email });
    if (!userToAdd) {
      throw new NotFoundError('User with that email');
    }

    const alreadyMember = project.members.some(
      (member) => member.userId.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      throw new ValidationError('User is already a member of this project');
    }

    project.members.push({
      userId: userToAdd._id,
      role: input.role,
      joinedAt: new Date(),
    });
    await project.save();

    logger.info({ projectId, addedUserId: userToAdd._id, role: input.role }, 'Member added to project');
    return project;
  },

  removeMember: async (projectId: string, memberUserId: string): Promise<IProject> => {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    const memberToRemove = project.members.find(
      (member) => member.userId.toString() === memberUserId
    );
    if (!memberToRemove) {
      throw new NotFoundError('Member');
    }

    if (memberToRemove.role === 'owner') {
      throw new ForbiddenError('Cannot remove the project owner');
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { members: { userId: memberToRemove.userId } } },
      { new: true }
    );

    logger.info({ projectId, removedUserId: memberUserId }, 'Member removed from project');
    return updatedProject!;
  },
};
