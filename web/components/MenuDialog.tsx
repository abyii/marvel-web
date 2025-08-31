"use client";
import { Button, IconButton, Tab, TabGroup } from "@marvel/ui/ui";
import {
  FullScreenDialog,
  TextField,
  LoadingPulser,
} from "@marvel/ui/ui/client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Course, ScopeEnum } from "@prisma/client";
import { BsSearch, BsXLg } from "react-icons/bs";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArticleCard,
  CourseCard,
  EventCard,
  PersonCard,
  ReportCard,
  WorkCard,
} from "./Cards";
import { GoSignOut, GoSignIn } from "react-icons/go";
import { useTheme } from "next-themes";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { searchMarvel } from "../app/actions";

const tabs = {
  people: "People",
  course: "Courses",
  event: "Events",
  work: "Works",
  article: "Articles",
  report: "Reports",
};
type Tab = keyof typeof tabs;

const MenuDialog = ({ menuOpen, setMenuOpen }) => {
  const sessionUser = useSession()?.data?.user;
  const theme = useTheme();
  const [query, setQuery] = useState<string>("");
  const [queryTemp, setQueryTemp] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<Tab>("people");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [selectedTab, query],
      initialPageParam: 0,
      queryFn: async ({ pageParam }) =>
        await searchMarvel({
          category: selectedTab,
          query: query,
          skip: pageParam,
        }),
      enabled: !!query || false,
      getNextPageParam: (lastPage, pages) =>
        lastPage?.length == 12 ? pages?.length * 12 : null,
    });
  return (
    <FullScreenDialog
      open={menuOpen}
      className="z-max overflow-y-auto"
      onClose={() => setMenuOpen(false)}
    >
      <div className="w-full flex flex-col items-start min-w-full pb-24">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(queryTemp);
          }}
          className="flex items-center gap-2 w-full"
        >
          <TextField
            id="search-marvel"
            className="flex-1 w-full"
            fullWidth
            placeholder="Search Marvel"
            autoComplete="Off"
            value={queryTemp}
            onChange={(e) => setQueryTemp(e)}
          />
          <IconButton
            type="reset"
            isDisabled={queryTemp === ""}
            variant="outlined"
            className="aspect-square h-full"
            onPress={() => {
              setQueryTemp("");
              setQuery("");
            }}
          >
            <BsXLg className="w-6" />
          </IconButton>
          <IconButton
            type="submit"
            className="aspect-square h-full"
            isDisabled={queryTemp === ""}
            variant="outlined"
          >
            <BsSearch className="w-6" />
          </IconButton>
        </form>
        {query !== "" || queryTemp !== "" ? (
          <>
            <div className="w-full flex max-w-2xl">
              <TabGroup className={`overflow-auto max-w-full mt-5`}>
                {Object.keys(tabs)?.map((t: Tab, i) => (
                  <Tab
                    key={i}
                    active={t == selectedTab}
                    onClick={() => {
                      setSelectedTab(t);
                    }}
                  >
                    {tabs?.[t]}
                  </Tab>
                ))}
              </TabGroup>
            </div>
            <br />
            {query === "" ? (
              <>
                <div className="w-full flex justify-center text-sm text-p-3 dark:text-p-6">
                  Type query and press Enter...
                </div>
              </>
            ) : isLoading ? (
              <div className="w-full flex justify-center">
                <LoadingPulser label="Breathe in. Breathe out." />
              </div>
            ) : (
              <div className="w-full flex flex-wrap gap-5 pb-48">
                {selectedTab === "people" ? (
                  <>
                    {data?.pages?.flat()?.map((d, i) => (
                      <PersonCard key={i} data={d} />
                    ))}
                  </>
                ) : selectedTab === "course" ? (
                  <>
                    {data?.pages?.flat()?.map((d: Course, i) => (
                      <CourseCard data={d} key={i} />
                    ))}
                  </>
                ) : selectedTab === "work" ? (
                  <>
                    {data?.pages?.flat()?.map((d, i) => (
                      <WorkCard data={d} key={i} />
                    ))}
                  </>
                ) : selectedTab === "article" ? (
                  <>
                    {data?.pages?.flat()?.map((d, i) => (
                      <ArticleCard data={d} key={i} />
                    ))}
                  </>
                ) : selectedTab === "report" ? (
                  <>
                    {data?.pages?.flat()?.map((d, i) => (
                      <ReportCard data={d} key={i} />
                    ))}
                  </>
                ) : selectedTab === "event" ? (
                  <>
                    {data?.pages?.flat()?.map((d, i) => (
                      <EventCard data={d as any} key={i} />
                    ))}
                  </>
                ) : null}
                <div className="w-full flex justify-center">
                  {isFetchingNextPage ? (
                    <p className="text-p-6 text-sm">Loading...</p>
                  ) : hasNextPage ? (
                    <Button onPress={() => fetchNextPage()}>Load more</Button>
                  ) : (
                    <p className="text-p-6 text-sm">That&apos;s it. </p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full flex flex-wrap gap-5 mt-5">
            <Link href={`/`} className="flex-1">
              <Button className="w-full">Home</Button>
            </Link>
            {["CRDN", "ADMIN"].some((s) =>
              sessionUser?.scope?.map((s) => s.scope).includes(s as ScopeEnum)
            ) && (
              <Link href={`/birdseye`} className="flex-1">
                <Button className="w-full">Coordinator Dashboard</Button>
              </Link>
            )}
            {sessionUser?.id && (
              <Link href={`/u/${sessionUser?.slug}`} className="flex-1">
                <Button className="w-full">My Profile</Button>
              </Link>
            )}
            <Link href={`/courses`} className="flex-1">
              <Button className="w-full">Courses</Button>
            </Link>
            <Link href={`/events`} className="flex-1">
              <Button className="w-full">Events</Button>
            </Link>
            {!!sessionUser?.id ? (
              <Button onPress={() => signOut()}>
                <span className="whitespace-nowrap flex gap-3 items-center">
                  <GoSignOut /> Sign Out
                </span>
              </Button>
            ) : (
              <Button onPress={() => signIn("google", { redirect: false })}>
                <span className="whitespace-nowrap flex gap-3 items-center">
                  <GoSignIn /> Sign In
                </span>
              </Button>
            )}
            <Button
              className="whitespace-nowrap flex gap-3 items-center"
              onPress={() =>
                theme.theme === "light"
                  ? theme.setTheme("dark")
                  : theme.setTheme("light")
              }
            >
              {theme.theme === "light" ? (
                <>
                  {" "}
                  <MdDarkMode /> Dark Mode{" "}
                </>
              ) : (
                <>
                  {" "}
                  <MdLightMode /> Light Mode{" "}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </FullScreenDialog>
  );
};

export default MenuDialog;
