import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Request form schema for contact/service requests
export const requestFormSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Укажите корректный номер телефона"),
  city: z.string().min(2, "Укажите город"),
  address: z.string().min(5, "Укажите полный адрес"),
  apartment: z.string().optional(),
  message: z.string().optional(),
});

export type RequestFormData = z.infer<typeof requestFormSchema>;
