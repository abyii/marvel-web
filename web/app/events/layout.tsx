import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events. | UVCE MARVEL",
  description: "Events, Workshops, Competitions and Talks at UVCE MARVEL",
  openGraph: {
    type: "website",
    title: "Events at UVCE MARVEL",
    description: "Events, Workshops, Competitions and Talks at UVCE MARVEL",
    images: [
      {
        url: "https://res.cloudinary.com/marvelweb/image/upload/v1679946683/Frame_1_kjxodv.jpg",
        secureUrl:
          "https://res.cloudinary.com/marvelweb/image/upload/v1679946683/Frame_1_kjxodv.jpg",
        type: "image/jpeg",
        width: 800,
        height: 800,
      },
    ],
  },
};

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

export default function layout({ children }) {
  return <>{children}</>;
}
