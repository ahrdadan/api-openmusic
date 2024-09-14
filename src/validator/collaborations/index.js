import InvariantError from '../../exceptions/invariantError.js';
import { CollaborationPayloadSchema } from './schema.js';

const CollaborationsValidator = {
  validateCollaborationPayload: (payload) => {
    const validationResult = CollaborationPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default CollaborationsValidator;
