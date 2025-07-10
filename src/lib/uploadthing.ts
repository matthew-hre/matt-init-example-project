import type { FileRouter } from "uploadthing/server";

import { createUploadthing } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  profileImageUploader: f({ image: { maxFileSize: "2MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Uploaded image:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
