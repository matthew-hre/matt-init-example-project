"use client";

import type { InferSelectModel } from "drizzle-orm";

import { UploadButton } from "@uploadthing/react";
import { useState } from "react";

import type { user } from "~/lib/db/schema";
import type { OurFileRouter } from "~/lib/uploadthing";

import { signOut, updateUserProfile } from "~/app/actions/user-actions";
import { Button } from "~/components/ui/button";

type UserType = InferSelectModel<typeof user>;

export default function ProfileClient({ currentUser }: { currentUser: UserType }) {
  const [imageUrl, setImageUrl] = useState(currentUser.image ?? "");

  return (
    <div className={`
      flex h-screen flex-col items-center justify-center space-y-8
    `}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Avatar"
          className="mb-4 h-24 w-24 rounded-full border"
        />
      )}

      <p className="font-sans">
        Hey
        {" "}
        <span className="font-bold">{currentUser.name}</span>
        , welcome to your profile!
      </p>

      <form
        action={async (formData) => {
          formData.set("image", imageUrl);
          await updateUserProfile(formData);
        }}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <UploadButton<OurFileRouter, "profileImageUploader">
          endpoint="profileImageUploader"
          onClientUploadComplete={(res) => {
            const url = res?.[0]?.url;
            if (url)
              setImageUrl(url);
          }}
          onUploadError={e => console.error("Upload error:", e)}
        />

        <input
          type="text"
          name="name"
          defaultValue={currentUser.name}
          className="rounded border px-3 py-2"
          placeholder="Name"
          required
        />
        <input
          type="email"
          name="email"
          defaultValue={currentUser.email}
          className="rounded border px-3 py-2"
          placeholder="Email"
          required
        />
        <input type="hidden" name="image" value={imageUrl} />
        <Button type="submit">Update Profile</Button>
      </form>

      <Button onClick={signOut} variant="outline" size="lg" className="mt-4">
        Sign Out
      </Button>
    </div>
  );
}
