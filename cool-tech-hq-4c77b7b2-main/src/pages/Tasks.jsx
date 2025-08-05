
import React, { useState, useEffect } from "react";
import { Task, Project, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ChevronDown, Archive } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import TaskForm from "../components/tasks/TaskForm";
import TaskCard from "../components/tasks/TaskCard";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true); // Set loading to true when data fetching starts
    try {
      const [tasksData, projectsData, usersData] = await Promise.all([
        Task.list('-created_date'),
        Project.list(),
        User.list()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };
  
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await Task.update(taskId, { status: newStatus });
      loadData(); // Reload data to reflect the change
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await Task.update(editingTask.id, taskData);
      } else {
        await Task.create(taskData);
      }
      setShowForm(false);
      setEditingTask(null);
      loadData();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  if (isLoading) {
    return <div className="p-6">Loading tasks...</div>;
  }

  const getFilteredTasks = () => {
    let filtered = tasks;
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.task_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Note: statusFilter now applies to both active and completed task sections
    // If you want filters to only apply to active tasks, this logic would need adjustment.
    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const activeTasks = filteredTasks.filter(t => t.status !== 'complete');
  const completedTasks = filteredTasks.filter(t => t.status === 'complete');


  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 truncate">Tasks</h1>
          <p className="text-slate-600 mt-1">{activeTasks.length} active tasks</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg w-full lg:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'to_do', 'in_progress', 'complete'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={`${statusFilter === status ? "bg-blue-600" : ""} text-xs lg:text-sm`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {activeTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            project={projects.find(p => p.id === task.project_id)}
            assignedUser={users.find(u => u.id === task.assigned_to)}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {activeTasks.length === 0 && !isLoading && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm text-center p-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No active tasks found</h3>
            <p className="text-slate-500 mb-4">Click "New Task" to get started.</p>
        </Card>
      )}

      {/* Completed Tasks Archive */}
      {completedTasks.length > 0 && (
        <Collapsible open={isArchiveOpen} onOpenChange={setIsArchiveOpen} className="mt-8">
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-center gap-2 text-slate-600">
                    <Archive className="w-4 h-4" />
                    View Completed Tasks ({completedTasks.length})
                    <ChevronDown className={`w-4 h-4 transition-transform ${isArchiveOpen ? 'rotate-180' : ''}`} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {completedTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            project={projects.find(p => p.id === task.project_id)}
                            assignedUser={users.find(u => u.id === task.assigned_to)}
                            onEdit={handleEdit}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
      )}
      
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <TaskForm
              task={editingTask}
              projects={projects}
              users={users}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
