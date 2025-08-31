import { ImageResponse } from "@vercel/og";
import dbClient from "../../../utils/dbConnector";
import { notFound } from "next/navigation";

export const runtime = "edge";

export const alt = "User Profile";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const font = fetch(
  new URL("../../../assets/IBMPlexSans-Medium.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export default async function Image({
  params,
}: {
  params: { profileSlug: string };
}) {
  const fontData = await font;
  const person = await dbClient.people.findUnique({
    where: {
      slug: params.profileSlug,
    },
    select: {
      name: true,
      profilePic: true,
    },
  });

  if (!person) {
    notFound();
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
        }}
      >
        <h3
          tw="text-4xl"
          style={{
            color: "#333",
            letterSpacing: "0.2em",
            margin: "40px 40px 10px 50px",
          }}
        >
          PROFILE
        </h3>
        <img
          src={person.profilePic as string}
          style={{
            borderRadius: "500px",
            margin: "40px 40px 20px 50px",
            width: "200px",
            aspectRatio: "1 / 1",
          }}
        />
        <h1
          tw="text-8xl"
          style={{ color: "#000", margin: "0px 40px 0px 50px" }}
        >
          {person.name}
        </h1>

        <svg
          style={{
            position: "absolute",
            bottom: "0px",
            width: "100%",
            right: "0px",
            left: "0px",
            objectFit: "cover",
            backgroundColor: "#000",
          }}
          width="649"
          height="167"
          viewBox="0 0 649 167"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.00012207"
            width="649"
            height="167"
            fill="url(#paint0_linear_1078_22)"
          />
          <path
            d="M79.2009 133.522C79.2009 133.522 88.8308 31.5641 98.042 31.5641C107.253 31.5641 109.85 133.523 123.582 133.522C137.314 133.521 142.842 31.564 157.496 31.5641C172.15 31.5642 200.203 133.522 220.718 133.522C245.277 133.522 276.823 31.5659 299.851 31.5642C325.994 31.5623 355.586 133.525 390.707 133.522"
            stroke="#1D1D1D"
            strokeWidth="2.36697"
            strokeLinecap="round"
          />
          <path
            d="M58.1167 133.522C58.1167 133.522 67.7465 31.5641 76.9577 31.5641C86.1689 31.5641 88.7661 133.523 102.498 133.522C116.23 133.521 121.758 31.564 136.412 31.5641C151.066 31.5642 179.118 133.522 199.634 133.522C224.193 133.522 255.739 31.5659 278.767 31.5642C304.91 31.5623 334.501 133.525 369.623 133.522"
            stroke="#363636"
            strokeWidth="2.36697"
            strokeLinecap="round"
          />
          <path
            d="M31.2009 133.522C31.2009 133.522 40.8308 31.5641 50.042 31.5641C59.2532 31.5641 61.8504 133.523 75.5821 133.522C89.3139 133.521 94.8419 31.564 109.496 31.5641C124.15 31.5642 152.203 133.522 172.718 133.522C197.277 133.522 228.823 31.5659 251.851 31.5642C277.994 31.5623 307.586 133.525 342.707 133.522"
            stroke="#B2B2B2"
            strokeWidth="2.36697"
            strokeLinecap="round"
          />
          <path
            d="M425.201 133.522C425.201 133.522 434.831 31.5641 444.042 31.5641C453.253 31.5641 455.85 133.523 469.582 133.522C483.314 133.521 488.842 31.564 503.496 31.5641C518.15 31.5642 546.203 133.522 566.718 133.522C591.277 133.522 622.823 31.5659 645.851 31.5642"
            stroke="#B2B2B2"
            strokeWidth="2.36697"
            strokeLinecap="round"
          />

          <defs>
            <linearGradient
              id="paint0_linear_1078_22"
              x1="324.501"
              y1="0"
              x2="324.501"
              y2="167"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#1D1D1D" />
              <stop offset="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "IBM Plex Sans",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}