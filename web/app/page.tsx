import Link from "next/link";
import { Window, MarvelLogoMark } from "@marvel/ui/ui/server";
import { Button } from "@marvel/ui/ui/client";
import { TrackDescription } from "../types";
import TracksButton from "../components/TracksButton";
import {
  MdOutlineBook,
  MdAutoAwesome,
  MdOutlineOpenInNew,
} from "../components/ReactIcons";
import Image from "next/image";

const tracks: TrackDescription[] = [
  {
    title: "Student",
    suffix: "Track",
    desc: "With Student Track, you'll be able to gain valuable experience in your areas of interest through a comprehensive, hands-on curriculum that utilizes Marvel's resources from the very beginning. The program is designed as a batch program and applications for enrollment will be accepted twice a year, giving students a unique opportunity to learn and grow with a cohort of like-minded individuals.",
    buttons: [
      {
        link: "/courses",
        buttonText: "Explore Courses",
        variant: "outlined",
      },
      {
        link: "/grads",
        buttonText: "View Graduates",
        variant: "outlined",
      },
      {
        link: "https://bit.ly/marvelstudent",
        buttonText: "Apply Now",
        variant: "standard",
      },
    ],
  },
  {
    title: "Project",
    suffix: "Track",
    desc: "Project Track is for UVCE students with project ideas but limited resources. Marvel provides facilities and resources to support these projects. Interested students can submit an abstract, timeline, team details, and budget estimate for consideration. Marvel's team screens applications and selects candidates for an interview or abstract presentation. Selected teams work closely with Marvel to turn their ideas into reality.",
    buttons: [
      {
        link: "https://forms.gle/aiD3WWXUBngknHzX9",
        buttonText: "Apply with an Idea",
        variant: "outlined",
      },
    ],
  },
  {
    title: "Competition",
    suffix: "Track",
    desc: "MARVEL's Competition Track supports UVCE students who want to participate in technical competitions across domains. Students can submit competition details and budget estimates, and MARVEL will screen and select promising entries. MARVEL provides resources such as financial assistance, mentorship, and guidance to ensure team success.",
    buttons: [
      {
        link: "https://forms.gle/Ds6EoHK7iYt6Ki6NA",
        buttonText: "Apply with an Idea",
        variant: "outlined",
      },
    ],
  },
  {
    title: "Open Learner",
    suffix: "Programme",
    desc: "While admission to Marvel's Student Track is limited, we invite you to continue upskilling yourself through our Open Learner Programme. Access any of Marvel's courses, utilize your own resources, and complete the tasks at your own pace. Upon completion of the coursework and submission of the final report, you will receive a certificate that highlights your achievement and dedication to continuous learning.",
    buttons: [
      {
        buttonText: "Explore Courses",
        link: "/courses",
        variant: "standard",
      },
      {
        link: "https://forms.gle/QCdFiTSu5K6hyysq5",
        buttonText: "Apply to OLP",
        variant: "outlined",
      },
    ],
  },
  {
    title: "Equipment",
    suffix: "Support",
    desc: "Students who are not part of Marvel can get access to the Lab's Equipments and Components through the Equipment Support Programme. Marvel is eager to help you build and innovate. To get started, fill the form below, specifying the Equipments and Components needed. T&C apply.",
    buttons: [
      {
        buttonText: "Apply",
        link: "https://forms.gle/CgAEdANBq3R17sdQA",
        variant: "standard",
      },
      {
        link: "https://docs.google.com/spreadsheets/d/14dbank2PsEFPxTKj9mVxcH3g4bW-Yhc3ZTqOtvyKphw/",
        buttonText: "View Catalogue",
        variant: "outlined",
      },
    ],
  },
];

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

export default function page() {
  return (
    <Window>
      {/*whole thing*/}
      <div className="w-full max-w-5xl flex flex-col pb-48">
        {/* hero box  */}
        <div className="relative flex flex-col gap-5 px-5 py-10">
          <MarvelLogoMark
            strokeWidth={4}
            className="w-32 h-16 float-left text-p-0 dark:text-p-10"
          />
          <h1 className="text-p-0 dark:text-p-8 text-5xl md:text-7xl font-light">
            <span className="font-normal dark:text-p-10">Marvel</span> is{" "}
            <Link
              href={"https://uvce.karnataka.gov.in"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E73857] hover:brightness-75 transition duration-300 ease-in-out"
            >
              UVCE
            </Link>
            &apos;s own Makerspace and R&D Lab.
          </h1>
          <div className="py-5 md:py-0 flex flex-wrap gap-3 my-2">
            <TracksButton />
            <Link href={"/courses"} className="flex-1 md:flex-none">
              <Button
                variant="outlined"
                className="w-full"
                left={MdOutlineBook}
              >
                Courses
              </Button>
            </Link>
            <Link href={"/events"} className="flex-1 md:flex-none">
              <Button
                variant="outlined"
                className="w-full"
                left={MdAutoAwesome}
              >
                Events
              </Button>
            </Link>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none"
              href={
                "https://www.playbook.com/s/marvel/Rm7nEeuHZRgEkaeTcSr9EBtq"
              }
            >
              <Button
                variant="outlined"
                className="flex-1 md:flex-none"
                right={MdOutlineOpenInNew}
              >
                Annual Reports
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-5">
            <Image
              width={800}
              height={600}
              alt="UVCE Marvel on Open Day"
              src={"/images/image1.jpg"}
              className="rounded-lg flex-1 max-h-60 object-cover"
            />
            <Image
              width={800}
              height={600}
              alt="UVCE Marvel on Open Day"
              src={"/images/image3.jpg"}
              className="rounded-lg flex-1 max-h-60 object-cover"
            />
            <p className="flex-1 p-5 rounded-lg border-[1.5px] dark:border border-p-0 dark:border-p-7 font-normal text-base bg-p-10 dark:bg-p-1">
              Marvel at University of Visvesvaraya College of Engineering, is
              poised to spur genuine passion in every learner, inspire decisive
              action, and redefine conventional education. The goal is to turn
              UVCE into a hub of Research and Innovation.
            </p>
          </div>
        </div>

        {/*tracks section*/}
        <div className="p-5">
          <h1
            id={"tracks"}
            className="capitalize tracking-widest text-p-0 dark:text-p-5 border-y border-p-5 dark:border-p-3 p-5"
          >
            TRACKS
          </h1>
          <div className="flex flex-col gap-10 py-10">
            {tracks?.map((t, i) => (
              <div
                className="p-5 flex flex-col md:flex-row w-full justify-between gap-5"
                key={i}
              >
                <h2 className="text-5xl flex-wrap leading-snug max-w-sm">
                  {t?.title}
                  <span className="text-p-5"> {t?.suffix}</span>
                </h2>
                <div className="max-w-sm flex flex-col gap-10">
                  <p className="text-p-0 dark:text-p-9">{t?.desc}</p>
                  <div className="flex gap-3 flex-wrap">
                    {t?.buttons?.map((b, k) => (
                      <Link
                        key={k}
                        href={b?.link}
                        target={
                          b?.link?.startsWith("http") ? "_blank" : "_self"
                        }
                        rel={
                          b?.link?.startsWith("http")
                            ? "noopener noreferrer"
                            : ""
                        }
                      >
                        <Button variant={b?.variant}>{b?.buttonText}</Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*events section*/}
        <div className="flex flex-wrap gap-5 p-5">
          <Image
            src={"/images/eatm.jpg"}
            alt="Events at Marvel"
            width={1000}
            height={720}
            className="flex-1 w-full md:max-w-[50%] rounded-lg max-h-80 object-cover object-center"
          />
          <div className="flex max-w-sm flex-col gap-5">
            <p>
              Marvel conducts workshops, competitions, talks, and other events
              throughout the year. Please check our event page for updates on
              the latest events at Marvel.
            </p>
            <Link href={"/events"}>
              <Button variant="outlined">Go to Events Page</Button>
            </Link>
          </div>
        </div>
      </div>
    </Window>
  );
}
