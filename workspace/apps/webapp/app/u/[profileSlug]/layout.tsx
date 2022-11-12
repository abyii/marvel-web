import Navbar from '../../../components/Navbar';
import { ReactNode } from 'react';
import { Window, Paper, Avatar, Button } from '@marvel/web-ui';
import connectToDB from '../../../utils/dbConnector';
import { people } from '@marvel/web-utils';

const getUserBySlug = async (slug: String) => {
  await connectToDB();
  const person = await people
    //@ts-ignore
    .findOne({ slug: slug })
    .select('-_id name profilePic scope crdnCourses')
    .lean()
    .exec();
  console.info({ info: 'getUserBySlug is called in profile page' });
  return person;
};

export default async function layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { profileSlug?: String };
}) {
  const dude = await getUserBySlug(params?.profileSlug);
  return (
    <>
      <Navbar />
      <Window className="pt-24">
        {/* whole box  */}
        <Paper className="w-full max-w-5xl mx-5 flex flex-col">
          {/* left box  */}
          <Paper shadow className="mb-6 max-h-min">
            {/* picture and name  */}
            <div className="flex items-center border-x border-t border-b border-p-7 p-5">
              <Avatar src={dude?.profilePic} className="w-14" />
              <h1 className="ml-5 text-lg">{dude?.name}</h1>
            </div>
            {/* coordinating courses */}
            {dude?.scope?.includes('CRDN') && (
              <div className="flex items-center border-b border-x border-p-7 p-5 max-w-full overflow-x-auto">
                {dude?.scope?.includes('CRDN') && (
                  <Button
                    variant="outlined"
                    className="mr-5 text-sm pointer-events-none"
                  >
                    Coordinator
                  </Button>
                )}
                {dude?.crdnCourses?.map((c, k) => (
                  <Button key={k} className="mr-5 text-sm">
                    {c}
                  </Button>
                ))}
              </div>
            )}
          </Paper>
          {/* right box  */}
          {children}
        </Paper>
      </Window>
    </>
  );
}