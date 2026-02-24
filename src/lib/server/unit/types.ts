import type { LearningUnitDefaultArgs, LearningUnitGetPayload } from '$lib/server/db';

type PublishedUnitNonNullableFields =
  | 'title'
  | 'contentType'
  | 'contentURL'
  | 'summary'
  | 'objectives'
  | 'createdBy';

export type PublishedLearningUnit<TArgs extends LearningUnitDefaultArgs> = {
  [K in keyof LearningUnitGetPayload<TArgs>]: K extends PublishedUnitNonNullableFields
    ? NonNullable<LearningUnitGetPayload<TArgs>[K]>
    : LearningUnitGetPayload<TArgs>[K];
};
