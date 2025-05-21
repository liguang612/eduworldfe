import type { FileRouter } from 'uploadthing/next';

import { createUploadthing } from 'uploadthing/next';

const f = createUploadthing();

// Giới hạn kích thước file (bytes)
const MAX_AUDIO_SIZE = 30 * 1024 * 1024;
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024;

export const ourFileRouter = {
  editorUploader: f(['image', 'text', 'blob', 'pdf', 'video', 'audio'])
    .middleware(({ req }) => {
      const file = req.body as { size: number; type: string };

      if (file.type.startsWith('audio/') && file.size > MAX_AUDIO_SIZE) {
        throw new Error(`File audio không được vượt quá ${MAX_AUDIO_SIZE / (1024 * 1024)}MB`);
      }

      if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE) {
        throw new Error(`File video không được vượt quá ${MAX_VIDEO_SIZE / (1024 * 1024 * 1024)}GB`);
      }

      return {};
    })
    .onUploadComplete(({ file }) => {
      return {
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
