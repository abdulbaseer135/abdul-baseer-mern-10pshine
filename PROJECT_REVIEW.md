# Pre-deployment verification — 22 October 2026

Status: automated checks pass; awaiting your manual review. Nothing has been deployed.

## Current results

| Check | Result |
| --- | --- |
| Backend unit, HTTP and MongoDB integration tests, with coverage | 319 passed, 0 failed |
| Frontend Jest suite, with coverage | 658 passed, 0 failed; 36 suites passed |
| Production frontend build | Passed using Vite |
| Backend npm audit | 0 vulnerabilities, including development dependencies |
| Frontend npm audit | 0 vulnerabilities, including development dependencies |
| Production preview HTTP smoke check | Home, /dashboard SPA fallback and JavaScript asset returned 200 |

Backend measured coverage: statements 74.91%, branches 59.53%, functions 76.08%, lines 75.64%. Frontend: statements 72.17%, branches 53.71%, functions 58.7%, lines 72.5%. These percentages are measured coverage, not a claim that every feature or security property is tested.

Evidence: `backend/coverage-fixes.log`, `frontend/coverage-fixes.log`, `frontend/build-fixes.log`, `backend/audit-fixes.json`, `frontend/audit-fixes.json`. Coverage HTML and lcov output are under each application's `coverage` directory.

Initial baseline was 282 backend passes/23 failures and 575 frontend passes/92 failures. Existing placeholder tests for startup, route protection and editor/delete hooks were replaced with behavior tests. No tests were skipped to obtain a passing result. New tests cover reset bypass, token expiry and reuse, simultaneous reset requests, OTP lockout, room isolation, image validation/storage, HTTPS email failures, HTML sanitization and forbidden note-update fields.

## Fixes completed

- Password reset now requires a cryptographic, ten-minute reset credential after OTP verification. Only its hash is stored, and an atomic update prevents reuse, including concurrent requests. The frontend carries the credential between verification and reset pages. Password reset also revokes older JWTs and disconnects active sockets.
- OTP generation uses cryptographic randomness, verification is limited to five attempts per code, and HTTP authentication/OTP endpoints have IP rate limits.
- Socket.IO verifies JWTs and the user's verified account, then joins only the authenticated user's room. Client-supplied room IDs are ignored.
- DOMPurify sanitizes HTML in both private and shared note views.
- Note updates reject ownership/sharing field injection and MongoDB update operators. Profile updates persist only the name, never arbitrary request fields.
- Task status survives unrelated edits and normalizes correctly when the category changes. Database connection retries open a new connection after failure.
- CORS no longer trusts arbitrary Vercel preview domains. Production cannot enable the development permissive-CORS switch.
- Profile uploads restrict formats and check file signatures, with consistent 5 MB limits. Production uses optional Cloudinary credentials instead of relying on ephemeral disk storage. The frontend rejects SVG and other unsupported formats.
- Added an HTTPS Resend delivery path for hosts that block SMTP. Existing SMTP configuration remains available for local use.
- Removed debug logs containing note bodies/responses. Profile responses exclude OTP/reset secrets.
- Updated dependencies and removed obsolete packages. Replaced Create React App with Vite; aligned Jest 30, React Router 7 and Tailwind 4; preserved npm start/build commands and the build output directory.
- Fixed selectors, mocks, fake-timer use and fixtures in outdated tests. Save/delete/import operations release loading state after unexpected errors. OTP input keys preserve focus.
- Removed committed Sonar token values from current source/docs. Sonar analysis uses the standalone CLI instead of its vulnerable npm wrapper.

## Still requires configuration or manual verification

- Rotate the previously committed Sonar token. Repository history can retain old credentials. Four profile images were already tracked before this work; they remain unchanged and should be reviewed before making the repository public. New uploads and coverage scratch files are ignored.
- Provide and verify real email and Cloudinary credentials before deployment. Automated provider tests mock HTTPS responses and do not send emails or upload real images.
- Review the UI after the Tailwind/Router/toolchain updates, including formatting, navigation and responsive layouts. The build has a non-blocking large JavaScript chunk warning; code splitting is a future performance improvement.
- SonarQube server analysis was not run because a configured standalone scanner/server is not available. Application tests, coverage, audits and the production build were run separately.
- IP limits are in-process and reset with the server. OTP attempt limits persist in MongoDB. Use a shared rate-limit store before running multiple backend replicas.
- Replacing/removing an image updates its database reference but does not delete old Cloudinary assets. Manage obsolete public profile assets through the provider until automated cleanup is added.
- Authentication remains bearer tokens in localStorage/Redux, with no refresh-token flow. Password reset revokes previously issued JWTs using a server-side token version.

## Manual review

Use disposable accounts and a separate test database. In separate terminals run npm start from backend and frontend. Ensure the frontend API URL points to http://localhost:5000/api/v1 for local review; see README for a PowerShell override that preserves your existing .env files. Open http://localhost:3000.

- [ ] Signup, email verification, invalid/expired OTP and resend cooldown.
- [ ] Login/logout, reload protected pages and handle an expired session.
- [ ] Password reset rejects requests without the verified reset credential; successful credentials cannot be reused.
- [ ] Create/edit/delete rich-text notes; cancel/save; reload to confirm persistence.
- [ ] Task state survives title-only edits and category changes.
- [ ] Search/sort/pin/filter/pagination, including empty results.
- [ ] Export/import, duplicate detection, invalid files and failed requests.
- [ ] Shared note works while logged out; disabling sharing removes access.
- [ ] A second account cannot read, change, delete or subscribe to the first account's notes.
- [ ] Profile name, JPEG/PNG/WebP upload/removal, password change and account deletion.
- [ ] Keyboard dialogs, mobile layouts, dark mode, rich-text styling and speech input in a supported browser.
- [ ] Network/API errors do not leave controls stuck loading.

Deploy only after your manual review. A candidate free setup is a static frontend, an Express web service and Atlas Free. Render Free requires HTTPS email delivery and external image storage; its service also sleeps after inactivity. See README and the official provider links there for configuration and current limitations.
