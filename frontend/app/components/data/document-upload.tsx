"use client";

import * as React from "react";
import { useState, useCallback, useRef } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/app/lib/utils";
import { apiClient } from "@/app/lib/api/client";
import type { AutonomousUploadResult, QualityMetrics, APIError } from "@/app/lib/types";
import { AutonomousErrorHandler, useErrorHandler } from "./autonomous-error-handler";

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
  autonomousResult?: AutonomousUploadResult;
  qualityMetrics?: QualityMetrics;
}

interface DocumentUploadProps {
  projectId?: string;
  onUploadComplete?: (
    documentId: string,
    analysis?: DocumentAnalysis,
    autonomousResult?: AutonomousUploadResult
  ) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
}

export function DocumentUpload({
  projectId,
  onUploadComplete,
  maxFiles = 10,
  maxSizeInMB = 50,
  acceptedFormats = [".pdf", ".docx", ".txt", ".xlsx", ".csv"],
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error, handleError, clearError } = useErrorHandler();

  const validateFile = useCallback(
    (file: File): string | null => {
      const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (!acceptedFormats.includes(extension)) {
        return `Invalid file type. Accepted formats: ${acceptedFormats.join(", ")}`;
      }
      if (file.size > maxSizeInMB * 1024 * 1024) {
        return `File too large. Maximum size: ${maxSizeInMB}MB`;
      }
      if (files.length >= maxFiles) {
        return `Maximum ${maxFiles} files allowed`;
      }
      return null;
    },
    [acceptedFormats, maxSizeInMB, maxFiles, files.length]
  );

  const uploadFile = useCallback(
    async (uploadedFile: UploadedFile) => {
      if (!projectId) {
        console.error("No project ID provided");
        return;
      }

      try {
        clearError();

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: "uploading", progress: 0 }
              : f
          )
        );

        const result = await apiClient.uploadDocument(
          projectId,
          uploadedFile.file,
          (progress) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id ? { ...f, progress } : f
              )
            );
          }
        );

        console.log("Document uploaded successfully:", result);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  status: "success",
                  progress: 100,
                  documentId: result.document_id,
                  autonomousResult: undefined,
                  qualityMetrics: undefined,
                  analysis: undefined,
                }
              : f
          )
        );

        if (onUploadComplete && result.document_id) {
          onUploadComplete(result.document_id, undefined, undefined);
        }
      } catch (error) {
        console.error("Document upload error:", error);
        const apiError = error as APIError;
        handleError(apiError);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  status: "error",
                  progress: 0,
                  error: apiError.message || "Upload failed",
                }
              : f
          )
        );
      }
    },
    [onUploadComplete, projectId, handleError, clearError]
  );

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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const retryUpload = useCallback(
    (file: UploadedFile) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: "pending", error: undefined } : f
        )
      );
      uploadFile(file);
    },
    [uploadFile]
  );

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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="animate-fade-in-down">
          <AutonomousErrorHandler
            error={error}
            context="upload"
            onDismiss={clearError}
            onRetry={() => {
              clearError();
              const failedFiles = files.filter((f) => f.status === "error");
              failedFiles.forEach((file) => uploadFile(file));
            }}
          />
        </div>
      )}

      {/* Modern Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "group relative overflow-hidden rounded-xl border-2 border-dashed p-8",
          "hover-lift cursor-pointer",
          isDragging
            ? "scale-[1.02] border-primary bg-primary/5 shadow-lg shadow-primary/20"
            : "border-neutral-300 bg-neutral-50/50 hover:border-primary/50 hover:bg-primary/5",
          files.length > 0 && "py-6"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Upload Icon with Sparkle Effect */}
        <div
          className={cn(
            "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br transition-all duration-300",
            isDragging
              ? "from-primary/20 to-primary/30 scale-110 animate-pulse"
              : "from-primary/10 to-primary/20 group-hover:scale-105 group-hover:from-primary/20 group-hover:to-primary/30"
          )}
        >
          <Upload
            className={cn(
              "h-8 w-8 text-primary transition-all duration-300",
              isDragging && "animate-bounce-soft"
            )}
          />
          {!isDragging && (
            <Sparkles className="absolute h-4 w-4 -top-1 -right-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-base font-semibold text-foreground">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            or click to browse from your computer
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500">
            <span className="rounded-full bg-neutral-100 px-3 py-1">
              {acceptedFormats.join(", ")}
            </span>
            <span className="rounded-full bg-neutral-100 px-3 py-1">
              Max {maxSizeInMB}MB
            </span>
            <span className="rounded-full bg-neutral-100 px-3 py-1">
              Up to {maxFiles} files
            </span>
          </div>
        </div>

        {/* Animated Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-primary/5 backdrop-blur-[1px] animate-fade-in" />
        )}
      </div>

      {/* Modern File List */}
      {files.length > 0 && (
        <div className="space-y-3 animate-fade-in-up">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            <span>Uploaded Files ({files.length})</span>
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={file.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border p-4 animate-fade-in-up card-hover",
                  `stagger-${Math.min(index + 1, 5)}`,
                  file.status === "success" && "border-success/30 bg-success/5",
                  file.status === "error" && "border-error/30 bg-error/5",
                  file.status === "uploading" && "border-primary/30 bg-primary/5",
                  file.status === "pending" && "border-neutral-200 bg-neutral-50"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                      file.status === "success" && "bg-success/20",
                      file.status === "error" && "bg-error/20",
                      file.status === "uploading" && "bg-primary/20 animate-pulse",
                      file.status === "pending" && "bg-neutral-200"
                    )}
                  >
                    {getStatusIcon(file.status)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-sm text-foreground">
                          {file.file.name}
                        </p>
                        <p className="text-xs text-neutral-600 mt-1">
                          {formatFileSize(file.file.size)}
                          {file.status === "uploading" && ` • ${file.progress}%`}
                          {file.status === "success" && " • Ready to analyze"}
                          {file.status === "error" && ` • ${file.error}`}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {file.status === "error" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryUpload(file)}
                            className="h-8 text-xs hover-scale"
                          >
                            Retry
                          </Button>
                        )}
                        {file.status !== "uploading" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(file.id);
                            }}
                            className="rounded-full p-1.5 text-neutral-400 hover:text-error hover:bg-error/10 transition-all duration-200 hover-scale"
                            aria-label="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {file.status === "uploading" && (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                        <div
                          className="h-full bg-linear-to-r from-primary to-primary/80 transition-all duration-300 ease-out animate-progress"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Quality Metrics */}
                    {file.status === "success" && file.qualityMetrics && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover-scale-sm">
                          <div className="status-dot status-dot-info" />
                          {file.qualityMetrics.ai_iterations} AI Iterations
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 text-success text-xs font-medium hover-scale-sm">
                          <div className="status-dot status-dot-success" />
                          {file.qualityMetrics.ai_decisions_made} Decisions
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-info/10 text-info text-xs font-medium hover-scale-sm">
                          <div className="status-dot status-dot-info" />
                          {Math.round(file.qualityMetrics.completeness_score * 100)}% Complete
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
