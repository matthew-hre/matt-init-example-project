"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { InputTags } from "~/components/ui/tags-input";
import { createGameSchema } from "~/lib/validation";

type AddGameDialogProps = {
  listId: number;
  addGameAction: (formData: FormData) => Promise<void>;
};

export function AddGameDialog({ listId, addGameAction }: AddGameDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const rawData = {
      name: formData.get("name") as string,
      url: formData.get("url") as string,
      siteName: formData.get("siteName") as string,
      tags: tags.join(","),
    };

    const result = createGameSchema.safeParse(rawData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    formData.set("name", result.data.name);
    formData.set("url", result.data.url);
    formData.set("siteName", result.data.siteName);
    formData.set("tags", result.data.tags);

    try {
      await addGameAction(formData);
      setIsOpen(false);
      setTags([]);
      setErrors({});
    }
    catch (error) {
      console.error("Error adding game:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to add game" });
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Game
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Game</DialogTitle>
          <DialogDescription>
            Add a new game to this list.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input type="hidden" name="listId" value={listId} />
          <div className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Game name"
              className={errors.name ? "border-red-500" : ""}
              required
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://example.com"
              className={errors.url ? "border-red-500" : ""}
            />
            {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              name="siteName"
              placeholder="Platform or site name"
              className={errors.siteName ? "border-red-500" : ""}
            />
            {errors.siteName && <p className="text-sm text-red-500">{errors.siteName}</p>}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="tags">Tags</Label>
            <InputTags
              id="tags"
              name="tags"
              value={tags}
              onChange={setTags}
              placeholder="e.g. tag1, tag2, tag3"
              className={errors.tags ? "border-red-500" : ""}
            />
            {errors.tags && <p className="text-sm text-red-500">{errors.tags}</p>}
          </div>
          {errors.submit && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-500">
              {errors.submit}
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Game"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
