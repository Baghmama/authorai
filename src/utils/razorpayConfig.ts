// Razorpay configuration and utilities
export const RAZORPAY_CONFIG = {
  // Live keys for production
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || '',
};

export const CURRENCY_CONFIG = {
  USD: {
    symbol: '$',
    code: 'USD',
    creditsPerDollar: 130, // 130 credits per $1
    minAmount: 1, // Minimum $1
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    creditsPerRupee: 1.857, // ~130 credits per ₹70
    minAmount: 70, // Minimum ₹70
  },
};

export const CREDIT_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic',
    credits: 130,
    price: { usd: 1, inr: 70 },
  },
  {
    id: 'popular',
    name: 'Popular',
    credits: 260,
    price: { usd: 2, inr: 140 },
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 440,
    price: { usd: 3, inr: 210 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 860,
    price: { usd: 6, inr: 420 },
  },
];

export function formatCurrency(amount: number, currency: 'USD' | 'INR'): string {
  const config = CURRENCY_CONFIG[currency];
  if (currency === 'USD') {
    return `${config.symbol}${amount.toFixed(2)}`;
  }
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