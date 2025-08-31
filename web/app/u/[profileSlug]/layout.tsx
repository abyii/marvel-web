import { ReactNode, cache } from "react";
import { Window, Paper } from "@marvel/ui/ui";
import { Avatar, Button } from "@marvel/ui/ui";
import dbClient from "../../../utils/dbConnector";
import Manager from "./UserManager";
import { ScopeEnum } from "@prisma/client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

const getUserBySlug = cache(async (slug: string) => {
  const person = await dbClient.people.findUnique({
    where: {
      slug: slug,
    },
    select: {
      slug: true,
      name: true,
      profilePic: true,
      scope: {
        select: {
          scope: true,
        },
      },
    },
  });
  return person;
});

export async function generateStaticParams() {
  return [];
}
export const dynamicParams = true;

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;
  const person = await getUserBySlug(params?.profileSlug);

  return {
    title: `${person?.name}'s Profile | UVCE MARVEL`,
    description: `${person?.name}'s Profile on UVCE MARVEL. UVCE's own Makerspace.`,
    openGraph: {
      type: "profile",
      title: `${person?.name}'s Profile | UVCE MARVEL`,
      description: `${person?.name}'s Profile on UVCE MARVEL. UVCE's own Makerspace.`,
    },
  } as Metadata;
}

export default async function layout(
  props: {
    children: ReactNode;
    params: Promise<{ profileSlug?: String }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const dude = await getUserBySlug(params?.profileSlug as string);
  if (!dude) {
    notFound();
  }
  return (
    <>
      <Window className="pt-10">
        {/* whole thing  */}
        <Paper className="w-full max-w-5xl mx-5 flex flex-col items-center md:flex-row md:items-start gap-5">
          {/* left part  */}
          <div className="w-full flex flex-col gap-5 max-h-min sm:max-w-xs">
            <Paper
              shadow
              border
              className="w-full max-h-min rounded-lg p-5 flex-1"
            >
              {/* picture and name  */}
              <div className="flex items-center pb-5">
                <Avatar
                  src={dude?.profilePic}
                  className="border-[1.5px] dark:border border-p-0 dark:border-p-6"
                  alt={dude?.name}
                />
                <h1 className="ml-5 text-xl">{dude?.name}</h1>
              </div>
              {/* coordinating courses */}
              {["ADMIN", "CRDN"].some((s) =>
                dude?.scope
                  ?.map((dudeScope) => dudeScope?.scope)
                  .includes(s as ScopeEnum)
              ) && (
                <div className="flex items-center border-t pt-5 max-w-full overflow-x-auto border-p-3">
                  <Button
                    variant="outlined"
                    className="mr-3 text-sm pointer-events-none"
                  >
                    Coordinator
                  </Button>
                </div>
              )}
            </Paper>
            <Manager dude={dude} />
          </div>

          {/* right box  */}
          <div className="w-full">{children}</div>
        </Paper>
      </Window>
    </>
  );
}
