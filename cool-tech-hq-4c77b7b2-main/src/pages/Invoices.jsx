
import React, { useState, useEffect } from "react";
import { Invoice, Client, Project } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Archive, ChevronDown, Send } from "lucide-react"; // Added Send icon
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import InvoiceForm from "../components/invoices/InvoiceForm";
import InvoiceSender from "../components/invoices/InvoiceSender"; // Added InvoiceSender import
import { Label } from "@/components/ui/label"; // Added Label import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select imports
import { groupBy } from 'lodash';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_date'); // New state variable for sorting
  const [showSender, setShowSender] = useState(false); // New state variable for showing sender modal
  const [sendingInvoice, setSendingInvoice] = useState(null); // New state variable for the invoice being sent

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invs, clis, projs] = await Promise.all([
        Invoice.list('-created_date'),
        Client.list(),
        Project.list()
      ]);
      setInvoices(invs || []);
      setClients(clis || []);
      setProjects(projs || []);
    } catch (error) {
      console.error("Error loading invoice data:", error);
    }
    setIsLoading(false);
  };
  
  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };
  
  const handleSubmit = async (invoiceData) => {
    try {
      if(editingInvoice) {
        await Invoice.update(editingInvoice.id, invoiceData);
      } else {
        const currentYear = new Date().getFullYear();
        // Fetch invoices sorted by invoice_number to find the latest one for generating a new number
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
        await Invoice.create({ ...invoiceData, invoice_number: newInvoiceNumber });
      }
      setShowForm(false);
      setEditingInvoice(null);
      loadData();
    } catch (error) {
      console.error("Error saving invoice", error);
    }
  };

  const handleSend = (invoice) => {
    setSendingInvoice(invoice);
    setShowSender(true);
  };

  const handleInvoiceSent = async () => {
    if (sendingInvoice) {
      try {
        await Invoice.update(sendingInvoice.id, { status: 'sent' });
        setShowSender(false);
        setSendingInvoice(null);
        loadData(); // Reload data to reflect the status change
      } catch (error) {
        console.error("Error updating invoice status:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSortedInvoices = (invoiceList) => {
    const sorted = [...invoiceList];
    if (sortBy === 'amount') {
      return sorted.sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
    } else if (sortBy === 'status') {
      // Define a custom order for statuses for consistent sorting
      const statusOrder = { 'draft': 1, 'sent': 2, 'overdue': 3 };
      return sorted.sort((a, b) => {
        const orderA = statusOrder[a.status] || Infinity; // Assign high value for unknown statuses
        const orderB = statusOrder[b.status] || Infinity;
        return orderA - orderB;
      });
    } else if (sortBy === 'client') {
      return sorted.sort((a, b) => {
        const clientA = clients.find(c => c.id === a.client_id)?.client_name || '';
        const clientB = clients.find(c => c.id === b.client_id)?.client_name || '';
        return clientA.localeCompare(clientB);
      });
    }
    // Default or 'created_date'
    return sorted.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
  };

  const activeInvoices = getSortedInvoices((invoices || []).filter(inv => inv.status !== 'paid'));
  const paidInvoices = (invoices || []).filter(inv => inv.status === 'paid');
  const paidInvoicesByMonth = groupBy(paidInvoices, inv => {
    // Group by payment date if available, otherwise by creation date
    const date = inv.payment_date ? new Date(inv.payment_date) : new Date(inv.created_date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const sortedMonths = Object.keys(paidInvoicesByMonth).sort((a, b) => b.localeCompare(a));

  return (
    <div className="p-3 lg:p-6 space-y-4 lg:space-y-6 min-w-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 mt-1 text-sm lg:text-base">{activeInvoices.length} active invoices</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 shadow-lg w-full lg:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg lg:text-xl">Active Invoices</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="sortBy" className="text-sm">Sort by:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sortBy" className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Invoice #</TableHead>
                <TableHead className="min-w-[120px]">Client</TableHead>
                <TableHead className="min-w-[120px]">Project</TableHead>
                <TableHead className="min-w-[80px]">Date</TableHead>
                <TableHead className="min-w-[80px]">Amount</TableHead>
                <TableHead className="min-w-[70px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead> {/* Increased min-width for actions */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeInvoices.map(invoice => {
                const client = (clients || []).find(c => c.id === invoice.client_id);
                const project = (projects || []).find(p => p.id === invoice.project_id);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium text-xs lg:text-sm">{invoice.invoice_number}</TableCell>
                    <TableCell className="truncate text-xs lg:text-sm">{client?.client_name || "N/A"}</TableCell>
                    <TableCell className="truncate text-xs lg:text-sm">{project?.project_name || "N/A"}</TableCell>
                    <TableCell className="text-xs lg:text-sm">{format(new Date(invoice.issue_date), "MMM d")}</TableCell>
                    <TableCell className="text-xs lg:text-sm">${(invoice.total_amount || 0).toFixed(0)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(invoice.status)} text-xs`}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(invoice)} className="text-xs lg:text-sm">
                          <Eye className="w-3 h-3 lg:w-4 lg:h-4"/>
                        </Button>
                        {(invoice.status === 'draft' || invoice.status === 'sent') && (
                          <Button variant="outline" size="sm" onClick={() => handleSend(invoice)} className="text-xs lg:text-sm">
                            <Send className="w-3 h-3 lg:w-4 lg:h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
               {activeInvoices.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-500 py-8 text-sm lg:text-base">No active invoices.</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {paidInvoices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Archive className="w-6 h-6"/> 
            Paid Invoices Archive
          </h2>
          {sortedMonths.map(monthKey => {
            const [year, month] = monthKey.split('-');
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            });
            
            return (
              <Collapsible key={monthKey} className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border">
                <CollapsibleTrigger className="w-full flex justify-between items-center p-4 hover:bg-slate-50">
                  <h3 className="font-semibold text-lg">{monthName}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{paidInvoicesByMonth[monthKey].length} invoices</Badge>
                    <ChevronDown className="w-5 h-5"/>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Paid Date</TableHead> {/* Changed header to Paid Date */}
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(paidInvoicesByMonth[monthKey] || []).map(invoice => {
                        const client = (clients || []).find(c => c.id === invoice.client_id);
                        return (
                          <TableRow key={invoice.id}>
                            <TableCell>{invoice.invoice_number}</TableCell>
                            <TableCell>{client?.client_name || 'N/A'}</TableCell>
                            <TableCell>{format(new Date(invoice.payment_date || invoice.created_date), "MMM d, yyyy")}</TableCell> {/* Displays payment_date */}
                            <TableCell>${(invoice.total_amount || 0).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <InvoiceForm 
                invoice={editingInvoice}
                clients={clients}
                projects={projects}
                onSubmit={handleSubmit}
                onCancel={() => {
                setShowForm(false);
                setEditingInvoice(null);
                }} 
            />
          </div>
        </div>
      )}

      {showSender && sendingInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full flex items-center justify-center min-h-full py-4">
            <InvoiceSender
              invoice={sendingInvoice}
              client={(clients || []).find(c => c.id === sendingInvoice.client_id)}
              onClose={() => {
                setShowSender(false);
                setSendingInvoice(null);
              }}
              onSent={handleInvoiceSent}
            />
          </div>
        </div>
      )}
    </div>
  );
}
