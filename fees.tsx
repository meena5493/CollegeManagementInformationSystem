import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Plus, CreditCard, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { FeesWithStudent, StudentWithUser } from "@shared/schema";

const paymentSchema = z.object({
  amount: z.string().min(1, "Payment amount is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
});

type PaymentData = z.infer<typeof paymentSchema>;

export default function Fees() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeesWithStudent | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fees = [], isLoading } = useQuery<FeesWithStudent[]>({
    queryKey: ["/api/fees"],
  });

  const { data: students = [] } = useQuery<StudentWithUser[]>({
    queryKey: ["/api/students"],
    enabled: user?.role === "admin",
  });

  const form = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "",
      paymentDate: "",
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentData & { feeId: string }) => {
      const paidAmount = parseFloat(data.amount);
      const existingPaid = parseFloat(selectedFee?.paidAmount || "0");
      const totalAmount = parseFloat(selectedFee?.totalAmount || "0");
      const newPaidAmount = existingPaid + paidAmount;
      
      let status = "partial";
      if (newPaidAmount >= totalAmount) {
        status = "paid";
      } else if (newPaidAmount === 0) {
        status = "pending";
      }

      const response = await apiRequest("PATCH", `/api/fees/${data.feeId}`, {
        paidAmount: newPaidAmount.toString(),
        paymentDate: data.paymentDate,
        status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      setPaymentModalOpen(false);
      setSelectedFee(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const filteredFees = fees.filter(fee => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      fee.student.user.firstName.toLowerCase().includes(query) ||
      fee.student.user.lastName.toLowerCase().includes(query) ||
      fee.student.studentId.toLowerCase().includes(query) ||
      fee.academicYear.toLowerCase().includes(query)
    );
    
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRecordPayment = (fee: FeesWithStudent) => {
    setSelectedFee(fee);
    const remainingAmount = parseFloat(fee.totalAmount) - parseFloat(fee.paidAmount);
    form.setValue("amount", remainingAmount.toString());
    form.setValue("paymentDate", new Date().toISOString().split('T')[0]);
    setPaymentModalOpen(true);
  };

  const onPaymentSubmit = (data: PaymentData) => {
    if (selectedFee) {
      paymentMutation.mutate({ ...data, feeId: selectedFee.id });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "partial": return "secondary";
      case "overdue": return "destructive";
      default: return "outline";
    }
  };

  const canManageFees = user?.role === "admin";

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <Topbar
          title="Fees"
          subtitle="Manage student fee payments and records"
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <CardTitle data-testid="text-fees-title">
                    Fee Records ({filteredFees.length})
                  </CardTitle>
                  
                  {canManageFees && (
                    <Button data-testid="button-add-fee">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Fee Record
                    </Button>
                  )}
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search fees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-search-fees"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
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
                        Academic Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Paid Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      {canManageFees && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr>
                        <td colSpan={canManageFees ? 8 : 7} className="px-6 py-8 text-center text-muted-foreground" data-testid="text-loading">
                          Loading fee records...
                        </td>
                      </tr>
                    ) : filteredFees.length > 0 ? (
                      filteredFees.map((fee) => {
                        const balance = parseFloat(fee.totalAmount) - parseFloat(fee.paidAmount);
                        
                        return (
                          <tr 
                            key={fee.id} 
                            className="hover:bg-muted/30 transition-colors"
                            data-testid={`row-fee-${fee.id}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                                  {fee.student.user.firstName[0]}{fee.student.user.lastName[0]}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-foreground" data-testid={`text-student-name-${fee.id}`}>
                                    {fee.student.user.firstName} {fee.student.user.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground" data-testid={`text-student-id-${fee.id}`}>
                                    {fee.student.studentId}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-foreground" data-testid={`text-academic-year-${fee.id}`}>
                                  {fee.academicYear}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Semester {fee.semester}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground" data-testid={`text-total-amount-${fee.id}`}>
                              ₹{parseFloat(fee.totalAmount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600" data-testid={`text-paid-amount-${fee.id}`}>
                              ₹{parseFloat(fee.paidAmount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground" data-testid={`text-balance-${fee.id}`}>
                              ₹{balance.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" data-testid={`text-due-date-${fee.id}`}>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span>{new Date(fee.dueDate).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={getStatusVariant(fee.status)} data-testid={`badge-status-${fee.id}`}>
                                {fee.status}
                              </Badge>
                            </td>
                            {canManageFees && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                <div className="flex space-x-2">
                                  {fee.status !== "paid" && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleRecordPayment(fee)}
                                      data-testid={`button-record-payment-${fee.id}`}
                                    >
                                      <CreditCard className="w-3 h-3 mr-1" />
                                      Record Payment
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    data-testid={`button-view-${fee.id}`}
                                  >
                                    View
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={canManageFees ? 8 : 7} className="px-6 py-8 text-center text-muted-foreground" data-testid="text-no-fees">
                          {searchQuery || statusFilter ? "No fee records found matching your filters." : "No fee records available yet."}
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

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-md" data-testid="modal-record-payment">
          <DialogHeader>
            <DialogTitle data-testid="text-modal-title">Record Payment</DialogTitle>
          </DialogHeader>
          
          {selectedFee && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">
                  {selectedFee.student.user.firstName} {selectedFee.student.user.lastName}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="ml-2 font-medium">₹{parseFloat(selectedFee.totalAmount).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Paid:</span>
                    <span className="ml-2 font-medium text-green-600">₹{parseFloat(selectedFee.paidAmount).toLocaleString()}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="ml-2 font-medium">₹{(parseFloat(selectedFee.totalAmount) - parseFloat(selectedFee.paidAmount)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onPaymentSubmit)} className="space-y-4" data-testid="form-record-payment">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Enter payment amount" 
                            {...field} 
                            data-testid="input-payment-amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-payment-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setPaymentModalOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={paymentMutation.isPending}
                      data-testid="button-submit"
                    >
                      {paymentMutation.isPending ? "Recording..." : "Record Payment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
