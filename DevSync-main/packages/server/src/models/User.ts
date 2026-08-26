// export const placeholder = {};


import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── WHY A SEPARATE INTERFACE? ────────────────────────────────────────────
//
// IUser is the TypeScript type for a USER DOCUMENT from MongoDB.
// mongoose.Document adds: _id, __v, save(), remove(), populate(), etc.
//
// Shared types (packages/shared/src/types/user.types.ts) defines User
// which is the PLAIN OBJECT shape for API responses.
//
// IUser (here) = what lives in MongoDB = has extra Mongoose methods
// User (shared) = what we send in HTTP responses = plain object
//
// They are related but different. Models use IUser. API responses use User.

export interface IUser extends Document {
  email: string;
  password?: string;        // Optional: GitHub OAuth users have no password
  githubId?: string;        // Optional: email/password users have no githubId
  username: string;
  avatar?: string;
  refreshTokens: string[];  // Array: one per device/browser session
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,             // MongoDB creates a B-tree index on this field
      lowercase: true,          // 'Test@Example.com' becomes 'test@example.com' automatically
      trim: true,               // Removes spaces from start and end
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },

    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      // select: false means this field is EXCLUDED from all queries by default
      // If you do User.find(), password field will NOT be in the result
      // You must explicitly request it: User.findOne({email}).select('+password')
      // This prevents accidentally leaking passwords in API responses
      select: false,
    },

    githubId: {
      type: String,
      sparse: true,             // sparse index: allows many documents to have null/undefined
      unique: true,             // but among those WITH a value, it must be unique
    },

    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Username too long'],
    },

    avatar: {
      type: String,             // URL to profile image
    },

    refreshTokens: {
      type: [String],
      default: [],              // New users start with empty array
      select: false,            // Never include in API responses
    },
  },
  {
    // timestamps: true automatically adds:
    // createdAt: Date (set on create)
    // updatedAt: Date (updated on every save)
    timestamps: true,

    toJSON: {
      // This transform runs whenever you call .toJSON() or JSON.stringify()
      // It removes sensitive and noisy fields from the output
      transform: (_, ret) => {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;         // MongoDB internal version key
        return ret;
      },
    },
  }
);

// ─── Pre-Save Hook ─────────────────────────────────────────────────────────
// This middleware runs automatically before EVERY .save() call on a User document.
// It intercepts the save and hashes the password if it was changed.

UserSchema.pre('save', async function (next) {
  // 'this' = the User document being saved

  // Only hash if password exists AND was actually modified
  // Without this check: every .save() (even to update username) would re-hash
  // the already-hashed password, making it impossible to verify later
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  // genSalt(12) → 2^12 = 4096 iterations
  // Higher number = more secure but slower
  // 12 is the current industry standard (2025)
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Method ───────────────────────────────────────────────────────
// Methods defined here are available on every User document instance
// Usage: const isMatch = await user.comparePassword('enteredPassword');

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;

  // bcrypt.compare hashes the candidatePassword the same way and compares
  // NEVER compare plaintext passwords directly — always use bcrypt.compare
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);