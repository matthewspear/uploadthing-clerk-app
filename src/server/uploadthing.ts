import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    // eslint-disable-next-line
    .middleware(async ({ req, res }) => {
      // This code runs on your server before upload
      try {
        // eslint-disable-next-line
        const { userId } = JSON.parse(req.body) as { userId: string };

        // If you throw, the user will not be able to upload
        if (!userId) throw new Error("Unauthorized");

        // Whatever is returned here is accessible in onUploadComplete as `metadata`
        return { userId: userId };
      } catch (e) {
        console.log("Error", e);
      }
      return { userId: null };
    })
    // eslint-disable-next-line
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
