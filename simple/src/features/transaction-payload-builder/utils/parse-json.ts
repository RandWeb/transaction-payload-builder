import type { JsonValue } from '../types';

export class InvalidJsonError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidJsonError';
  }
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return true;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (typeof value === 'object') {
    return Object.values(value).every(isJsonValue);
  }

  return false;
}

export function parseJson(source: string): JsonValue {
  if (source.trim().length === 0) {
    throw new InvalidJsonError('Enter JSON before building the payload.');
  }

  try {
    const value: unknown = JSON.parse(source);

    if (!isJsonValue(value)) {
      throw new InvalidJsonError('The input does not contain a valid JSON value.');
    }

    return value;
  } catch (error: unknown) {
    if (error instanceof InvalidJsonError) {
      throw error;
    }

    throw new InvalidJsonError(
      error instanceof SyntaxError ? error.message : 'Unable to parse the JSON input.',
      { cause: error },
    );
  }
}
