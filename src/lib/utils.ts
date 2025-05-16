
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMileage(mileage: number | string | undefined): string {
  if (mileage === undefined) return '0';
  
  const mileageNum = typeof mileage === 'string' ? parseInt(mileage.replace(/\D/g, '')) : mileage;
  
  if (isNaN(mileageNum)) return '0';
  
  return mileageNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseMileage(mileageStr: string): number {
  // Remove qualquer caracter que não seja número
  const cleanedValue = mileageStr.replace(/\D/g, '');
  
  // Converte para número
  return cleanedValue ? parseInt(cleanedValue, 10) : 0;
}
