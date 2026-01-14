# CLAUDE.md - AI Assistant Guidelines

> This file provides context and guidelines for AI assistants working with this codebase.

## Project Overview

**Repository:** batdongsan-digital (bds)
**Description:** Personal OS for Vietnamese Real Estate Agents (Môi giới BĐS Việt Nam)
**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, Supabase
**Status:** Active Development

This is a mobile-first PWA application designed to help Vietnamese real estate agents manage their property inventory, customers, and create professional microsites for listings.

---

## Quick Reference

### Essential Commands

```bash
npm install           # Install dependencies
npm run dev           # Start development server (localhost:3000)
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript compiler check
```

### Key URLs

- **Development:** http://localhost:3000
- **Supabase Dashboard:** (Configure in .env.local)
- **Public Microsite:** /p/[property-slug]

### Branch Naming Convention

- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Claude branches: `claude/<description>-<session-id>`

---

## Project Structure

```
bds/
├── app/
│   ├── (auth)/                    # Auth route group
│   │   ├── login/page.tsx         # Đăng nhập (Supabase Auth)
│   │   ├── register/page.tsx      # Đăng ký môi giới mới
│   │   └── layout.tsx             # Auth layout
│   │
│   ├── (dashboard)/               # Protected dashboard route group
│   │   ├── inventory/             # 📦 KHO HÀNG - Property management
│   │   │   ├── page.tsx           # Property list
│   │   │   ├── [id]/page.tsx      # Property detail
│   │   │   ├── [id]/edit/page.tsx # Edit property
│   │   │   └── new/page.tsx       # Add new property
│   │   │
│   │   ├── customers/             # 👥 KHÁCH HÀNG - Customer management
│   │   │   ├── page.tsx           # Customer list
│   │   │   └── [id]/page.tsx      # Customer detail
│   │   │
│   │   ├── tools/watermark/       # 🎨 Watermark tool
│   │   │   └── page.tsx
│   │   │
│   │   ├── settings/page.tsx      # ⚙️ User settings
│   │   └── layout.tsx             # Dashboard layout (Bottom Nav)
│   │
│   ├── p/[slug]/page.tsx          # 🌐 Public microsite (Sales Kit)
│   │
│   ├── api/
│   │   ├── watermark/route.ts     # Image watermarking (Sharp)
│   │   ├── ai/description/route.ts # AI description generation
│   │   └── upload/route.ts        # Image upload to Supabase Storage
│   │
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Tailwind base styles
│
├── components/
│   ├── ui/                        # Shadcn/UI components
│   ├── property/                  # Property-related components
│   ├── customer/                  # Customer-related components
│   ├── watermark/                 # Watermark tool components
│   ├── microsite/                 # Public microsite components
│   └── shared/                    # Shared components (nav, headers)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   └── middleware.ts          # Auth middleware
│   │
│   ├── hooks/                     # React hooks
│   │   ├── use-properties.ts      # Property CRUD
│   │   ├── use-customers.ts       # Customer CRUD
│   │   └── use-profile.ts         # User profile
│   │
│   ├── utils/
│   │   ├── format.ts              # VNĐ formatting, area formatting
│   │   ├── slug.ts                # Slug generation
│   │   └── image.ts               # Client-side image processing
│   │
│   └── constants.ts               # Property types, status, directions
│
├── types/
│   └── database.ts                # Supabase generated types
│
├── supabase/
│   └── schema.sql                 # Database schema
│
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service Worker
│   └── icons/                     # App icons
│
├── middleware.ts                  # Next.js middleware (Auth guard)
├── next.config.js
├── tailwind.config.ts
├── components.json                # Shadcn config
└── package.json
```

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | Agent profiles (extends Supabase Auth) |
| `properties` | Property inventory (Kho hàng BĐS) |
| `customers` | Customer/lead management |
| `property_views` | Microsite view tracking |
| `customer_interactions` | Interaction history |

### Key Relationships

- `profiles.id` → References `auth.users(id)`
- `properties.owner_id` → References `profiles(id)`
- `customers.owner_id` → References `profiles(id)`

### RLS (Row Level Security)

All tables have RLS enabled. Users can only access their own data:
- Agents see only their own properties/customers
- Public can view properties where `is_public = true`

---

## Vietnamese-Specific Conventions

### Property Types (Loại BĐS)

```typescript
PROPERTY_TYPES = {
  nha_pho: 'Nhà phố',
  can_ho: 'Căn hộ',
  dat_nen: 'Đất nền',
  biet_thu: 'Biệt thự',
  mat_bang: 'Mặt bằng',
  nha_xuong: 'Nhà xưởng',
}
```

### Property Status

```typescript
PROPERTY_STATUS = {
  available: 'Đang bán',
  deposited: 'Đã cọc',
  sold: 'Đã bán',
  rented: 'Đã thuê',
}
```

### Price Formatting

- Prices stored in VNĐ (full value, e.g., 5,000,000,000 for 5 tỷ)
- Display: Format with "tỷ" for billions, "triệu" for millions
- Example: `5.2 tỷ`, `850 triệu`

### Area Formatting

- Stored in m² (square meters)
- Display with "m²" suffix

---

## Development Guidelines

### Code Style & Conventions

1. **Naming Conventions**
   - Use camelCase for variables and functions
   - Use PascalCase for components and types
   - Use SCREAMING_SNAKE_CASE for constants
   - Use kebab-case for file names

2. **Component Organization**
   - One component per file
   - Co-locate related files (component, hooks, utils)
   - Use barrel exports (index.ts) for component folders

3. **TypeScript**
   - Always define types for props and state
   - Use Supabase-generated types from `types/database.ts`
   - Prefer `interface` for object shapes

4. **Styling**
   - Use Tailwind CSS classes
   - Mobile-first responsive design
   - Use Shadcn/UI components as base

### API Routes

- Use Next.js Route Handlers (`app/api/**/route.ts`)
- Validate input with Zod
- Return consistent JSON responses
- Handle Supabase errors gracefully

### State Management

- Use React hooks for local state
- Use SWR or React Query for server state
- Use Zustand for global client state (if needed)

---

## Environment Variables

Create `.env.local` (never commit):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (for AI descriptions)
OPENAI_API_KEY=your-openai-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## For AI Assistants

### Before Making Changes

1. **Understand Vietnamese context**
   - This app targets Vietnamese real estate agents
   - UI text should be in Vietnamese where appropriate
   - Use Vietnamese property terminology

2. **Check existing patterns**
   - Review similar components before creating new ones
   - Follow established hook patterns in `lib/hooks/`
   - Use existing utility functions in `lib/utils/`

3. **Consider mobile-first**
   - Design for mobile screens first
   - Use bottom navigation for primary actions
   - Ensure touch-friendly UI elements

### When Writing Code

1. **Follow the blueprint**
   - Refer to the project structure above
   - Use established component locations
   - Maintain consistent file organization

2. **Database operations**
   - Always use Supabase client from `lib/supabase/`
   - Respect RLS policies
   - Use server client for sensitive operations

3. **Image handling**
   - Store original images in Supabase Storage
   - Generate watermarked versions server-side
   - Use Next.js Image component for optimization

### When Testing

1. **Auth flows**
   - Test with Supabase Auth
   - Verify RLS policies work correctly

2. **Responsive design**
   - Test on mobile viewport (375px)
   - Test on tablet (768px)
   - Test on desktop (1280px+)

---

## Common Patterns

### Fetching Properties

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('status', 'available')
  .order('created_at', { ascending: false })
```

### Formatting Price

```typescript
import { formatPrice } from '@/lib/utils/format'

formatPrice(5200000000) // "5.2 tỷ"
formatPrice(850000000)  // "850 triệu"
```

### Protected API Route

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Continue with authenticated logic
}
```

---

## Troubleshooting

### Common Issues

1. **Supabase connection fails**
   - Check `.env.local` has correct values
   - Verify Supabase project is running
   - Check RLS policies

2. **Images not loading**
   - Verify storage bucket policies
   - Check file path structure: `{user_id}/{filename}`

3. **Vietnamese text display issues**
   - Ensure UTF-8 encoding
   - Use appropriate fonts (system fonts or imported Vietnamese fonts)

4. **Auth redirect loops**
   - Check middleware.ts configuration
   - Verify cookie settings

---

## Maintenance

**Last Updated:** 2026-01-14
**Updated By:** AI Assistant (Claude)
**Blueprint Version:** v1.0

> Update this document when:
> - Project structure changes
> - New patterns are established
> - Dependencies are updated
> - Database schema changes
