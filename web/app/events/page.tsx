"use client";
import { Window } from "@marvel/ui/ui";
import { LoadingPulser, Button } from "@marvel/ui/ui";
import EventCreatingForm from "./EventCreator";
import { EventCard } from "../../components/Cards";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";

const Page: React.FC<any> = ({ params }) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["event_list"],
      initialPageParam: 0,
      queryFn: async ({ pageParam }) =>
        (await axios.get(`/api/event/search?skip=${pageParam}`)).data?.data,
      getNextPageParam: (lastPage, pages) =>
        lastPage?.length == 12 ? pages?.length * 12 : null,
    });

  return (
    <Window className={"pt-5 md:pt-12 pb-40"}>
      <div className="w-full max-w-4xl flex flex-col p-5">
        {/* header  */}
        <div className="my-10">
          <h1 className="text-4xl md:text-6xl px-3">
            <span className="text-p-0 dark:text-p-9">events</span>
            <span className="text-p-4 dark:text-p-5">&nbsp;at marvel.</span>
          </h1>
          <p className="w-full max-w-2xl text-lg py-5 text-p-0 dark:text-p-6 px-3">
            Events, Workshops, Competitions and Talks at UVCE MARVEL.
          </p>
        </div>
        <EventCreatingForm />
        <div className="flex w-full gap-5 flex-wrap mt-5">
          {isLoading ? (
            <div className="w-full flex justify-center">
              <LoadingPulser />
            </div>
          ) : (
            data?.pages?.flat()?.map((d, i) => <EventCard data={d} key={i} />)
          )}
          <div className="w-full flex justify-center">
            {isFetchingNextPage ? (
              <p className="text-p-6 text-sm">Loading...</p>
            ) : hasNextPage ? (
              <Button onPress={() => fetchNextPage()}>Load more</Button>
            ) : (
              !isLoading && <p className="text-p-6 text-sm">That&apos;s it. </p>
            )}
          </div>
        </div>
      </div>
    </Window>
  );
};

export default Page;
