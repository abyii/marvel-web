import { ReactNode } from 'react';
import { Window, Paper, Button, Avatar } from '@marvel/web-ui';
import connectToDB from '../../../utils/dbConnector';
import { projectWork } from '@marvel/web-utils';

const getProject = async (_id: String) => {
  await connectToDB();
  const person = await projectWork
    //@ts-ignore
    .findById(_id)
    .select('-rankingScore -searchTerms')
    .lean()
    .exec();
  console.info({ info: 'findOne() on project.' });
  return person;
};

export async function generateStaticParams() {
  return [];
}
export const dynamicParams = true;

export default async function layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { projectId?: String };
}) {
  const project = await getProject(params?.projectId);
  return (
    <Window className="pt-10">
      {/* whole thing  */}
      <div className="w-full max-w-5xl">
        <Paper border shadow className="w-full p-5 rounded-lg">
          <h1 className="text-2xl">{project?.name}</h1>
        </Paper>
        <div className="w-full">{children}</div>
      </div>
    </Window>
  );
}