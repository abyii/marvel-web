"use client";

import clsx from "clsx";
import { useRef } from "react";
import {
  AriaButtonProps,
  LongPressProps,
  useButton,
  useLongPress,
  mergeProps,
} from "react-aria";

export type ButtonProps = AriaButtonProps &
  LongPressProps & {
    variant?: "text" | "outlined" | "standard";
    size?: "small" | "medium" | "large";
    className?: string;
    right?: React.ComponentType<any>;
    left?: React.ComponentType<any>;
  };

export const Button = ({
  variant = "standard",
  size = "medium",
  right: Right,
  left: Left,
  ...props
}: ButtonProps) => {
  let ref = useRef(null);
  let { buttonProps } = useButton(props, ref);
  let { longPressProps } = useLongPress(props);
  let { children } = props;

  return (
    <button
      {...mergeProps(buttonProps, longPressProps)}
      className={clsx(
        props?.className,
        //base classes
        "overflow-hidden min-w-max max-h-min whitespace-nowrap cursor-pointer select-none",
        "outline-none active:outline-none",
        "flex justify-center gap-2 flex-nowrap items-center",
        "rounded-full px-[1.2em] py-[0.5em]",
        "hover:translate-y-[-1.5px] active:scale-95 transition ease-out",
        "disabled:opacity-50",
        "disabled:cursor-not-allowed",
        "disabled:active:transform-none",
        "disabled:hover:transform-none",
        //size
        {
          "text-sm": size == "small",
          "text-base": size == "medium",
          "text-lg": size == "large",
        },
        //variants
        {
          //standard
          "bg-p-1 hover:bg-p-2 text-p-10 dark:bg-p-2 dark:hover:bg-p-3":
            variant == "standard",
          "border-[1.5px] border-p-1 hover:border-p-2 dark:border-p-2 dark:hover:border-p-3":
            variant == "standard",
          //outlined
          "bg-p-10 dark:bg-p-1 hover:bg-p-9 dark:hover:bg-p-2 text-p-0 dark:text-p-10":
            variant == "outlined",
          "border-[1.5px] dark:border border-p-0 dark:border-p-6":
            variant == "outlined",
          //text
          "underline text-p-0 dark:text-p-10 hover:bg-p-9 hover:dark:bg-p-1":
            variant === "text",
        }
      )}
    >
      {Left ? (
        <Left
          className={clsx(
            "h-full aspect-square -ml-1 -my-1 justify-center",
            {
              "text-p-10": variant == "standard",
            },
            {
              "text-p-0 dark:text-p-10":
                variant == "outlined" || variant == "text",
            }
          )}
        />
      ) : null}
      {children}
      {Right ? (
        <Right
          className={clsx(
            "h-full aspect-square -mr-1 -my-1 justify-center",
            {
              "text-p-10": variant == "standard",
            },
            {
              "text-p-0 dark:text-p-10":
                variant == "outlined" || variant == "text",
            }
          )}
        />
      ) : null}
    </button>
  );
};

export type IconButtonProps = AriaButtonProps &
  LongPressProps & {
    variant?: "text" | "outlined" | "standard";
    size?: "small" | "medium" | "large";
    className?: string;
  };

export const IconButton = ({
  variant = "standard",
  size = "medium",
  ...props
}: IconButtonProps) => {
  let ref = useRef(null);
  let { buttonProps } = useButton(props, ref);
  let { longPressProps } = useLongPress(props);
  let { children } = props;
  return (
    <button
      {...mergeProps(buttonProps, longPressProps)}
      className={clsx(
        props?.className,
        //base classes
        "cursor-pointer select-none",
        "outline-none active:outline-none focus:outline-none",
        "rounded-full p-2 aspect-square",
        "flex justify-center items-center",
        "hover:translate-y-[-1.5px] active:scale-95 transition ease-out",
        "text-p-0 dark:text-p-10",
        "disabled:opacity-50",
        "disabled:cursor-not-allowed",
        "disabled:active:transform-none",
        "disabled:hover:transform-none",
        //size
        {
          "text-sm": size == "small",
          "text-base": size == "medium",
          "text-2xl": size == "large",
        },
        //variants
        {
          //standard
          "bg-p-1 hover:bg-p-2 text-p-10 dark:bg-p-2 dark:hover:bg-p-3":
            variant == "standard",
          "border-[1.5px] border-p-1 hover:border-p-2 dark:border-p-2 dark:hover:border-p-3":
            variant == "standard",
          //outlined
          "bg-p-10 hover:bg-p-9 dark:bg-p-1 dark:hover:bg-p-2":
            variant == "outlined",
          "border-[1.5px] dark:border-[1px] border-p-0 dark:border-p-6":
            variant == "outlined",
          //text
          "underline hover:bg-p-9 hover:dark:bg-p-1": variant === "text",
        }
      )}
    >
      {children}
    </button>
  );
};
