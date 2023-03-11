import clsx from "clsx";

export const FullScreenDialog = ({
  open,
  className,
  children,
  ...props
}: JSX.IntrinsicElements["dialog"]) => {
  return (
    <dialog
      open={open}
      className={clsx(
        className,
        "w-screen",
        "h-screen",
        "fixed",
        "inset-x-0",
        "top-0",
        "rounded-lg",
        `bg-[hsla(0, 0%, 9%, 0.5)]`,
        "backdrop-blur-md",
        "p-5",
        "flex",
        "justify-center",
        "overflow-y-auto"
      )}
      {...props}
    >
      {children}
    </dialog>
  );
};

export const Dialog = ({
  open,
  className,
  children,
  ...props
}: JSX.IntrinsicElements["dialog"]) => {
  return (
    <dialog
      open={open}
      className={clsx(
        className,
        "fixed",
        "top-1/2",
        "left-1/2",
        "-translate-x-1/2",
        "-translate-y-1/2",
        "rounded-lg",
        `bg-[hsla(0, 0%, 9%, 0.5)]`,
        "backdrop-blur-md",
        "p-5",
        "flex",
        "justify-center",
        "overflow-y-auto"
      )}
      {...props}
    >
      {children}
    </dialog>
  );
};