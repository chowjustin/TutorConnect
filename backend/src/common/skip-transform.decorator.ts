import { SetMetadata } from '@nestjs/common';

export const SKIP_TRANSFORM_KEY = 'dbb:skip-transform';

/**
 * Mark a controller or handler so the global TransformInterceptor will
 * leave the response untouched. Use for file downloads, iCal streams,
 * Swagger JSON, redirects, or any non-JSON payload.
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
