'use client';

import {
  Button,
  FullScreenDialog,
  IconButton,
  TabGroup,
  Tab,
} from '@marvel/web-ui';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { VscClose as CloseIcon } from 'react-icons/vsc';

const Manager = ({ dude }: { dude: Object }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const sessionUser = useSession()?.data?.user;
  if (
    sessionUser?.scope?.includes('STU_TRACK') ||
    sessionUser?.scope?.includes('PRO_TRACK') ||
    sessionUser?.scope?.includes('ADMIN') ||
    sessionUser?.scope?.includes('DEV')
  ) {
    return (
      <>
        <div className="w-full">
          <Button onClick={() => setDialogOpen((p) => !p)}>Manage User</Button>
        </div>
        {dialogOpen && (
          <FullScreenDialog open={dialogOpen} className="z-10">
            <div className="w-full max-w-2xl py-24">
              <IconButton onClick={() => setDialogOpen((p) => !p)}>
                <CloseIcon className="h-10 w-20" />
              </IconButton>
              <TabGroup className="my-5">
                <Tab active>General</Tab>
                {sessionUser&&<Tab>Assign Course</Tab>}
                <Tab>Assign Project</Tab>
              </TabGroup>
            </div>
          </FullScreenDialog>
        )}
      </>
    );
  }
};

export default Manager;
