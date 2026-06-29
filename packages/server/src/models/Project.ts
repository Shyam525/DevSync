// export const placeholder = {};



import mongoose, { Schema, Document } from 'mongoose';

const ROLES = ['owner', 'admin', 'member', 'viewer'] as const;
type Role = typeof ROLES[number];  // 'owner' | 'admin' | 'member' | 'viewer'

export interface IProjectMember {
  userId: mongoose.Types.ObjectId;
  role: Role;
  joinedAt: Date;
}

export interface IProject extends Document {
  name: string;
  description?: string;
  members: IProjectMember[];
  createdBy: mongoose.Types.ObjectId;
  githubRepo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Subdocument Schema ────────────────────────────────────────────────────
// ProjectMemberSchema is NOT a full model — it is a subdocument.
// It lives INSIDE each Project document, not in its own collection.
// MongoDB stores it as an array within the project document.

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',              // 'ref' tells Mongoose which model to populate from
      required: true,
    },
    role: {
      type: String,
      enum: ROLES,              // Only these values are allowed
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }                // Subdocuments do not need their own _id
);

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name too long'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description too long'],
    },
    members: {
      type: [ProjectMemberSchema],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    githubRepo: {
      type: String,
    },
  },
  { timestamps: true }
);

// ─── WHY THESE INDEXES? ────────────────────────────────────────────────────
// Without indexes, MongoDB scans EVERY document to find a match.
// With 1 million projects, that is slow.
// Index on 'members.userId' makes "find all projects this user belongs to" fast.
// Index on 'createdBy' makes "find all projects this user created" fast.

ProjectSchema.index({ 'members.userId': 1 });
ProjectSchema.index({ createdBy: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);