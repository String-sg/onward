import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { type PrismaClient } from '../src/generated/prisma/client.js';

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

export interface Dataset<Row extends Record<string, unknown>> {
  readonly name: string;
  fetch(client: PrismaClient): Promise<Row[]>;
}

interface UserRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface MandatoryQuizOutcomeRow extends Record<string, unknown> {
  user_id: string;
  learning_unit_id: string;
  learning_unit_title: string;
  due_date: string | null;
  is_completed: boolean;
  is_quiz_attempted: boolean;
  is_quiz_passed: boolean | null;
  number_of_attempts: number;
  updated_at: string;
}

export const usersDataset: Dataset<UserRow> = {
  name: 'users',
  async fetch(client) {
    const rows = await client.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      created_at: r.createdAt.toISOString(),
    }));
  },
};

export const mandatoryQuizOutcomesDataset: Dataset<MandatoryQuizOutcomeRow> = {
  name: 'mandatory_quiz_outcomes',
  async fetch(client) {
    const rows = await client.learningJourney.findMany({
      select: {
        userId: true,
        learningUnitId: true,
        isCompleted: true,
        isQuizAttempted: true,
        isQuizPassed: true,
        numberOfAttempts: true,
        updatedAt: true,
        learningUnit: { select: { title: true, dueDate: true } },
      },
      where: { learningUnit: { isRequired: true } },
    });
    return rows.map((r) => ({
      user_id: r.userId,
      learning_unit_id: r.learningUnitId,
      learning_unit_title: r.learningUnit.title,
      due_date: r.learningUnit.dueDate ? r.learningUnit.dueDate.toISOString().slice(0, 10) : null,
      is_completed: r.isCompleted,
      is_quiz_attempted: r.isQuizAttempted,
      is_quiz_passed: r.isQuizPassed,
      number_of_attempts: r.numberOfAttempts,
      updated_at: r.updatedAt.toISOString(),
    }));
  },
};

export async function putObject(
  client: S3Client,
  cfg: ExportConfig,
  key: string,
  body: string,
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: 'application/x-ndjson',
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: cfg.kmsKeyId,
    }),
  );
}

export const datasets: readonly Dataset<Record<string, unknown>>[] = [
  usersDataset,
  mandatoryQuizOutcomesDataset,
];
