
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit,
  Clock,
  Building
} from "lucide-react";
import { format } from "date-fns";
import ProjectStatusDropdown from "./ProjectStatusDropdown";

export default function ProjectCard({ project, clientName, onEdit, getStatusColor, onStatusChange }) {
  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(project);
  }

  const handleCardClick = (e) => {
    // Check if the click was on the status dropdown or edit button
    if (e.target.closest('[data-dropdown]') || e.target.closest('button')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }

  return (
    <Link to={createPageUrl(`ProjectDetails?id=${project.id}`)} className="block group" onClick={handleCardClick}>
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <CardHeader className="p-3 lg:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm lg:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                {project.site_address || project.project_name}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-600 mt-1">
                <Building className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="truncate">{clientName}</span>
              </div>
            </div>
            <div data-dropdown className="flex-shrink-0">
              <ProjectStatusDropdown 
                project={project}
                onStatusChange={onStatusChange}
                getStatusColor={getStatusColor}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2 lg:space-y-4 flex-grow flex flex-col p-3 lg:p-6 pt-0">
          <div className="grid grid-cols-1 gap-2 lg:gap-4 text-xs lg:text-sm">
            {project.start_date && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-3 h-3 lg:w-4 lg:h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{format(new Date(project.start_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            {project.estimated_value && (
              <div className="flex items-center gap-2 text-slate-600">
                <DollarSign className="w-3 h-3 lg:w-4 lg:h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">${project.estimated_value.toLocaleString()}</span>
              </div>
            )}
          </div>

          {project.notes && (
            <p className="text-xs lg:text-sm text-slate-600 line-clamp-2 flex-grow break-words">{project.notes}</p>
          )}

          <div className="flex justify-between items-center pt-2 mt-auto gap-2">
            <div className="flex items-center gap-1 lg:gap-2 text-xs text-slate-500 min-w-0">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Created {format(new Date(project.created_date), 'MMM d')}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity z-10 flex-shrink-0 text-xs lg:text-sm"
            >
              <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
