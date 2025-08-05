
import React, { useState, useEffect } from "react";
import { Project, Client, Invoice, Task, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FolderOpen,
  Users,
  Receipt,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import MessageCenter from "../components/dashboard/MessageCenter";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    pendingTasks: 0,
    monthlyRevenue: 0,
    outstandingInvoices: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load all data
      const [projects, clients, invoices, tasks] = await Promise.all([
        Project.list('-created_date', 10),
        Client.list('-created_date'),
        Invoice.list('-created_date', 10),
        Task.list('-created_date', 10)
      ]);

      // Calculate stats
      const activeProjects = projects.filter(p => p.status === 'in_progress').length;
      const pendingTasks = tasks.filter(t => t.status !== 'complete').length;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyRevenue = invoices
        .filter(inv => {
          const invDate = new Date(inv.created_date);
          return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear && inv.status === 'paid';
        })
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      const outstandingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length;

      setStats({
        totalProjects: projects.length,
        activeProjects,
        totalClients: clients.length,
        pendingTasks,
        monthlyRevenue,
        outstandingInvoices
      });

      setRecentProjects(projects.slice(0, 5));
      setRecentInvoices(invoices.slice(0, 5));
      setUrgentTasks(tasks.filter(t => t.priority === 'urgent' && t.status !== 'complete').slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setIsLoading(false);
  };

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

  const StatCard = ({ title, value, icon: Icon, color, trend, linkTo, clickable = true }) => {
    const cardContent = (
      <Card className={`border-0 shadow-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${clickable ? 'cursor-pointer' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-sm font-semibold text-slate-600 ${clickable ? 'group-hover:text-blue-600' : ''} transition-colors`}>{title}</CardTitle>
          <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
            <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold text-slate-900 ${clickable ? 'group-hover:text-blue-700' : ''} transition-colors`}>{value}</div>
          {trend && (
            <p className="text-xs text-slate-500 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </CardContent>
      </Card>
    );

    return clickable && linkTo ? (
      <Link to={linkTo} className="block group">
        {cardContent}
      </Link>
    ) : cardContent;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 lg:p-6 space-y-6 lg:space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 truncate">Dashboard</h1>
          <p className="text-slate-600 mt-1 text-sm lg:text-base">Welcome back to Cool Tech Designs</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
          <MessageCenter />
          <Link to={createPageUrl("Projects")}>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg text-xs lg:text-sm" size="sm">
              <Plus className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FolderOpen}
          color="bg-blue-500"
          trend="12% increase"
          linkTo={createPageUrl("Projects")}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={Clock}
          color="bg-green-500"
          linkTo={createPageUrl("Projects")}
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          color="bg-purple-500"
          linkTo={createPageUrl("Clients")}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={AlertTriangle}
          color="bg-orange-500"
          linkTo={createPageUrl("Tasks")}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-emerald-500"
          trend="15% vs last month"
          linkTo={createPageUrl("Invoices")}
        />
        <StatCard
          title="Outstanding Invoices"
          value={stats.outstandingInvoices}
          icon={Receipt}
          color="bg-red-500"
          linkTo={createPageUrl("Invoices")}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Recent Projects */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">Recent Projects</CardTitle>
            <Link to={createPageUrl("Projects")}>
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.map((project) => (
              <Link to={createPageUrl(`ProjectDetails?id=${project.id}`)} key={project.id} className="block hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center justify-between p-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{project.project_name}</p>
                    <p className="text-sm text-slate-500">{project.site_address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {project.project_type === 'residential' ? 'Residential' : 'Commercial'}
                    </Badge>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
            {recentProjects.length === 0 && (
              <p className="text-center text-slate-500 py-8">No projects yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">Recent Invoices</CardTitle>
            <Link to={createPageUrl("Invoices")}>
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInvoices.map((invoice) => (
              <Link to={createPageUrl("Invoices")} key={invoice.id} className="block hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-slate-100">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">#{invoice.invoice_number}</p>
                    <p className="text-sm text-slate-500">
                      ${invoice.total_amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
              </Link>
            ))}
            {recentInvoices.length === 0 && (
              <p className="text-center text-slate-500 py-8">No invoices yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tasks */}
      {urgentTasks.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Urgent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {urgentTasks.map((task) => (
                <Link to={createPageUrl("Tasks")} key={task.id} className="block">
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer">
                    <p className="font-semibold text-slate-900">{task.task_title}</p>
                    <p className="text-sm text-slate-600 mt-1">{task.notes}</p>
                    {task.due_date && (
                      <p className="text-xs text-red-600 mt-2">
                        Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
