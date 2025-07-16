"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { InputTags } from "~/components/ui/tags-input";
import { createGameListSchema } from "~/lib/validation";

export default function CreateGameListDialog(
  { onCreate }: { onCreate: (formData: FormData) => void } = { onCreate: () => {} },
) {
  const [tags, setTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      tags: tags.join(","),
    };

    const result = createGameListSchema.safeParse(rawData);

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
    formData.set("description", result.data.description);
    formData.set("tags", result.data.tags);

    try {
      await onCreate(formData);
      setIsOpen(false);
      setTags([]);
      setErrors({});
    }
    catch (error) {
      console.error("Error creating game list:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to create game list" });
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTags([]);
      setErrors({});
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button
          className={`
            bg-primary text-primary-foreground
            hover:bg-primary/90
          `}
          onClick={() => setIsOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className={`
            hidden
            md:block
          `}
          >
            New List
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Create a List</DialogTitle>
            <DialogDescription>
              Add some initial details about your game list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="My Daily Games"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Games I like to play every day"
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="tags">Tags</Label>
              <InputTags
                value={tags}
                onChange={setTags}
                placeholder="e.g. daily, favorites, casual"
                className={`
                  w-full
                  ${errors.tags ? "border-red-500" : ""}
                `}
              />
              {errors.tags && (
                <p className="text-sm text-red-500">{errors.tags}</p>
              )}
            </div>
            {errors.submit && (
              <div className="rounded bg-red-50 p-3 text-sm text-red-500">
                {errors.submit}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
