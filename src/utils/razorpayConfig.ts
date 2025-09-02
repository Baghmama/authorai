// Razorpay configuration and utilities
export const RAZORPAY_CONFIG = {
  // Valid test keys for development
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1234567890',
  keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'test_secret_key_11111111111111',
};

export const CURRENCY_CONFIG = {
  USD: {
    symbol: '$',
    code: 'USD',
    creditsPerDollar: 90,
    minAmount: 1, // Minimum $1
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    creditsPerRupee: 90 / 88, // 90 credits for 88 INR
    minAmount: 88, // Minimum ₹88
  },
};

export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 90,
    price: { usd: 1, inr: 88 },
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 450,
    price: { usd: 5, inr: 440 },
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 900,
    price: { usd: 10, inr: 880 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 2700,
    price: { usd: 30, inr: 2640 },
  },
];

export function formatCurrency(amount: number, currency: 'USD' | 'INR'): string {
  const config = CURRENCY_CONFIG[currency];
  return `${config.symbol}${amount}`;
}

export function calculateCredits(amount: number, currency: 'USD' | 'INR'): number {
  const config = CURRENCY_CONFIG[currency];
  if (currency === 'USD') {
    return Math.floor(amount * config.creditsPerDollar);
  } else {
    return Math.floor(amount * config.creditsPerRupee);
  }
}