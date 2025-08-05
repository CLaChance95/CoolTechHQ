import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadFile } from '@/api/integrations';
import { X, Save, Upload } from 'lucide-react';
import { format } from 'date-fns';

export default function ExpenseForm({ expense, projects, users, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    expense_name: expense?.expense_name || '',
    vendor: expense?.vendor || '',
    category: expense?.category || 'materials',
    expense_date: expense?.expense_date || format(new Date(), 'yyyy-MM-dd'),
    amount: expense?.amount || '',
    project_id: expense?.project_id || '',
    receipt_url: expense?.receipt_url || '',
    tax_deductible: expense?.tax_deductible !== undefined ? expense.tax_deductible : true,
    paid_by: expense?.paid_by || '',
    notes: expense?.notes || ''
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleChange('receipt_url', file_url);
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert('Failed to upload receipt');
    }
    setIsUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0
    };
    onSubmit(finalData);
  };

  return (
    <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white">
      <CardHeader className="border-b flex flex-row justify-between items-center">
        <CardTitle className="text-xl font-bold">
          {expense ? 'Edit Expense' : 'Log New Expense'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Expense Name</Label>
              <Input
                value={formData.expense_name}
                onChange={(e) => handleChange('expense_name', e.target.value)}
                placeholder="What was purchased?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input
                value={formData.vendor}
                onChange={(e) => handleChange('vendor', e.target.value)}
                placeholder="Where was it purchased?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.expense_date}
                onChange={(e) => handleChange('expense_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={formData.project_id} onValueChange={(v) => handleChange('project_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  {(projects || []).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Paid By</Label>
              <Select value={formData.paid_by} onValueChange={(v) => handleChange('paid_by', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent>
                  {(users || []).map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Receipt</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  disabled={isUploading}
                />
                {formData.receipt_url && (
                  <Button type="button" variant="outline" size="sm" asChild>
                    <a href={formData.receipt_url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                )}
              </div>
              {isUploading && <p className="text-xs text-blue-600">Uploading...</p>}
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Checkbox
                id="tax_deductible"
                checked={formData.tax_deductible}
                onCheckedChange={(checked) => handleChange('tax_deductible', checked)}
              />
              <Label htmlFor="tax_deductible">Tax Deductible</Label>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes about this expense..."
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
              {expense ? 'Update Expense' : 'Log Expense'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}