# AGENTS.md

## Prompt Handling
- If the user's request is vague or under 15 words, ask one clarifying 
  question before planning or building.
- Restate the refined goal at the start of every plan.

## Stack
- Next.js App Router, TypeScript, Tailwind CSS, Shadcn UI
- Supabase for database
- npm as package manager; never use pnpm or yarn
- Vercel for deployment

## Package Manager Rules
- ALWAYS use npm. Never use pnpm or yarn under any circumstances.
- Install: `npm install <package>`
- Dev install: `npm install -D <package>`
- Run scripts: `npm run dev`, `npm run build`, `npm run lint`
- Never run `pnpm add`, `yarn add` or any pnpm/yarn command

## Code Style
- Functional components only, no class components
- Server components by default; add "use client" only when client state/hooks needed
- No semicolons. Single quotes. No inline styles — Tailwind only
- Keep imports at the top of every file
- Use exhaustive switch handling for TypeScript unions and enums

## Folder Structure
- /app — routes and pages (App Router)
- /components — reusable UI components
- /lib — utilities, helpers, server actions
- /types — TypeScript type definitions
- /public — static assets

## Naming Conventions
- PascalCase for components and types
- camelCase for functions, variables, hooks
- kebab-case for files and folders

## Testing
- Vitest for unit tests
- Test files in __tests__ folder next to source
- Write tests for all utility functions in /lib

## Git
- Conventional commits: feat:, fix:, chore:, docs:, refactor:
- Branch naming: feature/name, fix/name, chore/name

## Agent Rules
- Always follow the Agent Pack Policy in .cursor/rules/agent-pack-policy.mdc
- Planner → Builder → Critic flow is mandatory for multi-step tasks
- Never suggest pnpm or yarn commands under any circumstances