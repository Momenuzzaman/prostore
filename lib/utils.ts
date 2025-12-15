import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { da } from "zod/v4/locales";

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

// export function formatError(error: any) {
//   if (error.name === "ZodError") {
//     const filedError = Object.keys(error.errors).map((field) =>
//       error.errors(field)
//     );
//     return filedError.join(". ");
//   } else if (
//     error.name === "PrismaClientKnownRequestError" &&
//     error.code === "P2002"
//   ) {
//     const filed = error.meta?.target?.[0] ?? "Filed";
//     return `${filed.chartAt(0).toUpperCase() + filed.slice(1)} already exists`;
//   }
//   return typeof error.message === "string"
//     ? error.message
//     : JSON.stringify(error.message);
// }

export function formatError(error: any) {
  // CASE 1: ZodError
  if (error?.name === "ZodError" && Array.isArray(error.errors)) {
    return error.errors
      .map((err: any) => `${err.path?.[0] ?? "Field"}: ${err.message}`)
      .join(". ");
  }

  // CASE 2: Only array received (like your screenshot)
  if (Array.isArray(error)) {
    return error
      .map((err: any) => `${err.path?.[0] ?? "Field"}: ${err.message}`)
      .join(". ");
  }

  // CASE 3: Prisma error
  if (
    error?.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    const field = error.meta?.target?.[0] ?? "Field";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Default
  return typeof error?.message === "string"
    ? error.message
    : JSON.stringify(error);
}

// Round to two decimal places
export function round2(value: number | string) {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("Value must be a number or string");
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

// Format currency
export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return "NaN";
  }
}

// Formate Id
export function formateId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

// Formate Date and time
export function formateDateTime(dateString: Date) {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    date: formattedDate,
    time: formattedTime,
  };
}
