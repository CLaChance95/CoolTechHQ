import React, { useState, useEffect } from 'react';
import { Client, Project, Invoice } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Building,
  Receipt,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClientDetails() {
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');

  useEffect(() => {
    if (clientId) {
      loadClientData();
    }
  }, [clientId]);

  const loadClientData = async () => {
    setIsLoading(true);
    try {
      const [clients, projectsData, invoicesData] = await Promise.all([
        Client.list(),
        Project.list(),
        Invoice.list()
      ]);

      const foundClient = clients.find(c => c.id === clientId);
      if (foundClient) {
        setClient(foundClient);
        setProjects(projectsData.filter(p => p.client_id === clientId));
        setInvoices(invoicesData.filter(i => i.client_id === clientId));
      }
    } catch (error) {
      console.error('Error loading client data:', error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="p-4 lg:p-6">Loading client details...</div>;
  }

  if (!client) {
    return (
      <div className="p-4 lg:p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-900">Client Not Found</h2>
          <p className="text-slate-600 mt-2">The client you're looking for doesn't exist.</p>
          <Link to={createPageUrl('Clients')}>
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      on_hold: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  return (
    <div className="p-3 lg:p-6 space-y-4 lg:space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={createPageUrl('Clients')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl lg:text-3xl font-bold text-slate-900 truncate">{client.client_name}</h1>
            <p className="text-sm lg:text-base text-slate-600 truncate">{client.contact_name}</p>
          </div>
        </div>
      </div>

      {/* Client Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base lg:text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm lg:text-base">
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{client.email}</span>
              </div>
            )}
            {client.billing_address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
                <span className="break-words">{client.billing_address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base lg:text-lg">Project Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm lg:text-base">
            <div className="flex justify-between">
              <span>Total Projects:</span>
              <span className="font-semibold">{projects.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Projects:</span>
              <span className="font-semibold">{projects.filter(p => p.status !== 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>
              <span className="font-semibold">{projects.filter(p => p.status === 'completed').length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base lg:text-lg">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm lg:text-base">
            <div className="flex justify-between">
              <span>Total Revenue:</span>
              <span className="font-semibold text-green-600">${totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Invoices:</span>
              <span>{invoices.filter(i => i.status === 'paid').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Outstanding:</span>
              <span>{invoices.filter(i => i.status !== 'paid').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl">Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No projects for this client yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(project => (
                <Link key={project.id} to={createPageUrl(`ProjectDetails?id=${project.id}`)}>
                  <div className="p-4 border rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
                    <h4 className="font-semibold text-slate-900">{project.project_name}</h4>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className={getStatusColor(project.status)} variant="outline">
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{project.project_type}</Badge>
                    </div>
                    {project.estimated_value && (
                      <p className="text-sm text-slate-600 mt-2">${project.estimated_value.toLocaleString()}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}