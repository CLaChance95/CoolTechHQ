
import React, { useState, useEffect } from "react";
import { Project, Client } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  ChevronDown,
  Archive
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import ProjectForm from "../components/projects/ProjectForm";
import ProjectCard from "../components/projects/ProjectCard";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, clientsData] = await Promise.all([
        Project.list('-created_date'),
        Client.list()
      ]);
      setProjects(projectsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await Project.update(projectId, { status: newStatus });
      loadData();
    } catch (error) {
      console.error("Error updating project status:", error);
    }
  };

  const handleSubmit = async (projectData) => {
    try {
      if (editingProject) {
        await Project.update(editingProject.id, projectData);
      } else {
        await Project.create(projectData);
      }
      setShowForm(false);
      setEditingProject(null);
      loadData();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.client_name || 'Unknown Client';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      on_hold: 'bg-orange-100 text-orange-800 border-orange-300',
      completed: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const activeProjects = projects
    .filter(p => p.status !== 'completed')
    .filter(p => {
        const searchMatch = searchTerm ? (
            p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.site_address?.toLowerCase().includes(searchTerm.toLowerCase())
        ) : true;
        const statusMatch = statusFilter !== 'all' ? p.status === statusFilter : true;
        return searchMatch && statusMatch;
    });

  const completedProjects = projects.filter(p => p.status === 'completed');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 lg:p-6 space-y-4 lg:space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 truncate">Projects</h1>
          <p className="text-slate-600 mt-1 text-sm lg:text-base">{activeProjects.length} active projects</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg w-full lg:w-auto"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'in_progress', 'on_hold'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={`capitalize text-xs lg:text-sm ${statusFilter === status ? "bg-blue-600" : ""}`}
                >
                  {status === 'all' ? 'All Active' : status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {activeProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            clientName={getClientName(project.client_id)}
            onEdit={handleEdit}
            getStatusColor={getStatusColor}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {activeProjects.length === 0 && !isLoading && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No active projects found</h3>
            <p className="text-slate-500 mb-4">Get started by creating a new project.</p>
          </CardContent>
        </Card>
      )}
      
      {completedProjects.length > 0 && (
        <Collapsible open={isArchiveOpen} onOpenChange={setIsArchiveOpen} className="mt-8">
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-center gap-2 text-slate-600">
                    <Archive className="w-4 h-4" />
                    View Archived Projects ({completedProjects.length})
                    <ChevronDown className={`w-4 h-4 transition-transform ${isArchiveOpen ? 'rotate-180' : ''}`} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
                    {completedProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            clientName={getClientName(project.client_id)}
                            onEdit={handleEdit}
                            getStatusColor={getStatusColor}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
      )}

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ProjectForm
              project={editingProject}
              clients={clients}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
