import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "faculty", "student"] }).notNull().default("student"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  credits: integer("credits").notNull().default(3),
  department: text("department").notNull(),
  facultyId: varchar("faculty_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  admissionDate: timestamp("admission_date").notNull(),
  semester: integer("semester").notNull().default(1),
  status: text("status", { enum: ["active", "inactive", "graduated", "suspended"] }).notNull().default("active"),
});

export const marks = pgTable("marks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  examType: text("exam_type", { enum: ["internal", "midterm", "final", "assignment"] }).notNull(),
  marksObtained: decimal("marks_obtained", { precision: 5, scale: 2 }).notNull(),
  totalMarks: decimal("total_marks", { precision: 5, scale: 2 }).notNull(),
  examDate: timestamp("exam_date").notNull(),
  remarks: text("remarks"),
});

export const fees = pgTable("fees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  academicYear: text("academic_year").notNull(),
  semester: integer("semester").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  dueDate: timestamp("due_date").notNull(),
  paymentDate: timestamp("payment_date"),
  status: text("status", { enum: ["pending", "partial", "paid", "overdue"] }).notNull().default("pending"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isActive: true,
});


export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  isActive: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export const insertMarksSchema = createInsertSchema(marks).omit({
  id: true,
});

export const insertFeesSchema = createInsertSchema(fees).omit({
  id: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});


// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertMarks = z.infer<typeof insertMarksSchema>;
export type Marks = typeof marks.$inferSelect;
export type InsertFees = z.infer<typeof insertFeesSchema>;
export type Fees = typeof fees.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

// Extended types for joins
export type StudentWithUser = Student & {
  user: User;
  course: Course;
};

export type MarksWithDetails = Marks & {
  student: StudentWithUser;
  course: Course;
};

export type FeesWithStudent = Fees & {
  student: StudentWithUser;
};
