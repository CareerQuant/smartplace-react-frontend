
# smartplace-react-frontend

## How to Run This Project

1. **Install dependencies** (using pnpm):
	```sh
	pnpm install
	```

2. **Start the development server:**
	```sh
	pnpm dev
	```
	The app will be available at [http://localhost:3000](http://localhost:3000).

3. **Build for production:**
	```sh
	pnpm build
	pnpm start
	```

## Project Structure

```
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx
│       ├── admin/
│       │   ├── companies/
│       │   │   ├── page.tsx
│       │   │   └── [id]/page.tsx
│       │   ├── dashboard/page.tsx
│       │   ├── jobs/page.tsx
│       │   ├── skills/page.tsx
│       │   └── users/page.tsx
│       ├── executive/
│       │   ├── companies/page.tsx
│       │   ├── dashboard/page.tsx
│       │   ├── jobs/
│       │   │   ├── page.tsx
│       │   │   └── [id]/page.tsx
│       │   ├── stats/page.tsx
│       │   └── students/page.tsx
│       └── student/
│           ├── dashboard/page.tsx
│           ├── jobs/
│           │   ├── page.tsx
│           │   └── [jobId]/page.tsx
│           ├── profile/page.tsx
│           ├── register/page.tsx
│           └── skills/
│               ├── page.tsx
│               └── [skillId]/test/page.tsx
├── components/
│   ├── app-sidebar.tsx
│   ├── data-table.tsx
│   ├── job-card.tsx
│   ├── stat-card.tsx
│   ├── student-registration-form.tsx
│   ├── theme-provider.tsx
│   ├── top-navbar.tsx
│   └── ui/
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button-group.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── empty.tsx
│       ├── field.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-group.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── item.tsx
│       ├── kbd.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── spinner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       ├── tooltip.tsx
│       ├── use-mobile.tsx
│       └── use-toast.ts
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib/
│   ├── auth-context.tsx
│   ├── schemas.ts
│   ├── types.ts
│   ├── utils.ts
│   └── api/
│       ├── assessment.ts
│       ├── auth.ts
│       ├── client.ts
│       ├── companies.ts
│       ├── jobs.ts
│       ├── predictions.ts
│       ├── skills.ts
│       └── student.ts
├── public/
│   ├── apple-icon.png
│   ├── icon-dark-32x32.png
│   ├── icon-light-32x32.png
│   ├── icon.svg
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
├── styles/
│   └── globals.css
├── components.json
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```
