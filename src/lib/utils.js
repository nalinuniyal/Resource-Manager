import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const USD_TO_INR_RATE = 83;

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value, currency = "USD") {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function convertCurrency(value, fromCurrency = "INR", toCurrency = "USD") {
  const amount = Number(value || 0);

  if (fromCurrency === toCurrency) {
    return amount;
  }

  if (fromCurrency === "USD" && toCurrency === "INR") {
    return amount * USD_TO_INR_RATE;
  }

  if (fromCurrency === "INR" && toCurrency === "USD") {
    return amount / USD_TO_INR_RATE;
  }

  return amount;
}

export function formatMoneyPair(value, currency = "INR") {
  const primary = formatCurrency(value, currency);
  const secondaryCurrency = currency === "INR" ? "USD" : "INR";
  const secondaryValue = convertCurrency(value, currency, secondaryCurrency);
  return `${primary} · ${formatCurrency(secondaryValue, secondaryCurrency)}`;
}

export function sumByCurrency(items, getValue, getCurrency) {
  return items.reduce(
    (totals, item) => {
      const amount = Number(getValue(item) || 0);
      const currency = getCurrency(item) || "INR";
      totals.INR += convertCurrency(amount, currency, "INR");
      totals.USD += convertCurrency(amount, currency, "USD");
      return totals;
    },
    { INR: 0, USD: 0 }
  );
}

export function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  return error?.message || fallback;
}
