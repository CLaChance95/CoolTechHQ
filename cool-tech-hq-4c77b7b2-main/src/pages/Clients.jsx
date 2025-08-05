import React, { useState, useEffect } from "react";
import { Client, Project } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

import ClientForm from "../components/clients/ClientForm";
import ClientCard from "../components/clients/ClientCard";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm]);

  const loadData = async () => {
    try {
      const [clientsData, projectsData] = await Promise.all([
        Client.list('-created_date'),
        Project.list()
      ]);
      setClients(clientsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const filterClients = () => {
    let filtered = clients.map(client => ({
      ...client,
      projectCount: projects.filter(p => p.client_id === client.id).length
    }));

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredClients(filtered);
  };

  const handleSubmit = async (clientData) => {
    try {
      if (editingClient) {
        await Client.update(editingClient.id, clientData);
      } else {
        await Client.create(clientData);
      }
      setShowForm(false);
      setEditingClient(null);
      loadData();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  if (isLoading) {
    return <div className="p-6">Loading clients...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-600 mt-1">{clients.length} total clients</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Client
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by name, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {filteredClients.length === 0 && !isLoading && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm text-center p-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No clients found</h3>
            <p className="text-slate-500 mb-4">Click "New Client" to get started.</p>
        </Card>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ClientForm
              client={editingClient}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingClient(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}