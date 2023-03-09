'use client';
import { Button, LoadingPulser, Tab, TabGroup } from 'ui';
import { ScopeEnum } from '@prisma/client';
import { ArticleCard, PersonCard, ReportCard } from 'webapp/components/Cards';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInfiniteQuery } from 'react-query';

const tabs = {
  report: 'Reports to review',
  article: 'Articles to review',
  people: 'Coordinators',
};

type Tab = keyof typeof tabs;

export default () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<Tab>('report');
  const sessionUser = useSession()?.data?.user;
  useEffect(() => {
    if (
      sessionUser &&
      !['ADMIN', 'CRDN'].some((s: ScopeEnum) =>
        sessionUser?.scope?.map((s) => s?.scope).includes(s)
      )
    ) {
      router.replace('/');
    }
  }, [sessionUser]);

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    [selectedTab, 'birdseye'],
    async ({ pageParam }) =>
      (
        await axios.get(
          `/api/${selectedTab}/search?reviewStatus=PENDING&scope=ADMIN,CRDN&skip=${pageParam}`
        )
      ).data?.data,
    {
      getNextPageParam: (lastPage, pages) =>
        lastPage?.length == 12 ? pages?.length * 12 : null,
    }
  );

  return (
    <div className="w-full">
      <div className="w-full flex">
        <TabGroup className="max-w-full overflow-auto w-full">
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
      {isLoading || isFetching ? (
        <div className="py-5 w-full flex justify-center">
          <LoadingPulser />
        </div>
      ) : (
        <>
          <div className="py-5 flex flex-wrap gap-5">
            {selectedTab == 'report' ? (
              <>
                {data?.pages?.flat()?.map((d, i) => (
                  <ReportCard key={i} data={d} />
                ))}
              </>
            ) : selectedTab == 'article' ? (
              <>
                {data?.pages?.flat()?.map((d, i) => (
                  <ArticleCard key={i} data={d} />
                ))}
              </>
            ) : selectedTab == 'people' ? (
              <>
                {data?.pages?.flat()?.map((d, i) => (
                  <PersonCard key={i} data={d} />
                ))}
              </>
            ) : null}
          </div>
          <div className="w-full flex justify-center">
            {isFetchingNextPage ? (
              <p className="text-p-6 text-sm">Loading...</p>
            ) : hasNextPage ? (
              <Button onClick={() => fetchNextPage()}>Load more</Button>
            ) : (
              <p className="text-p-6 text-sm">That's it. </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
