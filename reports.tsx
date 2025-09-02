import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Download, TrendingUp, Users, BookOpen, DollarSign, BarChart3 } from "lucide-react";
import type { StudentWithUser, MarksWithDetails, FeesWithStudent, Course } from "@shared/schema";

interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalFeeCollection: number;
}

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>("overview");

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: students = [] } = useQuery<StudentWithUser[]>({
    queryKey: ["/api/students"],
  });

  const { data: marks = [] } = useQuery<MarksWithDetails[]>({
    queryKey: ["/api/marks"],
  });

  const { data: fees = [] } = useQuery<FeesWithStudent[]>({
    queryKey: ["/api/fees"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Calculate analytics
  const courseEnrollments = courses.map(course => {
    const enrolledCount = students.filter(student => student.courseId === course.id).length;
    return {
      ...course,
      enrolledCount,
      enrollmentPercentage: students.length > 0 ? (enrolledCount / students.length) * 100 : 0,
    };
  });

  const feeStatusDistribution = fees.reduce((acc, fee) => {
    acc[fee.status] = (acc[fee.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageMarks = marks.length > 0 
    ? marks.reduce((sum, mark) => sum + parseFloat(mark.marksObtained), 0) / marks.length 
    : 0;

  const topPerformers = marks
    .map(mark => ({
      ...mark,
      percentage: parseFloat(mark.marksObtained) / parseFloat(mark.totalMarks) * 100
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  const reportTypes = [
    { value: "overview", label: "Overview Report", icon: BarChart3 },
    { value: "students", label: "Student Report", icon: Users },
    { value: "courses", label: "Course Report", icon: BookOpen },
    { value: "fees", label: "Fee Report", icon: DollarSign },
    { value: "academic", label: "Academic Performance", icon: TrendingUp },
  ];

  const generateReport = () => {
    console.log(`Generating ${selectedReport} report...`);
    // In a real app, this would generate and download a PDF/Excel report
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <Topbar
          title="Reports"
          subtitle="Generate and view institutional reports"
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6 space-y-6">
          {/* Report Selection */}
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-report-selection-title">Report Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Report Type
                  </label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger data-testid="select-report-type">
                      <SelectValue placeholder="Choose report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={generateReport} data-testid="button-generate-report">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-total-students">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-students">
                      {stats?.totalStudents || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-total-courses">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Courses</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-courses">
                      {stats?.totalCourses || 0}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-average-marks">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Marks</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-average-marks">
                      {averageMarks.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-fee-collection">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Fee Collection</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-fee-collection">
                      ₹{((stats?.totalFeeCollection || 0) / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Enrollment */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-course-enrollment-title">Course Enrollment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseEnrollments.length > 0 ? (
                  courseEnrollments.map((course) => (
                    <div key={course.id} className="space-y-2" data-testid={`enrollment-${course.id}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground" data-testid={`text-course-name-${course.id}`}>
                            {course.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{course.code}</p>
                        </div>
                        <Badge variant="secondary" data-testid={`badge-enrollment-${course.id}`}>
                          {course.enrolledCount} students
                        </Badge>
                      </div>
                      <Progress value={course.enrollmentPercentage} className="h-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4" data-testid="text-no-enrollment-data">
                    No enrollment data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Fee Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-fee-status-title">Fee Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(feeStatusDistribution).length > 0 ? (
                  Object.entries(feeStatusDistribution).map(([status, count]) => {
                    const percentage = fees.length > 0 ? (count / fees.length) * 100 : 0;
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case "paid": return "bg-green-500";
                        case "partial": return "bg-yellow-500";
                        case "overdue": return "bg-red-500";
                        default: return "bg-gray-500";
                      }
                    };

                    return (
                      <div key={status} className="space-y-2" data-testid={`fee-status-${status}`}>
                        <div className="flex items-center justify-between">
                          <span className="capitalize font-medium text-foreground">
                            {status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getStatusColor(status)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4" data-testid="text-no-fee-data">
                    No fee data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-top-performers-title">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                          Rank
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                          Student
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                          Course
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                          Exam Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {topPerformers.map((performer, index) => (
                        <tr key={performer.id} data-testid={`top-performer-${index}`}>
                          <td className="px-4 py-3">
                            <Badge variant="outline">#{index + 1}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-foreground">
                                {performer.student.user.firstName} {performer.student.user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {performer.student.studentId}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {performer.course.name}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary">
                              {performer.examType}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-foreground">
                                {performer.percentage.toFixed(1)}%
                              </span>
                              <Progress value={performer.percentage} className="w-16 h-2" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
