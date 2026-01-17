import type { ContentType } from '../../../generated/prisma/enums';

export const ERROR_MESSAGES = {
  FIELD_REQUIRED: (field: string) => `${field} is required`,
  FIELD_INVALID: (field: string) => `Invalid ${field}`,
  FILE_UPLOAD_REQUIRED: (fileType: string) => `Please upload a ${fileType} file`,
  DATE_INVALID: () => 'Invalid date format',
  DATE_PAST: () => 'Due date must be today or in the future',
  ARRAY_INVALID: (field: string) => `${field} must be an array`,
  ARRAY_MIN: (field: string, min: number) =>
    `At least ${min} ${field.toLowerCase()} ${min === 1 ? 'is' : 'are'} required`,
  DATA_INVALID: (field: string) => `Invalid ${field} data. Please check the format.`,
  URL_REQUIRED: () => 'URL is required',
  URL_INVALID: () => 'Invalid URL format',
  OPTIONS_MIN: (min: number) => `At least ${min} options are required`,
  OPTIONS_EMPTY: () => 'All 4 options must have values',
  OPTIONS_EXACT: (count: number) => `Exactly ${count} options are required`,
  ANSWER_INVALID: () => 'Answer must match one of the 4 options exactly',
  ANSWER_REQUIRED: () => 'Answer is required',
  TYPE_INVALID: (field: string, expectedType: string) => `${field} must be a ${expectedType}`,
} as const;

export interface LearningUnitFormData {
  title: string;
  contentType: ContentType;
  podcastFile: File;
  summary: string;
  objectives: string;
  createdBy: string;
  collectionId: string;
  isRecommended: boolean;
  isRequired: boolean;
  dueDate: Date | null;
  tagIds: string[];
  sources: { title: string; sourceURL: string; tagId: string }[];
  questions: {
    question: string;
    options: [string, string, string, string];
    answer: number;
    explanation: string;
  }[];
}

export interface FormValidationError {
  errors: Record<string, { message: string; items: Record<string, string>[] }>;
}

/**
 * Parse and validate learning unit form data from a FormData object
 * @param data - FormData from the request
 * @returns Validated learning unit data or validation errors
 */
export function validateLearningUnit(data: FormData):
  | { success: true; data: LearningUnitFormData }
  | {
      success: false;
      errors: Record<string, { message: string; items: Record<string, string>[] }>;
    } {
  const errors: Record<string, { message: string; items: Record<string, string>[] }> = {};

  const title = data.get('title');
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.title = { message: ERROR_MESSAGES.FIELD_REQUIRED('Title'), items: [] };
  }

  const contentType = data.get('contentType');
  if (!contentType || typeof contentType !== 'string') {
    errors.contentType = { message: ERROR_MESSAGES.FIELD_REQUIRED('Content type'), items: [] };
  } else if (contentType !== 'PODCAST') {
    errors.contentType = { message: ERROR_MESSAGES.FIELD_INVALID('content type'), items: [] };
  }

  const podcastFile = data.get('podcastFile');
  if (!podcastFile || !(podcastFile instanceof File) || podcastFile.size === 0) {
    errors.podcastFile = { message: ERROR_MESSAGES.FILE_UPLOAD_REQUIRED('podcast'), items: [] };
  }

  const summary = data.get('summary');
  if (!summary || typeof summary !== 'string' || summary.trim().length === 0) {
    errors.summary = { message: ERROR_MESSAGES.FIELD_REQUIRED('Summary'), items: [] };
  }

  const objectives = data.get('objectives');
  if (!objectives || typeof objectives !== 'string' || objectives.trim().length === 0) {
    errors.objectives = {
      message: ERROR_MESSAGES.FIELD_REQUIRED('Learning objectives'),
      items: [],
    };
  }

  const createdBy = data.get('createdBy');
  if (!createdBy || typeof createdBy !== 'string' || createdBy.trim().length === 0) {
    errors.createdBy = { message: ERROR_MESSAGES.FIELD_REQUIRED('Creator name'), items: [] };
  }

  const collectionId = data.get('collectionId');
  if (!collectionId || typeof collectionId !== 'string' || collectionId.trim().length === 0) {
    errors.collectionId = { message: ERROR_MESSAGES.FIELD_REQUIRED('Collection'), items: [] };
  }

  const isRecommended = data.get('isRecommended') === 'on';
  const isRequired = data.get('isRequired') === 'on';

  const dueDateStr = data.get('dueDate');
  let dueDate: Date | null = null;
  if (dueDateStr && typeof dueDateStr === 'string' && dueDateStr.trim().length > 0) {
    dueDate = new Date(dueDateStr);
    if (isNaN(dueDate.getTime())) {
      errors.dueDate = { message: ERROR_MESSAGES.DATE_INVALID(), items: [] };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        errors.dueDate = { message: ERROR_MESSAGES.DATE_PAST(), items: [] };
      }
    }
  }

  const tagIds = data
    .getAll('tags')
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const sourcesJson = data.get('sources');
  let sources: { title: string; sourceURL: string; tagId: string }[] = [];
  if (sourcesJson && typeof sourcesJson === 'string') {
    try {
      const parsed = JSON.parse(sourcesJson);
      if (!Array.isArray(parsed)) {
        errors.sources = { message: ERROR_MESSAGES.ARRAY_INVALID('Sources'), items: [] };
      } else {
        sources = parsed;

        if (sources.length === 0) {
          errors.sources = { message: ERROR_MESSAGES.ARRAY_MIN('Source', 1), items: [] };
        } else {
          const sourcesItemErrors: Record<string, string>[] = [];

          for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            const itemError: Record<string, string> = {};
            if (
              !source.title ||
              typeof source.title !== 'string' ||
              source.title.trim().length === 0
            ) {
              itemError.title = ERROR_MESSAGES.FIELD_REQUIRED('Title');
            }
            if (
              !source.sourceURL ||
              typeof source.sourceURL !== 'string' ||
              source.sourceURL.trim().length === 0
            ) {
              itemError.sourceURL = ERROR_MESSAGES.URL_REQUIRED();
            } else {
              try {
                new URL(source.sourceURL);
              } catch {
                itemError.sourceURL = ERROR_MESSAGES.URL_INVALID();
              }
            }
            if (typeof source.tagId !== 'string') {
              source.tagId = '';
            }
            if (Object.keys(itemError).length > 0) {
              sourcesItemErrors[i] = itemError;
            }
          }
          if (sourcesItemErrors.length > 0) {
            errors.sources = { message: '', items: sourcesItemErrors };
          }
        }
      }
    } catch {
      errors.sources = { message: ERROR_MESSAGES.DATA_INVALID('sources'), items: [] };
    }
  } else {
    errors.sources = { message: ERROR_MESSAGES.ARRAY_MIN('Source', 1), items: [] };
  }

  const questionsJson = data.get('questions');
  let questions: {
    question: string;
    options: [string, string, string, string];
    answer: number;
    explanation: string;
  }[] = [];
  if (questionsJson && typeof questionsJson === 'string') {
    try {
      const parsed = JSON.parse(questionsJson);
      if (!Array.isArray(parsed)) {
        errors.questions = { message: ERROR_MESSAGES.ARRAY_INVALID('Questions'), items: [] };
      } else {
        if (parsed.length < 3) {
          errors.questions = { message: ERROR_MESSAGES.ARRAY_MIN('Questions', 3), items: [] };
        } else {
          const questionsItemErrors: Record<string, string>[] = [];
          for (let i = 0; i < parsed.length; i++) {
            const q = parsed[i];
            const itemError: Record<string, string> = {};

            if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
              itemError.question = ERROR_MESSAGES.FIELD_REQUIRED('Question text');
            }

            if (!Array.isArray(q.options) || q.options.length !== 4) {
              itemError.options = ERROR_MESSAGES.OPTIONS_EXACT(4);
            } else {
              const emptyOptions = q.options.filter(
                (opt: string) => !opt || opt.trim().length === 0,
              );
              if (emptyOptions.length > 0) {
                itemError.options = ERROR_MESSAGES.OPTIONS_EMPTY();
              }
            }

            const answerIndex = typeof q.answer === 'string' ? parseInt(q.answer, 10) : q.answer;
            if (typeof answerIndex !== 'number' || isNaN(answerIndex)) {
              itemError.answer = ERROR_MESSAGES.ANSWER_REQUIRED();
            } else if (answerIndex < 0 || answerIndex > 3) {
              itemError.answer = ERROR_MESSAGES.ANSWER_INVALID();
            } else {
              q.answer = answerIndex;
            }

            if (
              !q.explanation ||
              typeof q.explanation !== 'string' ||
              q.explanation.trim().length === 0
            ) {
              itemError.explanation = ERROR_MESSAGES.FIELD_REQUIRED('Explanation');
            }

            if (Object.keys(itemError).length > 0) {
              questionsItemErrors[i] = itemError;
            }
          }

          questions = parsed;

          if (questionsItemErrors.length > 0) {
            errors.questions = { message: '', items: questionsItemErrors };
          }
        }
      }
    } catch {
      errors.questions = { message: ERROR_MESSAGES.DATA_INVALID('questions'), items: [] };
    }
  } else {
    errors.questions = { message: ERROR_MESSAGES.ARRAY_MIN('Questions', 3), items: [] };
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      title: (title as string).trim(),
      contentType: contentType as ContentType,
      podcastFile: podcastFile as File,
      summary: (summary as string).trim(),
      objectives: (objectives as string).trim(),
      createdBy: (createdBy as string).trim(),
      collectionId: (collectionId as string).trim(),
      isRecommended,
      isRequired,
      dueDate,
      tagIds,
      sources,
      questions,
    },
  };
}
