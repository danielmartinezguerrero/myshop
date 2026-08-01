# MyShop - Subscriptions

A full-stack e-commerce app for shared digital subscription slots: think
buying a single seat in a Netflix, Spotify or YouTube Premium family plan
instead of paying for the whole thing.

> **Heads up:** this is a portfolio project. Nothing real is being sold, no
 payments go through, no card details are collected anywhere. "Placing an
 order" just simulates one.

 ##

Built 24 July to 1 August 2026

****Author:** Daniel Martinez - [LinkedIn](https://www.linkedin.com/in/daniel-martinez-guerrero-85a6632b0/)**

---

## Why this exists

I finished a vocational IT degree (DAW) in 2024 and moved to the Netherlands
shortly after. I came in knowing Python, HTML, CSS and JS, but I'd never
touched React or TypeScript, which is basically what every frontend job here
asks for.

Instead of grinding through tutorials, I decided to just build something real
and pick up the concepts as I actually needed them.

### How I actually worked on this

I used Claude as a pair-programming partner, not as a code generator. That
distinction mattered to me. I deliberately stayed away from agentic tools
like Claude Code, because if a whole feature just appears without me typing
it, I haven't really learned it.

So the loop for every feature was pretty much: I explain what I want, we talk through the approach and trade-offs,
I get code with an explanation attached, and then I go through it until I understand what it's actually doing, 
asking about whatever part I don't fully get, before typing it in myself. 
Sometimes that meant pasting a snippet Claude gave me, but only after picking it apart first, never before.

Slower than letting an agent do it, sure. But I can walk you through any
decision in this repo, and that was the whole point of doing it this way.

---

## What it does

- **Auth**: register/login with JWT, hashed passwords, sessions that
  survive a refresh, plus a "remember me" that turns off the inactivity
  timeout
- **Inactivity timeout**: warns you after a while of doing nothing and logs
  you out if you don't respond
- **Catalogue**: subscriptions split into categories/subcategories, with
  search
- **Slot availability**: every subscription has a limited number of seats,
  and that's tracked and enforced on the server, not just in the UI
- **Cart**: lives in the database per user, so it survives refreshes and
  follows you across devices
- **Checkout**: creates the order atomically (checks availability,
  decrements slots, empties the cart, all or nothing)
- **Order history**: shows prices as they were when you bought, not
  today's price
- **Protected routes**: redirect you back to wherever you were trying to go
  after you log in
- **Responsive**: works fine on mobile and desktop

---

## Stack

**Frontend:** React, TypeScript, Vite, Tailwind, React Router

**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL

**Auth:** JWT + bcrypt

---

## Architecture, roughly

```
┌─────────────────────────────┐
│  React SPA (Vite)           │
│                             │
│  pages/      routed views   │
│  components/ shared UI      │
│  context/    global state   │
│  hooks/      custom hooks   │
│  services/   API calls      │
│  types/      TS interfaces  │
└──────────────┬──────────────┘
               │  fetch + JWT in Authorization header
               ▼
┌─────────────────────────────┐
│  Express REST API           │
│                             │
│  routes/       endpoints    │
│  middleware/   JWT auth     │
│  controllers/  logic        │
│  lib/          Prisma client│
└──────────────┬──────────────┘
               │  Prisma ORM
               ▼
┌─────────────────────────────┐
│  PostgreSQL                 │
│                             │
│  User ─── Cart ─── CartItem │
│    │                   │    │
│    └──── Order ─── OrderItem│
│                        │    │
│  Category ─ Subcategory ─   │
│                    Product  │
└─────────────────────────────┘
```

---

## Decisions I actually had to think about

Not an exhaustive list of everything I did, just the stuff where I had more
than one option and had to pick.

**Cart on the server, not localStorage.** localStorage is faster to build,
but the cart would be stuck to one browser and I'd have no way to check
availability before checkout. Tying it to the user means it follows them
anywhere, and the server stays the one source of truth.

**Context API, not Redux.** Since the server always returns the full updated
cart, the frontend just swaps its state for whatever came back. There's no
gnarly state logic happening client-side, so Redux, or honestly even
`useReducer`, would've been solving a problem I didn't have.

**Orders snapshot price and product name.** `OrderItem` stores its own copy
of `unitPrice` and `productName` instead of just pointing at the product. If
the price changes later, old orders still need to show what was actually
paid at the time. An order is a receipt, not a live link to the catalogue.

**Checkout runs in a DB transaction.** Validate stock, create the order,
decrement slots, clear the cart. If any of that fails, it all rolls back.
Otherwise you risk ending up with slots gone and no order, or an order sitting
next to a cart that never got cleared.

Slot decrements use Prisma's atomic `decrement` instead of read-then-write,
because two people buying at the same time could otherwise both read the same
number and both "win" the last seat.

**`Decimal`, not `Float`, for money.** Floats round weirdly (`0.1 + 0.2 !=
0.3`), which you really don't want for prices. Postgres's `Decimal(10,2)`
keeps things exact. That's also why prices come through the API as strings
and get converted on the frontend.

**Slugs in URLs, not IDs.** `/products/netflix-premium-4k` instead of
`/products/17`. Easier to read, better for SEO, and it doesn't tell anyone
how many rows are in the table.

**Validation lives on the backend.** The frontend disables buttons when
something's maxed out, but that's just UX. Every rule gets checked again on
the server, because anything the client enforces can be gotten around.

---

## What I actually learned building this

Stuff that was new to me and that I could now explain to someone else:

- **Hooks**: `useState`, `useEffect` and its dependency array, `useRef` for
  values that shouldn't trigger re-renders, `useCallback` for stable
  function identity, and writing my own custom hooks
- **Derived state**: calculating values during render instead of storing
  them separately. Most of my early bugs came from keeping two copies of the
  same data and letting them drift apart
- **Context API**: sharing auth/cart state without prop-drilling
- **TypeScript**: interfaces, optional props, generics in hooks, and why
  `import type` actually matters
- **DB transactions** and atomic ops for concurrent writes
- **JWT auth** end to end, login through to protected routes on both sides

Still early days for me on all of this. Plenty here I'd do differently with
more experience, which is kind of the point of building it now rather than
later.

---

## Running it locally

**You'll need:** Node.js 18+, PostgreSQL, npm

### Backend

```bash
cd backend
npm install
```

Create a `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/myshop"
JWT_SECRET="any-long-random-string"
PORT=3001
```

Set up and seed the database:

```bash
npx prisma migrate dev
npm run seed
npm run dev
```

API runs on `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` (see `.env.example`):

```env
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

App runs on `http://localhost:5173`.

### Scripts worth knowing about

| Command | What it does |
|---|---|
| `npm run seed` | Resets the catalogue with sample data |
| `npm run restock` | Refills subscription slots, doesn't touch orders |
| `npx prisma studio` | Visual database browser |

---

## What's missing

Stuff I know isn't there and would tackle next:

- **No real payments.** Checkout is fully simulated right now. Stripe test
  mode is the next step, where orders would move through a `PENDING` state
  confirmed by a webhook instead of completing instantly
- **Security hardening.** No rate limiting on login, no security headers,
  and refresh token rotation would beat long-lived JWTs
- **Cleanup.** Some UI is duplicated instead of pulled into shared
  components, product data doesn't refetch if it goes stale while a page's
  open, and there's no test suite yet
  
