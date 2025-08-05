import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Circle, Clock, CheckCircle2 } from 'lucide-react';

export default function TaskStatusDropdown({ task, onStatusChange }) {
  const statusIcons = {
    to_do: <Circle className="w-4 h-4 text-gray-500" />,
    in_progress: <Clock className="w-4 h-4 text-blue-500" />,
    complete: <CheckCircle2 className="w-4 h-4 text-green-500" />
  };

  const getStatusColor = (status) => {
    const colors = {
      to_do: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      complete: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Badge className={getStatusColor(task.status)}>
            {task.status.replace('_', ' ')}
          </Badge>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onStatusChange(task.id, 'to_do')}>
          {statusIcons.to_do}
          To Do
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>
          {statusIcons.in_progress}
          In Progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange(task.id, 'complete')}>
          {statusIcons.complete}
          Complete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}