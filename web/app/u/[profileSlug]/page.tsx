import { Paper, TabGroup, Tab, MarkdownRender } from "@marvel/ui/ui";
import Link from "next/link";
import ReadMeEditor from "./ReadMeEditor";
import axios from "axios";
import { getUserBySlug } from "./getUserBySlug";

const getReadMe = async (slug: string) => {
  const readMeURL = (await getUserBySlug(slug))?.readMe;
  return readMeURL ? (await axios.get(readMeURL)).data : readMeURL;
};

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

export default async function page(props) {
  const params = await props.params;
  const readMe = await getReadMe(params?.profileSlug as string);
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
        {["", null].includes(readMe) ? (
          <div className="w-full">
            <h1 className="text-3xl text-p-5 m-5">ReadMe is Empty</h1>
          </div>
        ) : (
          <MarkdownRender
            content={readMe}
            className="mb-5"
          />
        )}
        <ReadMeEditor
          profileSlug={params?.profileSlug as string}
          content={readMe}
        />
      </Paper>
    </div>
  );
}
