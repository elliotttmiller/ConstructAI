"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles,
  FileCheck,
  Loader2
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { cn } from "@/app/lib/utils";
import { useMutation } from "@tanstack/react-query";

interface DocumentFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "processing" | "success" | "error";
  progress: number;
  error?: string;
  processedData?: {
    projectName?: string;
    budget?: number;
    tasks?: number;
  };
}

interface DocumentIntakeProps {
  onDocumentsProcessed: (documents: DocumentFile[]) => void;
  onCreateProject: (data: { name: string; description: string; budget: number; documentId: string }) => void;
}

export function DocumentIntake({ onDocumentsProcessed, onCreateProject }: DocumentIntakeProps) {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: DocumentFile) => {
      const formData = new FormData();
      formData.append("file", file.file);

      // Simulate upload with progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id ? { ...f, progress } : f
              )
            );
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", `http://localhost:8000/api/documents/upload`);
        xhr.send(formData);
      });
    },
  });

  const validateFile = useCallback((file: File): string | null => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return "File size exceeds 50MB limit";
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|xlsx|txt|csv)$/i)) {
      return "Unsupported file type. Please upload PDF, DOCX, XLSX, TXT, or CSV files.";
    }

    return null;
  }, []);

  const processFile = useCallback(async (docFile: DocumentFile) => {
    try {
      // Update to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === docFile.id ? { ...f, status: "uploading", progress: 0 } : f
        )
      );

      // Upload file
      await uploadMutation.mutateAsync(docFile);

      // Update to processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === docFile.id ? { ...f, status: "processing", progress: 100 } : f
        )
      );

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock processed data - in real implementation, this comes from backend
      const processedData = {
        projectName: docFile.file.name.replace(/\.(pdf|docx|xlsx|txt|csv)$/i, ""),
        budget: Math.floor(Math.random() * 5000000) + 1000000,
        tasks: Math.floor(Math.random() * 50) + 10,
      };

      setFiles((prev) =>
        prev.map((f) =>
          f.id === docFile.id
            ? { ...f, status: "success", processedData }
            : f
        )
      );

      onDocumentsProcessed(files);
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === docFile.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Processing failed",
              }
            : f
        )
      );
    }
  }, [uploadMutation, files, onDocumentsProcessed]);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const newFiles: DocumentFile[] = [];

      Array.from(fileList).forEach((file) => {
        const validationError = validateFile(file);

        const docFile: DocumentFile = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          status: validationError ? "error" : "pending",
          progress: 0,
          error: validationError || undefined,
        };

        newFiles.push(docFile);
      });

      setFiles((prev) => [...prev, ...newFiles]);

      // Start processing valid files
      newFiles.forEach((file) => {
        if (file.status === "pending") {
          processFile(file);
        }
      });
    },
    [validateFile, processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const retryFile = useCallback((file: DocumentFile) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === file.id ? { ...f, status: "pending", error: undefined } : f
      )
    );
    processFile(file);
  }, [processFile]);

  const handleCreateProjectFromDoc = (file: DocumentFile) => {
    if (file.processedData) {
      onCreateProject({
        name: file.processedData.projectName || file.file.name,
        description: `Project created from ${file.file.name}`,
        budget: file.processedData.budget || 0,
        documentId: file.id,
      });
    }
  };

  const getStatusIcon = (file: DocumentFile) => {
    switch (file.status) {
      case "success":
        return <CheckCircle2 className="h-6 w-6 text-success" />;
      case "error":
        return <AlertCircle className="h-6 w-6 text-error" />;
      case "uploading":
      case "processing":
        return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
      case "pending":
        return <FileText className="h-6 w-6 text-neutral-400" />;
    }
  };

  const getStatusText = (file: DocumentFile) => {
    switch (file.status) {
      case "success":
        return "Analysis complete";
      case "error":
        return file.error || "Failed";
      case "uploading":
        return `Uploading ${file.progress}%`;
      case "processing":
        return "Analyzing with AI...";
      case "pending":
        return "Pending";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="flex h-full flex-col">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/60">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Upload Construction Documents
        </h1>
        <p className="text-lg text-neutral-600">
          Our AI will scan, analyze, and optimize your construction proposals automatically
        </p>
      </div>

      {/* Drop Zone */}
      <Card className="mb-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-neutral-300 hover:border-primary hover:bg-neutral-50"
          )}
        >
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "mb-6 flex h-20 w-20 items-center justify-center rounded-full transition-all",
                isDragging
                  ? "bg-primary text-white scale-110"
                  : "bg-neutral-100 text-neutral-400"
              )}
            >
              <Upload className="h-10 w-10" />
            </div>

            <h3 className="mb-2 text-xl font-semibold text-foreground">
              {isDragging ? "Drop files here" : "Drop your documents here"}
            </h3>
            <p className="mb-6 text-sm text-neutral-600">
              or click to browse from your computer
            </p>

            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="mb-4"
            >
              <Upload className="mr-2 h-5 w-5" />
              Select Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.txt,.csv"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <p className="text-xs text-neutral-500">
              Supported: PDF, DOCX, XLSX, TXT, CSV • Max 50MB per file
            </p>
          </div>
        </div>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Documents ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map((file) => (
              <Card
                key={file.id}
                className={cn(
                  "transition-all duration-200",
                  file.status === "success" && "border-success/50 bg-success/5"
                )}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Status Icon */}
                  <div className="shrink-0">{getStatusIcon(file)}</div>

                  {/* File Info */}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-semibold text-foreground">
                        {file.file.name}
                      </h4>
                      {file.status === "success" && (
                        <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          Ready
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-600">
                      {formatFileSize(file.file.size)} • {getStatusText(file)}
                    </p>

                    {/* Progress Bar */}
                    {(file.status === "uploading" || file.status === "processing") && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{
                            width: `${file.status === "uploading" ? file.progress : 100}%`,
                          }}
                        />
                      </div>
                    )}

                    {/* Processed Data */}
                    {file.status === "success" && file.processedData && (
                      <div className="mt-3 flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <FileCheck className="h-3 w-3 text-success" />
                          <span className="font-medium text-success">
                            {file.processedData.tasks} tasks detected
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-neutral-600">Budget:</span>
                          <span className="font-medium text-foreground">
                            ${file.processedData.budget?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    {file.status === "success" && (
                      <Button
                        size="sm"
                        onClick={() => handleCreateProjectFromDoc(file)}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create Project
                      </Button>
                    )}
                    {file.status === "error" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryFile(file)}
                      >
                        Retry
                      </Button>
                    )}
                    {file.status !== "uploading" && file.status !== "processing" && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-error"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
