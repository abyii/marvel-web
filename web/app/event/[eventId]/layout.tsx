import { cache } from "react";
import { Metadata } from "next";
import dbClient from "../../../utils/dbConnector";

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

const getEvent = cache(async (id: string) => {
  try {
    const event = await dbClient.event.findUnique({
      where: {
        id: id,
      },
      select: {
        title: true,
        caption: true,
      },
    });
    return event;
  } catch (error) {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  return {
    title: `${event?.title} | UVCE MARVEL`,
    description: event?.caption,
  };
}

export async function generateStaticParams() {
  return [];
}
export const dynamicParams = true;

export default async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  return <>{children}</>;
}
