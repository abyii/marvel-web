import { Paper, TabGroup, Tab, MarkdownRender } from "@marvel/ui/ui";
import Link from "next/link";
import dbClient from "../../../utils/dbConnector";
import ReadMeEditor from "./ReadMeEditor";
import axios from "axios";

const getUserReadmeBySlug = async (slug: string) => {
  const person = await dbClient.people.findFirst({
    where: {
      slug: slug,
    },
    select: {
      readMe: true,
      slug: true,
      name: true,
    },
  });
  if (person?.readMe) {
    person.readMe = (await axios.get(person.readMe)).data;
  }
  return person;
};

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

export default async function page(props) {
  const params = await props.params;
  const readMeData = await getUserReadmeBySlug(params?.profileSlug as string);
  return (
    <div className="flex flex-col w-full rounded-lg gap-5 justify-center">
      {/* toggle buttons  */}
      <TabGroup className="self-center md:self-start">
        <Link href={`/u/${params?.profileSlug}/`}>
          <Tab active>ReadMe</Tab>
        </Link>
        <Link href={`/u/${params?.profileSlug}/works`}>
          <Tab>Works</Tab>
        </Link>
        <Link href={`/u/${params?.profileSlug}/writings`}>
          <Tab>Writings</Tab>
        </Link>
      </TabGroup>
      <Paper
        shadow
        border
        className=" w-full rounded-lg flex flex-col p-5 mb-32"
      >
        {["", null].includes(readMeData?.readMe as string) ? (
          <div className="w-full">
            <h1 className="text-3xl text-p-5 m-5">ReadMe is Empty</h1>
          </div>
        ) : (
          <MarkdownRender
            content={readMeData?.readMe as string}
            className="mb-5"
          />
        )}
        <ReadMeEditor
          profileSlug={params?.profileSlug as string}
          content={readMeData?.readMe as string}
        />
      </Paper>
    </div>
  );
}
