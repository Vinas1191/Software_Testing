import Joi from "joi";

// Define fields for an artist
const artistFields = {
    Name: Joi.string().max(50).required(), // Assuming a max length of 50 for the name
};

// define fields for album
const albumFields = {
    Title: Joi.string().max(50).required(),
    ReleaseYear: Joi.number().integer().min(1900),
    ArtistId: Joi.number().integer(),
};

// define fields for tracks
const trackFields = {
    Name: Joi.string().max(50).required(), 
    UnitPrice: Joi.number().precision(2), 
    AlbumId: Joi.number().integer().positive().required(), 
    MediaTypeId: Joi.number().integer().positive().required(), 
    GenreId: Joi.number().integer(), 
    Milliseconds: Joi.number().integer().min(60000).required(),
    Bytes: Joi.number().integer(), 
    Composer: Joi.string().max(50), 
};

// artist schema
const artistPostSchema = Joi.object({...artistFields});
const artistPatchSchema = Joi.object({...artistFields});

// album schema
const albumPostSchema = Joi.object({...albumFields});
const albumPatchSchema = Joi.object({...albumFields});

// tracks schema
const trackPostSchema = Joi.object({...trackFields});
const trackPatchSchema = Joi.object({...trackFields});

const validateSchema = (payload, schema) => {
    const result = schema.validate(payload);
    if (result.error) {
        return result.error.details.map(detail => ({
            message: detail.message
        }));
    }
    return null;
};

// artist schema
export const validateArtistPost = (payload) =>  validateSchema(payload, artistPostSchema);
export const validateArtistPatch = (payload) =>  validateSchema(payload, artistPatchSchema);

//album schema
export const validateAlbumPost = (payload) => validateSchema(payload, albumPostSchema);
export const validateAlbumPatch = (payload) => validateSchema(payload, albumPatchSchema);

// tracks schema
export const validateTrackPost = (payload) => validateSchema(payload, trackPostSchema);
export const validateTrackPatch = (payload) => validateSchema(payload, trackPatchSchema);