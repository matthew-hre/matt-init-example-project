"use client";

import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { InputTags } from "~/components/ui/tags-input";

import { createGameListSchema } from "./validation";

type GameList = {
  id: number;
  name: string;
  description: string | null;
  tags: string | null;
};

type EditGameDialogProps = {
  list: GameList;
  onEdit: (formData: FormData) => void;
  onDelete?: (listId: number) => void;
  showDelete?: boolean;
};

export default function EditGameDialog({
  list,
  onEdit,
  onDelete,
  showDelete = true,
}: EditGameDialogProps) {
  const [tags, setTags] = useState<string[]>(
    list.tags ? list.tags.split(",").map(tag => tag.trim()) : [],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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
    formData.set("id", list.id.toString());

    try {
      await onEdit(formData);
      setIsOpen(false);
      setErrors({});
    }
    catch (error) {
      console.error("Error updating game list:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to update game list" });
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete)
      return;

    setIsDeleting(true);
    try {
      await onDelete(list.id);
      setIsOpen(false);
    }
    catch (error) {
      console.error("Error deleting game list:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to delete game list" });
    }
    finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTags(list.tags ? list.tags.split(",").map(tag => tag.trim()) : []);
      setErrors({});
      setIsSubmitting(false);
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsOpen(true)}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit list</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {showDeleteConfirmation
          ? (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle>Delete List</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete "
                    {list.name}
                    "? This action cannot be undone and will permanently remove the list and all its games.
                  </DialogDescription>
                </DialogHeader>
                {errors.submit && (
                  <div className="rounded bg-red-50 p-3 text-sm text-red-500">
                    {errors.submit}
                  </div>
                )}
                <DialogFooter className={`
                  flex-col gap-2
                  sm:flex-row
                `}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className={`
                      flex-1
                      sm:flex-none
                    `}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`
                      flex-1
                      sm:flex-none
                    `}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete List"}
                  </Button>
                </DialogFooter>
              </div>
            )
          : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <DialogHeader>
                  <DialogTitle>Edit List</DialogTitle>
                  <DialogDescription>
                    Update the details of your game list.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="name">List Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={list.name}
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
                      defaultValue={list.description || ""}
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
                <DialogFooter className={`
                  flex-col gap-2
                  sm:flex-row
                `}
                >
                  {showDelete && onDelete && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteClick}
                      disabled={isSubmitting || isDeleting}
                      className={`
                        w-full
                        sm:w-auto
                      `}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete List
                    </Button>
                  )}
                  <div className={`
                    flex w-full gap-2
                    sm:w-auto
                  `}
                  >
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        disabled={isSubmitting || isDeleting}
                        className={`
                          flex-1
                          sm:flex-none
                        `}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={isSubmitting || isDeleting}
                      className={`
                        flex-1
                        sm:flex-none
                      `}
                    >
                      {isSubmitting ? "Updating..." : "Update List"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            )}
      </DialogContent>
    </Dialog>
  );
}
