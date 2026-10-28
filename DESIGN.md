# Vibecoding Project Tracker — Design

**Status:** Completed for Milestone 3 (`design-done`).

## 1. Mood / vibe

A sleek, fast, and focused developer workspace that feels like an extension of your IDE.

- References: Linear app UI, Vercel dashboard, GitHub dark themes
- Anti-references: Enterprise Jira boards, cluttered corporate spreadsheets

## 2. Color palette

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#6366F1` | Header, "+" button, focus rings |
| `brand-accent` | `#4F46E5` | Highlights, hover states, links |
| `surface-page` | `#0F172A` | Page background (Slate 900) |
| `surface-card` | `#1E293B` | Card background (Slate 800) |
| `text-primary` | `#F8FAFC` | Body text (Slate 50) |
| `text-muted` | `#94A3B8` | Captions, dates, counts (Slate 400) |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#10B981` | Cards tagged `feature` (emerald) |
| `type-bug` | `#EF4444` | Cards tagged `bug` (crimson) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#334155` | More than 2 days out |
| `due-warning` | `#D97706` | Less than 24 hours (amber) |
| `due-overdue` | `#DC2626` | Past due (red) |
| `due-neutral` | `#1E293B` | Done (overrides date) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | Inter, sans-serif | Clean, modern structural clarity |
| Body | Inter, sans-serif | High legibility at small sizes |
| Monospace (tags, badges, code) | Fira Code, monospace | Perfect for code snippets and prompts |

## 4. Component principles

- **Cards:** Light border, subtle hover elevation, no heavy drop shadows.
- **Buttons:** Solid fill, crisp edges, generous padding.
- **Modal:** Centered, max-w-lg, slate-900 backdrop at 60% opacity.
- **Empty states:** Dashed border, muted text, encouragement-focused.

## 5. Voice / microcopy

| Where | Text |
|---|---|
| "+" button label | "+ New Task" |
| Empty column placeholder | "Nothing here yet — keep vibecoding." |
| Toast after "Copy as Prompt Context" | "Copied prompt context to clipboard!" |
| Confirm-delete message | "Delete this task? This action cannot be undone." |
| Handoff toast (M7 `task-owner`) | "Handed off to {name}. They're on it." |

## 6. Logo / wordmark

- **Product name:** VibeFlow Tracker
- **Wordmark style:** Clean bold heading text with an indigo accent indicator.

## 7. Out of scope (this hackathon)

- Dark/light mode toggle (locked to dark developer mode).
- Custom icon sets (using Lucide/SVG standard symbols).