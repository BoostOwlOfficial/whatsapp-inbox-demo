"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface AIResponse {
  id: string;
  response_text: string;
  keywords?: string[];
  category?: string;
  is_active: boolean;
}

interface AIResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response?: AIResponse | null;
  onSave: (response: Partial<AIResponse>) => Promise<void>;
}

export function AIResponseDialog({
  open,
  onOpenChange,
  response,
  onSave,
}: AIResponseDialogProps) {
  const [responseText, setResponseText] = useState(
    response?.response_text || "",
  );
  const [category, setCategory] = useState(response?.category || "");
  const [keywords, setKeywords] = useState(
    response?.keywords?.join(", ") || "",
  );
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens/closes or response changes
  useEffect(() => {
    if (open) {
      setResponseText(response?.response_text || "");
      setCategory(response?.category || "");
      setKeywords(response?.keywords?.join(", ") || "");
    }
  }, [open, response]);

  const handleSave = async () => {
    if (!responseText.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: response?.id,
        response_text: responseText.trim(),
        category: category.trim() || undefined,
        keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0),
        is_active:
          response?.is_active !== undefined ? response.is_active : true,
      });
      onOpenChange(false);
      // Reset form
      setResponseText("");
      setCategory("");
      setKeywords("");
    } catch (error) {
      console.error("Error saving response:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {response ? "Edit Response" : "Add New Response"}
          </DialogTitle>
          <DialogDescription>
            {response
              ? "Update the AI auto-reply response."
              : "Create a new predefined response for AI auto-reply."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="response-text">
              Response Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="response-text"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Enter the response message..."
              className="min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {responseText.length}/1000 characters
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., greeting, pricing, support"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Helps organize your responses
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="keywords">Keywords (Optional)</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., price, cost, how much"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated keywords that might trigger this response
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!responseText.trim() || saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {response ? "Update" : "Add"} Response
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
