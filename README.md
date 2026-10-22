# Notes App — MERN internship project

A React and Express notes application with MongoDB, email OTP verification, rich-text notes, sharing, tasks, import/export, profile management and optional Socket.IO updates.

## Requirements

- Node.js 22.12 or newer (validated with Node 24)
- npm
- MongoDB locally or MongoDB Atlas
- SMTP credentials or a Resend API key for real OTP delivery

## Local setup

Install dependencies in each application directory:

```powershell
cd backend
npm ci
cd ../frontend
npm ci
```

Use `backend/.env.example` and `frontend/.env.example` as templates. Preserve your existing `.env` files and fill in your own values. Backend requires `MONGO_URI` and a strong `JWT_SECRET`. For local development use `http://localhost:5000/api/v1` as `REACT_APP_API_URL` and `http://localhost:3000` as `FRONTEND_URL`/`CLIENT_URL`.

Start each application in a separate terminal:

```powershell
# Terminal 1, from backend
npm start

# Terminal 2, from frontend
npm start
```

Open http://localhost:3000. Environment changes require restarting the frontend. Its API URL is embedded at build time. Only the explicitly configured public API URL and socket flag are passed from the environment into the frontend bundle.

For a temporary frontend API override in PowerShell:

```powershell
$env:REACT_APP_API_URL = 'http://localhost:5000/api/v1'
npm start
```

## Verification

```powershell
# Backend directory: Mocha unit, HTTP and disposable MongoDB integration tests
npm test
npm run test:coverage
npm audit

# Frontend directory: Jest and React Testing Library
npm test -- --runInBand
npm run test:coverage -- --runInBand
npm run build
npm audit
```

The frontend now uses Vite, Jest 30, React Router 7 and Tailwind 4. The production bundle is still written to `frontend/build`. Test dependencies use compatible security overrides for YAML and CSS selector parsing. The backend uses Node's built-in watch mode for `npm run dev` and built-in UUID generation.

Tests use disposable MongoDB instances, not the configured application database. Test startup may need to download the MongoDB binary on a new machine. Coverage is measured rather than assumed; see `PROJECT_REVIEW.md` for the latest counts and percentages. Passing automated tests does not replace a browser review or real email/storage checks.

## Security behavior

- Signup requires email verification before login and protected API access.
- Password reset requires a short-lived, single-use credential issued after a valid reset OTP. The server stores its hash and consumes it atomically; reset also revokes older sessions and disconnects active sockets.
- OTP codes use cryptographic randomness. Verification has a database-backed five-attempt limit, and authentication/OTP routes have IP rate limits.
- Socket.IO authenticates JWTs and joins only the authenticated user's room. Set `REACT_APP_ENABLE_SOCKET_IO=true` only when running the Socket.IO backend.
- Note updates allow only editable fields; ownership, sharing fields and MongoDB operators cannot be supplied through normal note updates.
- Rendered note HTML is sanitized with DOMPurify. Rich-text formatting is retained.
- Profile uploads accept JPEG, PNG and WebP up to 5 MB and check file signatures. Production requires persistent Cloudinary storage; development can use local files.
- CORS uses explicit origins from `FRONTEND_URL` and `CLIENT_URL` (comma-separated values are supported). Set `TRUST_PROXY=1` only behind one trusted hosting proxy.
- Authentication uses bearer tokens stored in Redux/localStorage. There is no HTTP-only cookie session or automatic refresh-token flow.

## Deployment preparation

Deployment is pending your manual review. Use the checklist in `PROJECT_REVIEW.md` with disposable accounts and a separate test database.

A candidate free architecture is a static frontend, an Express web service and an Atlas free database. Check current account limits before deploying. Free Render web services sleep after inactivity, have ephemeral disks and block standard SMTP ports. Use the HTTPS email path and persistent image storage when deploying there.

Backend hosting variables:

- `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`
- `FRONTEND_URL`, `CLIENT_URL`, `BACKEND_URL`
- `TRUST_PROXY=1` when applicable
- `RESEND_API_KEY` and `EMAIL_FROM` for HTTPS email (a verified sender is required)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Frontend hosting settings:

- Root: `frontend`
- Build: `npm ci && npm run build`
- Publish directory: `build`
- Build-time `REACT_APP_API_URL=https://YOUR-BACKEND/api/v1`
- SPA fallback to `index.html` for browser routes

Real provider credentials and live delivery/storage behavior have not been verified by the automated suite. Cloudinary uploads are public profile images; replacing or removing a profile reference does not currently delete the old remote asset. Remove old assets through the provider's media library as needed.

## Optional SonarQube analysis

Install the standalone SonarScanner CLI and run a SonarQube server separately. Set `SONAR_TOKEN` in your environment, then run `npm run sonar:analyze` from the repository root. The vulnerable npm scanner wrapper is no longer a dependency. Previously committed scanner tokens must be revoked or rotated; removing a token from the current files does not erase Git history.

SonarQube analysis is optional and was not run without a configured server and scanner. Never commit credentials, local `.env` files, profile uploads or generated coverage files.

## Project layout

- `backend/src`: Express routes, controllers, services, data access, models and middleware
- `backend/tests`: Mocha unit and integration tests
- `frontend/src`: React pages, components, Redux store, hooks and services
- `frontend/vite.config.mjs`: frontend build and public environment configuration
- `PROJECT_REVIEW.md`: verification results, remaining manual checks and deployment notes

## References

- [Render free service limitations](https://render.com/docs/free)
- [MongoDB Atlas free cluster setup](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/)
- [Resend email API](https://resend.com/docs/api-reference/emails/send-email)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Vite](https://vite.dev/guide/)

Author: Abdul Baseer — 10P Shine MERN internship project.
