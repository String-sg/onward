import type { ContentType } from '$lib/server/db.js';

export const ERROR_MESSAGES = {
  FIELD_REQUIRED: 'This field is required.',
  INVALID_OPTION: 'Invalid option selected. Please select a valid option.',
  DATE_PAST: 'Due date must be tomorrow or later.',
  INVALID_DATA: (data = 'data') => `Invalid ${data} format.`,
  ARRAY_MIN: (field: string, min: number) =>
    `At least ${min} ${field.toLowerCase()} ${min === 1 ? 'is' : 'are'} required`,
};

export type FormValidationError = Record<
  string,
  { message: string; items?: Record<string, string>[] }
>;

export interface LearningUnitDraftFormData {
  title: string | null;
  contentType: ContentType | null;
  contentURL: string | null;
  summary: string | null;
  objectives: string | null;
  createdBy: string | null;
  collectionId: string | null;
  isRecommended: boolean;
  isRequired: boolean;
  dueDate: Date | null;
  tagIds: string[];
  sources: { title: string; sourceURL: string; tagId: string }[];
  questionAnswers: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
}

export interface LearningUnitFormData {
  title: string;
  contentType: ContentType;
  contentURL: string;
  summary: string;
  objectives: string;
  createdBy: string;
  collectionId: string;
  isRecommended: boolean;
  isRequired: boolean;
  dueDate: Date | null;
  tagIds: string[];
  sources: { title: string; sourceURL: string; tagId: string }[];
  questionAnswers: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
}

/**
 * Parse and validate draft learning unit form data — schema-only validation.
 * All fields are optional; only format and type constraints are checked when values are present.
 * @param data - FormData from the request
 * @returns Parsed draft data or format validation errors
 */
export function validateLearningUnitDraft(
  data: FormData,
):
  | { success: true; data: LearningUnitDraftFormData }
  | { success: false; errors: FormValidationError } {
  const errors: FormValidationError = {};

  const titleRaw = data.get('title');
  const title =
    titleRaw && typeof titleRaw === 'string' && titleRaw.trim().length > 0 ? titleRaw.trim() : null;

  const contentTypeRaw = data.get('contentType');
  let contentType: ContentType | null = null;
  if (contentTypeRaw && typeof contentTypeRaw === 'string' && contentTypeRaw.trim().length > 0) {
    if (contentTypeRaw !== 'PODCAST') {
      errors.contentType = { message: ERROR_MESSAGES.INVALID_OPTION };
    } else {
      contentType = contentTypeRaw as ContentType;
    }
  }

  const contentURLRaw = data.get('contentURL');
  let contentURL: string | null = null;
  if (contentURLRaw && typeof contentURLRaw === 'string' && contentURLRaw.trim().length > 0) {
    try {
      new URL(contentURLRaw.trim());
      contentURL = contentURLRaw.trim();
    } catch {
      errors.contentURL = { message: ERROR_MESSAGES.INVALID_DATA('URL') };
    }
  }

  const summaryRaw = data.get('summary');
  const summary =
    summaryRaw && typeof summaryRaw === 'string' && summaryRaw.trim().length > 0
      ? summaryRaw.trim()
      : null;

  const objectivesRaw = data.get('objectives');
  const objectives =
    objectivesRaw && typeof objectivesRaw === 'string' && objectivesRaw.trim().length > 0
      ? objectivesRaw.trim()
      : null;

  const createdByRaw = data.get('createdBy');
  const createdBy =
    createdByRaw && typeof createdByRaw === 'string' && createdByRaw.trim().length > 0
      ? createdByRaw.trim()
      : null;

  const collectionIdRaw = data.get('collectionId');
  const collectionId =
    collectionIdRaw && typeof collectionIdRaw === 'string' && collectionIdRaw.trim().length > 0
      ? collectionIdRaw.trim()
      : null;

  const isRecommended = data.get('isRecommended') === 'on';
  const isRequired = data.get('isRequired') === 'on';

  let dueDate: Date | null = null;
  const dueDateRaw = data.get('dueDate');
  if (dueDateRaw && typeof dueDateRaw === 'string' && dueDateRaw.trim().length > 0) {
    const dueDateObj = new Date(dueDateRaw);
    if (isNaN(dueDateObj.getTime())) {
      errors.dueDate = { message: ERROR_MESSAGES.INVALID_DATA('date') };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDateObj <= today) {
        errors.dueDate = { message: ERROR_MESSAGES.DATE_PAST };
      } else {
        dueDate = dueDateObj;
      }
    }
  }

  const tagIds = data
    .getAll('tags')
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const sourcesJson = data.get('sources');
  let sources: LearningUnitDraftFormData['sources'] = [];
  if (sourcesJson && typeof sourcesJson === 'string') {
    try {
      sources = JSON.parse(sourcesJson);
    } catch {
      errors.sources = { message: ERROR_MESSAGES.INVALID_DATA(), items: [] };
    }

    if (!Array.isArray(sources)) {
      errors.sources = { message: ERROR_MESSAGES.INVALID_DATA(), items: [] };
      sources = [];
    } else if (sources.length > 0) {
      const sourcesItemErrors: Record<string, string>[] = [];
      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const itemError: Record<string, string> = {};

        if (typeof source.tagId !== 'string') {
          source.tagId = '';
        }

        if (
          source.sourceURL &&
          typeof source.sourceURL === 'string' &&
          source.sourceURL.trim().length > 0
        ) {
          try {
            new URL(source.sourceURL.trim());
          } catch {
            itemError.sourceURL = ERROR_MESSAGES.INVALID_DATA('URL');
          }
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

  const questionAnswersJson = data.get('questionAnswers');
  let questionAnswers: LearningUnitDraftFormData['questionAnswers'] = [];
  if (questionAnswersJson && typeof questionAnswersJson === 'string') {
    try {
      questionAnswers = JSON.parse(questionAnswersJson);
    } catch {
      errors.questionAnswers = { message: ERROR_MESSAGES.INVALID_DATA(), items: [] };
    }

    if (!Array.isArray(questionAnswers)) {
      errors.questionAnswers = { message: ERROR_MESSAGES.INVALID_DATA(), items: [] };
      questionAnswers = [];
    } else if (questionAnswers.length > 0) {
      const questionAnswerItemErrors: Record<string, string>[] = [];
      for (let i = 0; i < questionAnswers.length; i++) {
        const questionAnswer = questionAnswers[i];
        const itemError: Record<string, string> = {};

        const answerIndex =
          typeof questionAnswer.answer === 'string'
            ? Number(questionAnswer.answer)
            : questionAnswer.answer;
        if (typeof answerIndex !== 'number' || isNaN(answerIndex)) {
          itemError.answer = ERROR_MESSAGES.INVALID_DATA('answer');
        } else {
          questionAnswer.answer = answerIndex;
        }

        if (Object.keys(itemError).length > 0) {
          questionAnswerItemErrors[i] = itemError;
        }
      }
      if (questionAnswerItemErrors.length > 0) {
        errors.questionAnswers = { message: '', items: questionAnswerItemErrors };
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      title,
      contentType,
      contentURL,
      summary,
      objectives,
      createdBy,
      collectionId,
      isRecommended,
      isRequired,
      dueDate,
      tagIds,
      sources,
      questionAnswers,
    },
  };
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
      errors: FormValidationError;
    } {
  const errors: FormValidationError = {};

  const title = data.get('title');
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.title = { message: ERROR_MESSAGES.FIELD_REQUIRED };
  }

  const contentType = data.get('contentType');
  if (!contentType || typeof contentType !== 'string') {
    errors.contentType = { message: ERROR_MESSAGES.FIELD_REQUIRED };
  } else if (contentType !== 'PODCAST') {
    errors.contentType = { message: ERROR_MESSAGES.INVALID_OPTION };
  }

  const contentURL = data.get('contentURL');
  if (!contentURL || typeof contentURL !== 'string' || contentURL.trim().length === 0) {
    errors.contentURL = { message: ERROR_MESSAGES.FIELD_REQUIRED };
  } else {
    try {
      new URL(contentURL);
    } catch {
      errors.contentURL = { message: ERROR_MESSAGES.INVALID_DATA('URL') };
    }
  }

  const summary = data.get('summary');
  if (!summary || typeof summary !== 'string' || summary.trim().length === 0) {
    errors.summary = { message: ERROR_MESSAGES.FIELD_REQUIRED };
  }

  const objectives = data.get('objectives');
  if (!objectives || typeof objectives !== 'string' || objectives.trim().length === 0) {
    errors.objectives = { message: ERROR_MESSAGES.FIELD_REQUIRED };
  }

  const createdBy = data.get('createdBy');
  if (!createdBy || typeof createdBy !== 'string' || createdBy.trim().length === 0) {
    errors.createdBy = { message: ERROR_MESSAGES.FIELD_REQUIRED };
  }

  const collectionId = data.get('collectionId');
  if (!collectionId || typeof collectionId !== 'string' || collectionId.trim().length === 0) {
    errors.collectionId = { message: ERROR_MESSAGES.FIELD_REQUIRED };
  }

  const isRecommended = data.get('isRecommended') === 'on';
  const isRequired = data.get('isRequired') === 'on';

  let dueDate: Date | null = null;
  const dueDateRaw = data.get('dueDate');

  if (isRequired) {
    if (!dueDateRaw || typeof dueDateRaw !== 'string' || dueDateRaw.trim().length === 0) {
      errors.dueDate = { message: ERROR_MESSAGES.FIELD_REQUIRED };
    } else {
      const dueDateObj = new Date(dueDateRaw);

      if (isNaN(dueDateObj.getTime())) {
        errors.dueDate = { message: ERROR_MESSAGES.INVALID_DATA('date') };
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDateObj <= today) {
          errors.dueDate = { message: ERROR_MESSAGES.DATE_PAST };
        } else {
          dueDate = dueDateObj;
        }
      }
    }
  } else {
    dueDate = null;
  }

  const tagIds = data
    .getAll('tags')
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
  if (tagIds.length === 0) {
    errors.tags = { message: ERROR_MESSAGES.ARRAY_MIN('Tag', 1) };
  }

  const sourcesJson = data.get('sources');
  let sources: LearningUnitFormData['sources'] = [];
  if (sourcesJson && typeof sourcesJson === 'string') {
    try {
      sources = JSON.parse(sourcesJson);
    } catch {
      errors.sources = { message: ERROR_MESSAGES.INVALID_DATA(), items: [] };
    }

    if (!Array.isArray(sources)) {
      errors.sources = { message: ERROR_MESSAGES.INVALID_DATA(), items: [] };
    } else {
      const sourcesItemErrors: Record<string, string>[] = [];

      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const itemError: Record<string, string> = {};

        if (!source.title || typeof source.title !== 'string' || source.title.trim().length === 0) {
          itemError.title = ERROR_MESSAGES.FIELD_REQUIRED;
        }

        if (
          !source.sourceURL ||
          typeof source.sourceURL !== 'string' ||
          source.sourceURL.trim().length === 0
        ) {
          itemError.sourceURL = ERROR_MESSAGES.FIELD_REQUIRED;
        } else {
          try {
            new URL(source.sourceURL);
          } catch {
            itemError.sourceURL = ERROR_MESSAGES.INVALID_DATA('URL');
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
  } else {
    errors.sources = { message: ERROR_MESSAGES.ARRAY_MIN('Source', 1), items: [] };
  }

  const questionAnswersJson = data.get('questionAnswers');
  let questionAnswers: LearningUnitFormData['questionAnswers'] = [];
  if (questionAnswersJson && typeof questionAnswersJson === 'string') {
    try {
      questionAnswers = JSON.parse(questionAnswersJson);
    } catch {
      errors.questionAnswers = { message: ERROR_MESSAGES.INVALID_DATA(), items: [] };
    }

    if (!Array.isArray(questionAnswers)) {
      errors.questionAnswers = { message: ERROR_MESSAGES.INVALID_DATA(), items: [] };
    } else {
      if (questionAnswers.length === 0) {
        errors.questionAnswers = { message: ERROR_MESSAGES.ARRAY_MIN('question', 1), items: [] };
      } else {
        const questionAnswerItemErrors: Record<string, string>[] = [];
        for (let i = 0; i < questionAnswers.length; i++) {
          const questionAnswer = questionAnswers[i];
          const itemError: Record<string, string> = {};

          if (
            !questionAnswer.question ||
            typeof questionAnswer.question !== 'string' ||
            questionAnswer.question.trim().length === 0
          ) {
            itemError.question = ERROR_MESSAGES.FIELD_REQUIRED;
          }

          if (!Array.isArray(questionAnswer.options) || questionAnswer.options.length < 2) {
            itemError.options = ERROR_MESSAGES.ARRAY_MIN('Option', 2);
          } else {
            const hasBlankOptions = questionAnswer.options.some(
              (opt: string) => !opt || opt.trim().length === 0,
            );
            if (hasBlankOptions) {
              itemError.options = ERROR_MESSAGES.FIELD_REQUIRED;
            }
          }

          const answerIndex =
            typeof questionAnswer.answer === 'string'
              ? Number(questionAnswer.answer)
              : questionAnswer.answer;
          if (typeof answerIndex !== 'number' || isNaN(answerIndex)) {
            itemError.answer = ERROR_MESSAGES.FIELD_REQUIRED;
          } else {
            questionAnswer.answer = answerIndex;
          }

          if (
            !questionAnswer.explanation ||
            typeof questionAnswer.explanation !== 'string' ||
            questionAnswer.explanation.trim().length === 0
          ) {
            itemError.explanation = ERROR_MESSAGES.FIELD_REQUIRED;
          }

          if (Object.keys(itemError).length > 0) {
            questionAnswerItemErrors[i] = itemError;
          }
        }

        if (questionAnswerItemErrors.length > 0) {
          errors.questionAnswers = { message: '', items: questionAnswerItemErrors };
        }
      }
    }
  } else {
    errors.questionAnswers = { message: ERROR_MESSAGES.ARRAY_MIN('Question', 1), items: [] };
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      title: (title as string).trim(),
      contentType: contentType as ContentType,
      contentURL: (contentURL as string).trim(),
      summary: (summary as string).trim(),
      objectives: (objectives as string).trim(),
      createdBy: (createdBy as string).trim(),
      collectionId: (collectionId as string).trim(),
      isRecommended,
      isRequired,
      dueDate,
      tagIds,
      sources,
      questionAnswers,
    },
  };
}
