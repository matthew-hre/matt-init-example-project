"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { InputTags } from "~/components/ui/tags-input";

export default function CreateGameDialog(
  { onCreate }: { onCreate: (formData: FormData) => void } = { onCreate: () => {} },
) {
  const [tags, setTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    formData.set("tags", tags.join(","));

    onCreate(formData);

    setIsOpen(false);
    setTags([]);
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTags([]);
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
              <Input id="name" name="name" placeholder="My Daily Games" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Games I like to play every day" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="tags">Tags</Label>
              <InputTags
                value={tags}
                onChange={setTags}
                placeholder="e.g. daily, favorites, casual"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create List</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
