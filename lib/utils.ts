import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//Convert Prisma objects to plain JavaScript objects
export function convertToPlainObject<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

//Format number to have two decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

// Formate Error

export function formatError(error: any) {
  if (error.name === "ZodError") {
    const filedError = Object.keys(error.errors).map((field) =>
      error.errors(field)
    );
    return filedError.join(". ");
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    const filed = error.meta?.target?.[0] ?? "Filed";
    return `${filed.chartAt(0).toUpperCase() + filed.slice(1)} already exists`;
  }
  return typeof error.message === "string"
    ? error.message
    : JSON.stringify(error.message);
}
