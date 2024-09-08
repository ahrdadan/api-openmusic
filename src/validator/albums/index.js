import InvariantError from '../../exceptions/InvariantError.js';
import { AlbumPayloadSchema } from './schema.js';

const AlbumsValidator = {
  validateAlbumsPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default AlbumsValidator;