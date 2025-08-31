import clsx from "clsx";

import type { JSX } from "react";

type MarvelLogoProps = JSX.IntrinsicElements["svg"];

export const MarvelLogoMark = ({
  stroke,
  strokeWidth,
  ...props
}: MarvelLogoProps) => {
  return (
    <svg
      className={clsx(props?.className)}
      width="375"
      height="126"
      viewBox="0 0 375 126"
      stroke="currentColor"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.60563 124.334C1.60563 124.334 16.5482 2.26516 28.1046 2.26142C39.661 2.25768 43.5321 124.32 60.76 124.314C77.9879 124.307 82.7928 2.24143 101.178 2.23559C119.563 2.22974 132.093 124.289 156.103 124.28C184.985 124.27 197.913 2.20295 239.669 2.18689C273.422 2.17391 329.52 124.221 373.583 124.204"
        strokeWidth={strokeWidth || 3}
      />
    </svg>
  );
};
