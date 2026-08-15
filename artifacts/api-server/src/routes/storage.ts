import { Readable } from 'stream';
import {
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from '@workspace/api-zod';
import { Router, type IRouter, type Request, type Response } from 'express';

import { ObjectNotFoundError, ObjectStorageService } from '../lib/objectStorage';
import { requireAuth } from '../lib/session';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

// Allowed MIME types and maximum upload size enforced both at request-URL time
// (metadata check) and at finalization time (GCS metadata check after upload).
const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /storage/uploads/request-url
 *
 * Step 1 of the upload flow: request a presigned PUT URL.
 * Validates declared content type and size server-side before minting the URL.
 * Requires admin or provider role.
 *
 * NOTE: The client-supplied metadata is validated here, but is not cryptographically
 * bound to the signed URL. Always call /storage/uploads/finalize after upload to
 * confirm the actual GCS object matches the declared constraints.
 */
router.post(
  '/storage/uploads/request-url',
  requireAuth(['admin', 'provider']),
  async (req: Request, res: Response) => {
    const parsed = RequestUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    const { name, size, contentType } = parsed.data;

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      res.status(400).json({
        error: 'Unsupported file type. Only JPEG, PNG, and WebP images are accepted.',
      });
      return;
    }
    if (size > MAX_UPLOAD_BYTES) {
      res.status(400).json({ error: 'File exceeds the 5 MB size limit.' });
      return;
    }

    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json(
        RequestUploadUrlResponse.parse({
          uploadURL,
          objectPath,
          metadata: { name, size, contentType },
        }),
      );
    } catch (error) {
      req.log.error({ err: error }, 'Error generating upload URL');
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  },
);

/**
 * POST /storage/uploads/finalize
 *
 * Step 3 of the upload flow (after the client PUT to the presigned URL).
 * Fetches the actual GCS object metadata and enforces content-type and size
 * limits server-side against the real uploaded bytes — not client claims.
 * Deletes non-conforming objects immediately.
 * Requires admin or provider role.
 */
router.post(
  '/storage/uploads/finalize',
  requireAuth(['admin', 'provider']),
  async (req: Request, res: Response) => {
    const { objectPath } = req.body as { objectPath?: unknown };
    if (typeof objectPath !== 'string' || !objectPath.startsWith('/objects/')) {
      res.status(400).json({ error: 'Invalid objectPath' });
      return;
    }

    try {
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      const [metadata] = await objectFile.getMetadata();

      const contentType = metadata.contentType as string | undefined;
      const size = Number(metadata.size ?? 0);

      if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
        await objectFile.delete().catch(() => {}); // best-effort cleanup
        res.status(400).json({
          error: 'Uploaded file is not an accepted image type. Only JPEG, PNG, and WebP are allowed.',
        });
        return;
      }
      if (size > MAX_UPLOAD_BYTES) {
        await objectFile.delete().catch(() => {}); // best-effort cleanup
        res.status(400).json({ error: 'Uploaded file exceeds the 5 MB size limit.' });
        return;
      }

      res.json({ objectPath });
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        res.status(404).json({ error: 'Upload not found. The file may not have been uploaded yet.' });
        return;
      }
      req.log.error({ err: error }, 'Error finalizing upload');
      res.status(500).json({ error: 'Failed to verify upload.' });
    }
  },
);

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * Unconditionally public — no authentication or ACL checks.
 */
router.get(
  '/storage/public-objects/*filePath',
  async (req: Request, res: Response) => {
    try {
      const raw = req.params.filePath;
      const filePath = Array.isArray(raw) ? raw.join('/') : raw;
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const response = await objectStorageService.downloadObject(file);
      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));

      if (response.body) {
        const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      req.log.error({ err: error }, 'Error serving public object');
      res.status(500).json({ error: 'Failed to serve public object' });
    }
  },
);

/**
 * GET /storage/objects/*
 *
 * Serve uploaded object entities (provider profile photos, etc.).
 * Restricted to authenticated users — any logged-in role may view provider photos
 * since they appear throughout the admin portal. Public-facing About page access
 * is handled separately via the public-objects path (Task #46).
 */
router.get(
  '/storage/objects/*path',
  requireAuth(),
  async (req: Request, res: Response) => {
    try {
      const raw = req.params.path;
      const wildcardPath = Array.isArray(raw) ? raw.join('/') : raw;
      const objectPath = `/objects/${wildcardPath}`;
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

      const response = await objectStorageService.downloadObject(objectFile);
      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));

      if (response.body) {
        const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        req.log.warn({ err: error }, 'Object not found');
        res.status(404).json({ error: 'Object not found' });
        return;
      }
      req.log.error({ err: error }, 'Error serving object');
      res.status(500).json({ error: 'Failed to serve object' });
    }
  },
);

export default router;
