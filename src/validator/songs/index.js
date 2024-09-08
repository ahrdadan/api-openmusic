import InvariantError from '../../exceptions/InvariantError.js';
import { SongsPayloadSchema } from './schema.js';

export const SongsValidator = {
  validateSongsPayload: (payload) => {
    const validationResult = SongsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};