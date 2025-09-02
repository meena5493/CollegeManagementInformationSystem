import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Presentation, Book, DollarSign, UserPlus, Edit, FileText } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddStudentModal } from "@/components/modals/add-student-modal";
import { AddMarksModal } from "@/components/modals/add-marks-modal";
import type { StudentWithUser } from "@shared/schema";

interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalFeeCollection: number;
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addMarksOpen, setAddMarksOpen] = useState(false);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentStudents = [] } = useQuery<StudentWithUser[]>({
    queryKey: ["/api/students"],
    select: (data) => data.slice(0, 5), // Show only recent 5 students
  });

  const statsCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      trend: "+12%",
      trendColor: "text-green-600",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Faculty Members",
      value: stats?.totalFaculty || 0,
      icon: Presentation,
      trend: "+5%",
      trendColor: "text-blue-600",
      bgColor: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      title: "Active Courses",
      value: stats?.totalCourses || 0,
      icon: Book,
      trend: "+3%",
      trendColor: "text-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Fee Collection",
      value: `₹${((stats?.totalFeeCollection || 0) / 100000).toFixed(1)}L`,
      icon: DollarSign,
      trend: "-2%",
      trendColor: "text-red-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  const quickActions = [
    {
      title: "Add Student",
      icon: UserPlus,
      color: "bg-primary/5 hover:bg-primary/10 border-primary/20",
      iconColor: "text-primary",
      onClick: () => setAddStudentOpen(true),
    },
    {
      title: "Enter Marks",
      icon: Edit,
      color: "bg-accent/5 hover:bg-accent/10 border-accent/20",
      iconColor: "text-accent",
      onClick: () => setAddMarksOpen(true),
    },
    {
      title: "Fee Collection",
      icon: DollarSign,
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      iconColor: "text-green-600",
      onClick: () => {},
    },
    {
      title: "Generate Report",
      icon: FileText,
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      iconColor: "text-purple-600",
      onClick: () => {},
    },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <Topbar
          title="Dashboard"
          subtitle="Welcome back, manage your college efficiently"
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`${stat.iconColor} w-6 h-6`} />
                      </div>
                      <Badge variant="secondary" className={`${stat.trendColor} bg-transparent`}>
                        {stat.trend}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-1" data-testid={`text-stat-value-${index}`}>
                      {stat.value}
                    </h3>
                    <p className="text-muted-foreground text-sm" data-testid={`text-stat-label-${index}`}>
                      {stat.title}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-quick-actions-title">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className={`p-4 h-auto flex flex-col items-center space-y-2 ${action.color} transition-colors group`}
                          onClick={action.onClick}
                          data-testid={`button-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <Icon className={`${action.iconColor} w-6 h-6 group-hover:scale-110 transition-transform`} />
                          <span className="text-sm font-medium text-foreground">{action.title}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-recent-activity-title">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserPlus className="text-primary w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">System initialized with sample data</p>
                      <p className="text-xs text-muted-foreground">Just now</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Book className="text-green-600 w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">Courses database updated</p>
                      <p className="text-xs text-muted-foreground">1 minute ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="text-blue-600 w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">Admin user logged in</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Students */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle data-testid="text-recent-students-title">Recent Students</CardTitle>
                  <Button variant="link" className="text-primary" data-testid="link-view-all-students">
                    View All
                  </Button>
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
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentStudents.length > 0 ? (
                        recentStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-student-${student.id}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                                  {student.user.firstName[0]}{student.user.lastName[0]}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-foreground" data-testid={`text-student-name-${student.id}`}>
                                    {student.user.firstName} {student.user.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground" data-testid={`text-student-id-${student.id}`}>
                                    {student.studentId}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" data-testid={`text-student-course-${student.id}`}>
                              {student.course.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={student.status === "active" ? "default" : "secondary"}
                                data-testid={`badge-student-status-${student.id}`}
                              >
                                {student.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground" data-testid="text-no-students">
                            No students enrolled yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Popular Courses */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle data-testid="text-popular-courses-title">Popular Courses</CardTitle>
                  <Button variant="link" className="text-primary" data-testid="link-view-all-courses">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <Book className="text-blue-600 w-4 h-4" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-foreground">Computer Science</p>
                              <p className="text-xs text-muted-foreground">CS101</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">0</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Progress value={0} className="w-16 mr-2" />
                            <span className="text-xs text-muted-foreground">0%</span>
                          </div>
                        </td>
                      </tr>
                      
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                              <Book className="text-green-600 w-4 h-4" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-foreground">Mathematics</p>
                              <p className="text-xs text-muted-foreground">MATH201</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">0</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Progress value={0} className="w-16 mr-2" />
                            <span className="text-xs text-muted-foreground">0%</span>
                          </div>
                        </td>
                      </tr>
                      
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                              <Book className="text-purple-600 w-4 h-4" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-foreground">Physics</p>
                              <p className="text-xs text-muted-foreground">PHY301</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">0</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Progress value={0} className="w-16 mr-2" />
                            <span className="text-xs text-muted-foreground">0%</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AddStudentModal open={addStudentOpen} onOpenChange={setAddStudentOpen} />
      <AddMarksModal open={addMarksOpen} onOpenChange={setAddMarksOpen} />
    </div>
  );
}
