export interface ExportConfig {
  postgresUrl: string;
  bucket: string;
  prefix: string;
  kmsKeyId: string;
  region: string;
}

type RequiredVar =
  | 'POSTGRES_URL'
  | 'NLDS_BUCKET'
  | 'NLDS_PREFIX'
  | 'NLDS_KMS_KEY_ID'
  | 'AWS_REGION';

function requireVar(env: NodeJS.ProcessEnv, name: RequiredVar): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv): ExportConfig {
  return {
    postgresUrl: requireVar(env, 'POSTGRES_URL'),
    bucket: requireVar(env, 'NLDS_BUCKET'),
    prefix: requireVar(env, 'NLDS_PREFIX'),
    kmsKeyId: requireVar(env, 'NLDS_KMS_KEY_ID'),
    region: requireVar(env, 'AWS_REGION'),
  };
}

export function objectKey(prefix: string, dataset: string, date: string): string {
  return `${prefix}${dataset}/${date}.ndjson`;
}

export function formatDateUtc(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function toNdjson(rows: readonly Record<string, unknown>[]): string {
  return rows.map((row) => `${JSON.stringify(row)}\n`).join('');
}
