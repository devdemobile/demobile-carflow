
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um número como quilometragem (ex: 1.000 km)
 */
export function formatMileage(value: number): string {
  return value.toLocaleString('pt-BR');
}
