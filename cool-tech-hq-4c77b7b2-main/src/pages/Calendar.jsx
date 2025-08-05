import React, { useState, useEffect } from 'react';
import { Appointment, Task, Project, Client, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock, FolderOpen } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, parseISO } from 'date-fns';
import AppointmentForm from '../components/calendar/AppointmentForm';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [data, setData] = useState({ projects: [], clients: [], users: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      const [appointments, tasks, projects, clients, users] = await Promise.all([
        Appointment.list(), Task.list(), Project.list(), Client.list(), User.list()
      ]);
      setData({ projects, clients, users });

      const appointmentEvents = appointments.map(a => ({ id: `appt-${a.id}`, title: a.title, date: parseISO(a.start_time), type: 'appointment', color: 'bg-blue-500', data: a }));
      const taskEvents = tasks.filter(t => t.due_date).map(t => ({ id: `task-${t.id}`, title: t.task_title, date: parseISO(t.due_date), type: 'task', color: 'bg-yellow-500', data: t }));
      const projectStartEvents = projects.filter(p => p.start_date).map(p => ({ id: `proj-start-${p.id}`, title: `Start: ${p.project_name}`, date: parseISO(p.start_date), type: 'project', color: 'bg-green-500', data: p }));
        
      setEvents([...appointmentEvents, ...taskEvents, ...projectStartEvents]);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    }
    setIsLoading(false);
  };
  
  const handleSubmit = async (formData) => {
    try {
        await Appointment.create(formData);
        setShowForm(false);
        loadCalendarData();
    } catch (err) {
        console.error("Failed to save appointment", err);
    }
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startingDayIndex = getDay(monthStart);

  const prevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="p-6 space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600 mt-1">Schedule & track important dates</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft/></Button>
            <h2 className="text-xl font-bold text-slate-800 w-48 text-center">{format(currentDate, "MMMM yyyy")}</h2>
            <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight/></Button>
            <Button variant="outline" onClick={goToToday}>Today</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7">
            {days.map(day => (
              <div key={day} className="text-center font-bold text-slate-600 py-3 border-b border-r">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 h-[60vh]">
            {Array.from({ length: startingDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r bg-slate-50"></div>
            ))}
            {daysInMonth.map(day => {
              const dayEvents = events.filter(e => format(e.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
              return (
                <div key={day.toString()} className={`p-2 border-b border-r relative ${isToday(day) ? 'bg-blue-50' : ''} overflow-hidden`}>
                  <span className={`font-semibold ${isToday(day) ? 'text-blue-600' : 'text-slate-700'}`}>{format(day, "d")}</span>
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-full">
                    {dayEvents.map(event => (
                       <div key={event.id} className={`p-1 rounded-md text-xs text-white ${event.color} truncate`}>
                           {event.title}
                       </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <AppointmentForm 
                projects={data.projects}
                clients={data.clients}
                users={data.users}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
            />
        </div>
      )}
    </div>
  );
}