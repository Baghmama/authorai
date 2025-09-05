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
    creditsPerDollar: 100, // 10 credits per $0.10
    minAmount: 0.10, // Minimum $0.10
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    creditsPerRupee: 10, // 10 credits per ₹1
    minAmount: 1, // Minimum ₹1
  },
};

export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 10,
    price: { usd: 0.10, inr: 1 },
  },
  {
    id: 'basic',
    name: 'Basic',
    credits: 30,
    price: { usd: 0.30, inr: 3 },
  },
  {
    id: 'popular',
    name: 'Popular',
    credits: 60,
    price: { usd: 0.60, inr: 6 },
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 100,
    price: { usd: 1.00, inr: 10 },
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