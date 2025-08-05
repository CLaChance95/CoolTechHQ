
import React, { useState, useEffect } from "react";
import { Expense, Project, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import ExpenseForm from '../components/expenses/ExpenseForm';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [exps, projs, usrs] = await Promise.all([
        Expense.list('-expense_date'),
        Project.list(),
        User.list()
      ]);
      setExpenses(exps || []);
      setProjects(projs || []);
      setUsers(usrs || []);
    } catch (error) {
      console.error("Error loading expense data:", error);
    }
    setIsLoading(false);
  };
  
  const handleSubmit = async (expenseData) => {
    try {
      if(editingExpense) {
        await Expense.update(editingExpense.id, expenseData);
      } else {
        await Expense.create(expenseData);
      }
      setShowForm(false);
      setEditingExpense(null);
      loadData();
    } catch (error) {
      console.error("Failed to save expense:", error);
    }
  };

  const handleCreate = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  return (
    <div className="p-3 lg:p-6 space-y-4 lg:space-y-6 min-w-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-600 mt-1 text-sm lg:text-base">{expenses.length} total expenses logged</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 shadow-lg w-full lg:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Log Expense
        </Button>
      </div>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Expense</TableHead>
                <TableHead className="min-w-[100px]">Vendor</TableHead>
                <TableHead className="min-w-[80px]">Category</TableHead>
                <TableHead className="min-w-[100px]">Project</TableHead>
                <TableHead className="min-w-[80px]">Date</TableHead>
                <TableHead className="min-w-[80px]">Amount</TableHead>
                <TableHead className="min-w-[60px]">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(expenses || []).map(expense => {
                const project = (projects || []).find(p => p.id === expense.project_id);
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium text-xs lg:text-sm">{expense.expense_name}</TableCell>
                    <TableCell className="text-xs lg:text-sm">{expense.vendor}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{expense.category}</Badge></TableCell>
                    <TableCell className="truncate text-xs lg:text-sm">{project?.project_name || "N/A"}</TableCell>
                    <TableCell className="text-xs lg:text-sm">{format(new Date(expense.expense_date), "MMM d")}</TableCell>
                    <TableCell className="text-xs lg:text-sm">${(expense.amount || 0).toFixed(0)}</TableCell>
                    <TableCell>
                      {expense.receipt_url && (
                          <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="w-6 h-6 lg:w-8 lg:h-8"><Download className="w-3 h-3 lg:w-4 lg:h-4"/></Button>
                          </a>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <ExpenseForm 
            expense={editingExpense}
            projects={projects}
            users={users}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}
    </div>
  );
}
