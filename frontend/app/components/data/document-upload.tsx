"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/app/lib/utils";

interface DocumentAnalysis {
  sections: number;
  clauses_extracted: number;
  divisions_found: Record<string, number>;
  sample_clauses: unknown[];
  ner_analysis: unknown[];
}

interface UploadedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  documentId?: string;
  analysis?: DocumentAnalysis;
}

interface DocumentUploadProps {
  projectId?: string;
  onUploadComplete?: (documentId: string, analysis: DocumentAnalysis) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
}

export function DocumentUpload({
  projectId,
  onUploadComplete,
  maxFiles = 10,
  maxSizeInMB = 50,
  acceptedFormats = [".pdf", ".docx", ".xlsx", ".txt", ".csv"],
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSizeInMB) {
        return `File size exceeds ${maxSizeInMB}MB limit`;
      }

      // Check file format
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (!acceptedFormats.includes(fileExtension)) {
        return `File format not supported. Accepted: ${acceptedFormats.join(", ")}`;
      }

      // Check max files limit
      if (files.length >= maxFiles) {
        return `Maximum ${maxFiles} files allowed`;
      }

      return null;
    },
    [files.length, maxFiles, maxSizeInMB, acceptedFormats]
  );

  const uploadFile = useCallback(async (uploadedFile: UploadedFile): Promise<void> => {
    const formData = new FormData();
    formData.append("file", uploadedFile.file);

    let progressInterval: NodeJS.Timeout | undefined;

    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: "uploading", progress: 0 }
            : f
        )
      );

      // Simulate upload progress
      progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      // Use the project-specific upload endpoint if projectId is provided
      const uploadUrl = projectId 
        ? `http://localhost:8000/api/projects/${projectId}/documents/upload`
        : `http://localhost:8000/api/documents/upload`;
        
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(errorData.detail || "Upload failed");
      }

      const result = await response.json();
      console.log("Document uploaded and analyzed:", result);

      // Update status to success and store analysis data
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { 
                ...f, 
                status: "success", 
                progress: 100,
                documentId: result.document_id,
                analysis: result.analysis
              }
            : f
        )
      );

      // Notify parent component with document ID and analysis
      if (onUploadComplete && result.document_id && result.analysis) {
        onUploadComplete(result.document_id, result.analysis);
      }
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      console.error("Upload error:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
    }
  }, [onUploadComplete, projectId]);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const newFiles: UploadedFile[] = [];

      Array.from(fileList).forEach((file) => {
        const error = validateFile(file);

        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          status: error ? "error" : "pending",
          progress: 0,
          error: error || undefined,
        };

        newFiles.push(uploadedFile);
      });

      setFiles((prev) => [...prev, ...newFiles]);

      // Start uploading files without errors
      newFiles.forEach((file) => {
        if (file.status === "pending") {
          uploadFile(file);
        }
      });
    },
    [validateFile, uploadFile]
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
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const retryUpload = useCallback((file: UploadedFile) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === file.id ? { ...f, status: "pending", error: undefined } : f
      )
    );
    uploadFile(file);
  }, [uploadFile]);

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-error" />;
      case "uploading":
      case "pending":
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-neutral-300 hover:border-primary hover:bg-neutral-50"
            )}
          >
            <Upload
              className={cn(
                "mb-4 h-12 w-12 transition-colors",
                isDragging ? "text-primary" : "text-neutral-400"
              )}
            />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Drop files here to upload
            </h3>
            <p className="mb-4 text-sm text-neutral-600">
              or click to browse from your computer
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFormats.join(",")}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <p className="mt-4 text-xs text-neutral-500">
              Accepted formats: {acceptedFormats.join(", ")} • Max {maxSizeInMB}
              MB per file
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Uploaded Files ({files.length})
            </h4>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-surface p-3"
                >
                  {getStatusIcon(file.status)}

                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <span>{formatFileSize(file.file.size)}</span>
                      {file.status === "uploading" && (
                        <>
                          <span>•</span>
                          <span>{file.progress}%</span>
                        </>
                      )}
                      {file.status === "error" && file.error && (
                        <>
                          <span>•</span>
                          <span className="text-error">{file.error}</span>
                        </>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {file.status === "uploading" && (
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-neutral-200">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {file.status === "error" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryUpload(file)}
                      >
                        Retry
                      </Button>
                    )}
                    {file.status !== "uploading" && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-neutral-600 hover:text-error"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
