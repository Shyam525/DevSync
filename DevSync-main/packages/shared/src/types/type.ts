// This defines what a User looks like across the ENTIRE application.
// Both the server database model and the frontend will use these same types.

export interface User {
  _id: string;
  email: string;
  githubId?: string;      // Optional — only exists if logged in via GitHub
  username: string;
  avatar?: string;        // Optional profile picture URL
  createdAt: Date;
  updatedAt: Date;
}

// The roles a user can have inside a project
export enum UserRole {
  OWNER = 'owner',        // Created the project — full control
  ADMIN = 'admin',        // Can manage members and settings
  MEMBER = 'member',      // Can create and edit content
  VIEWER = 'viewer',      // Read-only access
}

// What gets returned when auth is successful
export interface AuthUser {
  user: User;
  accessToken: string;
  refreshToken: string;
}