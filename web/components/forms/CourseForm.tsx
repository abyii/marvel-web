"use client";

import { Button, TextField } from "@marvel/ui/ui";
import { CourseFormData } from "../../types";
import ImageUploader from "../ImageUploader";

type CourseFormProps = {
  formData: CourseFormData;
  setFormData: (args: any) => void;
  onSubmit?: () => void;
  showCourseCode?: boolean;
  submitDisabled?: boolean;
  submitLabel?: string;
};

const CourseForm = ({
  formData,
  setFormData,
  onSubmit,
  submitDisabled = false,
  submitLabel = "Submit",
  showCourseCode = false,
}: CourseFormProps) => {
  return (
    <form
      className="my-5 flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit && onSubmit();
      }}
    >
      {showCourseCode && (
        <>
          <label htmlFor="courseCode" className="text-3xl py-3">
            Course Code
          </label>
          <p className="text-p-4 dark:text-p-6 my-2">
            {
              "Course Code can be anything. But it's recommended that you follow the naming conventions. i.e {Domain/Topic}-{Serial No.}. This cannot be changed later."
            }
          </p>
          <TextField
            id="courseCode"
            fullWidth
            isRequired
            value={formData.courseCode}
            errorMessage={
              formData.courseCode && 
              !/^[a-zA-Z0-9-]+$/.test(formData.courseCode) ? 
              "Only letters, numbers and hyphens allowed" :
              formData.courseCode?.includes(" ") ?
              "Spaces are not allowed" : 
              undefined
            }
            onChange={(e) => {
              // Remove any spaces and non-alphanumeric/hyphen characters
              const sanitizedValue = e.trim().replace(/[^a-zA-Z0-9-]/g, '');
              setFormData({ ...formData, courseCode: sanitizedValue });
            }}
            placeholder="Enter Course Code"
            maxLength={12}
          />
        </>
      )}

      <label htmlFor="repoURL" className="text-3xl py-3">
        GitHub Repo URL
      </label>
      <TextField
        fullWidth
        id="repoURL"
        value={formData.repoURL}
        onChange={(e) => {
          setFormData({ ...formData, repoURL: e });
        }}
        placeholder="link to the GitHub Repo that has course data."
        maxLength={60}
      />
      <label htmlFor="caption" className="text-3xl py-3">
        Caption
      </label>
      <TextField
        fullWidth
        id="caption"
        value={formData?.caption}
        onChange={(e) => {
          setFormData({ ...formData, caption: e });
        }}
        placeholder="Caption..."
        maxLength={200}
      />
      <label htmlFor="caption" className="text-3xl py-3">
        Course duration
      </label>
      <TextField
        fullWidth
        id="duration"
        value={formData?.courseDuration}
        onChange={(e) => {
          setFormData({ ...formData, courseDuration: e });
        }}
        placeholder="Course duration"
        maxLength={20}
      />
      <ImageUploader
        className="my-5"
        value={formData?.coverPhoto as string}
        onClick={() => {
          setFormData({ ...formData, coverPhoto: "" });
        }}
        onChange={(photo) => {
          setFormData({ ...formData, coverPhoto: photo });
        }}
      />
      <Button
        className="max-w-max self-end"
        isDisabled={submitDisabled}
        type="submit"
      >
        {submitLabel}
      </Button>
    </form>
  );
};

export default CourseForm;
