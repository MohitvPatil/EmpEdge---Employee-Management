"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, CreditCard as Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  contact: string;
}

interface FormData {
  name: string;
  email: string;
  position: string;
  contact: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  position?: string;
  contact?: string;
}

export default function EmployeeDashboard() {
  // State
  const [employees, setEmployees] = useState<Employee[]>([]); // line ~14
  const [searchTerm, setSearchTerm] = useState('');           // line ~15
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', position: '', contact: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  // Filter employees based on search term

  const filteredEmployees = Array.isArray(employees)
  ? employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];

  // Validation function
  const validateForm = (data: FormData): FormErrors => {
    const errors: FormErrors = {};
    
    if (!data.name.trim()) errors.name = 'Name is required';
    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!data.position.trim()) errors.position = 'Position is required';
    if (!data.contact.trim()) {
      errors.contact = 'Contact is required';
    } else if (!/^\d{10}$/.test(data.contact.replace(/[\s\-\(\)]/g, ''))) {
      errors.contact = 'Contact must be exactly 10 digits';
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = () => {
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (editingEmployee) {
        // Update existing employee
        fetch(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
          .then(res => res.json())
          .then(() => {
            setEmployees(prev =>
              prev.map(emp => (emp.id === editingEmployee.id ? { ...emp, ...formData } : emp))
            );
            handleCloseModal();
          })
          .catch(err => console.error(err));
      } else {
        // Add new employee
        fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
          .then(res => res.json())
          .then(data => {
            const newEmployee: Employee = { id: data.id.toString(), ...formData };
            setEmployees(prev => [...prev, newEmployee]);
            handleCloseModal();
          })
          .catch(err => console.error(err));
      }
    }
  };

  // Handle opening modal for adding new employee
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setFormData({ name: '', email: '', position: '', contact: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle opening modal for editing employee
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      position: employee.position,
      contact: employee.contact,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({ name: '', email: '', position: '', contact: '' });
    setFormErrors({});
  };

  // Handle delete confirmation
  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  // Handle actual deletion
  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      fetch(`/api/employees/${employeeToDelete.id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
          setIsDeleteDialogOpen(false);
          setEmployeeToDelete(null);
        })
        .catch(err => console.error(err));
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <User className="h-6 w-6 text-teal-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                EmpEdge - Employee Management
              </h1>
            </div>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              {employees.length} Employee{employees.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
                <p className="text-gray-600 mt-1">Manage your team members</p>
              </div>
              <Button onClick={handleAddEmployee} className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search employees by name or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Employee Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Position</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Contact</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{employee.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-600">{employee.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            {employee.position}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-600">{employee.contact}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                              className="hover:bg-blue-50 hover:border-blue-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(employee)}
                              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        {searchTerm ? 'No employees found matching your search criteria.' : 'No employees found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Employee Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={formErrors.name ? 'border-red-500' : ''}
                placeholder="Enter full name"
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={formErrors.email ? 'border-red-500' : ''}
                placeholder="Enter email address"
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className={formErrors.position ? 'border-red-500' : ''}
                placeholder="Enter job position"
              />
              {formErrors.position && (
                <p className="text-sm text-red-500">{formErrors.position}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact *</Label>
              <Input
                id="contact"
                type="tel"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                className={formErrors.contact ? 'border-red-500' : ''}
                placeholder="Enter phone number"
              />
              {formErrors.contact && (
                <p className="text-sm text-red-500">{formErrors.contact}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
              {editingEmployee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {employeeToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
