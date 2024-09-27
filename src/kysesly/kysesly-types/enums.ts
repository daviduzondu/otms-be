export const QuestionType = {
    mcq: "mcq",
    trueOrFalse: "trueOrFalse",
    shortAnswer: "shortAnswer",
    essay: "essay"
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];
export const MediaType = {
    image: "image",
    video: "video",
    pdf: "pdf",
    audio: "audio"
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];
export const AuthType = {
    local: "local",
    google: "google"
} as const;
export type AuthType = (typeof AuthType)[keyof typeof AuthType];
export const TestStatus = {
    active: "active",
    pending: "pending",
    completed: "completed",
    paused: "paused"
} as const;
export type TestStatus = (typeof TestStatus)[keyof typeof TestStatus];
