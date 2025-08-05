import React, { useState, useEffect } from "react";
import { Estimate, Client, Project } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Send } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import EstimateForm from "../components/estimates/EstimateForm";
import EstimateSender from "../components/estimates/EstimateSender";

export default function Estimates() {
  const [estimates, setEstimates] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSender, setShowSender] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [sendingEstimate, setSendingEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ests, clis, projs] = await Promise.all([
        Estimate.list('-created_date'),
        Client.list(),
        Project.list()
      ]);
      setEstimates(ests || []);
      setClients(clis || []);
      setProjects(projs || []);
    } catch (error) {
      console.error("Error loading estimate data:", error);
    }
    setIsLoading(false);
  };
  
  const handleEdit = (estimate) => {
    setEditingEstimate(estimate);
    setShowForm(true);
  };

  const handleSend = (estimate) => {
    setSendingEstimate(estimate);
    setShowSender(true);
  };

  const handleCreate = () => {
    setEditingEstimate(null);
    setShowForm(true);
  };
  
  const handleSubmit = async (estimateData) => {
    try {
      if(editingEstimate) {
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
        await Estimate.create({ ...estimateData, estimate_number: newEstimateNumber });
      }
      setShowForm(false);
      setEditingEstimate(null);
      loadData();
    } catch (error) {
      console.error("Error saving estimate", error);
    }
  };

  const handleEstimateSent = async () => {
    if (sendingEstimate) {
      try {
        await Estimate.update(sendingEstimate.id, { status: 'sent' });
        setShowSender(false);
        setSendingEstimate(null);
        loadData();
      } catch (error) {
        console.error("Error updating estimate status:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <div className="p-4 lg:p-6">Loading estimates...</div>
  }

  return (
    <div className="p-3 lg:p-6 space-y-4 lg:space-y-6 min-w-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Estimates</h1>
          <p className="text-slate-600 mt-1 text-sm lg:text-base">{estimates.length} total estimates</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 shadow-lg w-full lg:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Estimate
        </Button>
      </div>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Estimate #</TableHead>
                <TableHead className="min-w-[120px]">Client</TableHead>
                <TableHead className="min-w-[120px]">Project</TableHead>
                <TableHead className="min-w-[80px]">Date</TableHead>
                <TableHead className="min-w-[80px]">Amount</TableHead>
                <TableHead className="min-w-[70px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(estimates || []).map(estimate => {
                const client = (clients || []).find(c => c.id === estimate.client_id);
                const project = (projects || []).find(p => p.id === estimate.project_id);
                return (
                  <TableRow key={estimate.id}>
                    <TableCell className="font-medium text-xs lg:text-sm">{estimate.estimate_number}</TableCell>
                    <TableCell className="truncate text-xs lg:text-sm">{client?.client_name || "N/A"}</TableCell>
                    <TableCell className="truncate text-xs lg:text-sm">{project?.project_name || "N/A"}</TableCell>
                    <TableCell className="text-xs lg:text-sm">{format(new Date(estimate.issue_date), "MMM d")}</TableCell>
                    <TableCell className="text-xs lg:text-sm">${(estimate.total_amount || 0).toFixed(0)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(estimate.status)} text-xs`}>{estimate.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(estimate)} className="text-xs lg:text-sm">
                          <Eye className="w-3 h-3 lg:w-4 lg:h-4"/>
                        </Button>
                        {estimate.status === 'draft' && (
                          <Button variant="outline" size="sm" onClick={() => handleSend(estimate)} className="text-xs lg:text-sm">
                            <Send className="w-3 h-3 lg:w-4 lg:h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <EstimateForm 
                estimate={editingEstimate}
                clients={clients}
                projects={projects}
                onSubmit={handleSubmit}
                onCancel={() => {
                setShowForm(false);
                setEditingEstimate(null);
                }} 
            />
          </div>
        </div>
      )}

      {showSender && sendingEstimate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full flex items-center justify-center min-h-full py-4">
            <EstimateSender
              estimate={sendingEstimate}
              client={(clients || []).find(c => c.id === sendingEstimate.client_id)}
              onClose={() => {
                setShowSender(false);
                setSendingEstimate(null);
              }}
              onSent={handleEstimateSent}
            />
          </div>
        </div>
      )}
    </div>
  );
}