import { IOptions } from "sanitize-html";
import { TypeOfArticle, TypeOfEvent, TypeOfWork } from "@prisma/client";

export const SANITIZE_OPTIONS: IOptions = {
  allowedTags: [
    "iframe",
    "br",
    "strong",
    "blockquote",
    "details",
    "summary",
    "input",
    "div",
    "span",
  ],
  allowedAttributes: {
    iframe: ["src", "height"],
    input: ["type", "checked", "disabled"],
    details: ["open", "class", "className"],
    summary: ["class", "className"],
    div: ["class", "className", "id"],
    span: ["class", "className"],
  },
  allowedIframeHostnames: [
    "www.youtube.com",
    "codesandbox.io",
    "codepen.io",
    "www.thiscodeworks.com",
    "gist.github.com",
    "plot.ly",
    "www.kaggle.com",
    "player.vimeo.com",
    "plotly.com",
    "docs.google.com",
    "lu.ma",
    "forms.gle",
  ],
  nestingLimit: 5,
};

const courseWorkPhoto =
  "https://res.cloudinary.com/marvelweb/image/upload/v1678647885/coursework_ddvlol.jpg";
const projectWorkPhoto =
  "https://res.cloudinary.com/marvelweb/image/upload/v1678645549/project_work-1_qvqe48.jpg";
const articlePhoto =
  "https://res.cloudinary.com/marvelweb/image/upload/v1678645549/article_ol6oje.jpg";
const coursePagePhoto =
  "https://res.cloudinary.com/marvelweb/image/upload/v1678650375/course_page_hvaudh.jpg";
const competitionPhoto =
  "https://res.cloudinary.com/marvelweb/image/upload/v1681331964/competition_rennib.png";
const talkPhoto =
  "https://res.cloudinary.com/marvelweb/image/upload/v1681331964/talk_zu423j.png";
const workshopPhoto =
  "https://res.cloudinary.com/marvelweb/image/upload/v1681331964/workshop_ujjfgy.png";
const eventPhoto =
  "https://res.cloudinary.com/marvelweb/image/upload/v1681331964/event_ojlfob.png";
export const getCroppedCloudinaryImage = (
  src: string = "",
  fallbackType: TypeOfArticle | TypeOfWork | "COURSE_PAGE" | TypeOfEvent
): string =>
  src
    ? src?.slice(0, src?.search("upload") + 6) +
      "/ar_1.66,c_crop" +
      src?.slice(src?.search("upload") + 6)
    : fallbackType === "COURSE"
    ? courseWorkPhoto
    : fallbackType === "PROJECT"
    ? projectWorkPhoto
    : fallbackType == "BLOG" || fallbackType == "RESOURCE"
    ? articlePhoto
    : fallbackType == "COURSE_PAGE"
    ? coursePagePhoto
    : fallbackType === "COMPETITION"
    ? competitionPhoto
    : fallbackType === "EVENT"
    ? eventPhoto
    : fallbackType === "TALK"
    ? talkPhoto
    : fallbackType === "WORKSHOP"
    ? workshopPhoto
    : "";
