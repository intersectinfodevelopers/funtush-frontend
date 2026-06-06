/**
 * Application Routes
 * Central place for all route constants
 */

// Auth routes
export const ROUTES = {
  // Public
  HOME: '/',
  MARKETPLACE: '/marketplace',

  // Auth
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    REGISTER_AGENCY: '/register/agency',
    REGISTER_TREKKER: '/register/trekker',
    VERIFY: '/verify',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },

  // Marketplace
  MARKETPLACE_ROUTES: {
    ROOT: '/marketplace',
    AGENCIES: '/marketplace/agencies',
    AGENCY_DETAIL: (slug: string) => `/marketplace/agencies/${slug}`,
    PACKAGES: '/marketplace/packages',
    PACKAGE_DETAIL: (slug: string) => `/marketplace/packages/${slug}`,
    DESTINATIONS: '/marketplace/destinations',
    DESTINATION_DETAIL: (slug: string) => `/marketplace/destinations/${slug}`,
    SEARCH: '/marketplace/search',
    ABOUT: '/about',
    CONTACT: '/contact',
  },

  // Agency Dashboard
  AGENCY: {
    DASHBOARD: '/dashboard',
    PACKAGES: '/dashboard/packages',
    PACKAGE_NEW: '/dashboard/packages/new',
    PACKAGE_DETAIL: (id: string) => `/dashboard/packages/${id}`,
    PACKAGE_EDIT: (id: string) => `/dashboard/packages/${id}/edit`,
    BOOKINGS: '/dashboard/bookings',
    BOOKING_DETAIL: (id: string) => `/dashboard/bookings/${id}`,
    GUIDES: '/dashboard/guides',
    GUIDE_DETAIL: (id: string) => `/dashboard/guides/${id}`,
    STAFF: '/dashboard/staff',
    STAFF_DETAIL: (id: string) => `/dashboard/staff/${id}`,
    FINANCE: '/dashboard/finance',
    FINANCE_INCOME: '/dashboard/finance/income',
    FINANCE_EXPENSES: '/dashboard/finance/expenses',
    FINANCE_PAYROLL: '/dashboard/finance/payroll',
    FINANCE_INVOICES: '/dashboard/finance/invoices',
    FINANCE_REPORTS: '/dashboard/finance/reports',
    ANALYTICS: '/dashboard/analytics',
    CUSTOMERS: '/dashboard/customers',
    BLOG: '/dashboard/blog',
    BLOG_NEW: '/dashboard/blog/new',
    BLOG_DETAIL: (id: string) => `/dashboard/blog/${id}`,
    DESTINATIONS: '/dashboard/destinations',
    DESTINATIONS_NEW: '/dashboard/destinations/new',
    DESTINATIONS_DETAIL: (id: string) => `/dashboard/destinations/${id}`,
    REVIEWS: '/dashboard/reviews',
    COUPONS: '/dashboard/coupons',
    BRANCHES: '/dashboard/branches',
    SAFETY: '/dashboard/safety',
    SUPPORT: '/dashboard/support',
    SETTINGS: '/dashboard/settings',
    SETTINGS_BRANDING: '/dashboard/settings/branding',
    SETTINGS_DOMAIN: '/dashboard/settings/domain',
    SETTINGS_PAYMENTS: '/dashboard/settings/payments',
    SETTINGS_NOTIFICATIONS: '/dashboard/settings/notifications',
    SETTINGS_KYC: '/dashboard/settings/kyc',
  },

  // Super Admin
  SUPERADMIN: {
    DASHBOARD: '/admin',
    AGENCIES: '/admin/agencies',
    AGENCY_DETAIL: (id: string) => `/admin/agencies/${id}`,
    SUBSCRIPTIONS: '/admin/subscriptions',
    KYC: '/admin/kyc',
    MARKETPLACE: '/admin/marketplace',
    SOS: '/admin/sos',
    SOS_DETAIL: (id: string) => `/admin/sos/${id}`,
    CAMPAIGNS: '/admin/campaigns',
    CAMPAIGN_DETAIL: (id: string) => `/admin/campaigns/${id}`,
    STAFF: '/admin/staff',
    ANALYTICS: '/admin/analytics',
    TIERS: '/admin/tiers',
    BUGS: '/admin/bugs',
    FRAUD: '/admin/fraud',
  },

  // Trekker
  TREKKER: {
    MY_TREKS: '/my-treks',
    TREK_DETAIL: (id: string) => `/my-treks/${id}`,
    PROFILE: '/profile',
    DISCOVERY: '/discovery',
    REVIEWS: '/reviews',
  },
};
