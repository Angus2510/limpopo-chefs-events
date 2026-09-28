Limpopo Chefs Academy event bookings, backed by PostgreSQL and Yoco checkout.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Booking setup

Copy `.env.example` to `.env.local` and configure PostgreSQL, Yoco, Resend, and admin credentials. If you want events and short courses in the same PostgreSQL database, use the short-courses database URLs here too. Events are stored only in the `event_bookings` table; short-course bookings remain in their existing `Booking` table.

Apply the database schema with `pnpm exec prisma migrate deploy`, then run the app with `pnpm dev`. Configure the Yoco webhook URL as `/api/webhooks/yoco` and set its signing secret in `YOCO_WEBHOOK_SECRET`. Paid bookings are confirmed by the signed webhook or by verifying the Yoco checkout on the return page.

Set `NEXT_PUBLIC_BASE_URL` to the deployed site origin before accepting live payments. Set a unique `ADMIN_USERNAME` and `ADMIN_PASSWORD`; `ADMIN_PANEL_SECRET` must contain at least 32 characters. The protected booking register is available at `/admin`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
