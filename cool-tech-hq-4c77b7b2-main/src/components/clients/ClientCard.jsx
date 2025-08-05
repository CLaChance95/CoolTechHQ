import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Edit,
  Building,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ClientCard({ client, onEdit }) {
  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(client);
  };

  return (
    <Link to={createPageUrl(`ClientDetails?id=${client.id}`)} className="block group">
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                {client.client_name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{client.contact_name}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {client.projectCount} projects
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 flex-grow flex flex-col">
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{client.phone}</span>
            </div>
          )}

          {client.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}

          {client.billing_address && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
              <span className="break-words line-clamp-2">{client.billing_address}</span>
            </div>
          )}

          {client.notes && (
            <p className="text-sm text-slate-600 line-clamp-2 flex-grow break-words">{client.notes}</p>
          )}

          <div className="flex justify-end pt-2 mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}