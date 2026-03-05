import type { FormValidationError } from '$lib/server/unit/validation.js';

export interface UnitState {
  title: string;
  contentType: string;
  contentURL: string;
  collectionId: string;
  summary: string;
  objectives: string;
  createdBy: string;
  selectedTagId: string;
  isRecommended: boolean;
  isRequired: boolean;
  dueDate: string;
  sources: { title: string; sourceURL: string; tagId: string }[];
  questionAnswers: { question: string; options: string[]; answer: number; explanation: string }[];
}

export interface UnitData {
  collections: { id: string; title: string }[];
  contentTags: { id: string; label: string }[];
  sourceTags: { id: string; label: string }[];
  contentTypes: string[];
}

export type FormErrors = FormValidationError;

export { default as LearningUnitForm } from './LearningUnitForm.svelte';
