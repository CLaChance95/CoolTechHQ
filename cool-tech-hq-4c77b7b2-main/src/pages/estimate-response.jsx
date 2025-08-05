import React, { useState, useEffect } from 'react';
import { Estimate, Invoice, Project, Client } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Home, FileText } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { addDays, format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function EstimateResponse() {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Processing your response...');
    const [estimate, setEstimate] = useState(null);
    const [client, setClient] = useState(null);
    const [project, setProject] = useState(null);
    const [generatedInvoice, setGeneratedInvoice] = useState(null);

    useEffect(() => {
        const processResponse = async () => {
            const params = new URLSearchParams(window.location.search);
            const estimateId = params.get('id');
            const action = params.get('action');

            if (!estimateId || !action) {
                setStatus('error');
                setMessage('Invalid response link. Missing information.');
                return;
            }

            try {
                const estimates = await Estimate.list();
                const fetchedEstimate = estimates.find(e => e.id === estimateId);
                
                if (!fetchedEstimate) {
                    setStatus('error');
                    setMessage('Estimate not found. Please contact us if you believe this is an error.');
                    return;
                }
                
                setEstimate(fetchedEstimate);

                const [clients, projects] = await Promise.all([
                    Client.list(),
                    Project.list()
                ]);
                
                const estimateClient = clients.find(c => c.id === fetchedEstimate.client_id);
                const estimateProject = projects.find(p => p.id === fetchedEstimate.project_id);
                
                setClient(estimateClient);
                setProject(estimateProject);

                if (fetchedEstimate.status === 'approved') {
                    setStatus('already_actioned');
                    setMessage('This estimate has already been approved. Thank you!');
                    return;
                } else if (fetchedEstimate.status === 'declined') {
                    setStatus('already_actioned');
                    setMessage('This estimate has already been declined.');
                    return;
                }

                if (action === 'approve') {
                    await handleApproval(fetchedEstimate, estimateProject);
                } else if (action === 'decline') {
                    await handleDecline(fetchedEstimate);
                } else {
                    setStatus('error');
                    setMessage('Invalid action specified.');
                }
            } catch (err) {
                console.error("Error processing estimate response:", err);
                setStatus('error');
                setMessage('An error occurred while processing your response. Please contact us.');
            }
        };

        processResponse();
    }, []);

    const handleApproval = async (approvedEstimate, estimateProject) => {
        try {
            await Estimate.update(approvedEstimate.id, { status: 'approved' });

            const allInvoices = await Invoice.list();
            const currentYear = new Date().getFullYear();
            let lastNum = 0;
            const lastInvoiceThisYear = allInvoices.find(inv => 
                inv.invoice_number && inv.invoice_number.startsWith(`INV-${currentYear}-`)
            );

            if (lastInvoiceThisYear) {
                const parts = lastInvoiceThisYear.invoice_number.split('-');
                if (parts.length === 3) lastNum = parseInt(parts[2], 10);
            }
            
            const newNum = (lastNum + 1).toString().padStart(4, '0');
            const newInvoiceNumber = `INV-${currentYear}-${newNum}`;

            const isCommercial = estimateProject?.project_type === 'commercial';
            
            const newInvoiceData = {
                invoice_number: newInvoiceNumber,
                client_id: approvedEstimate.client_id,
                project_id: approvedEstimate.project_id,
                line_items: approvedEstimate.line_items || [],
                subtotal: approvedEstimate.subtotal || 0,
                tax_amount: approvedEstimate.tax_amount || 0,
                tax_rate: isCommercial ? 0.0825 : 0,
                total_amount: approvedEstimate.total_amount || 0,
                issue_date: format(new Date(), 'yyyy-MM-dd'),
                due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
                status: 'draft',
                notes: `Auto-generated from approved estimate #${approvedEstimate.estimate_number}`
            };

            const createdInvoice = await Invoice.create(newInvoiceData);
            setGeneratedInvoice(createdInvoice);
            setStatus('success_approved');
            setMessage('Thank you! Your estimate has been approved and an invoice has been generated.');
        } catch (error) {
            console.error('Error approving estimate:', error);
            setStatus('error');
            setMessage('Error processing approval. Please contact us.');
        }
    };

    const handleDecline = async (declinedEstimate) => {
        try {
            await Estimate.update(declinedEstimate.id, { status: 'declined' });
            setStatus('success_declined');
            setMessage('Thank you for your response. This estimate has been declined.');
        } catch (error) {
            console.error('Error declining estimate:', error);
            setStatus('error');
            setMessage('Error processing decline. Please contact us.');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="p-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-slate-600">{message}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card className="border-0 shadow-2xl bg-white">
                    <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                        <CardTitle className="text-2xl font-bold">Cool Tech Designs</CardTitle>
                        <p className="text-blue-100">HVAC Management Solutions</p>
                    </CardHeader>
                    <CardContent className="p-8 text-center">
                        {status === 'success_approved' && (
                            <>
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-green-700 mb-2">Estimate Approved!</h2>
                                <p className="text-slate-600 mb-6">{message}</p>
                                {generatedInvoice && (
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                                        <p className="text-green-800 font-semibold">
                                            Invoice #{generatedInvoice.invoice_number} has been automatically created
                                        </p>
                                        <p className="text-green-600 text-sm mt-1">
                                            You will receive your invoice separately
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {status === 'success_declined' && (
                            <>
                                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-red-700 mb-2">Estimate Declined</h2>
                                <p className="text-slate-600 mb-6">{message}</p>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                                    <p className="text-blue-800 font-semibold">We appreciate your consideration</p>
                                    <p className="text-blue-600 text-sm mt-1">
                                        Feel free to contact us if you have any questions or would like to discuss alternatives
                                    </p>
                                </div>
                            </>
                        )}

                        {status === 'already_actioned' && (
                            <>
                                <FileText className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-yellow-700 mb-2">Already Processed</h2>
                                <p className="text-slate-600 mb-6">{message}</p>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
                                <p className="text-slate-600 mb-6">{message}</p>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                                    <p className="text-red-800 font-semibold">Please contact Cool Tech Designs</p>
                                    <p className="text-red-600 text-sm mt-1">
                                        We'll help resolve this issue as quickly as possible
                                    </p>
                                </div>
                            </>
                        )}

                        {estimate && (
                            <div className="bg-slate-50 p-4 rounded-lg text-left mb-6">
                                <h3 className="font-semibold text-slate-700 mb-2">Estimate Details</h3>
                                <p className="text-sm text-slate-600">Estimate #{estimate.estimate_number}</p>
                                <p className="text-sm text-slate-600">Total: ${estimate.total_amount?.toFixed(2) || '0.00'}</p>
                                {client && <p className="text-sm text-slate-600">Client: {client.client_name}</p>}
                            </div>
                        )}

                        <div className="space-y-3">
                            <p className="text-sm text-slate-500">
                                Thank you for your business with Cool Tech Designs
                            </p>
                            <Link to={createPageUrl("Dashboard")}>
                                <Button variant="outline" className="w-full">
                                    <Home className="w-4 h-4 mr-2" />
                                    Return to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}