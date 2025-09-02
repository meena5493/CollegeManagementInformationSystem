import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter } from "lucide-react";
import { AddMarksModal } from "@/components/modals/add-marks-modal";
import { useAuth } from "@/hooks/use-auth";
import type { MarksWithDetails, StudentWithUser, Course } from "@shared/schema";

export default function Marks() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addMarksOpen, setAddMarksOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const { user } = useAuth();

  const { data: marks = [], isLoading } = useQuery<MarksWithDetails[]>({
    queryKey: ["/api/marks", selectedStudent === "all" ? "" : selectedStudent, selectedCourse === "all" ? "" : selectedCourse],
  });

  const { data: students = [] } = useQuery<StudentWithUser[]>({
    queryKey: ["/api/students"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const filteredMarks = marks.filter(mark => {
    const query = searchQuery.toLowerCase();
    return (
      mark.student.user.firstName.toLowerCase().includes(query) ||
      mark.student.user.lastName.toLowerCase().includes(query) ||
      mark.student.studentId.toLowerCase().includes(query) ||
      mark.course.name.toLowerCase().includes(query) ||
      mark.examType.toLowerCase().includes(query)
    );
  });

  const getPercentage = (obtained: string, total: string) => {
    const obtainedNum = parseFloat(obtained);
    const totalNum = parseFloat(total);
    return totalNum > 0 ? ((obtainedNum / totalNum) * 100).toFixed(1) : "0";
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A+", variant: "default" as const };
    if (percentage >= 80) return { grade: "A", variant: "default" as const };
    if (percentage >= 70) return { grade: "B", variant: "secondary" as const };
    if (percentage >= 60) return { grade: "C", variant: "secondary" as const };
    if (percentage >= 50) return { grade: "D", variant: "outline" as const };
    return { grade: "F", variant: "destructive" as const };
  };

  const canAddMarks = user?.role === "admin" || user?.role === "faculty";

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <Topbar
          title="Marks"
          subtitle="View and manage student examination marks"
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <CardTitle data-testid="text-marks-title">
                    Student Marks ({filteredMarks.length})
                  </CardTitle>
                  
                  {canAddMarks && (
                    <Button onClick={() => setAddMarksOpen(true)} data-testid="button-add-marks">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Marks
                    </Button>
                  )}
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search marks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-search-marks"
                    />
                  </div>
                  
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="w-48" data-testid="select-student-filter">
                      <SelectValue placeholder="Filter by Student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.user.firstName} {student.user.lastName} ({student.studentId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-48" data-testid="select-course-filter">
                      <SelectValue placeholder="Filter by Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Exam Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Exam Date
                      </th>
                      {canAddMarks && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr>
                        <td colSpan={canAddMarks ? 8 : 7} className="px-6 py-8 text-center text-muted-foreground" data-testid="text-loading">
                          Loading marks...
                        </td>
                      </tr>
                    ) : filteredMarks.length > 0 ? (
                      filteredMarks.map((mark) => {
                        const percentage = parseFloat(getPercentage(mark.marksObtained, mark.totalMarks));
                        const gradeInfo = getGrade(percentage);
                        
                        return (
                          <tr 
                            key={mark.id} 
                            className="hover:bg-muted/30 transition-colors"
                            data-testid={`row-mark-${mark.id}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                                  {mark.student.user.firstName[0]}{mark.student.user.lastName[0]}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-foreground" data-testid={`text-student-name-${mark.id}`}>
                                    {mark.student.user.firstName} {mark.student.user.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground" data-testid={`text-student-id-${mark.id}`}>
                                    {mark.student.studentId}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" data-testid={`text-course-${mark.id}`}>
                              <div>
                                <p className="text-sm font-medium text-foreground">{mark.course.name}</p>
                                <p className="text-xs text-muted-foreground">{mark.course.code}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline" data-testid={`badge-exam-type-${mark.id}`}>
                                {mark.examType}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground" data-testid={`text-marks-${mark.id}`}>
                              {mark.marksObtained} / {mark.totalMarks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground" data-testid={`text-percentage-${mark.id}`}>
                              {percentage}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={gradeInfo.variant} data-testid={`badge-grade-${mark.id}`}>
                                {gradeInfo.grade}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" data-testid={`text-exam-date-${mark.id}`}>
                              {new Date(mark.examDate).toLocaleDateString()}
                            </td>
                            {canAddMarks && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    data-testid={`button-edit-${mark.id}`}
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={canAddMarks ? 8 : 7} className="px-6 py-8 text-center text-muted-foreground" data-testid="text-no-marks">
                          {searchQuery || selectedStudent || selectedCourse ? "No marks found matching your filters." : "No marks recorded yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {canAddMarks && (
        <AddMarksModal open={addMarksOpen} onOpenChange={setAddMarksOpen} />
      )}
    </div>
  );
}
