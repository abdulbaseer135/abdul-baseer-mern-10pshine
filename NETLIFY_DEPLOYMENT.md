# Netlify frontend + existing Render backend

Use this guide for the selected Netlify deployment. Existing Vercel configuration is unused on Netlify. This setup does not change Render's plan, database, routes, authentication, Redux state, or UI.

## Netlify settings

Import `https://github.com/abdulbaseer135/abdul-baseer-mern-10pshine` and choose the branch containing the reviewed changes after an approved push.

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Base directory | `frontend` |
| Package directory | `frontend`, if requested |
| Configuration file | `frontend/netlify.toml` |
| Build command | `npm run build` |
| Publish directory | `build` relative to base, resolved as `frontend/build` |
| Node version | `24.14.0` |

Netlify installs dependencies from frontend/package-lock.json. Ensure its build installs development dependencies: Vite and its plugins are build dependencies. Do not configure an install with `--omit=dev`.

Set these two public variables in Netlify's environment variable settings with Builds scope for Production. Configure other deploy contexts separately if needed:

```dotenv
VITE_API_URL=https://abdul-baseer-mern-10pshine.onrender.com/api/v1
VITE_ENABLE_SOCKET_IO=true
```

They are compiled into the JavaScript bundle. Rebuild after changing them. Keep MongoDB, JWT, email, Cloudinary, and other secrets exclusively on Render. Do not upload real .env files.

### Netlify secret-scan failure after a successful Vite build

The supplied deploy log for commit `390083b` shows that Vite completed successfully, then Netlify blocked deployment because it treated `VITE_API_URL` as a secret and found the public URL in `.env.example` and the generated JavaScript. The API endpoint is public configuration and must be included in the browser bundle.

`frontend/netlify.toml` now sets `SECRETS_SCAN_OMIT_KEYS = "VITE_API_URL"`. This excludes only that public variable from value scanning; scanning remains enabled for other variables and files. Do not disable scanning globally or exclude the entire bundle. See [Netlify's secret-scanning settings](https://ntl.fyi/configure-secrets-scanning).

After reviewing and approving the change, commit/push it and manually retry the Netlify build. For the existing commit without a source update, the equivalent manual fix is setting `SECRETS_SCAN_OMIT_KEYS=VITE_API_URL` in Netlify's build environment before retrying. The committed TOML setting takes precedence over a conflicting UI setting. Merge any future intentional public-key exceptions into the TOML value explicitly.

The deployment log also lists `SONAR_TOKEN` and `SONAR_HOST_URL` as build environment variables. This frontend build does not run a Sonar scan. Remove those values from Netlify if unused; keep genuine secrets out of `VITE_*` variables. Rotate the Sonar token exposed in the chat/editor context. No token or backend secret was changed by this fix.

The `/*` to `/index.html` status-200 rewrite serves React Router routes on refresh while preserving existing static assets. `/login`, `/dashboard`, `/profile`, and `/shared/<token>` load through React. `/notes` is not registered in this application: the fallback loads React's existing Not Found page instead of Netlify's 404 page. The notes screen is `/dashboard`; no routes have been added or changed.

Axios uses the shared API base above. Socket.IO derives `https://abdul-baseer-mern-10pshine.onrender.com` from that base, connects through `/socket.io/` using WebSockets, and sends the existing authentication token. No API proxy through Netlify is needed.

## Render: allow the final Netlify domain

Obtain the actual assigned Netlify site URL, or your final custom domain. In the existing Render service's Environment settings set:

```dotenv
FRONTEND_URL=https://<actual-site-name>.netlify.app
CLIENT_URL=https://<actual-site-name>.netlify.app
BACKEND_URL=https://abdul-baseer-mern-10pshine.onrender.com
NODE_ENV=production
```

The Netlify origin above is a placeholder; replace it with the actual HTTPS origin without a path or trailing slash. FRONTEND_URL controls HTTP CORS and backend browser redirects. CLIENT_URL controls Socket.IO CORS; it can instead be removed to inherit FRONTEND_URL. Both support explicit comma-separated origins if old sites must remain active. Do not allow arbitrary Netlify preview domains by wildcard. If testing a preview, explicitly allow its exact origin in both settings.

Retain existing MONGO_URI, JWT_SECRET, email, upload and other production settings. The current backend production validator requires valid email delivery configuration and all three Cloudinary credentials. Do not change Render's plan or apply the optional render.yaml Blueprint to this existing service. Save/redeploy environment changes manually when ready. Verify /health and confirm API errors no longer contain development stack traces.

## Local development

The ignored frontend/.env.development.local overrides the production API with `http://localhost:5000/api/v1` and enables sockets for `npm start`. On a fresh checkout create that file using the commented local overrides in frontend/.env.example. Run `npm run dev` from backend and `npm start` from frontend with appropriate local backend credentials. No secrets or local environment files should be committed.

## Manual release steps

1. Review and commit the intended changes locally. Push only when approved; this preparation does not push anything. Keep unrelated working-tree changes out of a deployment-only commit.
2. In Netlify choose Add new project / Import an existing project, connect GitHub, select this repository and the approved deployment branch.
3. Apply the settings and two frontend variables above before starting the first build. Verify Netlify reads frontend/netlify.toml and publishes frontend/build.
4. Obtain the assigned Netlify origin and update Render's FRONTEND_URL and CLIENT_URL as described above. Save/redeploy Render manually without changing its plan or database.
5. Open the Netlify site and refresh /login and /dashboard directly. Test /notes to confirm the application's Not Found page appears. A signed-out /dashboard may redirect to /login through the existing authentication guard.
6. Check DevTools Network: API requests must target Render /api/v1; WebSockets must target Render /socket.io/; no localhost calls should appear.
7. Test login, signup/OTP, refresh persistence, notes create/edit/delete/search/pagination, profile uploads, public sharing, password reset, and authenticated socket updates between two sessions using disposable data. These live features require manual verification.
8. If environment values change, rebuild Netlify. If CORS rejects requests, compare the browser Origin with the exact Render allowlist and check CLIENT_URL as well.

Official references: [Netlify build settings](https://docs.netlify.com/build/configure-builds/overview/), [file-based configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/), [SPA rewrites](https://www.netlify.com/knowledge-base/how-to-configure-redirects-headers-and-env-vars-in-netlifyto/).
