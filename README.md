# Technoout

Technoout is a Laravel 13 and React/Inertia B2B automation and security platform. It includes a public catalog, database-managed company content, quote requests, role-based administration, quotations, invoices, offline payment tracking, PDFs, secure customer links, and SMTP email delivery.

## Local setup

1. Copy `.env.example` to `.env` and configure database and SMTP values.
2. Run `composer install` and `npm install`.
3. Run `php artisan key:generate`.
4. Run `php artisan migrate --seed`.
5. Run `php artisan storage:link`.
6. Run `npm run dev`, or `npm run build` for production.

The configured Laragon URL is `http://technoout.test`.

## Initial administrator

- Email: `admin@technoout.pk`
- Password: `ChangeMe123!`

Change this password after first login. Override seed credentials with `ADMIN_EMAIL` and `ADMIN_PASSWORD` before seeding.

## Editable business data

Addresses, contacts, social links, bank accounts, company identity, pages, products, and categories are stored in the database and managed in Admin. No address or contact data is kept in an application config file.

Public registration is intentionally disabled. Administrators are created by an authorized administrator and assigned a scoped role.
