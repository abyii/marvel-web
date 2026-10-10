"use client";
import { Event } from "@prisma/client";
import clsx from "clsx";
import { useSyncExternalStore } from "react";
import { DATE_OPTIONS } from "../utils/DATE_OPTIONS";

import type { JSX } from "react";

// One shared clock for every status bar on the page, ticking once a minute.
// The server snapshot is null: cached HTML must not depend on when it was
// rendered, so the status is only computed in the browser.
const listeners = new Set<() => void>();
let now = Date.now();
let timer: number | undefined;

const subscribeToClock = (onChange: () => void) => {
  listeners.add(onChange);
  if (!timer) {
    now = Date.now();
    timer = window.setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };
};

type EventTimes = Pick<
  Event,
  | "registrationStartTime"
  | "registrationEndTime"
  | "eventStartTime"
  | "eventEndTime"
>;

// Full class names so Tailwind can find them in the source.
const STATUS_CLASS_NAMES = {
  muted: "bg-p-10 dark:bg-p-1",
  open: "bg-s-8 text-s-0 dark:bg-s-2 dark:text-s-10",
  inProgress: "bg-s-9 text-s-1 dark:bg-s-1 dark:text-s-9",
};

const format = (date: Date) => date.toLocaleDateString("en-IN", DATE_OPTIONS);
const toTime = (date: Date | string | null) =>
  date ? new Date(date).getTime() : null;

function getEventStatus(data: EventTimes, now: number) {
  const registrationStart = toTime(data?.registrationStartTime);
  const registrationEnd = toTime(data?.registrationEndTime);
  const eventStart = toTime(data?.eventStartTime);
  const eventEnd = toTime(data?.eventEndTime);

  if (registrationStart && now < registrationStart) {
    return {
      text: "Registration Starts at " + format(new Date(registrationStart)),
      className: STATUS_CLASS_NAMES.muted,
    };
  }
  if (registrationStart && registrationEnd && now < registrationEnd) {
    return {
      text: "Registrations are open!. Closes on " + format(new Date(registrationEnd)),
      className: STATUS_CLASS_NAMES.open,
    };
  }
  if (registrationEnd && eventStart && now < eventStart) {
    return {
      text: "Registrations are Closed. Event Starts at " + format(new Date(eventStart)),
      className: STATUS_CLASS_NAMES.muted,
    };
  }
  if (eventStart && eventEnd && now > eventStart && now < eventEnd) {
    return {
      text: "Event is in Progress. Ends at " + format(new Date(eventEnd)),
      className: STATUS_CLASS_NAMES.inProgress,
    };
  }
  if (eventEnd && now > eventEnd) {
    return { text: "Event is Done.", className: STATUS_CLASS_NAMES.muted };
  }
  return null;
}

const EventTimingText = ({
  data,
  children,
  className,
  ...props
}: JSX.IntrinsicElements["div"] & { data: EventTimes }) => {
  const currentTime = useSyncExternalStore(
    subscribeToClock,
    () => now,
    () => null
  );
  const status = currentTime === null ? null : getEventStatus(data, currentTime);

  return (
    <div
      className={clsx(className, status?.className ?? STATUS_CLASS_NAMES.muted)}
      {...props}
    >
      {children}
      {/* placeholder keeps the bar's height until the status is known */}
      {status?.text ?? "\u00a0"}
    </div>
  );
};

export default EventTimingText;
