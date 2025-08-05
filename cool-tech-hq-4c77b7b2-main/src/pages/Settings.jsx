
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Info, X, ShieldCheck, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

function InviteUserModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
        <CardHeader className="flex flex-row justify-between items-center border-b">
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            How to Invite Users
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-slate-600">
            User invitations and role management are handled directly through your application's main dashboard for security.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-slate-800">Steps to Invite:</h4>
            <ol className="list-decimal list-inside text-slate-600 mt-2 space-y-1">
              <li>Navigate to the <span className="font-semibold">Dashboard</span> tab on the main platform sidebar (not inside the app preview).</li>
              <li>Click on the <span className="font-semibold">Users</span> section.</li>
              <li>Use the <span className="font-semibold">'Invite User'</span> button to send an invitation email.</li>
            </ol>
          </div>
          <p className="text-xs text-slate-500">
            This ensures a secure and standardized process for adding new team members to your application.
          </p>
        </CardContent>
        <div className="border-t p-4 flex justify-end">
            <Button onClick={onClose}>Got it</Button>
        </div>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, currentUserData] = await Promise.all([
        User.list(),
        User.me()
      ]);
      setUsers(usersData);
      setCurrentUser(currentUserData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    setIsLoading(false);
  };
  
  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
        await User.update(userId, { role: newRole });
        // Optimistically update the UI before reloading all data
        setUsers(currentUsers => 
            currentUsers.map(u => u.id === userId ? { ...u, role: newRole } : u)
        );
    } catch (error) {
        console.error(`Failed to update role for user ${userId}:`, error);
        alert('There was an error updating the role. Please try again.');
        // If the update fails, we can reload to revert the optimistic update
        loadData();
    } finally {
        setUpdatingUserId(null);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      user: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  };

  return (
    <div className="p-3 lg:p-6 space-y-4 lg:space-y-6 min-w-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1 text-sm lg:text-base">Manage users and application settings.</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage team members who have access to the app.</CardDescription>
            </div>
            {currentUser?.role === 'admin' && (
                <Button onClick={() => setShowInviteModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Invite User
                </Button>
            )}
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan="4" className="text-center py-8">Loading users...</TableCell>
                            </TableRow>
                        ) : users.map(user => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.profile_picture_url} alt={user.full_name} />
                                        <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                                    </Avatar>
                                    <span>{user.full_name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                {currentUser?.role === 'admin' && user.id !== currentUser.id ? (
                                    <Select
                                        value={user.role}
                                        onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                                        disabled={updatingUserId === user.id}
                                    >
                                        <SelectTrigger className="w-32 text-xs lg:text-sm">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4 text-red-600"/> Admin
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="user">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="w-4 h-4 text-blue-600"/> User
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge className={`${getRoleBadge(user.role)} text-xs lg:text-sm`}>{user.role}</Badge>
                                )}
                            </TableCell>
                            <TableCell>{format(new Date(user.created_date), 'MMM d, yyyy')}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      {showInviteModal && <InviteUserModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}
