/**
 * Agency Types
 */

export type AgencyTier = 'starter' | 'growth' | 'enterprise';

export interface Agency {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  tier: AgencyTier;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isKYCApproved: boolean;
  isSafetyVerified: boolean;
  website?: string;
  email: string;
  phone: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AgencyVerification {
  id: string;
  agencyId: string;
  type: 'email' | 'phone' | 'document' | 'bank';
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  expiresAt?: Date;
}
