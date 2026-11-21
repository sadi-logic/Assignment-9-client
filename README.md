# SalonBook

SalonBook is a full-stack salon booking platform for hair, skin, and beauty services. Customers can browse the service menu, request appointments, and pay securely online. Admins manage services, appointments, users, and transactions from a role-based dashboard.

## Live Website

🔗 **Live Client Site:** https://salonbook-client-zeta.vercel.app/
🔗 **Live Server Site:** https://salonbook-server-ten.vercel.app/


## Repository Links

| Part | Repository |
| --- | --- |
| Client (Next.js) | https://github.com/sadi-logic/Assignment-9-client |
| Server (Express API) | https://github.com/sadi-logic/Assignment-9-server |

## Important Features

**For everyone**
- Browse active salon services on a responsive home page and a dedicated Browse Services page
- Search, filter by category, and sort services by price; filters are kept in the URL so they are shareable
- Service details page and a salon details page

**For customers**
- Sign up and sign in with email and password or with Google
- Request appointments for a service
- View, inspect, and cancel their own appointments
- Pay for appointments online through Stripe Checkout (BDT)
- Manage their own profile

**For admins**
- Add, edit, and delete services, with photo upload through ImgBB
- Confirm or cancel customer appointments
- View all users and block or unblock accounts
- View payment transactions
- Manage their own profile

**Security and quality**
- Role-based access control (`admin` and `customer`) enforced on both the client and the server
- Server-side session verification with Bearer tokens on protected API routes
- Stripe webhook signature verification for payment confirmation
- Password strength checklist, safe post-login redirects, and loading skeletons

## Technology Stack

**Client**
- Next.js 16 (App Router) and React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Base UI components), Lucide icons, Sonner toasts
- Better Auth (email/password and Google OAuth) with the MongoDB adapter

**Server**
- Node.js and Express 5
- MongoDB (official driver)
- Stripe (payments and webhooks)
- CORS and dotenv

**Third-party services**
- MongoDB Atlas, Stripe, Google OAuth, ImgBB

## Installation Instructions

**Prerequisites:** Node.js 20 or later, npm, a MongoDB Atlas database, and optionally Stripe, Google OAuth, and ImgBB accounts.

1. Clone both repositories:

   ```bash
   git clone https://github.com/sadi-logic/Assignment-9-client.git
   git clone https://github.com/sadi-logic/Assignment-9-server.git
   ```

2. Install server dependencies:

   ```bash
   cd Assignment-9-server
   npm install
   ```

3. Install client dependencies:

   ```bash
   cd ../Assignment-9-client
   npm install
   ```

## Required Environment Variables

Create a `.env` file in the root of each project. Use your own values; never commit real secrets.

**Server (`Assignment-9-server/.env`)**

```env
PORT=
DB_USER=
DB_PASSWORD=
APP_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=
```

**Client (`Assignment-9-client/.env`)**

```env
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
MONGODB_URI=
MONGODB_DB_NAME=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
IMGBB_API_KEY=
SALONBOOK_API_URL=
```

Notes:
- `PORT` defaults to `5000`, `STRIPE_CURRENCY` defaults to `bdt`, and `MONGODB_DB_NAME` defaults to `salonbookdb`.
- `SALONBOOK_API_URL` must point to the running server (for example `http://localhost:5000`).
- `APP_URL` and `BETTER_AUTH_URL` should be the client URL (for example `http://localhost:3000`).
- The client and server must use the same MongoDB database.
- Google sign-in, Stripe payments, and image upload are only active when their keys are provided.
- Never commit `.env` files. Both repositories already ignore them.

## How to Run the Project Locally

1. **Start the server** (runs on `http://localhost:5000`):

   ```bash
   cd Assignment-9-server
   node index.js
   ```

2. **Start the client** in a second terminal (runs on `http://localhost:3000`):

   ```bash
   cd Assignment-9-client
   npm run dev
   ```

3. Open **http://localhost:3000** in your browser.

4. *(Optional)* To test Stripe payments locally, forward webhooks to the server:

   ```bash
   stripe listen --forward-to localhost:5000/payments/webhook
   ```

**Production build (client):**

```bash
npm run build
npm start
```

## Scripts (Client)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Author

**Sadullah Sadi** – [GitHub](https://github.com/sadi-logic)