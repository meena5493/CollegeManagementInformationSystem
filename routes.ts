import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertStudentSchema, insertMarksSchema, insertFeesSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // In a real app, use JWT here
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          firstName: user.firstName, 
          lastName: user.lastName 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User is already registered. Please login to the application." });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          firstName: user.firstName, 
          lastName: user.lastName 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }
    // Here you would send a reset link or code to the user's email
    // For now, just respond with success
    res.json({ message: "Password reset instructions sent to your email" });
  } catch (error) {
    res.status(400).json({ message: "Invalid email address" });
  }
});

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Students
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getStudentsWithDetails();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, address, courseId, admissionDate } = req.body;
      
      // Create user first
      const userData = insertUserSchema.parse({
        email,
        password: "student123", // Default password
        role: "student",
        firstName,
        lastName,
        phone,
        address,
      });

      const user = await storage.createUser(userData);

      // Generate student ID
      const studentCount = (await storage.getStudents()).length + 1;
      const studentId = `STU${studentCount.toString().padStart(3, "0")}`;

      // Create student record
      const studentData = insertStudentSchema.parse({
        studentId,
        userId: user.id,
        courseId,
        admissionDate: new Date(admissionDate),
        semester: 1,
        status: "active",
      });

      const student = await storage.createStudent(studentData);
      const studentWithDetails = await storage.getStudentsWithDetails();
      const createdStudent = studentWithDetails.find(s => s.id === student.id);
      
      res.status(201).json(createdStudent);
    } catch (error) {
      res.status(400).json({ message: "Failed to create student" });
    }
  });

  // Courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Marks
  app.get("/api/marks", async (req, res) => {
    try {
      const { studentId, courseId } = req.query;
      const marks = await storage.searchMarks(
        studentId as string | undefined,
        courseId as string | undefined
      );
      res.json(marks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch marks" });
    }
  });

app.post("/api/marks", async (req, res) => {
  try {
    // Validate the incoming data
    const marksData = insertMarksSchema.parse({
      ...req.body,
      examDate: new Date(req.body.examDate),
    });

    // Additional validation
    if (Number(marksData.marksObtained) > Number(marksData.totalMarks)) {
      return res.status(400).json({
        message: "Marks obtained cannot be greater than total marks"
      });
    }

    // Check if student exists
    const student = await storage.getStudent(marksData.studentId);
    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Check if course exists
    const course = await storage.getCourse(marksData.courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    // Create marks entry
    const marks = await storage.createMarks(marksData);
    
    // Return success with created marks
    res.status(201).json({
      message: "Marks entry created successfully",
      data: marks
    });

  } catch (error) {
    // Detailed error handling
    console.error('Marks creation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors
      });
    }

    res.status(400).json({ 
      message: "Failed to create marks entry",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

  // Fees
  app.get("/api/fees", async (req, res) => {
    try {
      const fees = await storage.getFeesWithDetails();
      res.json(fees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });

  app.post("/api/fees", async (req, res) => {
    try {
      const feesData = insertFeesSchema.parse({
        ...req.body,
        dueDate: new Date(req.body.dueDate),
        paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : null,
      });
      const fees = await storage.createFees(feesData);
      res.status(201).json(fees);
    } catch (error) {
      res.status(400).json({ message: "Failed to create fees entry" });
    }
  });

  app.patch("/api/fees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (updates.paymentDate) {
        updates.paymentDate = new Date(updates.paymentDate);
      }
      
      const updatedFees = await storage.updateFees(id, updates);
      if (!updatedFees) {
        return res.status(404).json({ message: "Fee record not found" });
      }
      
      res.json(updatedFees);
    } catch (error) {
      res.status(400).json({ message: "Failed to update fees" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
