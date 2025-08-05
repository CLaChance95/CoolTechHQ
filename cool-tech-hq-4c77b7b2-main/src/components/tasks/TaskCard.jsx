import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Edit, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import TaskStatusDropdown from './TaskStatusDropdown';

export default function TaskCard({ task, project, assignedUser, onEdit, onStatusChange }) {
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-900">{task.task_title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
              {project && (
                <>
                  <span className="font-medium">{project.project_name}</span>
                  <span className="text-slate-400">•</span>
                </>
              )}
              {assignedUser && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{assignedUser.full_name}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
            <TaskStatusDropdown task={task} onStatusChange={onStatusChange} />
            <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
            </Badge>
        </div>

        {task.due_date && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
          </div>
        )}

        {task.notes && (
          <p className="text-sm text-slate-600 line-clamp-2">{task.notes}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t">
          <Clock className="w-3 h-3" />
          Created {format(new Date(task.created_date), 'MMM d')}
        </div>
      </CardContent>
    </Card>
  );
}