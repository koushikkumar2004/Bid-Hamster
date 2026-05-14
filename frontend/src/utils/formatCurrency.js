export const formatCurrency = (amount, currencyCode = 'INR') => {
  // Use Intl.NumberFormat to correctly format currency strings
  // For INR, using 'en-IN' locale looks more authentic
  const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
