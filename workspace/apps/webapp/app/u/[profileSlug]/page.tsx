import { Window, Paper, Avatar, Button } from '@marvel/web-ui';
import Link from 'next/link';
import connectToDB from 'apps/webapp/utils/dbConnector';
import { people } from '@marvel/web-utils';

const getUserReadmeBySlug = async (slug: string) => {
  await connectToDB();
  const person = await people
    //@ts-ignore
    .findOne({ slug: slug })
    .select('readMe slug name')
    .lean()
    .exec();
  console.log({ info: 'fetched readme of user in profile page' });
  return person;
};

export default async function page({ params, searchParams }) {
  const readMeData = await getUserReadmeBySlug(params?.profilePage as string);

  return (
    <div className="flex flex-col">
      {/* toggle buttons  */}
      <div className="flex border rounded-full max-w-min p-2 place-self-center">
        <Link href={`/u/${params?.profileSlug}/`}>
          <Button>ReadMe</Button>
        </Link>
        <Link href={`/u/${params?.profileSlug}/works`}>
          <Button variant="text">Works</Button>
        </Link>
        <Link href={`/u/${params?.profileSlug}/writings`}>
          <Button variant="text">Writings</Button>
        </Link>
      </div>
      <Paper shadow border className="mt-5">
        {['', undefined].includes(readMeData?.readMe) && (
          <h1 className="text-4xl p-5">No readme</h1>
        )}
      </Paper>
    </div>
  );
}
