'use client';

import { Button, FullScreenDialog, IconButton, Paper } from '@marvel/web-ui';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { VscClose as CloseIcon } from 'react-icons/vsc';
import {
  AiOutlineMinusCircle as MinusIcon,
  AiOutlinePlusCircle as PlusIcon,
} from 'react-icons/ai';
import { useMutation } from 'react-query';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const sendSpawnRequest = async (profile: any) => {
  const data = (await axios.post(`/api/mutate/profile-meta`, { profile })).data;
  return data;
};

const Spawner = ({ authorSlug }: { authorSlug: string }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const session = useSession();
  const sessionUser = session?.data?.user;
  const [formData, setFormData] = useState({});
  const [formType, setFormType] = useState<'COURSE' | 'PROJECT'>('PROJECT');
  const router = useRouter();

  useEffect(() => {
    setFormData({});
  }, [formType]);

  const { mutate: sendMutation, isLoading } = useMutation(
    () => sendSpawnRequest(formData),
    {
      onError: () => alert("Couldn't update user. loss"),
      onSuccess: () => {
        router.refresh();
        setDialogOpen(false);
      },
      //   onSettled: () => setChanged(false),
    }
  );

  if (
    sessionUser?.scope?.includes('CRDN') ||
    sessionUser?.scope?.includes('ADMIN')
  ) {
    return (
      <>
        <div className="w-full">
          <Button>Manage User</Button>
          <Paper border className="rounded-lg p-4 flex flex-col gap-3">
            <Button
              onClick={() => {
                setFormType('COURSE');
                setDialogOpen((p) => !p);
              }}
            >
              New Course Work
            </Button>
            <Button
              onClick={() => {
                setFormType('PROJECT');
                setDialogOpen((p) => !p);
              }}
            >
              New Project Work
            </Button>
          </Paper>
        </div>
        {dialogOpen && (
          <FullScreenDialog open={dialogOpen} className="z-10">
            <div className="w-full max-w-2xl py-24">
              <IconButton
                className="mb-5"
                onClick={() => setDialogOpen((p) => !p)}
              >
                <CloseIcon className="h-10 w-20" />
              </IconButton>
              <div>
                {(sessionUser?.scope?.includes('ADMIN') ||
                  sessionUser?.scope?.includes('CRDN')) && (
                  <div>
                    <Paper
                      border
                      shadow
                      className="rounded-lg pl-5 pt-5 min-h-[60px] mt-5"
                    >
                      {dudeCopy?.scope?.map((s: string) => (
                        <Button
                          onClick={() => {
                            setDudeCopy((p) => ({
                              ...p,
                              scope: dudeCopy?.scope?.filter(
                                (scope) => scope != s
                              ),
                            }));
                            setChanged(true);
                          }}
                          variant="outlined"
                          className="mr-5 mb-5 inline-flex items-center gap-2"
                        >
                          <MinusIcon />
                          {s}
                        </Button>
                      ))}
                    </Paper>
                    <div className="pl-5 pt-5">
                      {[
                        'PROFILE',
                        'WRITER',
                        'R-WRITER',
                        ...(sessionUser?.scope?.includes('ADMIN')
                          ? ['CRDN', 'ADMIN']
                          : []),
                      ].map(
                        (s) =>
                          !dudeCopy?.scope?.includes(s) && (
                            <Button
                              onClick={() => {
                                setDudeCopy((p) => ({
                                  ...p,
                                  scope: [...dudeCopy?.scope, s],
                                }));
                                setChanged(true);
                              }}
                              variant="outlined"
                              className="mr-5 mb-5 inline-flex items-center gap-2"
                            >
                              <PlusIcon />
                              {s}
                            </Button>
                          )
                      )}
                    </div>
                  </div>
                )}
                <div className="w-full flex gap-5 justify-end">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setDudeCopy(dude);
                      setChanged(false);
                    }}
                    disabled={!changed || isLoading}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={() => sendMutation()}
                    disabled={isLoading || !changed}
                  >
                    Update User
                  </Button>
                </div>
              </div>
            </div>
          </FullScreenDialog>
        )}
      </>
    );
  }
};

export default Manager;