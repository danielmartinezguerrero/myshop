# MyShop — Portfolio Project

## Context
Developer with a DAW (vocational IT) degree from 2024, currently working 
in the Netherlands. Learning React and TypeScript from scratch through this 
project. Goal: build a portfolio piece to land a frontend React role.
All code, comments and commits in English.

## Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS + React Router
- State: Context API + useReducer for the cart
- Backend: Node.js + Express + TypeScript (running on localhost:3001)
- Database: Prisma + PostgreSQL
- Auth: JWT

## Project type
E-commerce platform for shared digital subscriptions (streaming, music, etc.)

## API base URL
http://localhost:3001

## How I want you to work with me
- Generate most of the code yourself, but before writing a new component 
  or a pattern we haven't used before, briefly explain WHAT you're doing 
  and WHY.
- Comment the generated code at key points (hooks, props, state, types, 
  interfaces) so I can understand it by reading, not just copy it.
- When you use a new TypeScript concept (interface, type, generics, union 
  types) or a new React concept (context, custom hooks, routing), add a 
  short summary at the end explaining the concept in general.
- Prefer explicit, clear typing over `any` or advanced tricks — I'm learning.
- Keep it simple and idiomatic over clever.
- All code, comments and commit messages in English.

## Progress
- [x] Backend: Express + Prisma + PostgreSQL + JWT auth
- [x] Frontend: Vite + React + TypeScript base
- [x] Tailwind CSS setup
- [x] Auth forms (login + register)
- [x] Header + navigation
- [x] Inactivity timeout with "Remember me" option
- [x] Product catalog backend (categories, subcategories, seed)
- [x] Product listing page (grid, skeletons, empty/error states)
- [ ] Product detail page
- [ ] Search + category filters
- [ ] Cart