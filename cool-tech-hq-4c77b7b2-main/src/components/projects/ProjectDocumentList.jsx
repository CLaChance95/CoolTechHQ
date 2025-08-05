import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, File, Download, Upload, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function ProjectDocumentList({ documents, users, onUpload }) {
  const getDocTypeIcon = (type) => {
    const iconMap = {
      "estimate": <FileText className="text-blue-500 w-5 h-5"/>,
      "permit": <FileText className="text-orange-500 w-5 h-5"/>,
      "work_order": <FileText className="text-purple-500 w-5 h-5"/>,
      "invoice": <FileText className="text-green-500 w-5 h-5"/>,
      "job_photo": <Image className="text-indigo-500 w-5 h-5"/>,
      "equipment_list": <FileText className="text-red-500 w-5 h-5"/>,
      "contract": <FileText className="text-yellow-500 w-5 h-5"/>,
      "other": <File className="text-gray-500 w-5 h-5"/>,
    }
    return iconMap[type] || <File className="text-gray-500 w-5 h-5"/>;
  }

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
          <FileText className="w-5 h-5" /> 
          Documents ({documents?.length || 0})
        </CardTitle>
        <Button size="sm" onClick={onUpload}>
          <Plus className="w-4 h-4 mr-2" /> 
          Upload
        </Button>
      </CardHeader>
      <CardContent>
        {(documents?.length || 0) === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
            <Button variant="outline" size="sm" onClick={onUpload} className="mt-2">
              <Upload className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Document</TableHead>
                  <TableHead className="min-w-[80px]">Type</TableHead>
                  <TableHead className="min-w-[100px]">Uploaded By</TableHead>
                  <TableHead className="min-w-[80px]">Date</TableHead>
                  <TableHead className="min-w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map(doc => {
                  const user = (users || []).find(u => u.id === doc.uploaded_by);
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium flex items-center gap-2 text-xs lg:text-sm">
                        {getDocTypeIcon(doc.document_type)}
                        <span className="truncate">{doc.document_name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{doc.document_type.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell className="text-xs lg:text-sm">{user?.full_name || "N/A"}</TableCell>
                      <TableCell className="text-xs lg:text-sm">{format(new Date(doc.created_date), "MMM d")}</TableCell>
                      <TableCell>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3 lg:w-4 lg:h-4"/>
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}