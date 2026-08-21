# Production operations

## Required environment

- Set `APP_ENV=production`, `APP_DEBUG=false`, a unique `APP_KEY`, the canonical HTTPS `APP_URL`, and `APP_TIMEZONE=Asia/Karachi`.
- Use a dedicated least-privilege MySQL/PostgreSQL account. Do not use SQLite for multi-user production traffic.
- Set a strong one-time `ADMIN_PASSWORD` before the initial seed. Change it immediately after login.
- Configure real SMTP credentials, `MAIL_FROM_ADDRESS`, and a durable `QUEUE_CONNECTION` (Redis or database).
- Set secure session values: `SESSION_ENCRYPT=true`, `SESSION_SECURE_COOKIE=true`, and the correct `SESSION_DOMAIN`.

## Deploy

1. Put the application in maintenance mode and take a database backup.
2. Install locked dependencies with `composer install --no-dev --classmap-authoritative` and `npm ci`.
3. Build assets with `npm run build`.
4. Run `php artisan migrate --force`.
5. Run `php artisan optimize` and `php artisan storage:link` for public catalog media only.
6. Restart PHP workers and queue workers, then leave maintenance mode.
7. Verify `/up`, login, a public catalog page, queue processing, SMTP delivery, and PDF generation.

## Processes

- Run `php artisan queue:work --sleep=1 --tries=3 --max-time=3600` under Supervisor/systemd and restart it during deploys.
- Run `php artisan schedule:run` every minute. It expires quotations and marks overdue invoices.
- Serve only `public/` from the web server and force HTTPS. Customer inquiry attachments remain outside the public disk.

## Backup and monitoring

- Back up the database, private storage, and environment secrets independently. Encrypt backups and test restoration quarterly.
- Alert on HTTP 5xx rates, queue failures, failed jobs, disk capacity, backup failures, certificate expiry, and `/up` availability.
- Send application logs to centralized storage with access controls and retention rules.
- Run `composer audit`, `npm audit`, the test suite, and the production build in CI before deployment.

## Rollback

- Keep the previous release directory and asset manifest.
- Prefer forward-compatible migrations. Before any destructive migration, make and verify a restorable backup.
- On failure, re-point the release symlink, restart workers, restore the database only when the migration cannot be safely rolled forward, and document the incident.
