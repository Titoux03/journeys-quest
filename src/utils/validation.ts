import { z } from 'zod';

// Addiction Commitment Validation
export const addictionCommitmentSchema = z.object({
  daily_cigarettes: z.number()
    .int("Must be a whole number")
    .min(1, "Must be at least 1 cigarette")
    .max(200, "Must be less than 200 cigarettes"),
  cigarette_price: z.number()
    .positive("Price must be positive")
    .max(100, "Price must be less than 100"),
  pack_price: z.number()
    .positive("Pack price must be positive")
    .max(1000, "Pack price must be less than 1000")
    .optional(),
  cigarettes_per_pack: z.number()
    .int("Must be a whole number")
    .min(1, "Must be at least 1")
    .max(100, "Must be less than 100")
    .optional(),
});

// Journal Entry Validation
export const journalEntrySchema = z.object({
  mood: z.string()
    .min(1, "Mood is required")
    .max(50, "Mood must be less than 50 characters"),
  reflection: z.string()
    .max(5000, "Reflection must be less than 5000 characters")
    .optional(),
  scores: z.record(z.string(), z.number().min(0).max(10))
    .refine((scores) => Object.keys(scores).length <= 20, {
      message: "Maximum 20 criteria allowed"
    }),
});

// Daily Notes Validation
export const dailyNotesSchema = z.object({
  content: z.string()
    .min(1, "Content cannot be empty")
    .max(10000, "Content must be less than 10,000 characters")
    .refine((val) => !val.includes('<script'), {
      message: "Invalid content detected"
    }),
});

// Custom Criteria Validation
export const customCriteriaSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Name can only contain letters, numbers, spaces, hyphens, and underscores"),
});

// Affiliate Code Validation
export const affiliateCodeSchema = z.object({
  code: z.string()
    .min(3, "Affiliate code must be at least 3 characters")
    .max(50, "Affiliate code must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\-_]+$/, "Affiliate code can only contain letters, numbers, hyphens, and underscores"),
});

// Todo Validation
export const todoSchema = z.object({
  text: z.string()
    .min(1, "Todo text cannot be empty")
    .max(500, "Todo text must be less than 500 characters"),
  priority_level: z.number()
    .int()
    .min(0)
    .max(5)
    .optional(),
});
