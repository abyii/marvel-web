import { ReactNode } from 'react';

type AppbarProps = {
  children?: ReactNode;
  className?: String;
};

export const Appbar = ({ children, className, ...props }: AppbarProps) => {
  return (
    <nav
      className={`${
        className || ''
      } fixed z-max top-0 inset-x-0 bg-[hsla(0, 0%, 9%[, 0.5])] backdrop-blur-md border border-p-1
      flex justify-center p-2`}
      {...props}
    >
      {children}
    </nav>
  );
};
