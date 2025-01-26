export const AttemptStatus = {
    submitted: "submitted",
    unsubmitted: "unsubmitted"
} as const;
export type AttemptStatus = (typeof AttemptStatus)[keyof typeof AttemptStatus];
export const MediaType = {
    image: "image",
    video: "video",
    audio: "audio"
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];
export const QuestionType = {
    mcq: "mcq",
    trueOrFalse: "trueOrFalse",
    shortAnswer: "shortAnswer",
    essay: "essay"
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];
export const Platform = {
    desktop: "desktop",
    mobileAndDesktop: "mobileAndDesktop"
} as const;
export type Platform = (typeof Platform)[keyof typeof Platform];
