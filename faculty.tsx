import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, BookOpen } from "lucide-react";
import type { User, Course } from "@shared/schema";

export default function Faculty() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    select: (data) => data.filter(user => user.role === "faculty"),
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const filteredFaculty = users.filter(faculty => {
    const query = searchQuery.toLowerCase();
    return (
      faculty.firstName.toLowerCase().includes(query) ||
      faculty.lastName.toLowerCase().includes(query) ||
      faculty.email.toLowerCase().includes(query) ||
      (faculty.phone && faculty.phone.toLowerCase().includes(query))
    );
  });

  const getFacultyCourses = (facultyId: string) => {
    return courses.filter(course => course.facultyId === facultyId);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <Topbar
          title="Faculty"
          subtitle="Manage faculty members and their courses"
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <CardTitle data-testid="text-faculty-title">
                  Faculty Members ({filteredFaculty.length})
                </CardTitle>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search faculty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-search-faculty"
                    />
                  </div>
                  
                  <Button data-testid="button-add-faculty">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Faculty
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-loading">
                  Loading faculty members...
                </div>
              ) : filteredFaculty.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFaculty.map((faculty) => {
                    const facultyCourses = getFacultyCourses(faculty.id);
                    
                    return (
                      <Card key={faculty.id} className="hover:shadow-md transition-shadow" data-testid={`card-faculty-${faculty.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
                              {faculty.firstName[0]}{faculty.lastName[0]}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-foreground" data-testid={`text-faculty-name-${faculty.id}`}>
                                {faculty.firstName} {faculty.lastName}
                              </h3>
                              <Badge variant="secondary" className="mt-1">
                                Faculty
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <span className="text-foreground" data-testid={`text-faculty-email-${faculty.id}`}>
                                {faculty.email}
                              </span>
                            </div>
                            
                            {faculty.phone && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="text-foreground" data-testid={`text-faculty-phone-${faculty.id}`}>
                                  {faculty.phone}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-start space-x-2 text-sm">
                              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-muted-foreground">Courses:</span>
                                <div className="mt-1 space-y-1" data-testid={`text-faculty-courses-${faculty.id}`}>
                                  {facultyCourses.length > 0 ? (
                                    facultyCourses.map((course) => (
                                      <Badge key={course.id} variant="outline" className="mr-1 mb-1">
                                        {course.code}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-sm text-muted-foreground">No courses assigned</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {faculty.address && (
                            <div className="pt-3 border-t">
                              <p className="text-sm text-muted-foreground mb-1">Address</p>
                              <p className="text-sm text-foreground" data-testid={`text-faculty-address-${faculty.id}`}>
                                {faculty.address}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex space-x-2 pt-3">
                            <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-${faculty.id}`}>
                              View Profile
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" data-testid={`button-edit-${faculty.id}`}>
                              Edit
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                            <span>Status:</span>
                            <Badge variant={faculty.isActive ? "default" : "secondary"} data-testid={`badge-faculty-status-${faculty.id}`}>
                              {faculty.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-faculty">
                  {searchQuery ? "No faculty members found matching your search." : "No faculty members available yet."}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
