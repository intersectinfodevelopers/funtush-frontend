# Funtush Frontend - Project Structure Documentation

## 📁 Project Architecture

This document provides a comprehensive guide to the Funtush Frontend project structure, configuration, and development guidelines.

### Quick Links
- [Directory Structure](#directory-structure)
- [Configuration Files](#configuration-files)
- [Utilities & Helpers](#utilities--helpers)
- [Component Organization](#component-organization)
- [API Integration](#api-integration)
- [Development Workflow](#development-workflow)

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (no URL segment)
│   │   ├── layout.tsx           # Centered card layout
│   │   ├── login/page.tsx
│   │   ├── register/            # Agency and trekker registration
│   │   ├── verify/page.tsx      # OTP verification
│   │   └── ...
│   │
│   ├── (marketplace)/            # Public marketplace routes
│   │   ├── layout.tsx           # Header + footer layout
│   │   ├── page.tsx             # Homepage
│   │   ├── agencies/
│   │   ├── packages/
│   │   ├── destinations/
│   │   └── search/
│   │
│   ├── (agency)/                 # Agency dashboard (authenticated)
│   │   ├── layout.tsx           # Sidebar + topbar
│   │   └── dashboard/           # Main dashboard routes
│   │       ├── packages/
│   │       ├── bookings/
│   │       ├── guides/
│   │       ├── finance/
│   │       ├── analytics/
│   │       └── settings/
│   │
│   ├── (superadmin)/             # Super admin panel
│   │   ├── layout.tsx           # Dark sidebar
│   │   └── admin/               # Admin routes
│   │       ├── agencies/
│   │       ├── kyc/
│   │       ├── sos/
│   │       └── ...
│   │
│   ├── (trekker)/                # Trekker portal
│   │   ├── layout.tsx
│   │   ├── my-treks/
│   │   ├── profile/
│   │   └── discovery/
│   │
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/
│   │   └── webhooks/stripe/
│   │
│   ├── layout.tsx               # Root layout + providers
│   ├── error.tsx                # Global error boundary
│   ├── not-found.tsx            # 404 page
│   ├── globals.css              # Global styles
│   ├── providers.tsx            # React Query, NextAuth providers
│   └── favicon.ico
│
├── components/                   # Reusable React components
│   ├── ui/                       # Shadcn/Radix UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── shared/                   # Cross-section reusable components
│   │   ├── layout/
│   │   │   ├── DashboardTopbar.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── navigation/
│   │   ├── data-display/
│   │   ├── feedback/
│   │   └── forms/
│   │
│   ├── marketplace/             # Marketplace-specific components
│   │   ├── hero/
│   │   ├── agencies/
│   │   ├── packages/
│   │   ├── destinations/
│   │   └── filters/
│   │
│   ├── agency/                  # Agency dashboard components
│   │   ├── dashboard/
│   │   ├── packages/
│   │   ├── bookings/
│   │   ├── finance/
│   │   ├── analytics/
│   │   └── settings/
│   │
│   ├── superadmin/              # Admin panel components
│   │
│   ├── trekker/                 # Trekker portal components
│   │
│   ├── safety/                  # Safety & tracking components
│   │   ├── map/
│   │   ├── sos/
│   │   └── tracking/
│   │
│   └── forms/                   # Top-level form components
│
├── lib/                          # Utilities and helpers
│   ├── utils/                   # Utility functions
│   │   ├── cn.ts                # clsx + tailwind-merge
│   │   ├── format.ts            # String/number/currency formatting
│   │   └── date.ts              # Date utilities
│   │
│   ├── api/                     # Axios API client & services
│   │   ├── client.ts            # Axios instance + interceptors
│   │   ├── agencies.ts          # Agency API functions
│   │   ├── packages.ts          # Package API functions
│   │   ├── bookings.ts          # Booking API functions
│   │   └── ...
│   │
│   ├── auth/                    # Authentication utilities
│   │   ├── config.ts            # NextAuth config
│   │   └── guards.ts            # Role-based route guards
│   │
│   ├── validations/             # Zod validation schemas
│   │   ├── auth.ts
│   │   ├── agency.ts
│   │   ├── booking.ts
│   │   └── package.ts
│   │
│   └── constants/               # Application constants
│       ├── routes.ts            # Route paths
│       └── tiers.ts             # Tier configuration
│
├── hooks/                        # Custom React hooks
│   ├── agency/                  # Agency-specific hooks
│   │   ├── usePackages.ts
│   │   ├── useBookings.ts
│   │   └── ...
│   │
│   ├── marketplace/             # Marketplace hooks
│   │   ├── useAgencies.ts
│   │   └── usePackages.ts
│   │
│   ├── trekker/                 # Trekker hooks
│   │
│   ├── superadmin/              # Admin hooks
│   │
│   └── shared/                  # Shared hooks
│       ├── useDebounce.ts
│       ├── usePagination.ts
│       └── useLocalStorage.ts
│
├── store/                        # Zustand state management
│   ├── auth/authStore.ts        # Auth state
│   ├── agency/agencyStore.ts    # Agency context
│   └── ui/uiStore.ts            # UI state
│
├── types/                        # TypeScript type definitions
│   ├── agency.ts                # Agency types
│   ├── booking.ts               # Booking types
│   ├── package.ts               # Package types
│   └── index.ts                 # Re-exports
│
├── config/                       # Configuration files
│   ├── navigation.ts            # Sidebar nav config
│   ├── tiers.ts                 # Tier feature matrix
│   └── payments.ts              # Payment gateway config
│
└── middleware.ts                # Next.js middleware (auth + redirects)
```

---

## Configuration Files

### 1. **tailwind.config.ts**
Extended Tailwind configuration with Funtush design tokens:
- **Brand Colors**: Primary (sky), Accent (orange), Success, Danger, Warning, Neutral
- **Spacing Scale**: XS to 5XL
- **Typography**: Font sizes and weights
- **Border Radius**: XS to 3XL
- **Shadows**: Custom shadow levels
- **Animations**: Fade-in, slide-in, pulse effects

### 2. **.env.local** (Development)
Local environment variables (git-ignored):
```env
NEXT_PUBLIC_APP_NAME=Funtush
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

### 3. **.env.example**
Template for all required environment variables (committed to repo)

### 4. **tsconfig.json**
- Path alias: `@/*` → `./src/*`
- Strict TypeScript checking enabled
- Support for Next.js experimental features

---

## Utilities & Helpers

### cn() - Class Name Utility
```typescript
import { cn } from '@/lib/utils/cn';

// Combines classes and merges Tailwind conflicts
cn('px-2 py-1', 'px-3') // 'py-1 px-3'
cn('text-lg', condition && 'font-bold')
```

### Format Utilities
```typescript
import { formatCurrency, truncate, slugify, getInitials } from '@/lib/utils/format';

formatCurrency(1234.56, 'USD')  // '$1,234.56'
truncate('Hello World', 5)      // 'Hello...'
slugify('Hello World')          // 'hello-world'
getInitials('John Doe')         // 'JD'
```

### Date Utilities
```typescript
import { formatDate, getRelativeTime, isPast, isFuture } from '@/lib/utils/date';

formatDate(new Date(), 'MMM dd, yyyy')    // 'Jan 15, 2024'
getRelativeTime(Date.now() - 3600000)     // 'about 1 hour ago'
isPast(new Date('2020-01-01'))            // true
```

---

## API Integration

### Axios Client
Located at `src/lib/api/client.ts`:

**Features:**
- Automatic token injection in Authorization header
- Automatic token refresh on 401
- Request/response interceptors
- Standardized error handling
- Request ID tracking for debugging

**Usage:**
```typescript
import { api } from '@/lib/api/client';

// GET request
const { data } = await api.get('/agencies');

// POST request
const { data } = await api.post('/bookings', { /* payload */ });

// File upload
const formData = new FormData();
formData.append('file', file);
await api.upload('/upload', formData);
```

---

## Component Organization

### UI Components (`components/ui/`)
Shadcn/Radix UI primitives styled with Tailwind:
- Button, Card, Input, Dialog, Select, Tabs, etc.

### Shared Components (`components/shared/`)
Cross-cutting reusable components:
- **Layout**: DashboardTopbar, PageHeader
- **Navigation**: Breadcrumb, Pagination
- **Data Display**: StatsCard, DataTable, EmptyState
- **Feedback**: ConfirmDialog, LoadingSpinner, ErrorBoundary
- **Forms**: RichTextEditor, FileUpload, DatePicker

### Feature Components
Domain-specific components (Marketplace, Agency, Admin, etc.)

---

## Route Organization

### Route Groups (Parentheses in Path)
Route groups don't affect URL structure but organize layouts:

- `(auth)` - Centered card layout for auth forms
- `(marketplace)` - Header + footer layout for public site
- `(agency)` - Sidebar + topbar for agency dashboard
- `(superadmin)` - Dark sidebar for admin panel
- `(trekker)` - Trekker portal layout

---

## Type Definitions

Central type definitions in `src/types/`:
- `agency.ts` - Agency, Tier, Verification types
- `booking.ts` - Booking, BookingStatus types
- `package.ts` - TrekPackage, Departure types
- `index.ts` - Re-exports all types

---

## Constants

### Routes (`lib/constants/routes.ts`)
Centralized route paths to prevent typos:
```typescript
import { ROUTES } from '@/lib/constants';

// Usage
navigate(ROUTES.AGENCY.PACKAGES);
navigate(ROUTES.MARKETPLACE_ROUTES.AGENCY_DETAIL('slug'));
```

### Tiers (`lib/constants/tiers.ts`)
Tier feature matrix:
```typescript
import { hasTierFeature } from '@/lib/constants/tiers';

if (hasTierFeature('growth', 'blogFeature')) {
  // Show blog feature
}
```

---

## Development Workflow

### 1. **Creating New Features**

```typescript
// 1. Define types (src/types/feature.ts)
export interface Feature { /* ... */ }

// 2. Create API client (src/lib/api/feature.ts)
export async function getFeatures() { /* ... */ }

// 3. Create custom hook (src/hooks/feature/useFeatures.ts)
export function useFeatures() { /* ... */ }

// 4. Build UI components (src/components/feature/)

// 5. Create pages using route groups
```

### 2. **Component Styling**
Always use:
- Tailwind classes for styling
- `cn()` utility for conditional classes
- Design tokens from `tailwind.config.ts`

```typescript
import { cn } from '@/lib/utils/cn';

export function MyComponent({ isActive }) {
  return (
    <div className={cn(
      'base-styles',
      isActive && 'active-styles'
    )}>
      Content
    </div>
  );
}
```

### 3. **API Calls**
Use typed responses:
```typescript
import { api, type ApiSuccessResponse } from '@/lib/api/client';

interface Package {
  id: string;
  name: string;
}

const response = await api.get<Package[]>('/packages');
```

### 4. **Form Validation**
Use Zod schemas:
```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginForm = z.infer<typeof loginSchema>;
```

---

## Best Practices

✅ **Do:**
- Use `cn()` for class merging
- Type all API responses
- Keep components focused and reusable
- Use custom hooks for logic extraction
- Follow folder structure for organization
- Use route constants instead of hardcoding

❌ **Don't:**
- Mix Tailwind classes with arbitrary styles
- Create untypedAPI functions
- Put complex logic in components
- Hardcode route paths
- Create components outside their category

---

## Testing Structure

Components and utilities are organized to support testing:
- Each component can be tested in isolation
- Hooks can be tested with `@testing-library/react-hooks`
- Utilities have clear, pure functions
- API client is mockable with interceptors

---

## Performance Considerations

- **Code Splitting**: Route groups enable automatic code splitting
- **Image Optimization**: Use Next.js Image component
- **Font Optimization**: Google fonts loaded via next/font
- **API Caching**: React Query configured for 5-minute stale time
- **Component Lazy Loading**: Dynamic imports for heavy components

---

## Environment Setup

See `.env.example` for all required variables. Copy and fill:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

---

## Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [React Query](https://tanstack.com/query/latest)
- [Zod](https://zod.dev)
- [Axios](https://axios-http.com)

---

**Last Updated**: June 2024
**Maintainer**: Funtush Development Team
