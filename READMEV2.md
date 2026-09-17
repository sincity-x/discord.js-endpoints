# Discord Webhook Control Panel

A local Discord webhook dashboard with webhook management, message building, Discord lookups, optional bot tools, account management, and server-side security monitoring.

## Features

- Connect, inspect, edit, send to, monitor, and remove Discord webhooks.
- Compose plain messages and Discord embeds with a live preview.
- View request history, message history, diagnostics, errors, and recent activity.
- Look up Discord invites and user IDs through server-side Discord API requests.
- Connect multiple Discord bots and browse their servers, channels, messages, and members.
- Send channel and direct messages from the Bot Console.
- Manage user accounts, roles, status, passwords, and sessions from the admin dashboard.
- Publish dashboard announcements and enable maintenance mode.
- Monitor blocked security events and enable Under Attack mode.

## Requirements

- Node.js 18 or newer
- A Discord webhook URL for webhook features
- A Discord bot token for Multi-Bot features
- Discord Developer Portal access if privileged intents are needed

## Run Locally

```bash
npm install
npm start
```

Open http://127.0.0.1:4000.

The server binds to `127.0.0.1` and uses port `4000` by default. Override either value with environment variables:

```powershell
$env:PORT=4000
$env:HOST="127.0.0.1"
npm start
```

Keep `HOST=127.0.0.1` unless remote access is deliberately configured behind authentication and a properly secured reverse proxy.

## Accounts And Admin Access

User accounts and sessions are stored locally. Passwords are stored as bcrypt hashes. The protected admin account can use the admin dashboard at `/admin` to manage users and security settings.

Set these environment variables when deploying outside a local development environment:

```env
SESSION_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=admin
```

Do not commit `.env`, session secrets, passwords, Discord tokens, or `backend/database.json`.

## Security Controls

- XSS protection is enabled by default and can be managed from the admin dashboard.
- Unsafe script and HTML markup is rejected before API handlers process it.
- Blocked events record the verified logged-in username when available.
- Unauthenticated requests use the submitted username when one is provided, otherwise `anonymous`.
- Path traversal payloads are rejected and logged.
- Common command-injection syntax is rejected and logged.
- Prototype-pollution keys such as `__proto__`, `constructor`, and `prototype` are rejected.
- NoSQL operator keys beginning with `$` are rejected.
- Under Attack mode can block non-admin API changes while an incident is investigated.
- Security events are visible only in the admin dashboard and can be cleared there.
- API requests use bounded body sizes, rate limiting, origin checks, and security headers including CSP and clickjacking protection.
- Discord bot tokens remain server-side and are encrypted in the local database.

These checks are defensive input validation. They do not replace authentication, authorization, secure deployment, dependency updates, or regular security review.

## Discord Bots

1. Create or open a bot application in the Discord Developer Portal.
2. Copy or reset the bot token.
3. Open **Multi-Bot** in the dashboard.
4. Paste the token into **Connect another bot**.
5. Invite the bot to the servers it should access.

Bot connections are held in memory and must be reconnected after a server restart. Enable Presence Intent only when member presence data is required:

```env
DISCORD_GUILD_PRESENCES_INTENT=true
```

## Project Structure

```text
server.js                    Express server and API routes
backend/admin-dashboard.html Admin dashboard markup
backend/admin-dashboard.js   Admin dashboard behavior
backend/database.js          Local database and encrypted bot storage
backend/database.json        Local runtime data, never commit
public/dashboard/             Main user dashboard
public/home/                  Public home page
public/Login/                 Login page
public/Register/              Registration page
```

## Changelog

### 2026-09-17

- Added a persisted XSS protection toggle to the admin dashboard.
- Removed the Under Attack mode auto-disable selector.
- Added username attribution to security events.
- Ensured admin requests authenticate before blocked-input events are recorded.
- Added logging and blocking for path traversal payloads.
- Added logging and blocking for common command-injection syntax.
- Added blocking for prototype-pollution keys.
- Added blocking for NoSQL operator keys.
- Displayed the identified user in the admin Security Monitor.
- Kept `anonymous` as the fallback when no verified or submitted username exists.
- Updated the README with the current port, account flow, security controls, and project structure.

### 2026-09-16

- Reworked the dashboard UI into a cleaner dark control panel.
- Added webhook diagnostics, request history, message history, and recent activity views.
- Added Discord invite and user ID lookup tools.
- Added Multi-Bot server, channel, message, member, moderation, and Bot Console tools.
- Added optional member presence badges.
- Added responsive layouts for dashboard cards, tables, lookup results, and the Discord-style workspace.
- Added stricter CSP and additional browser security headers.
- Escaped Recent Activity values before rendering them to reduce stored DOM XSS risk.

### Previous Releases

- Added webhook inspection, sending, editing, deletion, diagnostics, monitoring, and message history.
- Added local account registration, login, sessions, user management, announcements, and maintenance mode.

## Limitations

- Bot connections are held in memory and disappear when the Node process restarts.
- Discord permissions and enabled intents control which server, channel, message, and member data is available.
- The panel is intended for local use and should not be exposed directly to the public internet without careful authentication and proxy configuration.
