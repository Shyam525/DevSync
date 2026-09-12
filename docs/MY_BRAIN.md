# DevSync - Developer Brain & Architecture Journal

## Week 4 — Project CRUD, RBAC, and First Frontend (Login + Dashboard)

### Backend Checkpoints & Concepts

#### 1. Why `requireProjectRole` needs `asyncHandler`
`requireProjectRole` is an asynchronous middleware function because it queries MongoDB (`Project.findById`) to retrieve project details and check member authorization roles. Express 4 does not automatically catch rejected promises or thrown errors inside `async` middleware functions. Without wrapping the async inner function in `asyncHandler`, any unhandled database exception or thrown error inside `requireProjectRole` would result in an unhandled promise rejection rather than being forwarded to Express's global `errorHandler` middleware (`next(err)`).

#### 2. Difference between 401 and 403 status codes
- **401 Unauthorized (`AuthError`)**: The user is unauthenticated — their identity is unknown or their JWT access token is missing, invalid, or expired.
- **403 Forbidden (`ForbiddenError`)**: The user is authenticated (we know who they are), but they lack sufficient permissions or roles to perform the requested operation on the specific resource (e.g. non-members trying to view a project, or members trying to invite others when admin role is required).

#### 3. MongoDB `$push` vs `$pull` operations in `ProjectService`
- **Adding a member (`push()` + `save()`)**: Used when loading the document into memory is already required (such as checking `alreadyMember` on the in-memory `project.members` array).
- **Removing a member (`$pull` via `findByIdAndUpdate`)**: Used as a single atomic database operation to remove matching array subdocuments by filter criteria (`{ $pull: { members: { userId: memberUserId } } }`) without needing a read-modify-write cycle in application memory.

#### 4. Registering `cors()` before `express.json()`
Browsers send preflight `OPTIONS` requests prior to making cross-origin requests with custom headers (such as `Authorization: Bearer <token>`). Preflight requests do not contain a request body. Registering `cors()` as the very first middleware ensures CORS headers are returned and OPTIONS preflight requests are handled immediately before body-parsing or routing middleware executes.

---

### Frontend Checkpoints & Concepts

#### 1. Vite Path Aliases vs TypeScript `compilerOptions.paths`
- `tsconfig.json` `paths` informs TypeScript's type checker and VS Code's editor language server how to resolve module specifiers like `@devsync/shared`.
- Vite's dev server (`esbuild`) does NOT read `tsconfig.json` `paths`. Therefore, Vite requires an explicit `resolve.alias` configuration in `vite.config.ts` so the bundler can resolve `@devsync/shared` imports at runtime.

#### 2. Axios Interceptor Silent Refresh Queue (`axiosInstance.ts`)
- **Problem**: Access tokens expire (e.g. after 15 minutes). Without interceptors, active user sessions would experience 401 errors across all API calls.
- **Queue & Bypass Pattern**: When an API request encounters a 401:
  - If a refresh request is not yet active (`isRefreshing = false`), set `isRefreshing = true` and issue a single token refresh request using plain `axios.post` (bypassing `axiosInstance` interceptors to prevent infinite loops if the refresh call itself fails).
  - If a refresh request is already in progress, subsequent failing 401 requests are pushed to a `failedQueue` promise array.
  - Once the token refresh completes, all queued requests resolve with the new access token and automatically retry their original HTTP calls seamlessly without user disruption.

#### 3. State Persistence with Zustand `persist`
- React state and standard Zustand stores reside in memory and reset upon browser page reload.
- Wrapping the Zustand store with `persist` middleware automatically syncs the auth state (`user`, `accessToken`, `refreshToken`, `isAuthenticated`) to `localStorage` under the key `devsync-auth` and restores state on application boot.
