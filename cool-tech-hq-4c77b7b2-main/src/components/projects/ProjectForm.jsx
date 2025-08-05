
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Save, Home, Building2 } from "lucide-react";

export default function ProjectForm({ project, clients, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    project_name: project?.project_name || "",
    client_id: project?.client_id || "",
    site_address: project?.site_address || "",
    start_date: project?.start_date || "",
    end_date: project?.end_date || "",
    status: project?.status || "pending",
    estimated_value: project?.estimated_value || "",
    project_type: project?.project_type || "residential",
    notes: project?.notes || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    try {
      // Use site_address as project_name if site_address is provided
      const finalData = {
        ...formData,
        project_name: formData.site_address || formData.project_name,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null
      };
      await onSubmit(finalData);
    } catch (error) {
      console.error('Error submitting project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-0 shadow-2xl bg-white">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle className="text-xl font-bold text-slate-900">
          {project ? 'Edit Project' : 'New Project'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => handleChange('client_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="site_address">Project Address (Project Name)</Label>
              <Input
                id="site_address"
                value={formData.site_address}
                onChange={(e) => handleChange('site_address', e.target.value)}
                placeholder="Enter project address (this will be the project name)"
                required
              />
              <p className="text-xs text-slate-500">This address will be used as the project name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_value">Estimated Value</Label>
              <Input
                id="estimated_value"
                type="number"
                step="0.01"
                value={formData.estimated_value}
                onChange={(e) => handleChange('estimated_value', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label>Project Type</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="residential"
                    checked={formData.project_type === 'residential'}
                    onCheckedChange={(checked) => checked && handleChange('project_type', 'residential')}
                  />
                  <Label htmlFor="residential" className="flex items-center gap-2 cursor-pointer">
                    <Home className="w-4 h-4" />
                    Residential (No Tax)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="commercial"
                    checked={formData.project_type === 'commercial'}
                    onCheckedChange={(checked) => checked && handleChange('project_type', 'commercial')}
                  />
                  <Label htmlFor="commercial" className="flex items-center gap-2 cursor-pointer">
                    <Building2 className="w-4 h-4" />
                    Commercial (Taxable)
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Project details and notes..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
