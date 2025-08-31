import { TypeOfEvent } from "@prisma/client";
import { ImageListType } from "react-images-uploading";

export type ArticleFormData = {
  title: string;
  caption: string;
  coverPhoto?: string | ArrayBuffer | ImageListType;
  content: string;
  courseIds?: string[];
};

export type ReportFormData = {
  title: string;
  content: string;
};

export type CourseFormData = {
  courseCode?: string;
  courseDuration: string;
  caption: string;
  coverPhoto?: string | ArrayBuffer;
  repoURL: string;
};

export type WorkFormData = {
  name: string;
  note?: string;
  coverPhoto?: string | ArrayBuffer;
};

export type TrackDescription = {
  title: string;
  suffix: string;
  desc: string;
  buttons?: {
    link: string;
    buttonText: string;
    variant: "standard" | "outlined" | "text";
  }[];
};

export type EventFormData = {
  title: string;
  typeOfEvent: TypeOfEvent;
  caption: string;
  coverPhoto?: string | ArrayBuffer;
  description: string;

  eventStartTime?: Date;
  eventEndTime?: Date;

  requiresRegistration: boolean;
  registrationStartTime?: Date;
  registrationEndTime?: Date;

  requiresActionButton: boolean;
  actionLink?: string;
  actionText?: string;
};
