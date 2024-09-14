import InvariantError from '../../exceptions/invariantError.js';
import { PlaylistPayloadSchema, SongsPlaylistPayloadSchema } from './schema.js';

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateSongPlaylistPayload: (payload) => {
    const validationResult = SongsPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default PlaylistsValidator;
