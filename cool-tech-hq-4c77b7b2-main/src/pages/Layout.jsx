

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from '@/api/entities';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Receipt, 
  Calculator,
  Settings,
  FileText,
  ClipboardList,
  CalendarDays,
  FileSignature
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    url: createPageUrl("Projects"),
    icon: FolderOpen,
  },
  {
    title: "Tasks",
    url: createPageUrl("Tasks"),
    icon: ClipboardList,
  },
  {
    title: "Calendar",
    url: createPageUrl("Calendar"),
    icon: CalendarDays,
  },
  {
    title: "Clients",
    url: createPageUrl("Clients"),
    icon: Users,
  },
  {
    title: "Documents",
    url: createPageUrl("Documents"),
    icon: FileText,
  },
];

const accountingItems = [
  {
    title: "Estimates",
    url: createPageUrl("Estimates"),
    icon: FileSignature,
  },
  {
    title: "Invoices",
    url: createPageUrl("Invoices"),
    icon: Receipt,
  },
  {
    title: "Expenses",
    url: createPageUrl("Expenses"),
    icon: Calculator,
  },
];

const adminItems = [
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        // Not logged in or error fetching user
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="border-r border-slate-200 bg-white shadow-xl">
          <SidebarHeader className="border-b border-slate-200 p-3 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="hidden sm:block min-w-0">
                <h2 className="font-bold text-slate-900 text-sm lg:text-lg truncate">Cool Tech</h2>
                <p className="text-xs text-slate-500 font-medium truncate">HVAC Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2 lg:p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-2 lg:px-3 py-2">
                Main
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-700'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-3 min-w-0">
                          <item.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                          <span className="font-medium text-sm lg:text-base truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-2 lg:px-3 py-2">
                Accounting
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {accountingItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-700'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-3 min-w-0">
                          <item.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                          <span className="font-medium text-sm lg:text-base truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {currentUser?.role === 'admin' && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-2 lg:px-3 py-2">
                  Admin
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 ${
                            location.pathname === item.url ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-700'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-3 min-w-0">
                            <item.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                            <span className="font-medium text-sm lg:text-base truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-3 lg:p-4 mt-auto">
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xs lg:text-sm">CT</span>
              </div>
              <div className="flex-1 min-w-0 hidden sm:block">
                <p className="font-semibold text-slate-900 text-xs lg:text-sm truncate">Cool Tech Designs</p>
                <p className="text-xs text-slate-500 truncate">HVAC Management</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-3 lg:px-6 py-3 lg:py-4 lg:hidden">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-base lg:text-xl font-bold text-slate-900 truncate">Cool Tech</h1>
            </div>
          </header>

          <div className="flex-1 min-w-0 overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

