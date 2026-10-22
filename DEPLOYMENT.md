# Deployment: Vercel + Render + MongoDB Atlas

This repository uses Vite/React (`frontend/build`), Express (`backend/src/local-server.js`), MongoDB, authenticated Socket.IO, OTP email, and Cloudinary profile images. No database migration or UI redesign is required. Preparation does not publish anything. Push and production deployment require the owner's approval.

## MongoDB Atlas

1. Create a project and cluster, or select the existing cluster containing your users and notes. Preserve the existing database name and collections. Enable backups appropriate to your plan.
2. In Database Access create a dedicated database user with read/write permission only for the application database. This is separate from your Atlas login.
3. In Network Access allow the outbound IP ranges displayed for your Render service. Add your development IP separately if needed. Avoid permanent `0.0.0.0/0` access. See [Atlas IP access lists](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/).
4. Choose Connect > Drivers > Node.js. Copy the URI into Render's secret `MONGO_URI` setting. Include the existing database name and URL-encode special characters in credentials. Example shape only: `mongodb+srv://<user>:<encoded-password>@<cluster>/<database>?retryWrites=true&w=majority`.
5. Never paste the real URI into source control. Startup validates configuration and connects before opening the HTTP listener. `/health` is a liveness check; an authenticated API request also checks database availability.

## External services

- Profile uploads already use Cloudinary when its three credentials are configured. Production requires these values because Render's application filesystem is ephemeral. Local files only stage uploads; Cloudinary keeps the resulting HTTPS image URLs. No persistent disk is required for new uploads. Existing `/uploads/...` images must be copied from the old host or uploaded again; deployment does not migrate them or rewrite database records.
- OTP email already supports Resend over HTTPS. Configure a verified sending domain, `RESEND_API_KEY`, and `EMAIL_FROM` allowed by that domain. Test delivery to a real recipient beyond any provider sandbox restrictions. SMTP remains available using the variables below. [Render Free services block ports 25, 465 and 587](https://render.com/docs/free), so use HTTPS delivery there.
- Socket.IO shares the backend HTTP server and port. [Render supports WebSockets](https://render.com/docs/websocket). Connections reconnect after deployments. Use one backend instance: rooms and live broadcasts are in memory, with no multi-instance adapter. Pending background email sends may be interrupted by a deploy; the existing resend-OTP flow remains available.

## Render backend

Connect `https://github.com/abdulbaseer135/abdul-baseer-mern-10pshine` as a Node Web Service. Select `main` only after the reviewed changes have been pushed there; otherwise select the reviewed deployment branch.

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Runtime | Node |
| Node version | `24.14.0` (tested locally) |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health check | `/health` |
| Instances | 1 |

The optional root `render.yaml` declares these settings and a **paid Starter** instance. Review the price before creating it; no resources have been created. Free instances can sleep and are suitable for previews, not reliable always-on production. Render supplies `PORT`; do not hardcode it. Node's listener binds the available interfaces by default.

Set these backend environment variables in Render, not in Vercel:

| Variable | Required value / purpose |
| --- | --- |
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `24.14.0` |
| `TRUST_PROXY` | `1` for the Render reverse proxy; preserves client IP rate limits |
| `MONGO_URI` | Atlas URI including the existing database name |
| `JWT_SECRET` | Cryptographically random secret, at least 32 characters; retain the existing strong secret to preserve sessions |
| `FRONTEND_URL` | Exact HTTPS Vercel origin, no trailing slash; comma-separated explicit origins supported |
| `BACKEND_URL` | Exact HTTPS Render origin, no trailing slash; used for existing image URLs |
| `EMAIL_FROM` | Verified sender, e.g. `Notes <notes@your-verified-domain>` |
| `RESEND_API_KEY` | Required for recommended HTTPS email delivery |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Optional Socket.IO origins; defaults to `FRONTEND_URL`. If set, keep aligned with allowed frontend origins |
| `JWT_EXPIRES_IN` | Optional; default `7d` |
| `LOG_LEVEL` | Optional; default `info` |
| `UPLOADS_PATH` | Optional temporary staging path; default `backend/uploads` |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS` | SMTP alternative if not using Resend; default port 587, secure false; hosting must permit outbound SMTP |

`CORS_ALLOW_ALL` is development-only; do not enable it for deployment. Do not rotate an existing JWT secret casually: this invalidates tokens. To create a new secret locally use `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"` and enter the output directly in Render.

For the initial deployment, reserve the desired Vercel project name first so `FRONTEND_URL` is known, and use the Render service's assigned URL for `BACKEND_URL`. Confirm startup logs show a database connection and a listener, and `GET https://<backend>/health` returns 200. SIGTERM/SIGINT closes HTTP, sockets, and MongoDB with a bounded shutdown.

## Vercel frontend

Import the repository and select the same reviewed branch.

| Setting | Value |
| --- | --- |
| Root directory | `frontend` |
| Framework preset | Vite |
| Node.js | 24.x |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `build` |

Set these public build-time values for Production (and separately for Preview if used):

```dotenv
VITE_API_URL=https://abdul-baseer-mern-10pshine.onrender.com/api/v1
VITE_ENABLE_SOCKET_IO=true
```

`VITE_API_URL` includes `/api/v1`. It must use HTTPS for production builds. `VITE_ENABLE_SOCKET_IO=true` enables existing live note updates. These values are public; never add MongoDB, JWT, email, or Cloudinary secrets to frontend variables. The Vite config explicitly injects these two public configuration values for compatibility with the existing Jest setup. Legacy `REACT_APP_API_URL` is supported only for development; use Vite names for deployment.

`frontend/vercel.json` already rewrites SPA routes to `/index.html`; this supports refreshes on `/dashboard`, `/profile`, and `/shared/<token>`. [Vercel's Vite guidance](https://vercel.com/docs/frameworks/frontend/vite) describes this fallback. The root `vercel.json` is a frontend-only alternative if importing with repository root `.`; do not combine its root commands with `frontend` as Root Directory. Backend legacy Vercel files are unused on Render.

After changing frontend environment variables, create a new deployment: existing JavaScript bundles retain their old values. After changing backend environment variables, redeploy/restart the backend.

## Final integration and verification

1. Add the exact final Vercel HTTPS origin to Render `FRONTEND_URL`. Leave `CLIENT_URL` unset to inherit it, or update it too. Redeploy Render. Explicitly allow preview origins only when needed; do not wildcard all Vercel deployments.
2. Deploy/redeploy Vercel with the final backend URL. Confirm DevTools requests target `https://<backend>/api/v1`, never localhost, and no secrets appear in the bundle.
3. Register a disposable test user, receive and verify OTP, log in, refresh `/dashboard`, and confirm the existing bearer token persists. Tokens remain in the existing localStorage/Redux flow; no cookie strategy was introduced.
4. Create, edit, delete, search, paginate, pin and share a test note; open its public link signed out. Check rich text and filters.
5. Open a second session for the same user; confirm authenticated Socket.IO live updates and reconnection.
6. Update the profile name/image; confirm the Cloudinary URL survives a backend restart. Check password reset and logout. Never test destructive operations on real records.
7. Confirm unconfigured origins are rejected, authentication failures are 401, and backend 500 responses contain no stack or database details.
8. Refresh a nested frontend route directly and confirm assets load. Check Console and Network for CORS, mixed content, failed imports, and WebSocket errors.

Local checks (use a disposable test configuration and never a production database):

```powershell
npm ci
npm ci --prefix backend
npm ci --prefix frontend
$env:VITE_API_URL='https://example-backend.onrender.com/api/v1'
$env:VITE_ENABLE_SOCKET_IO='true'
npm run build --prefix frontend
Remove-Item Env:VITE_API_URL
Remove-Item Env:VITE_ENABLE_SOCKET_IO
$env:NODE_ENV='test'
$env:MONGO_URI='mongodb://127.0.0.1:27017/notes-test'
$env:JWT_SECRET='local-disposable-test-secret-at-least-32-characters'
npm test --prefix backend
npm test --prefix frontend -- --runInBand
```

The build URL above is a placeholder for compilation verification, not a connectivity test. Backend integration tests use mongodb-memory-server. Local development still uses `npm run dev` in backend and `npm start` in frontend, with example .env files and real local/service credentials as appropriate.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Frontend route 404 on refresh | Vercel Root Directory `frontend`, SPA rewrite, correct output `build` |
| API 404 / HTML instead of JSON | `VITE_API_URL` must target Render and end in `/api/v1`; inspect Network URL |
| CORS / WebSocket rejection | Exact origin including scheme, no trailing slash; match FRONTEND_URL and CLIENT_URL; redeploy |
| 401 / JWT | Bearer header, same strong JWT secret across restarts, token expiry, verified email; log in again if secret changed |
| 500 | Inspect private Render logs; clients intentionally receive generic internal errors |
| MongoDB startup failure | MONGO_URI database name, encoded credentials, database permissions, Render outbound IP allowlist, cluster availability and DNS |
| OTP not received | Verified sender/domain, Resend API key and recipient restrictions; SMTP port availability; resend OTP |
| Image upload 503 | All Cloudinary values must be present and valid |
| Old images missing | Old local uploads are not in Git or Cloudinary; copy/re-upload from original host |
| Slow first request | Free Render instance may be waking up; use an always-on production plan |

No live deployment, remote push, real email delivery, Atlas access, or cloud upload is implied by a successful local build or test suite. Record local verification results separately and complete the live checklist after approval.

## Preparation verification (2026-10-22)

- Root and backend `npm ci` succeeded. A clean frontend `npm ci --offline` succeeded in an isolated temporary directory using the same package.json and lockfile. The workspace frontend `npm ci` initially failed because Windows locked a loaded native CSS module; `npm install` restored the workspace dependencies successfully. All three lockfiles remain unchanged.
- Frontend production build passed using `VITE_API_URL=https://example-backend.onrender.com/api/v1` and sockets enabled. The generated bundle contains that test URL, no unresolved Vite configuration expressions, and no localhost API fallback. The existing large-chunk warning remains; no performance refactoring was introduced.
- Frontend: 37 suites, 659 tests passed.
- Backend: 326 tests passed, including database-backed integration tests. After the final optional CLIENT_URL validation adjustment, the 10 environment/startup tests passed again.
- Real production-mode Node startup was exercised against a disposable mongodb-memory-server database with dummy external-service credentials. Health, allowed/disallowed CORS, protected notes/users routes, auth route validation, and Socket.IO polling handshake passed. No real email or Cloudinary request was sent.
- `git diff --check` passed. Tracked files matched no MongoDB credential URI/private-key/common token patterns in a heuristic secret scan. This is not a full historical credential audit. Real frontend/backend .env files are ignored by Git.
- At the initial preparation stage, local environment files were left unchanged. The later Render integration below updates the frontend environment to the real backend and creates a separate development override. Backend secrets remain unchanged. Production Cloudinary configuration still needs to be supplied in Render.
- Production hosting, Atlas connectivity, real OTP delivery, real cloud uploads, authenticated WebSocket broadcasts across live browsers, and the manual user-flow checklist have not been tested or deployed.

Deployment changes touch .gitignore, root vercel.json, render.yaml, frontend/.env.example, frontend/vite.config.mjs, frontend/src/utils/constants.js, frontend/src/services/api.js, frontend/src/hooks/useSocket.js, backend/.env.example, backend/src/app.js, backend/src/config/env.js, backend/src/config/db.js, backend/src/config/logger.js, backend/src/local-server.js, backend/src/middleware/errorHandler.middleware.js, backend/src/middleware/requestLogger.middleware.js, backend/tests/unit/server.test.js, backend/tests/unit/production-env.test.js, and this document. The NoteEditor fix and lifecycle test were already present from the earlier editing task and were preserved.


## Actual Render integration verification (2026-10-22)

The backend is reachable at `https://abdul-baseer-mern-10pshine.onrender.com`. Source registration and the live root response both confirm `/api/v1`.

- GET `/`: 200, JSON API service response.
- GET `/health`: 200, healthy liveness response.
- GET `/api/v1/notes` without credentials: 401, expected authorization rejection. The live response currently exposes a stack trace. Set `NODE_ENV=production` in Render before launch; the current source suppresses stacks in production.
- GET `/socket.io/?EIO=4&transport=polling`: 200, Engine.IO handshake advertising WebSocket support. A real WebSocket connection without credentials reached socket authentication and was rejected with `Not authorized`, as expected. Authenticated live updates were not exercised.
- CORS preflight from `https://note-book-app-one.vercel.app`: 200, matching Allow-Origin and authorization/content-type headers. This is also the frontend origin advertised by the live backend.
- CORS preflight from `https://abdul-baseer-mern-10pshine-gamma.vercel.app`: 403, despite that origin appearing in the local backend configuration. Local .env changes do not update Render settings.
- CORS preflight from an untrusted example origin: 403, expected.

Current ignored `frontend/.env` uses:

```dotenv
VITE_API_URL=https://abdul-baseer-mern-10pshine.onrender.com/api/v1
VITE_ENABLE_SOCKET_IO=true
```

Its unrelated existing values were preserved. `frontend/.env.example` documents the same production configuration. Ignored `frontend/.env.development.local` overrides the two values for `npm start`, using `http://localhost:5000/api/v1` and sockets enabled. Production builds load the Render URL; development loads the local URL. On another machine, create that development override from the comments in `.env.example` if you want to use the local backend.

Vercel settings remain Root Directory `frontend`, Framework `Vite`, Install Command `npm ci`, Build Command `npm run build`, Output Directory `build`. Set the two production variables above in Vercel before building. Existing SPA rewrites are unchanged.

In Render set `NODE_ENV=production` and `BACKEND_URL=https://abdul-baseer-mern-10pshine.onrender.com`. Configure `FRONTEND_URL` to your chosen final Vercel HTTPS origin without a trailing slash; do not guess a new URL. The live backend currently advertises `https://note-book-app-one.vercel.app`; confirm whether you intend to keep that site. Leave `CLIENT_URL` unset to inherit FRONTEND_URL or set the same allowed origins explicitly. Do not copy local backend .env wholesale or overwrite secrets. Retain existing Atlas and JWT credentials. Confirm email, Cloudinary and proxy settings listed above are present in Render.

Verification after this integration: frontend production build passed using the real URL, all 37 frontend suites / 659 tests passed, and 14 focused backend environment/startup/socket-security/database tests passed. The compiled bundle contains the actual Render API URL and no localhost backend or unresolved Vite configuration reference. The existing large-bundle warning remains. No authenticated live CRUD, signup, OTP delivery, Atlas credential inspection, or upload was attempted. No push, deployment, or Render configuration change was performed. The frontend connection configuration is ready; production launch still requires the Render environment corrections and manual authenticated user-flow verification.
