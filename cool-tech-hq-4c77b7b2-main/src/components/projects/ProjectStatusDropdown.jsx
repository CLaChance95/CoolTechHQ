import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Circle, Clock, Pause, CheckCircle2 } from 'lucide-react';

export default function ProjectStatusDropdown({ project, onStatusChange, getStatusColor }) {
  const statusIcons = {
    pending: <Circle className="w-4 h-4 text-yellow-500" />,
    in_progress: <Clock className="w-4 h-4 text-blue-500" />,
    on_hold: <Pause className="w-4 h-4 text-orange-500" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-500" />
  };

  const handleStatusChange = (e, newStatus) => {
    e.preventDefault();
    e.stopPropagation();
    onStatusChange(project.id, newStatus);
  };

  const handleDropdownClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div onClick={handleDropdownClick}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ')}
            </Badge>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => handleStatusChange(e, 'pending')}>
            {statusIcons.pending}
            Pending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => handleStatusChange(e, 'in_progress')}>
            {statusIcons.in_progress}
            In Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => handleStatusChange(e, 'on_hold')}>
            {statusIcons.on_hold}
            On Hold
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => handleStatusChange(e, 'completed')}>
            {statusIcons.completed}
            Completed
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}