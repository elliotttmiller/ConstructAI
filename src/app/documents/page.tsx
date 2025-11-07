/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDataFetch } from "@/lib/data-fetching-hooks";
import { PageSkeleton } from "@/components/ui/loading-skeletons";
import { CACHE_TTL } from "@/lib/cache-config";
import {
  Upload,
  FileText,
  Image,
  Eye,
  Download,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  File,
  FileImage,
  FileSpreadsheet,
  RotateCcw,
  Zap,
  Loader2,
  Square,
  CheckSquare
} from "lucide-react";
import FileUpload from "@/components/documents/FileUpload";

interface Document {
  id: string;
  name: string;
  type: 'dwg' | 'dxf' | 'pdf' | 'csv' | 'xlsx' | 'image';
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  size: string;
  uploadDate: Date;
  processedDate?: Date;
  category?: string;
  extractedText?: number;
  confidence?: number;
}

// Documents will be fetched from API

const getFileIcon = (type: string) => {
  switch (type) {
    case 'dwg':
    case 'dxf':
      return <File className="h-4 w-4" />;
    case 'pdf':
      return <FileText className="h-4 w-4" />;
    case 'csv':
    case 'xlsx':
      return <FileSpreadsheet className="h-4 w-4" />;
    case 'image':
      return <FileImage className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'uploaded':
      return <Badge variant="secondary">Uploaded</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500">Processing</Badge>;
    case 'completed':
      return <Badge className="bg-green-500">Completed</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Use optimized data fetching with shorter cache for real-time updates
  const { data: documentsData, loading, error, refetch } = useDataFetch<{ documents: any[] }>(
    session?.user ? '/api/documents' : null,
    {
      cacheTTL: CACHE_TTL.SHORT, // Short cache for real-time processing updates
      onError: (err) => console.error('Error fetching documents:', err),
    }
  );

  // Format file size helper (must be above usage)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Transform API data to component format
  const documents: Document[] = useMemo(() => {
    return documentsData?.documents?.map((d: any) => ({
      id: d.id,
      name: d.name,
      type: d.type as any,
      status: d.status as any,
      size: formatFileSize(d.size),
      uploadDate: new Date(d.created_at),
      processedDate: d.updated_at ? new Date(d.updated_at) : undefined,
      category: d.category,
      extractedText: d.metadata?.extractedText || d.metadata?.extractedTextBlocks,
      confidence: d.confidence || d.metadata?.confidence,
    })) || [];
  }, [documentsData]);

  // Set up polling for processing documents - but use refetch instead of fetchDocuments
  useEffect(() => {
    if (!session?.user) return;

    const hasProcessing = documents.some(d => d.status === 'processing');
    if (!hasProcessing) return;

    // Poll every 3 seconds if there are processing documents
    const pollInterval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [session?.user, documents, refetch]);


  const handleViewDocument = (doc: Document) => {
    // Open document in new tab or modal
    window.open(`/api/documents/${doc.id}/view`, '_blank');
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading document:', err);
      setLocalError('Failed to download document');
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${doc.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      // Refresh documents list
      await refetch();
    } catch (err) {
      console.error('Error deleting document:', err);
      setLocalError('Failed to delete document');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedDocuments.size} document(s)?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete all selected documents in parallel
      await Promise.all(
        Array.from(selectedDocuments).map(docId =>
          fetch(`/api/documents/${docId}`, { method: 'DELETE' })
        )
      );

      // Clear selection and refresh
      setSelectedDocuments(new Set());
      await refetch();
    } catch (err) {
      console.error('Error deleting documents:', err);
      setLocalError('Failed to delete some documents');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(documents.map(d => d.id)));
    }
  };

  const handleRetryProcessing = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/retry`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Retry failed');

      // Refresh documents list
      await refetch();
    } catch (err) {
      console.error('Error retrying document processing:', err);
      setLocalError('Failed to retry processing');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'general');
        // If you have a project context, add projectId here
        // formData.append('projectId', currentProjectId);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        console.log('File uploaded:', data);
        
        // Refresh documents list using refetch
        await refetch();
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    }
  };

  const uploadedCount = documents.filter(d => d.status === 'uploaded').length;
  const processingCount = documents.filter(d => d.status === 'processing').length;
  const completedCount = documents.filter(d => d.status === 'completed').length;
  const errorCount = documents.filter(d => d.status === 'error').length;

  if (loading) {
    return <PageSkeleton />;
  }

  if (!session?.user) {
    return (
      <Alert>
        <AlertDescription>
          Please sign in to view documents.
        </AlertDescription>
      </Alert>
    );
  }

  if (localError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error: {localError}
        </AlertDescription>
      </Alert>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading documents: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Processing Center</h1>
          <p className="text-muted-foreground">
            Upload, process, and manage construction documents with AI
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Documents
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently being processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OCR Accuracy</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              Average extraction accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <FileUpload
        projectId="default-project"
        onUploadComplete={(uploadedDocuments) => {
          console.log('Upload completed:', uploadedDocuments);
          // Refresh the document list immediately and after a short delay
          refetch();
          setTimeout(() => refetch(), 1000);
        }}
        onUploadError={(error) => {
          console.error('Upload error:', error);
        }}
      />

      {/* Document Management */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>
                All uploaded and processed documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDocuments.size > 0 && (
                <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedDocuments.size} document(s) selected
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                      </>
                    )}
                  </Button>
                </div>
              )}
              <div className="space-y-3">
                {documents.length > 0 && (
                  <div className="flex items-center p-2 border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="mr-2"
                    >
                      {selectedDocuments.size === documents.length ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedDocuments.size === documents.length ? 'Deselect All' : 'Select All'}
                    </span>
                  </div>
                )}
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDocumentSelection(doc.id)}
                        className="p-0 h-auto hover:bg-transparent"
                      >
                        {selectedDocuments.has(doc.id) ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getFileIcon(doc.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>Uploaded {doc.uploadDate.toLocaleString()}</span>
                          {doc.category && (
                            <>
                              <span>•</span>
                              <span>{doc.category}</span>
                            </>
                          )}
                        </div>
                        {doc.status === 'processing' && (
                          <Progress value={65} className="w-32 h-2 mt-2" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {doc.status === 'completed' && doc.confidence && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{doc.confidence}%</p>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                        </div>
                      )}
                      {doc.extractedText && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{doc.extractedText}</p>
                          <p className="text-xs text-muted-foreground">Text blocks</p>
                        </div>
                      )}
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(doc.status)}
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(doc)}>
                          <Download className="h-3 w-3" />
                        </Button>
                        {doc.status === 'error' && (
                          <Button size="sm" variant="outline" onClick={() => handleRetryProcessing(doc)}>
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteDocument(doc)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents Being Processed</CardTitle>
              <CardDescription>
                Files currently being analyzed by AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.filter(doc => doc.status === 'processing').map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        {getFileIcon(doc.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">OCR extraction in progress...</p>
                        <Progress value={65} className="w-48 h-2 mt-2" />
                      </div>
                    </div>
                    <Badge className="bg-blue-500">Processing</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Documents</CardTitle>
              <CardDescription>
                Successfully processed documents ready for use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.filter(doc => doc.status === 'completed').map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        {getFileIcon(doc.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Processed {doc.processedDate?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{doc.confidence}%</p>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                      </div>
                      <Badge className="bg-green-500">Completed</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Errors</CardTitle>
              <CardDescription>
                Documents that encountered issues during processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.filter(doc => doc.status === 'error').map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <p className="text-sm text-red-600">
                          Processing failed - file format not supported
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <RotateCcw className="mr-2 h-3 w-3" />
                        Retry
                      </Button>
                      <Badge variant="destructive">Error</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
