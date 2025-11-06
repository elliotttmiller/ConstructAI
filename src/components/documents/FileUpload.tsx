"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

interface FileUploadProps {
  projectId?: string;
  onUploadComplete?: (documents: any[]) => void;
  onUploadError?: (error: string) => void;
}

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  response?: any;
}

export default function FileUpload({ projectId, onUploadComplete, onUploadError }: FileUploadProps) {
  const { data: session } = useSession();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      progress: 0
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);

    // Start uploading each file
    newFiles.forEach(uploadFile => {
      uploadSingleFile(uploadFile);
    });
  }, [projectId]);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.tiff', '.tif'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/dwg': ['.dwg'],
      'application/dxf': ['.dxf']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: true
  });

  const uploadSingleFile = async (uploadFile: UploadFile) => {
    try {
      setUploadFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      const formData = new FormData();
      formData.append('file', uploadFile.file);
      if (projectId) {
        formData.append('projectId', projectId);
      }
      formData.append('category', detectFileCategory(uploadFile.file.name));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => {
          if (f.id === uploadFile.id && f.progress < 90) {
            return { ...f, progress: f.progress + Math.random() * 20 };
          }
          return f;
        }));
      }, 500);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setUploadFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? {
          ...f,
          status: 'processing',
          progress: 100,
          response: result.document
        } : f
      ));

      // Poll for processing completion
      if (result.document.status === 'uploaded' || result.document.status === 'processing') {
        pollForCompletion(uploadFile.id, result.document.id);
      } else {
        setUploadFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'completed' } : f
        ));
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? {
          ...f,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ));

      if (onUploadError) {
        onUploadError(error instanceof Error ? error.message : 'Upload failed');
      }
    }
  };

  const pollForCompletion = async (uploadFileId: string, documentId: string) => {
    const maxAttempts = 30; // 30 attempts with 2-second intervals = 1 minute max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/upload?documentId=${documentId}`);
        if (response.ok) {
          const result = await response.json();
          const document = result.documents?.[0];

          if (document && (document.status === 'completed' || document.status === 'error')) {
            setUploadFiles(prev => prev.map(f =>
              f.id === uploadFileId ? {
                ...f,
                status: document.status,
                response: document
              } : f
            ));

            if (document.status === 'completed' && onUploadComplete) {
              onUploadComplete([document]);
            }
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          // Timeout - mark as completed anyway
          setUploadFiles(prev => prev.map(f =>
            f.id === uploadFileId ? { ...f, status: 'completed' } : f
          ));
        }
      } catch (error) {
        console.error('Polling error:', error);
        setUploadFiles(prev => prev.map(f =>
          f.id === uploadFileId ? {
            ...f,
            status: 'error',
            error: 'Processing timeout'
          } : f
        ));
      }
    };

    setTimeout(poll, 2000);
  };

  const detectFileCategory = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'dwg':
      case 'dxf':
        return 'CAD Drawings';
      case 'pdf':
        return 'Documents';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'tiff':
      case 'tif':
        return 'Images';
      case 'xlsx':
      case 'csv':
        return 'Spreadsheets';
      default:
        return 'Other';
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'tiff':
      case 'tif':
        return <Image className="h-4 w-4" />;
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <Upload className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'uploading':
        return 'Uploading';
      case 'processing':
        return 'Processing OCR';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive || dropzoneActive
                ? 'border-primary bg-primary/10'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop files here' : 'Drop files here or click to upload'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Support for CAD files (DWG, DXF), PDFs, images, and spreadsheets up to 500MB
            </p>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getFileIcon(uploadFile.file.name)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{uploadFile.file.name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{detectFileCategory(uploadFile.file.name)}</span>
                    </div>
                    {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                      <Progress value={uploadFile.progress} className="mt-2 h-2" />
                    )}
                    {uploadFile.error && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {uploadFile.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(uploadFile.status)}
                  <Badge variant={uploadFile.status === 'completed' ? 'default' : uploadFile.status === 'error' ? 'destructive' : 'secondary'}>
                    {getStatusText(uploadFile.status)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(uploadFile.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
