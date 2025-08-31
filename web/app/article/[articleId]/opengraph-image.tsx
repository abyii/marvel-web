import { ImageResponse } from "@vercel/og";
import dbClient from "../../../utils/dbConnector";
import { cache } from "react";

export const runtime = "edge";

export const alt = "Article OG Image";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const getArticle = cache(async (id: string) => {
    try {
      const article = await dbClient.article.findUniqueOrThrow({
        where: {
          id: id,
        },
        select: {
          title: true,
          caption: true,
          typeOfArticle: true,
          createdAt: true,
        },
      });
      return article;
    } catch (error) {
      return null;
    }
  });

const font = fetch(
    new URL("../../../assets/IBMPlexSans-Medium.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

export default async function Image({ params }: { params: { articleId: string } }) {
    const fontData = await font;
    const article = await getArticle(params.articleId);

    if (!article) {
        return new Response(`Not found`, {
            status: 404,
          });
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
            {article.typeOfArticle} &#183;{" "}
            {new Date(article.createdAt)?.toLocaleDateString("en-IN")}
          </h3>
          <h1
            tw="text-8xl"
            style={{ color: "#000", margin: "0px 40px 0px 50px" }}
          >
            {article.title}
          </h1>

          <p
            tw="text-4xl"
            style={{
              color: "#333",
              margin: "20px 40px 0px 50px",
            }}
          >
            {article.caption || ""}
          </p>
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
              stroke="#4E4E4E"
              strokeWidth="2.36697"
              strokeLinecap="round"
            />
            <path
              d="M44.6587 133.522C44.6587 133.522 54.2886 31.5641 63.5 31.5641C72.7111 31.5641 75.3083 133.523 89.0401 133.522C102.772 133.521 108.3 31.564 122.954 31.5641C137.608 31.5642 165.661 133.522 186.176 133.522C210.735 133.522 242.281 31.5659 265.309 31.5642C291.452 31.5623 321.043 133.525 356.165 133.522"
              stroke="#1D1D1D"
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
                <stop stopColor="#141414" />
                <stop offset="1" stopColor="#1D1D1D" />
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
          weight: 500,
        },
      ],
    }
  );
}