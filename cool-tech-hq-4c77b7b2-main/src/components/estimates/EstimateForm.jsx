
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function EstimateForm({ estimate, clients, projects, onSubmit, onCancel, defaultProject }) {
  const [formData, setFormData] = useState({
    client_id: estimate?.client_id || defaultProject?.client_id || '',
    project_id: estimate?.project_id || defaultProject?.id || '',
    issue_date: estimate?.issue_date || format(new Date(), 'yyyy-M-dd'),
    expiry_date: estimate?.expiry_date || format(addDays(new Date(), 30), 'yyyy-M-dd'),
    status: estimate?.status || 'draft',
    line_items: estimate?.line_items || [{ description: '', quantity: 1, unit_price: 0 }],
    notes: estimate?.notes || '',
    photos: estimate?.photos || []
  });
  
  const [totals, setTotals] = useState({ subtotal: 0, tax_amount: 0, total_amount: 0 });
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    calculateTotals();
  }, [formData.line_items, selectedProject]);

  useEffect(() => {
    if (formData.project_id) {
      const project = (projects || []).find(p => p.id === formData.project_id);
      setSelectedProject(project);
    } else if (defaultProject) {
        setSelectedProject(defaultProject);
    }
  }, [formData.project_id, projects, defaultProject]);
  
  const handleChange = (field, value) => setFormData(prev => ({...prev, [field]: value}));

  const handleLineItemChange = (index, field, value) => {
    const items = [...formData.line_items];
    items[index][field] = value;
    handleChange('line_items', items);
  };
  
  const addLineItem = () => handleChange('line_items', [...formData.line_items, { description: '', quantity: 1, unit_price: 0 }]);
  const removeLineItem = (index) => handleChange('line_items', formData.line_items.filter((_, i) => i !== index));

  const calculateTotals = () => {
    let subtotal = 0;
    
    formData.line_items.forEach(item => {
      subtotal += (item.quantity || 0) * (item.unit_price || 0);
    });
    
    // Check if project is commercial for tax calculation
    const isCommercial = selectedProject?.project_type === 'commercial';
    const SALES_TAX_RATE = isCommercial ? 0.0825 : 0;
    
    const tax_amount = subtotal * SALES_TAX_RATE;
    const total_amount = subtotal + tax_amount;
    setTotals({ subtotal, tax_amount, total_amount, tax_rate: SALES_TAX_RATE });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...formData, ...totals };
    onSubmit(finalData);
  };
  
  return (
    <div className="w-full max-w-4xl max-h-[90vh] flex flex-col">
      <Card className="border-0 shadow-2xl bg-white flex-1 flex-col">
        <CardHeader className="border-b flex flex-row justify-between items-center flex-shrink-0">
            <CardTitle className="text-xl font-bold">
              {estimate ? 'Edit Estimate' : 'Create New Estimate'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5"/>
            </Button>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select value={formData.client_id} onValueChange={v => handleChange('client_id', v)} required>
                      <SelectTrigger><SelectValue placeholder="Select client..."/></SelectTrigger>
                      <SelectContent>{(clients || []).map(c => <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={formData.project_id} onValueChange={v => handleChange('project_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Select project..."/></SelectTrigger>
                      <SelectContent>{(projects || []).filter(p => p.client_id === formData.client_id).map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.project_name} ({p.project_type === 'residential' ? 'Residential - No Tax' : 'Commercial - Taxable'})
                        </SelectItem>
                      ))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input type="date" value={formData.issue_date} onChange={e => handleChange('issue_date', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input type="date" value={formData.expiry_date} onChange={e => handleChange('expiry_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                      <SelectTrigger><SelectValue placeholder="Select status..."/></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                {selectedProject && (
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedProject.project_type === 'residential' ? 'secondary' : 'default'}>
                      {selectedProject.project_type === 'residential' ? 'Residential - Tax Free' : 'Commercial - Taxable'}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-lg font-semibold">Line Items</Label>
                <div className="mt-2 space-y-3">
                  {formData.line_items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end p-3 border rounded-lg bg-slate-50">
                      <div className="flex-1">
                        <Input 
                          placeholder="Description" 
                          value={item.description} 
                          onChange={e => handleLineItemChange(index, 'description', e.target.value)} 
                        />
                      </div>
                      <div className="w-20">
                        <Input 
                          type="number" 
                          placeholder="Qty" 
                          value={item.quantity} 
                          onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} 
                        />
                      </div>
                      <div className="w-24">
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="Price" 
                          value={item.unit_price} 
                          onChange={e => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)} 
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(index)}>
                        <Trash2 className="w-4 h-4 text-red-500"/>
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="mt-3">
                  <Plus className="w-4 h-4 mr-2"/>Add Item
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={formData.notes} 
                  onChange={e => handleChange('notes', e.target.value)}
                  placeholder="Additional notes for the estimate..."
                  rows={3}
                />
              </div>
            </CardContent>
          </div>
          <CardFooter className="bg-slate-50 border-t p-6 flex-shrink-0">
            <div className="w-full flex justify-between items-end">
                <div>
                     <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                </div>
                <div className="w-1/3 space-y-2 text-right">
                    <div className="flex justify-between font-medium">
                      <p>Subtotal:</p>
                      <p>${totals.subtotal.toFixed(2)}</p>
                    </div>
                    {totals.tax_rate > 0 && (
                      <div className="flex justify-between text-sm">
                        <p>Tax ({(totals.tax_rate * 100).toFixed(2)}%):</p>
                        <p>${totals.tax_amount.toFixed(2)}</p>
                      </div>
                    )}
                    {totals.tax_rate === 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <p>Tax (Residential):</p>
                        <p>$0.00</p>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                      <p>Total:</p>
                      <p>${totals.total_amount.toFixed(2)}</p>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Save Estimate
                      </Button>
                    </div>
                </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
