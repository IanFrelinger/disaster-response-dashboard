import { z } from 'zod';
import { createLongitude, createLatitude, createZoom } from '../types/domain';

// Base coordinate schemas
export const longitudeSchema = z.number()
  .min(-180)
  .max(180)
  .transform(createLongitude);

export const latitudeSchema = z.number()
  .min(-90)
  .max(90)
  .transform(createLatitude);

export const zoomSchema = z.number()
  .min(0)
  .max(22)
  .transform(createZoom);

// GeoJSON schemas
export const coordinateSchema = z.tuple([longitudeSchema, latitudeSchema]);

export const pointSchema = z.object({
  type: z.literal('Point'),
  coordinates: coordinateSchema
});

export const lineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(coordinateSchema).min(2)
});

export const polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(coordinateSchema).min(3)).min(1)
});

export const geometrySchema = z.discriminatedUnion('type', [
  pointSchema,
  lineStringSchema,
  polygonSchema
]);

export const featureSchema = z.object({
  type: z.literal('Feature'),
  geometry: geometrySchema,
  properties: z.record(z.unknown()).optional(),
  id: z.union([z.string(), z.number()]).optional()
});

export const featureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(featureSchema),
  bbox: z.array(z.number()).length(4).optional(),
  crs: z.unknown().optional()
});

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  error: z.string().optional(),
  error_code: z.string().optional(),
  trace_id: z.string().optional(),
  timestamp: z.string()
});

export const paginationSchema = z.object({
  page: z.number().min(1),
  per_page: z.number().min(1).max(100),
  total: z.number().min(0),
  total_pages: z.number().min(1)
});

// Map configuration schemas
export const mapStyleSchema = z.object({
  version: z.number(),
  name: z.string(),
  sources: z.record(z.unknown()),
  layers: z.array(z.object({
    id: z.string(),
    type: z.string(),
    source: z.string(),
    paint: z.record(z.unknown()).optional(),
    layout: z.record(z.unknown()).optional()
  }))
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  error_code: z.string(),
  trace_id: z.string(),
  timestamp: z.string(),
  details: z.record(z.unknown()).optional()
});

// Validation functions
export const validateGeoJSON = (data: unknown) => {
  return featureCollectionSchema.parse(data);
};

export const validateAPIResponse = (data: unknown) => {
  return apiResponseSchema.parse(data);
};

export const validateErrorResponse = (data: unknown) => {
  return errorResponseSchema.parse(data);
};

export const validateMapStyle = (data: unknown) => {
  return mapStyleSchema.parse(data);
};
