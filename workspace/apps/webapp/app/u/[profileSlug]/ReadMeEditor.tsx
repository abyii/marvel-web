'use client';

import {
  Button,
  FullScreenDialog,
  Tab,
  TabGroup,
  IconButton,
  MarkdownRender,
  LoadingPulser,
} from '@marvel/web-ui';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { VscClose as CloseIcon } from 'react-icons/vsc';
import { useMutation } from 'react-query';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { IconBase } from 'react-icons';

type ReadMeEditorProp = { profileSlug: string; content: string };

const sendEdit = async ({ slug, content }) => {
  const data = (await axios.post(`/api/mutate/profile`, { slug, content }))
    .data;
  return data;
};

const ReadMeEditor = ({ profileSlug, content }: ReadMeEditorProp) => {
  const session = useSession();
  const sessionUser = session?.data?.user;
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [copy, setCopy] = useState(content);
  const [changed, setChanged] = useState<boolean>(false);
  const router = useRouter();

  const { mutate: mutateReadMe, isLoading } = useMutation(
    () => sendEdit({ slug: profileSlug, content: copy }),
    {
      onError: () => alert("Couldn't edit readme. loss"),
      onSuccess: () => router.refresh(),
      onSettled: () => {
        setChanged(false);
        setMode('view');
      },
    }
  );

  return (
    <>
      {(sessionUser?.slug === profileSlug ||
        sessionUser?.scope?.includes('ADMIN')) && (
        <Button
          onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
          variant="outlined"
          className="w-max mt-5 self-end"
        >
          Edit ReadMe
        </Button>
      )}
      {mode === 'edit' && (
        <FullScreenDialog open={mode == 'edit'}>
          <div className="w-full max-w-2xl py-24">
            <IconButton onClick={() => setMode('view')}>
              <CloseIcon className="h-10 w-20" />
            </IconButton>
            <TabGroup className="my-5">
              <Tab
                active={editorMode === 'write'}
                onClick={() => setEditorMode('write')}
              >
                write
              </Tab>
              <Tab
                active={editorMode === 'preview'}
                onClick={() => setEditorMode('preview')}
              >
                preview
              </Tab>
            </TabGroup>
            {editorMode == 'write' ? (
              <textarea
                className="p-5 pb-10 rounded-lg w-full min-h-[300px]"
                onChange={(e) => {
                  setCopy(e.target?.value);
                  setChanged(true);
                }}
                value={copy}
              />
            ) : (
              <MarkdownRender content={copy} />
            )}

            {/* action area  */}
            <div className="w-full">
              <Button
                disabled={isLoading || !changed}
                className={`float-right m-5 ${
                  isLoading ? 'animate-pulse' : 'animate-none'
                }`}
                onClick={() => mutateReadMe()}
              >
                <span className="flex">
                  {isLoading && <LoadingPulser className="h-5" />}
                  Submit
                </span>
              </Button>
            </div>
          </div>
        </FullScreenDialog>
      )}
    </>
  );
};

export default ReadMeEditor;