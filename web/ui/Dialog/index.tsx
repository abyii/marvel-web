"use client";
import { FC, useEffect, useRef } from "react";
import clsx from "clsx";
import { IconButton } from "../Buttons";

interface DialogBaseProps extends React.HTMLProps<HTMLDivElement> {
  onClose: () => void;
}

export const FullScreenDialog = ({
  open,
  onClose,
  className,
  children,
  ...props
}: DialogBaseProps) => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (open && typeof window !== "undefined") {
      window.document.addEventListener("keydown", handleEscapeKey);
    } else {
      window.document.removeEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [open, onClose]);

  if (open) {
    return (
      <div
        className={clsx(
          className,
          "fixed inset-0 z-max dark:backdrop-brightness-50 backdrop-blur-xl flex w-full h-full justify-center overflow-y-auto",
          "p-5",
          { hidden: !open }
        )}
        {...props}
      >
        <div className="flex flex-col items-start w-full h-full max-w-2xl py-20">
          <IconButton variant="outlined" className="mb-8" onPress={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1"
              stroke="currentColor"
              width={"80"}
              height={"80"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
          {children}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

interface DialogProps extends DialogBaseProps {
  displayCloseButton?: boolean;
}

export const Dialog = ({
  open = false,
  onClose,
  displayCloseButton = false,
  className,
  children,
}: DialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (open && typeof window !== "undefined") {
      window.document.addEventListener("keydown", handleEscapeKey);
    } else {
      window.document.removeEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [open, onClose]);

  return (
    <div
      ref={dialogRef}
      className={clsx(
        "fixed inset-0 z-max dark:backdrop-brightness-50 backdrop-blur-xl grid place-items-center",
        { hidden: !open }
      )}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <dialog
        open={open}
        className={clsx(
          className,
          "bg-p-10 dark:bg-p-1",
          "relative appearance-none max-w-sm w-auto rounded-lg",
          "p-5 m-5",
          "border-[1.5px] dark:border border-p-0 dark:border-p-6",
          "shadow-xl"
        )}
      >
        {displayCloseButton ? (
          <IconButton
            variant="outlined"
            size="small"
            className="absolute -top-16 right-0"
            onPress={onClose}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
              <path
                fillRule="evenodd"
                d="M14.348 5.652a.5.5 0 010 .707L10.707 10l3.64 3.64a.5.5 0 11-.707.707L10 10.707l-3.64 3.64a.5.5 0 11-.707-.707L9.293 10 5.652 6.36a.5.5 0 11.707-.707L10 9.293l3.64-3.64a.5.5 0 01.708 0z"
                clipRule="evenodd"
              />
            </svg>
          </IconButton>
        ) : null}
        {children}
      </dialog>
    </div>
  );
};
