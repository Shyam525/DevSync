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

  // ─── CREATE ────────────────────────────────────────────────────────────
  createProject: async (
    userId: string,
    input: CreateProjectInput
  ): Promise<IProject> => {
    // The person creating the project is automatically the OWNER.
    // This is a business rule, not something the client can choose —
    // notice createProjectSchema has no "role" field at all.
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

  // ─── LIST — projects the current user belongs to ─────────────────────
  getUserProjects: async (userId: string): Promise<IProject[]> => {
    // This query uses the index we created in Week 2:
    // ProjectSchema.index({ 'members.userId': 1 })
    // Without that index, MongoDB would scan every project in the
    // database to find the ones this user belongs to.
    return Project.find({ 'members.userId': userId }).sort({ createdAt: -1 });
  },

  // ─── GET ONE ────────────────────────────────────────────────────────────
  getProjectById: async (projectId: string): Promise<IProject> => {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }
    return project;
  },

  // ─── ADD MEMBER ─────────────────────────────────────────────────────────
  addMember: async (
    projectId: string,
    input: InviteMemberInput
  ): Promise<IProject> => {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    // We invite by EMAIL (something a human types), but we store
    // the relationship by userId (something the database uses).
    // So the first step is translating email → user account.
    const userToAdd = await User.findOne({ email: input.email });
    if (!userToAdd) {
      throw new NotFoundError('User with that email');
    }

    const alreadyMember = project.members.some(
      (m) => m.userId.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      throw new ValidationError('User is already a member of this project');
    }

    // push() + save() — the same pattern you used in Week 2's
    // auth.service.ts when adding a refresh token to the array.
    project.members.push({
      userId: userToAdd._id,
      role: input.role,
      joinedAt: new Date(),
    });
    await project.save();

    logger.info(
      { projectId, addedUserId: userToAdd._id, role: input.role },
      'Member added to project'
    );
    return project;
  },

  // ─── REMOVE MEMBER ──────────────────────────────────────────────────────
  removeMember: async (
    projectId: string,
    memberUserId: string
  ): Promise<IProject> => {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    const memberToRemove = project.members.find(
      (m) => m.userId.toString() === memberUserId
    );
    if (!memberToRemove) {
      throw new NotFoundError('Member');
    }

    // Business rule: the owner can never be removed this way.
    // Ownership transfer would be a separate, deliberate feature —
    // not something that happens through the "remove member" endpoint.
    if (memberToRemove.role === 'owner') {
      throw new ForbiddenError('Cannot remove the project owner');
    }

    // $pull — the SAME MongoDB operator you used in Week 2's logout
    // function to remove a refresh token from an array. Same operator,
    // different array. Once you learn $pull, you can remove any item
    // from any array field in MongoDB.
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { members: { userId: memberToRemove.userId } } },
      { new: true }   // return the document AFTER the update, not before
    );

    logger.info(
      { projectId, removedUserId: memberUserId },
      'Member removed from project'
    );
    return updatedProject!;
  },
};