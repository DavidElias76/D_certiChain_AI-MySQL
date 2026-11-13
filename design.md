# CertiChain AI UI Design Guide

Use the student Career Recommendations page as the visual reference when styling
additional student-facing pages. Keep changes presentational unless a feature
request explicitly calls for behavior changes.

## Visual direction

- Calm, trustworthy, and practical; use indigo for primary emphasis and slate
  neutrals for most surfaces and text.
- Prefer clean, mostly square geometry. Avoid decorative gradients, excessive
  rounding, and heavy shadows.
- Use borders and spacing to define sections rather than elevated effects.
- Support dark mode alongside the light theme for every surface, border, and
  text color.

## Page structure

- Center student content in a `max-w-6xl` container, with `space-y-6` between
  major sections and comfortable bottom padding.
- Start with a compact editorial header: small uppercase indigo eyebrow,
  clear `text-2xl`/`sm:text-3xl` title, and a short muted description.
- Optional header artwork should be subtle, decorative (`aria-hidden`), and
  hidden at narrow widths.
- Use responsive grids, such as `sm:grid-cols-3` for summary cards and
  `md:grid-cols-2` for content cards. Allow content to stack on small screens.
- Authentication pages may use a split-screen layout at large breakpoints:
  a subtle branded information panel beside a centered, bounded form column.
  Collapse the brand area into a compact mark above the form on small screens.
- Keep the theme control visible at the top of the form area without obscuring
  the heading or fields.

## Surfaces and color

- Standard card: `border border-slate-200 bg-white dark:border-slate-800
  dark:bg-slate-900`.
- Subtle highlighted information: indigo-tinted background with a light indigo
  border; provide equivalent dark indigo tones.
- Use indigo for primary icons, links, eyebrow labels, selected controls, and
  primary actions. Reserve green/red for meaningful success/error status.
- Keep informational text in slate-600/slate-400 and less prominent metadata
  in slate-500/slate-400.

## Components and interaction

- Pair compact square icon blocks with concise labels and clear numeric
  hierarchy in overview cards.
- Use restrained hover border/background transitions; keep visible focus states
  and accessible names/labels for interactive elements.
- Buttons and links should have concise action text, sufficient contrast, and
  consistent indigo treatment for primary actions.
- Maintain readable line lengths, truncation where necessary, and adequate
  spacing between repeated list items.
- For authentication forms, use a bordered white/slate surface with restrained
  shadowing and square-cornered controls. Inputs should use a subtle slate
  background, clear border, readable placeholder, and visible indigo focus
  treatment in both themes.
- Use a subtle indigo radial wash behind auth branding only as decorative
  background artwork; it must not reduce text contrast or capture interaction.

## Applying the guide

Match the page's existing functionality and content. Reuse its data flow,
loading/error/empty states, routes, and interactions; change layout and styling
without altering behavior unless requested.


## Component Styling
Statistics cards:	border border-slate-200 rounded-md
Data tables: 	border-y border-slate-200
Form sections: 	border border-slate-200 rounded-md p-6
input sections:  py 3.5 rounded-md
Modals:	rounded-lg border border-slate-200 shadow-lg
Status:  badges	Small, muted status colors
Primary buttons and all buttons: 	Solid brand color, rounded-md

## What will make it feel genuinely designed
The biggest difference won't come from the border color alone. It will come from consistency and restraint:
- Use one primary brand color, not a different accent color for every statistic.
- Keep icons small and only use them when they add meaning.
- Avoid gradients, excessive shadows, and unnecessary animations.
- Use clear page headings and align table columns carefully.
- Give important data more prominence than decorative elements.
- Use consistent spacing, but don't force every section into a card.
