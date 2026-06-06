/**
 * Agency Tier Configuration
 * Defines features available per tier
 */

export type AgencyTier = 'starter' | 'growth' | 'enterprise';

export interface TierFeatures {
  maxPackages: number;
  maxGuides: number;
  maxStaffMembers: number;
  customDomain: boolean;
  advancedAnalytics: boolean;
  paymentGateways: number;
  blogFeature: boolean;
  destinationManagement: boolean;
  couponSystem: boolean;
  branchManagement: boolean;
  safetyTracking: boolean;
  apiAccess: boolean;
  dedicatedSupport: boolean;
  monthlyPrice: number;
}

export const TIER_CONFIG: Record<AgencyTier, TierFeatures> = {
  starter: {
    maxPackages: 5,
    maxGuides: 3,
    maxStaffMembers: 2,
    customDomain: false,
    advancedAnalytics: false,
    paymentGateways: 1,
    blogFeature: false,
    destinationManagement: false,
    couponSystem: false,
    branchManagement: false,
    safetyTracking: false,
    apiAccess: false,
    dedicatedSupport: false,
    monthlyPrice: 0,
  },
  growth: {
    maxPackages: 50,
    maxGuides: 10,
    maxStaffMembers: 5,
    customDomain: true,
    advancedAnalytics: true,
    paymentGateways: 3,
    blogFeature: true,
    destinationManagement: true,
    couponSystem: true,
    branchManagement: false,
    safetyTracking: true,
    apiAccess: true,
    dedicatedSupport: false,
    monthlyPrice: 99,
  },
  enterprise: {
    maxPackages: Infinity,
    maxGuides: Infinity,
    maxStaffMembers: Infinity,
    customDomain: true,
    advancedAnalytics: true,
    paymentGateways: 8,
    blogFeature: true,
    destinationManagement: true,
    couponSystem: true,
    branchManagement: true,
    safetyTracking: true,
    apiAccess: true,
    dedicatedSupport: true,
    monthlyPrice: 499,
  },
};

/**
 * Check if tier has feature
 */
export function hasTierFeature(tier: AgencyTier, feature: keyof TierFeatures): boolean {
  const config = TIER_CONFIG[tier];
  const value = config[feature];

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value > 0;
  }

  return false;
}
