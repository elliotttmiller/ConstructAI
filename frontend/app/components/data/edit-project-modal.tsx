"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import type { Project } from "@/app/lib/types";

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  onSubmit: (project: {
    name: string;
    description: string;
    budget: number;
  }) => Promise<void>;
}

export function EditProjectModal({
  open,
  onOpenChange,
  project,
  onSubmit,
}: EditProjectModalProps) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [budget, setBudget] = useState(project?.budget?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    budget?: string;
  }>({});

  // Reset form when project changes
  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setBudget(project.budget.toString());
      setErrors({});
    }
  }, [project]);

  const validate = (): boolean => {
    const newErrors: { name?: string; budget?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Project name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Project name must be at least 3 characters";
    }

    const budgetNum = parseFloat(budget);
    if (budget && (isNaN(budgetNum) || budgetNum < 0)) {
      newErrors.budget = "Budget must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        budget: budget ? parseFloat(budget) : 0,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update project:", error);
      setErrors({
        name: "Failed to update project. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => !isSubmitting && onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the details for your construction project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Project Name <span className="text-error">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Downtown Office Complex"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                required
                autoFocus
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-xs text-error">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                placeholder="Brief project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-budget">Budget (USD)</Label>
              <Input
                id="edit-budget"
                type="number"
                placeholder="0"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  if (errors.budget) setErrors({ ...errors, budget: undefined });
                }}
                min="0"
                step="1000"
                disabled={isSubmitting}
              />
              {errors.budget && (
                <p className="text-xs text-error">{errors.budget}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
