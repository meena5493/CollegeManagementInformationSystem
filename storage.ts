import { 
  type User, 
  type InsertUser, 
  type Course, 
  type InsertCourse,
  type Student, 
  type InsertStudent,
  type Marks, 
  type InsertMarks,
  type Fees, 
  type InsertFees,
  type StudentWithUser,
  type MarksWithDetails,
  type FeesWithStudent
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Courses
  getCourse(id: string): Promise<Course | undefined>;
  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<Course>): Promise<Course | undefined>;

  // Students
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  getStudentByUserId(userId: string): Promise<Student | undefined>;
  getStudents(): Promise<Student[]>;
  getStudentsWithDetails(): Promise<StudentWithUser[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined>;

  // Marks
  getMarks(id: string): Promise<Marks | undefined>;
  getMarksByStudent(studentId: string): Promise<Marks[]>;
  getMarksWithDetails(): Promise<MarksWithDetails[]>;
  createMarks(marks: InsertMarks): Promise<Marks>;
  updateMarks(id: string, updates: Partial<Marks>): Promise<Marks | undefined>;
  searchMarks(studentId?: string, courseId?: string): Promise<MarksWithDetails[]>;

  // Fees
  getFees(id: string): Promise<Fees | undefined>;
  getFeesByStudent(studentId: string): Promise<Fees[]>;
  getFeesWithDetails(): Promise<FeesWithStudent[]>;
  createFees(fees: InsertFees): Promise<Fees>;
  updateFees(id: string, updates: Partial<Fees>): Promise<Fees | undefined>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalStudents: number;
    totalFaculty: number;
    totalCourses: number;
    totalFeeCollection: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private courses: Map<string, Course>;
  private students: Map<string, Student>;
  private marks: Map<string, Marks>;
  private fees: Map<string, Fees>;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.students = new Map();
    this.marks = new Map();
    this.fees = new Map();
    this.seedData();
  }

  private seedData() {
    // Create admin user
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      email: "admin@college.edu",
      password: "admin123", // In real app, this would be hashed
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      phone: "+1-555-0100",
      address: "College Administrative Office",
      isActive: true,
    };
    this.users.set(adminId, admin);

    // Create sample courses
    const csId = randomUUID();
    const mathId = randomUUID();
    const physicsId = randomUUID();

    const courses: Course[] = [
      {
        id: csId,
        code: "CS101",
        name: "Computer Science",
        description: "Introduction to Computer Science",
        credits: 4,
        department: "Computer Science",
        facultyId: adminId,
        isActive: true,
      },
      {
        id: mathId,
        code: "MATH201",
        name: "Mathematics",
        description: "Advanced Mathematics",
        credits: 3,
        department: "Mathematics",
        facultyId: adminId,
        isActive: true,
      },
      {
        id: physicsId,
        code: "PHY301",
        name: "Physics",
        description: "General Physics",
        credits: 4,
        department: "Physics",
        facultyId: adminId,
        isActive: true,
      },
    ];

    courses.forEach(course => this.courses.set(course.id, course));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      isActive: true,
      phone: insertUser.phone || null,
      address: insertUser.address || null,
      role: insertUser.role || "student"
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Courses
  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.isActive);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = { 
      ...insertCourse, 
      id, 
      isActive: true,
      description: insertCourse.description || null,
      facultyId: insertCourse.facultyId || null,
      credits: insertCourse.credits || 3
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    const updatedCourse = { ...course, ...updates };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  // Students
  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.studentId === studentId);
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.userId === userId);
  }

  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudentsWithDetails(): Promise<StudentWithUser[]> {
    const students = Array.from(this.students.values());
    return students.map(student => {
      const user = this.users.get(student.userId);
      const course = this.courses.get(student.courseId);
      return {
        ...student,
        user: user!,
        course: course!,
      };
    });
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { 
      ...insertStudent, 
      id,
      status: insertStudent.status || "active",
      semester: insertStudent.semester || 1
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    const updatedStudent = { ...student, ...updates };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  // Marks
  async getMarks(id: string): Promise<Marks | undefined> {
    return this.marks.get(id);
  }

  async getMarksByStudent(studentId: string): Promise<Marks[]> {
    return Array.from(this.marks.values()).filter(marks => marks.studentId === studentId);
  }

  async getMarksWithDetails(): Promise<MarksWithDetails[]> {
    const marks = Array.from(this.marks.values());
    return marks.map(mark => {
      const student = this.students.get(mark.studentId);
      const course = this.courses.get(mark.courseId);
      const user = student ? this.users.get(student.userId) : undefined;
      return {
        ...mark,
        student: {
          ...student!,
          user: user!,
          course: course!,
        },
        course: course!,
      };
    });
  }

  async createMarks(insertMarks: InsertMarks): Promise<Marks> {
    const id = randomUUID();
    const marks: Marks = { 
      ...insertMarks, 
      id,
      remarks: insertMarks.remarks || null
    };
    this.marks.set(id, marks);
    return marks;
  }

  async updateMarks(id: string, updates: Partial<Marks>): Promise<Marks | undefined> {
    const marks = this.marks.get(id);
    if (!marks) return undefined;
    const updatedMarks = { ...marks, ...updates };
    this.marks.set(id, updatedMarks);
    return updatedMarks;
  }

  async searchMarks(studentId?: string, courseId?: string): Promise<MarksWithDetails[]> {
    const allMarks = await this.getMarksWithDetails();
    return allMarks.filter(mark => {
      if (studentId && mark.studentId !== studentId) return false;
      if (courseId && mark.courseId !== courseId) return false;
      return true;
    });
  }

  // Fees
  async getFees(id: string): Promise<Fees | undefined> {
    return this.fees.get(id);
  }

  async getFeesByStudent(studentId: string): Promise<Fees[]> {
    return Array.from(this.fees.values()).filter(fee => fee.studentId === studentId);
  }

  async getFeesWithDetails(): Promise<FeesWithStudent[]> {
    const fees = Array.from(this.fees.values());
    return fees.map(fee => {
      const student = this.students.get(fee.studentId);
      const user = student ? this.users.get(student.userId) : undefined;
      const course = student ? this.courses.get(student.courseId) : undefined;
      return {
        ...fee,
        student: {
          ...student!,
          user: user!,
          course: course!,
        },
      };
    });
  }

  async createFees(insertFees: InsertFees): Promise<Fees> {
    const id = randomUUID();
    const fees: Fees = { 
      ...insertFees, 
      id,
      status: insertFees.status || "pending",
      paidAmount: insertFees.paidAmount || "0",
      paymentDate: insertFees.paymentDate || null
    };
    this.fees.set(id, fees);
    return fees;
  }

  async updateFees(id: string, updates: Partial<Fees>): Promise<Fees | undefined> {
    const fees = this.fees.get(id);
    if (!fees) return undefined;
    const updatedFees = { ...fees, ...updates };
    this.fees.set(id, updatedFees);
    return updatedFees;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalFaculty: number;
    totalCourses: number;
    totalFeeCollection: number;
  }> {
    const totalStudents = this.students.size;
    const totalFaculty = Array.from(this.users.values()).filter(user => user.role === "faculty").length;
    const totalCourses = Array.from(this.courses.values()).filter(course => course.isActive).length;
    const totalFeeCollection = Array.from(this.fees.values())
      .reduce((sum, fee) => sum + Number(fee.paidAmount), 0);

    return {
      totalStudents,
      totalFaculty,
      totalCourses,
      totalFeeCollection,
    };
  }
}

export const storage = new MemStorage();
