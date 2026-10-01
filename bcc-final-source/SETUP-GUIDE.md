# BCC Buildtech Website - Setup Guide

## Technology

- React 19
- Vinext / Next-compatible App Router
- Tailwind CSS 4
- Motion for React
- TypeScript

## Run locally

Requirements: Node.js 22.13+ and pnpm 11.

```bash
pnpm install
pnpm dev
```

Open the local URL shown in the terminal.

## Production build

```bash
pnpm build
pnpm start
```

## Main source locations

- `app/page.tsx` - homepage route
- `app/[slug]/page.tsx` - corporate pages
- `app/projects/[id]/page.tsx` - project detail routes
- `app/data.ts` - company, financial, leadership, project and machinery data
- `components/bcc-site.tsx` - shared website sections and interactions
- `app/globals.css` - design system and responsive styling
- `public/bcc/` - BCC project, machinery and leadership images
- `public/BCC-Buildtech-Company-Profile.pdf` - downloadable company profile
- `public/BCC-Buildtech-Credit-Rating-December-2025.pdf` - rating report

## Notes

The enquiry form currently demonstrates the complete frontend interaction. Connect its submit handler to the company-approved email service, CRM or backend API before accepting production enquiries.
