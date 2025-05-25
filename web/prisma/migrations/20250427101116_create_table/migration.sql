-- CreateEnum
CREATE TYPE "ScopeEnum" AS ENUM ('PROFILE', 'CRDN', 'ADMIN');

-- CreateEnum
CREATE TYPE "TypeOfWork" AS ENUM ('COURSE', 'PROJECT');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AUTHOR', 'COORDINATOR');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'FLAGGED', 'FEATURED');

-- CreateEnum
CREATE TYPE "TypeOfArticle" AS ENUM ('BLOG', 'RESOURCE');

-- CreateEnum
CREATE TYPE "ArticleAuthorRole" AS ENUM ('OP', 'PENDING', 'GUEST');

-- CreateEnum
CREATE TYPE "TypeOfEvent" AS ENUM ('EVENT', 'WORKSHOP', 'COMPETITION', 'TALK');

-- CreateTable
CREATE TABLE "People" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePic" TEXT NOT NULL,
    "readMe" TEXT,
    "rankingScore" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "People_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope" (
    "personId" TEXT NOT NULL,
    "scope" "ScopeEnum" NOT NULL,

    CONSTRAINT "Scope_pkey" PRIMARY KEY ("personId","scope")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseDuration" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "coverPhoto" TEXT,
    "totalLevels" INTEGER NOT NULL,
    "repoURL" TEXT NOT NULL DEFAULT '',
    "rankingScore" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "typeOfWork" "TypeOfWork" NOT NULL,
    "totalLevels" INTEGER,
    "name" TEXT,
    "coverPhoto" TEXT,
    "courseCode" TEXT,
    "note" TEXT,
    "searchTerms" TEXT,
    "rankingScore" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeopleOnWork" (
    "personId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeopleOnWork_pkey" PRIMARY KEY ("personId","workId")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "isOverview" BOOLEAN,
    "reviewStatus" "ReviewStatus" NOT NULL,
    "feedback" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "typeOfArticle" "TypeOfArticle" NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "coverPhoto" TEXT,
    "content" TEXT NOT NULL,
    "reviewStatus" "ReviewStatus" NOT NULL,
    "feedback" TEXT,
    "rankingScore" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleToPeople" (
    "role" "ArticleAuthorRole" NOT NULL DEFAULT 'OP',
    "articleId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "ArticleToPeople_pkey" PRIMARY KEY ("articleId","personId")
);

-- CreateTable
CREATE TABLE "ArticleToCourse" (
    "articleId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "ArticleToCourse_pkey" PRIMARY KEY ("articleId","courseId")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "typeOfEvent" "TypeOfEvent" NOT NULL,
    "caption" TEXT NOT NULL,
    "coverPhoto" TEXT,
    "description" TEXT NOT NULL,
    "registrationStartTime" TIMESTAMP(3),
    "registrationEndTime" TIMESTAMP(3),
    "eventStartTime" TIMESTAMP(3) NOT NULL,
    "eventEndTime" TIMESTAMP(3),
    "actionLink" TEXT,
    "actionText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "People_googleId_key" ON "People"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "People_slug_key" ON "People"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "People_email_key" ON "People"("email");

-- CreateIndex
CREATE INDEX "People_googleId_slug_email_name_idx" ON "People"("googleId", "slug", "email", "name");

-- CreateIndex
CREATE INDEX "Scope_personId_idx" ON "Scope"("personId");

-- CreateIndex
CREATE INDEX "Scope_scope_idx" ON "Scope"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseCode_key" ON "Course"("courseCode");

-- CreateIndex
CREATE INDEX "Course_courseCode_caption_idx" ON "Course"("courseCode", "caption");

-- CreateIndex
CREATE INDEX "Work_courseCode_name_searchTerms_idx" ON "Work"("courseCode", "name", "searchTerms");

-- CreateIndex
CREATE INDEX "PeopleOnWork_personId_idx" ON "PeopleOnWork"("personId");

-- CreateIndex
CREATE INDEX "PeopleOnWork_workId_idx" ON "PeopleOnWork"("workId");

-- CreateIndex
CREATE INDEX "Report_workId_title_reviewStatus_idx" ON "Report"("workId", "title", "reviewStatus");

-- CreateIndex
CREATE INDEX "Article_title_typeOfArticle_reviewStatus_caption_idx" ON "Article"("title", "typeOfArticle", "reviewStatus", "caption");

-- CreateIndex
CREATE INDEX "ArticleToPeople_articleId_idx" ON "ArticleToPeople"("articleId");

-- CreateIndex
CREATE INDEX "ArticleToPeople_personId_idx" ON "ArticleToPeople"("personId");

-- CreateIndex
CREATE INDEX "ArticleToCourse_articleId_idx" ON "ArticleToCourse"("articleId");

-- CreateIndex
CREATE INDEX "ArticleToCourse_courseId_idx" ON "ArticleToCourse"("courseId");

-- CreateIndex
CREATE INDEX "Event_title_caption_idx" ON "Event"("title", "caption");

-- AddForeignKey
ALTER TABLE "Scope" ADD CONSTRAINT "Scope_personId_fkey" FOREIGN KEY ("personId") REFERENCES "People"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_courseCode_fkey" FOREIGN KEY ("courseCode") REFERENCES "Course"("courseCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeopleOnWork" ADD CONSTRAINT "PeopleOnWork_personId_fkey" FOREIGN KEY ("personId") REFERENCES "People"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeopleOnWork" ADD CONSTRAINT "PeopleOnWork_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleToPeople" ADD CONSTRAINT "ArticleToPeople_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleToPeople" ADD CONSTRAINT "ArticleToPeople_personId_fkey" FOREIGN KEY ("personId") REFERENCES "People"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleToCourse" ADD CONSTRAINT "ArticleToCourse_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleToCourse" ADD CONSTRAINT "ArticleToCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
