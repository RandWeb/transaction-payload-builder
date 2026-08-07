export type JsonPrimitive = boolean | number | string | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };

export interface TransactionPayload {
  readonly schemaVersion: '1.0';
  readonly generatedAt: string;
  readonly transaction: JsonValue;
}

export interface PayloadTransformer {
  transform(source: JsonValue): TransactionPayload;
}
