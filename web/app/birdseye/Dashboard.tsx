"use client";
import { Tab, TabGroup } from "@marvel/ui/ui/";
import { LoadingPulser, Button } from "@marvel/ui/ui/";
import { ScopeEnum } from "@prisma/client";
import { ArticleCard, PersonCard, ReportCard } from "../../components/Cards";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getBirdseyeData } from "./actions";

const tabs = {
  report: "Reports to review",
  article: "Articles to review",
  people: "Coordinators",
};

type Tab = keyof typeof tabs;

const Dashboard = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<Tab>("report");
  const sessionUser = useSession()?.data?.user;
  useEffect(() => {
    if (
      sessionUser &&
      !["ADMIN", "CRDN"].some((s: ScopeEnum) =>
        sessionUser?.scope?.map((s) => s?.scope).includes(s)
      )
    ) {
      router.replace("/");
    }
  }, [sessionUser, router]);

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [selectedTab, "birdseye"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      getBirdseyeData({
        category: selectedTab,
        skip: pageParam,
      }),
    getNextPageParam: (lastPage, pages) =>
      lastPage?.length == 12 ? pages?.length * 12 : null,
  });

  return (
    <div className="w-full">
      <div className="w-full flex">
        <TabGroup className="max-w-full overflow-auto">
          {Object.keys(tabs)?.map((t: Tab, i) => (
            <Tab
              active={selectedTab === t}
              key={i}
              onClick={() => setSelectedTab(t)}
            >
              {tabs?.[t]}
            </Tab>
          ))}
        </TabGroup>
      </div>
      {isLoading ? (
        <div className="py-5 w-full flex justify-center">
          <LoadingPulser />
        </div>
      ) : (
        <>
          <div className="py-5 flex flex-wrap gap-5">
            {selectedTab == "report" ? (
              <>
                {data?.pages?.flat()?.map((d, i) => (
                  <ReportCard className={"min-w-[250px]"} key={i} data={d} />
                ))}
              </>
            ) : selectedTab == "article" ? (
              <>
                {data?.pages?.flat()?.map((d, i) => (
                  <ArticleCard key={i} data={d} className={"min-w-[250px]"} />
                ))}
              </>
            ) : selectedTab == "people" ? (
              <>
                {data?.pages?.flat()?.map((d: any, i) => (
                  <div
                    key={i}
                    className={
                      d?.scope?.map((s) => s.scope)?.includes("ADMIN") &&
                      "rounded-xl border-[red] border-2"
                    }
                  >
                    <PersonCard data={d} />
                  </div>
                ))}
              </>
            ) : null}
          </div>
          <div className="w-full flex justify-center">
            {isFetchingNextPage ? (
              <p className="text-p-6 text-sm">Loading...</p>
            ) : hasNextPage ? (
              <Button onPress={() => fetchNextPage()}>Load more</Button>
            ) : (
              <p className="text-p-6 text-sm">That&apos;s it. </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
