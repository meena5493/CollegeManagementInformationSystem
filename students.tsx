import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter } from "lucide-react";
import { AddStudentModal } from "@/components/modals/add-student-modal";
import type { StudentWithUser } from "@shared/schema";

export default function Students() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: students = [], isLoading } = useQuery<StudentWithUser[]>({
    queryKey: ["/api/students"],
  });

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.user.firstName.toLowerCase().includes(query) ||
      student.user.lastName.toLowerCase().includes(query) ||
      student.studentId.toLowerCase().includes(query) ||
      student.user.email.toLowerCase().includes(query) ||
      student.course.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <Topbar
          title="Students"
          subtitle="Manage student records and information"
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <CardTitle data-testid="text-students-title">
                  All Students ({filteredStudents.length})
                </CardTitle>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-search-students"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" data-testid="button-filter">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button onClick={() => setAddStudentOpen(true)} data-testid="button-add-student">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </div>
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
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground" data-testid="text-loading">
                          Loading students...
                        </td>
                      </tr>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr 
                          key={student.id} 
                          className="hover:bg-muted/30 transition-colors"
                          data-testid={`row-student-${student.id}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                                {student.user.firstName[0]}{student.user.lastName[0]}
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-foreground" data-testid={`text-student-name-${student.id}`}>
                                  {student.user.firstName} {student.user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Semester {student.semester}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground" data-testid={`text-student-id-${student.id}`}>
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap" data-testid={`text-course-${student.id}`}>
                            <div>
                              <p className="text-sm font-medium text-foreground">{student.course.name}</p>
                              <p className="text-xs text-muted-foreground">{student.course.code}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" data-testid={`text-email-${student.id}`}>
                            {student.user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" data-testid={`text-phone-${student.id}`}>
                            {student.user.phone || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={student.status === "active" ? "default" : "secondary"}
                              data-testid={`badge-status-${student.id}`}
                            >
                              {student.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                data-testid={`button-view-${student.id}`}
                              >
                                View
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                data-testid={`button-edit-${student.id}`}
                              >
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground" data-testid="text-no-students">
                          {searchQuery ? "No students found matching your search." : "No students enrolled yet."}
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

      <AddStudentModal open={addStudentOpen} onOpenChange={setAddStudentOpen} />
    </div>
  );
}
