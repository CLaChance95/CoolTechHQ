import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AppointmentForm({ projects, clients, users, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    start_time: '',
    end_time: '',
    project_id: '',
    client_id: '',
    assigned_to: [],
    type: 'site_visit',
    status: 'scheduled',
    notes: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString()
    };
    onSubmit(finalData);
  };

  const generateEndTime = (startTime) => {
    if (!startTime) return '';
    const start = new Date(startTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour
    return format(end, "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white">
      <CardHeader className="border-b flex flex-row justify-between items-center">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          New Appointment
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Appointment title"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => {
                  handleChange('start_time', e.target.value);
                  if (!formData.end_time) {
                    handleChange('end_time', generateEndTime(e.target.value));
                  }
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site_visit">Site Visit</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={formData.client_id} onValueChange={(v) => handleChange('client_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent>
                  {(clients || []).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Project</Label>
              <Select value={formData.project_id} onValueChange={(v) => handleChange('project_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  {(projects || []).filter(p => !formData.client_id || p.client_id === formData.client_id).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Appointment details and notes..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Create Appointment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}