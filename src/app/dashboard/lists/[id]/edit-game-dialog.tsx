"use client";

import { Edit2 } from "lucide-react";
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

import type { Game } from "./types";

type EditGameDialogProps = {
  game: Game;
  updateGameAction: (formData: FormData) => Promise<void>;
};

export function EditGameDialog({ game, updateGameAction }: EditGameDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<string[]>(game.tags ? game.tags.split(",") : []);

  const handleUpdate = async (formData: FormData) => {
    formData.set("tags", tags.join(","));
    await updateGameAction(formData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
          <DialogDescription>
            Update the game details below.
          </DialogDescription>
        </DialogHeader>
        <form action={handleUpdate}>
          <input type="hidden" name="id" value={game.id} />
          <input type="hidden" name="listId" value={game.listId || ""} />
          <div className="space-y-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={game.name}
                placeholder="Game name"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                type="url"
                defaultValue={game.url || ""}
                placeholder="https://example.com"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                name="siteName"
                defaultValue={game.siteName || ""}
                placeholder="Platform or site name"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="tags">Tags</Label>
              <InputTags
                id="tags"
                name="tags"
                value={tags}
                onChange={setTags}
                placeholder="e.g. tag1, tag2, tag3"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
