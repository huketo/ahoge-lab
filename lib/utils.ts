import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isAllowedDomain = (url: string) => {
  const allowedDomains = ['www.notion.so', 'cdn.sanity.io', 'giphy.com'];
  try {
    const hostname = new URL(url).hostname;
    return allowedDomains.some((domain) => hostname.includes(domain));
  } catch {
    return false;
  }
};
