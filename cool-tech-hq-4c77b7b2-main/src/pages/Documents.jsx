
import React, { useState, useEffect } from "react";
import { Document, Project, User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, FileText, Image, File, Download } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // Added import
import { Label } from "@/components/ui/label"; // Added import
import { Textarea } from "@/components/ui/textarea"; // Added import

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docs, projs, usrs] = await Promise.all([
        Document.list("-created_date"),
        Project.list(),
        User.list()
      ]);
      setDocuments(docs || []);
      setProjects(projs || []);
      setUsers(usrs || []);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
    setIsLoading(false);
  };
  
  const handleUpload = async (file, docData) => {
    try {
        const currentUser = await User.me();
        const { file_url } = await UploadFile({ file });
        await Document.create({
            ...docData,
            file_url,
            document_name: file.name,
            uploaded_by: currentUser.id
        });
        loadData();
        setShowUploader(false);
    } catch(err) {
        console.error("Upload failed", err);
    }
  }

  const filteredDocuments = (documents || []).filter(doc => {
    const projectMatch = projectFilter === "all" || doc.project_id === projectFilter;
    const typeMatch = typeFilter === "all" || doc.document_type === typeFilter;
    return projectMatch && typeMatch;
  });
  
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
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-600 mt-1">{documents.length} total documents</p>
        </div>
        <Button onClick={() => setShowUploader(true)} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger><SelectValue placeholder="Filter by project..."/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger><SelectValue placeholder="Filter by type..."/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {['estimate', 'permit', 'work_order', 'invoice', 'job_photo', 'equipment_list', 'contract', 'other'].map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
              </Select>
          </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredDocuments.map(doc => {
                    const project = (projects || []).find(p => p.id === doc.project_id);
                    const user = (users || []).find(u => u.id === doc.uploaded_by);
                    return (
                        <TableRow key={doc.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                {getDocTypeIcon(doc.document_type)}
                                {doc.document_name}
                            </TableCell>
                            <TableCell>{project?.project_name || "N/A"}</TableCell>
                            <TableCell><Badge variant="outline">{doc.document_type.replace('_', ' ')}</Badge></TableCell>
                            <TableCell>{user?.full_name || "N/A"}</TableCell>
                            <TableCell>{format(new Date(doc.created_date), "MMM d, yyyy")}</TableCell>
                            <TableCell>
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm"><Download className="w-4 h-4"/></Button>
                                </a>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
      </Card>

      {showUploader && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Uploader projects={projects} onUpload={handleUpload} onCancel={() => setShowUploader(false)} />
        </div>
      )}
    </div>
  );
}

function Uploader({ projects, onUpload, onCancel }) {
    const [file, setFile] = useState(null);
    const [projectId, setProjectId] = useState('');
    const [docType, setDocType] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!file || !projectId || !docType) return;
        onUpload(file, { project_id: projectId, document_type: docType, notes });
    }

    return (
        <Card className="w-full max-w-lg border-0 shadow-2xl bg-white">
            <CardHeader className="border-b">
                <CardTitle>Upload a New Document</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6"> {/* Changed space-y-4 to space-y-6 */}
                    <div>
                        <Label htmlFor="file-upload">Document File</Label> {/* Added Label */}
                        <Input id="file-upload" type="file" onChange={e => setFile(e.target.files[0])} required />
                    </div>
                    <div>
                        <Label>Project</Label> {/* Added Label */}
                        <Select value={projectId} onValueChange={setProjectId} required>
                            <SelectTrigger><SelectValue placeholder="Select a project..."/></SelectTrigger>
                            <SelectContent>
                                {(projects || []).map(p => <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Document Type</Label> {/* Added Label */}
                        <Select value={docType} onValueChange={setDocType} required>
                            <SelectTrigger><SelectValue placeholder="Select document type..."/></SelectTrigger>
                            <SelectContent>
                                {/* Changed t.replace('_', ' ') to t.replace(/_/g, ' ') for global replacement */}
                                {['estimate', 'permit', 'work_order', 'invoice', 'job_photo', 'equipment_list', 'contract', 'other'].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="notes">Notes</Label> {/* Added Label */}
                        <Textarea id="notes" placeholder="Optional notes about the document..." value={notes} onChange={e => setNotes(e.target.value)} /> {/* Added Textarea */}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Upload</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
