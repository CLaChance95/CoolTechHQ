
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Project, Client, Task, Estimate, Invoice, Document, User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft,
  MapPin, 
  Calendar, 
  DollarSign, 
  Users,
  ClipboardList,
  FileText,
  Receipt,
  Plus,
  Edit,
  FileSignature,
  BrainCircuit,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import TaskForm from "../components/tasks/TaskForm";
import EstimateForm from "../components/estimates/EstimateForm";
import InvoiceForm from "../components/invoices/InvoiceForm";
import ProjectDocumentList from "../components/projects/ProjectDocumentList";

export default function ProjectDetails() {
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEstimateForm, setShowEstimateForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [isSuggestingTasks, setIsSuggestingTasks] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [suggestionSource, setSuggestionSource] = useState('');

  const location = useLocation();
  const projectId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      const allProjects = await Project.list();
      const currentProject = allProjects.find(p => p.id === projectId);
      setProject(currentProject);
      setProjects(allProjects);

      if (currentProject) {
        const [
          allClients,
          allTasks,
          allEstimates,
          allInvoices,
          allDocuments,
          allUsers
        ] = await Promise.all([
          Client.list(),
          Task.list(),
          Estimate.list(),
          Invoice.list(),
          Document.list(),
          User.list()
        ]);
        setClient(allClients.find(c => c.id === currentProject.client_id));
        setTasks(allTasks.filter(t => t.project_id === projectId));
        setEstimates(allEstimates.filter(e => e.project_id === projectId));
        setInvoices(allInvoices.filter(i => i.project_id === projectId));
        setDocuments(allDocuments.filter(d => d.project_id === projectId));
        setUsers(allUsers);
        setClients(allClients);
      }
    } catch (error) {
      console.error('Error loading project details:', error);
    }
    setIsLoading(false);
  };
  
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      on_hold: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      to_do: 'bg-gray-100 text-gray-800',
      complete: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  // Task Handlers
  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await Task.update(editingTask.id, taskData);
      } else {
        await Task.create({ ...taskData, project_id: projectId });
      }
      setShowTaskForm(false);
      setEditingTask(null);
      loadProjectData();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Estimate Handlers
  const handleEstimateSubmit = async (estimateData) => {
    try {
      if (editingEstimate) {
        await Estimate.update(editingEstimate.id, estimateData);
      } else {
         const currentYear = new Date().getFullYear();
        const allEstimates = await Estimate.list('-estimate_number');
        let lastNum = 0;
        const lastEstimateThisYear = allEstimates.find(est => 
          est.estimate_number && est.estimate_number.startsWith(`EST-${currentYear}-`)
        );

        if (lastEstimateThisYear) {
          const parts = lastEstimateThisYear.estimate_number.split('-');
          if (parts.length === 3) lastNum = parseInt(parts[2], 10);
        }
        
        const newNum = (lastNum + 1).toString().padStart(4, '0');
        const newEstimateNumber = `EST-${currentYear}-${newNum}`;
        await Estimate.create({ ...estimateData, estimate_number: newEstimateNumber, project_id: projectId });
      }
      setShowEstimateForm(false);
      setEditingEstimate(null);
      loadProjectData();
    } catch (error) {
      console.error('Error saving estimate:', error);
    }
  };

  const handleNewEstimate = () => {
    setEditingEstimate(null);
    setShowEstimateForm(true);
  };

  const handleEditEstimate = (estimate) => {
    setEditingEstimate(estimate);
    setShowEstimateForm(true);
  };

  // Invoice Handlers
  const handleInvoiceSubmit = async (invoiceData) => {
    try {
      if (editingInvoice) {
        await Invoice.update(editingInvoice.id, invoiceData);
      } else {
        const currentYear = new Date().getFullYear();
        const allInvoices = await Invoice.list('-invoice_number'); 
        let lastNum = 0;
        const lastInvoiceThisYear = allInvoices.find(inv => 
          inv.invoice_number && inv.invoice_number.startsWith(`INV-${currentYear}-`)
        );

        if (lastInvoiceThisYear) {
          const parts = lastInvoiceThisYear.invoice_number.split('-');
          if (parts.length === 3) {
            lastNum = parseInt(parts[2], 10);
          }
        }
        
        const newNum = (lastNum + 1).toString().padStart(4, '0');
        const newInvoiceNumber = `INV-${currentYear}-${newNum}`;
        await Invoice.create({ ...invoiceData, invoice_number: newInvoiceNumber, project_id: projectId });
      }
      setShowInvoiceForm(false);
      setEditingInvoice(null);
      loadProjectData();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
  };

  // AI Task Suggestion Handlers
  const generateSuggestions = async (document, type) => {
      if (!document.notes || document.notes.trim() === '') {
          alert('There are no notes on this document to generate tasks from.');
          return;
      }
      setSuggestionSource(`from ${type} #${document.estimate_number || document.invoice_number}`);
      setIsSuggestingTasks(true);
      setSuggestions([]);
      setSelectedSuggestions([]);
      setShowSuggestionModal(true);

      try {
          const prompt = `Based on the following notes from an HVAC project ${type}, extract a list of actionable tasks for a technician. The notes are: "${document.notes}". Return a JSON object with a key "tasks", which is an array of objects. Each task object should have a "task_title" and "notes" property.`;
          const schema = {
              type: 'object',
              properties: {
                  tasks: {
                      type: 'array',
                      items: {
                          type: 'object',
                          properties: {
                              task_title: { type: 'string', description: 'A clear, concise title for the task.' },
                              notes: { type: 'string', description: 'A brief description or notes for the task, derived from the source.' },
                          },
                          required: ['task_title'],
                      },
                  },
              },
          };

          const result = await InvokeLLM({ prompt, response_json_schema: schema });
          setSuggestions(result.tasks || []);
      } catch (error) {
          console.error("Error generating task suggestions:", error);
          alert("Failed to generate task suggestions. The AI might be having trouble understanding the notes.");
          setShowSuggestionModal(false);
      } finally {
          setIsSuggestingTasks(false);
      }
  };

  const handleToggleSuggestion = (task, isChecked) => {
      if (isChecked) {
          setSelectedSuggestions(prev => [...prev, task]);
      } else {
          setSelectedSuggestions(prev => prev.filter(s => s.task_title !== task.task_title));
      }
  };

  const handleCreateTasks = async () => {
      if (selectedSuggestions.length === 0) {
          alert("Please select at least one task to create.");
          return;
      }
      try {
          const tasksToCreate = selectedSuggestions.map(t => ({
              ...t,
              project_id: projectId,
              status: 'to_do',
              priority: 'medium',
          }));
          await Task.bulkCreate(tasksToCreate);
          setShowSuggestionModal(false);
          loadProjectData();
      } catch (error) {
          console.error("Error creating tasks:", error);
          alert("Failed to create tasks. Please try again.");
      }
  };


  if (isLoading) return <div className="p-6">Loading project details...</div>;
  if (!project) return <div className="p-6">Project not found.</div>;

  return (
    <div className="p-3 lg:p-6 space-y-4 lg:space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1 min-w-0">
          <Link to={createPageUrl("Projects")} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 truncate">{project.project_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
            <Badge variant={project.project_type === 'residential' ? 'secondary' : 'default'}>
              {project.project_type}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
          <Button onClick={handleNewTask} variant="outline" size="sm" className="text-xs lg:text-sm">
            <Plus className="w-4 h-4 mr-1 lg:mr-2" />
            New Task
          </Button>
          <Button onClick={handleNewEstimate} variant="outline" size="sm" className="text-xs lg:text-sm">
            <FileSignature className="w-4 h-4 mr-1 lg:mr-2" />
            New Estimate
          </Button>
          <Button onClick={handleNewInvoice} variant="outline" size="sm" className="text-xs lg:text-sm">
            <Receipt className="w-4 h-4 mr-1 lg:mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Project Info Card - Now at top */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader><CardTitle>Project Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-slate-500"/>
              <div>
                <p className="text-xs text-slate-500">Client</p>
                <Link to={createPageUrl(`ClientDetails?id=${client?.id}`)} className="font-medium text-blue-600 hover:underline">{client?.client_name}</Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-500"/>
              <div>
                <p className="text-xs text-slate-500">Address</p>
                <span className="font-medium">{project.site_address}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-500"/>
              <div>
                <p className="text-xs text-slate-500">Timeline</p>
                <span className="font-medium">{format(new Date(project.start_date), 'MMM d, yyyy')} - {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : 'Ongoing'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-slate-500"/>
              <div>
                <p className="text-xs text-slate-500">Est. Value</p>
                <span className="font-medium">${project.estimated_value?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>
          {project.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-slate-500 mb-2">Notes</p>
              <p className="text-sm text-slate-600">{project.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5"/>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <ul className="space-y-2">
                {tasks.map(task => (
                  <li key={task.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50">
                    <div>
                      <p className="font-semibold">{task.task_title}</p>
                      <p className="text-sm text-slate-500">
                        {task.due_date ? `Due: ${format(new Date(task.due_date), 'MMM d')}` : 'No due date'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}>
                        <Edit className="w-4 h-4"/>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-500 text-center py-4">No tasks for this project.</p>}
          </CardContent>
        </Card>

        {/* Estimates */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileSignature className="w-5 h-5"/>Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            {estimates.length > 0 ? (
              <ul className="space-y-2">
                {estimates.map(estimate => (
                  <li key={estimate.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50">
                    <div>
                      <p className="font-semibold">{estimate.estimate_number}</p>
                      <p className="text-sm text-slate-500">${(estimate.total_amount || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => generateSuggestions(estimate, 'estimate')} title="Suggest tasks from notes">
                        <BrainCircuit className="w-4 h-4 text-blue-500"/>
                      </Button>
                      <Badge className={getStatusColor(estimate.status)}>{estimate.status}</Badge>
                       <Button variant="ghost" size="icon" onClick={() => handleEditEstimate(estimate)}>
                        <Edit className="w-4 h-4"/>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-500 text-center py-4">No estimates for this project.</p>}
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5"/>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <ul className="space-y-2">
                {invoices.map(invoice => (
                  <li key={invoice.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50">
                    <div>
                      <p className="font-semibold">{invoice.invoice_number}</p>
                      <p className="text-sm text-slate-500">${(invoice.total_amount || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => generateSuggestions(invoice, 'invoice')} title="Suggest tasks from notes">
                        <BrainCircuit className="w-4 h-4 text-blue-500"/>
                      </Button>
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                       <Button variant="ghost" size="icon" onClick={() => handleEditInvoice(invoice)}>
                        <Edit className="w-4 h-4"/>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-500 text-center py-4">No invoices for this project.</p>}
          </CardContent>
        </Card>
        
        {/* Documents */}
        <div className="lg:col-span-2">
          <ProjectDocumentList documents={documents} users={users} />
        </div>
      </div>
      
      {/* Task Suggestion Modal */}
      {showSuggestionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
                  <CardHeader className="border-b">
                      <CardTitle className="flex items-center gap-2">
                          <BrainCircuit className="w-5 h-5 text-blue-600"/>
                          Task Suggestions
                      </CardTitle>
                      <p className="text-sm text-slate-500">Generated {suggestionSource}</p>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 overflow-y-auto">
                      {isSuggestingTasks ? (
                          <div className="flex items-center justify-center h-full">
                              <Loader2 className="w-8 h-8 animate-spin text-blue-600"/>
                              <p className="ml-4">Generating suggestions...</p>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {suggestions.length > 0 ? (
                                  suggestions.map((task, index) => (
                                      <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 border">
                                          <Checkbox 
                                              id={`task-${index}`} 
                                              className="mt-1"
                                              onCheckedChange={(checked) => handleToggleSuggestion(task, checked)}
                                          />
                                          <div className="flex-1">
                                              <label htmlFor={`task-${index}`} className="font-semibold text-slate-800">{task.task_title}</label>
                                              <p className="text-sm text-slate-600">{task.notes}</p>
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <p className="text-center text-slate-500">No tasks could be suggested from the notes.</p>
                              )}
                          </div>
                      )}
                  </CardContent>
                  <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowSuggestionModal(false)}>Cancel</Button>
                      <Button 
                          onClick={handleCreateTasks} 
                          disabled={isSuggestingTasks || selectedSuggestions.length === 0}
                          className="bg-blue-600 hover:bg-blue-700"
                      >
                          <Plus className="w-4 h-4 mr-2"/>
                          Create {selectedSuggestions.length > 0 ? `${selectedSuggestions.length} Task(s)` : 'Tasks'}
                      </Button>
                  </div>
              </Card>
          </div>
      )}

      {/* Other Modals */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <TaskForm 
              task={editingTask}
              projects={projects}
              users={users}
              onSubmit={handleTaskSubmit}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
              defaultProjectId={projectId}
            />
          </div>
        </div>
      )}

      {showEstimateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <EstimateForm 
              estimate={editingEstimate}
              clients={clients}
              projects={projects}
              onSubmit={handleEstimateSubmit}
              onCancel={() => {
                setShowEstimateForm(false);
                setEditingEstimate(null);
              }}
              defaultProject={project}
            />
          </div>
        </div>
      )}

      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <InvoiceForm
              invoice={editingInvoice}
              clients={clients}
              projects={projects}
              onSubmit={handleInvoiceSubmit}
              onCancel={() => {
                setShowInvoiceForm(false);
                setEditingInvoice(null);
              }}
              defaultProject={project}
            />
          </div>
        </div>
      )}
    </div>
  );
}
