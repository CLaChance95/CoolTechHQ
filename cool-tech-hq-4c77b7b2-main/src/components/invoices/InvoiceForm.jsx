
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function InvoiceForm({ invoice, clients, projects, onSubmit, onCancel, defaultProject }) {
  const [formData, setFormData] = useState({
    client_id: invoice?.client_id || defaultProject?.client_id || '',
    project_id: invoice?.project_id || defaultProject?.id || '',
    issue_date: invoice?.issue_date || format(new Date(), 'yyyy-MM-dd'),
    due_date: invoice?.due_date || '',
    status: invoice?.status || 'draft',
    line_items: invoice?.line_items || [{ description: '', quantity: 1, unit_price: 0, taxable: true }],
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
  
  const addLineItem = () => handleChange('line_items', [...formData.line_items, { description: '', quantity: 1, unit_price: 0, taxable: true }]);
  const removeLineItem = (index) => handleChange('line_items', formData.line_items.filter((_, i) => i !== index));

  const calculateTotals = () => {
    let subtotal = 0;
    let taxableTotal = 0;
    
    // Check if project is residential (no tax) or commercial (taxable)
    const isResidential = selectedProject?.project_type === 'residential';
    const SALES_TAX_RATE = isResidential ? 0 : 0.0825;
    
    formData.line_items.forEach(item => {
      const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
      subtotal += itemTotal;
      if (item.taxable && !isResidential) {
        taxableTotal += itemTotal;
      }
    });
    
    const tax_amount = taxableTotal * SALES_TAX_RATE;
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
      <Card className="border-0 shadow-2xl bg-white flex-1 flex flex-col">
        <CardHeader className="border-b flex flex-row justify-between items-center flex-shrink-0">
            <CardTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5"/></Button>
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
                  <Label>Due Date</Label>
                  <Input type="date" value={formData.due_date} onChange={e => handleChange('due_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
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
                    <div key={index} className="flex gap-2 items-end p-2 border rounded-lg">
                      <Input placeholder="Description" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} className="flex-grow"/>
                      <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value))} className="w-20"/>
                      <Input type="number" placeholder="Price" value={item.unit_price} onChange={e => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value))} className="w-24"/>
                      {!selectedProject || selectedProject.project_type === 'commercial' ? (
                        <div className="flex items-center space-x-2 pb-2">
                          <Checkbox checked={item.taxable} onCheckedChange={c => handleLineItemChange(index, 'taxable', c)}/>
                          <Label>Tax</Label>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 pb-2">
                          <Badge variant="secondary" className="text-xs">Tax Free</Badge>
                        </div>
                      )}
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(index)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="mt-3"><Plus className="w-4 h-4 mr-2"/>Add Item</Button>
              </div>
            </CardContent>
          </div>
          <CardFooter className="bg-slate-50 border-t p-6 flex-shrink-0">
            <div className="w-full flex justify-between items-end">
                <div>
                     <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                </div>
                <div className="w-1/3 space-y-2 text-right">
                    <div className="flex justify-between font-medium"><p>Subtotal:</p><p>${totals.subtotal.toFixed(2)}</p></div>
                    {totals.tax_rate > 0 && (
                      <div className="flex justify-between text-sm"><p>Tax ({ (totals.tax_rate * 100).toFixed(2) }%):</p><p>${totals.tax_amount.toFixed(2)}</p></div>
                    )}
                    {totals.tax_rate === 0 && (
                      <div className="flex justify-between text-sm text-green-600"><p>Tax (Residential):</p><p>$0.00</p></div>
                    )}
                    <div className="flex justify-between font-bold text-lg"><p>Total:</p><p>${totals.total_amount.toFixed(2)}</p></div>
                    <div className="pt-4 flex justify-end">
                      <Button type="submit"><Save className="w-4 h-4 mr-2" />Save Invoice</Button>
                    </div>
                </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
