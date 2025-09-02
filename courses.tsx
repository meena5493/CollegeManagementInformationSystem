import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Book, Users } from "lucide-react";
import type { Course } from "@shared/schema";

export default function Courses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase();
    return (
      course.name.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query) ||
      course.department.toLowerCase().includes(query) ||
      (course.description && course.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <Topbar
          title="Courses"
          subtitle="View and manage course catalog"
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6">
          {/* Courses Grid */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <CardTitle data-testid="text-courses-title">
                  All Courses ({filteredCourses.length})
                </CardTitle>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-search-courses"
                    />
                  </div>
                  
                  <Button data-testid="button-add-course">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-loading">
                  Loading courses...
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow" data-testid={`card-course-${course.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Book className="text-primary w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground" data-testid={`text-course-name-${course.id}`}>
                                {course.name}
                              </h3>
                              <p className="text-sm text-muted-foreground" data-testid={`text-course-code-${course.id}`}>
                                {course.code}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" data-testid={`badge-course-status-${course.id}`}>
                            {course.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Description</p>
                          <p className="text-sm text-foreground" data-testid={`text-course-description-${course.id}`}>
                            {course.description || "No description available"}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Credits</p>
                            <p className="text-sm font-medium text-foreground" data-testid={`text-course-credits-${course.id}`}>
                              {course.credits}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Department</p>
                            <p className="text-sm font-medium text-foreground" data-testid={`text-course-department-${course.id}`}>
                              {course.department}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span data-testid={`text-course-enrollment-${course.id}`}>0 enrolled</span>
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-${course.id}`}>
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" data-testid={`button-edit-${course.id}`}>
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-courses">
                  {searchQuery ? "No courses found matching your search." : "No courses available yet."}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
