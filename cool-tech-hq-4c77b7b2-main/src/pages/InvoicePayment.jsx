import React, { useState, useEffect } from 'react';
import { Invoice, Client, Project } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, CreditCard, Home } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function InvoicePayment() {
    const [invoice, setInvoice] = useState(null);
    const [client, setClient] = useState(null);
    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadInvoice = async () => {
            const params = new URLSearchParams(window.location.search);
            const invoiceId = params.get('id');

            if (!invoiceId) {
                setIsLoading(false);
                return;
            }

            try {
                const [invoices, clients, projects] = await Promise.all([
                    Invoice.list(),
                    Client.list(),
                    Project.list()
                ]);
                
                const fetchedInvoice = invoices.find(i => i.id === invoiceId);
                setInvoice(fetchedInvoice);
                
                if (fetchedInvoice) {
                    setClient(clients.find(c => c.id === fetchedInvoice.client_id));
                    setProject(projects.find(p => p.id === fetchedInvoice.project_id));
                }
            } catch (error) {
                console.error('Error loading invoice:', error);
            }
            setIsLoading(false);
        };

        loadInvoice();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Loading invoice...</h2>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">Invoice Not Found</h2>
                        <p className="text-slate-600">The invoice you're looking for could not be found.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
                    <h1 className="text-2xl font-bold">Cool Tech Designs</h1>
                    <p className="opacity-90">HVAC Management Solutions</p>
                </div>
                
                <Card className="border-0 rounded-t-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Invoice #{invoice.invoice_number}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                            {invoice.status === 'paid' && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    Paid
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-slate-900 mb-3">Invoice Details</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Client:</strong> {client?.client_name}</p>
                                    <p><strong>Contact:</strong> {client?.contact_name}</p>
                                    <p><strong>Project:</strong> {project?.project_name}</p>
                                    <p><strong>Issue Date:</strong> {format(new Date(invoice.issue_date), 'MMM d, yyyy')}</p>
                                    {invoice.due_date && (
                                        <p><strong>Due Date:</strong> {format(new Date(invoice.due_date), 'MMM d, yyyy')}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-slate-900 mb-3">Payment Information</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Total Amount:</strong> ${invoice.total_amount?.toFixed(2)}</p>
                                    <p><strong>Status:</strong> {invoice.status === 'paid' ? 'Paid' : 'Outstanding'}</p>
                                    <p className="text-slate-600">Please contact us for payment arrangements</p>
                                </div>
                            </div>
                        </div>

                        {invoice.line_items && invoice.line_items.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3">Line Items</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-slate-200">
                                        <thead>
                                            <tr className="bg-slate-100">
                                                <th className="border border-slate-200 p-3 text-left">Description</th>
                                                <th className="border border-slate-200 p-3 text-center">Qty</th>
                                                <th className="border border-slate-200 p-3 text-right">Unit Price</th>
                                                <th className="border border-slate-200 p-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice.line_items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="border border-slate-200 p-3">{item.description}</td>
                                                    <td className="border border-slate-200 p-3 text-center">{item.quantity}</td>
                                                    <td className="border border-slate-200 p-3 text-right">${item.unit_price?.toFixed(2)}</td>
                                                    <td className="border border-slate-200 p-3 text-right">${(item.quantity * item.unit_price)?.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="text-right space-y-1 border-t pt-4">
                            <p><strong>Subtotal: ${invoice.subtotal?.toFixed(2) || '0.00'}</strong></p>
                            <p><strong>Tax: ${invoice.tax_amount?.toFixed(2) || '0.00'}</strong></p>
                            <p className="text-xl font-bold text-green-600">Total: ${invoice.total_amount?.toFixed(2) || '0.00'}</p>
                        </div>

                        {invoice.notes && (
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <h4 className="font-semibold text-yellow-800">Additional Notes:</h4>
                                <p className="text-yellow-700 mt-1">{invoice.notes}</p>
                            </div>
                        )}

                        <div className="bg-slate-50 p-6 rounded-lg text-center">
                            <h3 className="font-semibold text-slate-700 mb-4">Payment Options</h3>
                            <p className="text-slate-600 mb-4">Please contact Cool Tech Designs to arrange payment:</p>
                            <div className="space-y-2 text-sm">
                                <p><strong>Phone:</strong> (555) 123-4567</p>
                                <p><strong>Email:</strong> billing@cooltechdesigns.com</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}