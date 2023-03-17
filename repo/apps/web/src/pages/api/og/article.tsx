import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

const font = fetch(
  new URL("../../../../assets/IBMPlexSans-Medium.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const hasTitle = searchParams.has("title");
    const hasTypeOfArticle = searchParams.has("typeOfArticle");
    const hasCaption = searchParams.has("caption");
    const hasCreatedAt = searchParams.has("createdAt");

    if (!hasTitle || !hasTypeOfArticle || !hasCreatedAt || !hasCaption)
      return new Response(`Invalid data`, {
        status: 401,
      });

    const fontData = await font;

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
            {searchParams.get("typeOfArticle")} &#183;{" "}
            {searchParams?.get("createdAt")}
          </h3>
          <h1
            tw="text-8xl"
            style={{ color: "#000", margin: "0px 40px 0px 50px" }}
          >
            {searchParams.get("title")}
          </h1>

          <p
            tw="text-4xl"
            style={{
              color: "#333",
              margin: "20px 40px 0px 50px",
            }}
          >
            {searchParams?.get("caption")}
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
              stroke-width="2.36697"
              stroke-linecap="round"
            />
            <path
              d="M58.1167 133.522C58.1167 133.522 67.7465 31.5641 76.9577 31.5641C86.1689 31.5641 88.7661 133.523 102.498 133.522C116.23 133.521 121.758 31.564 136.412 31.5641C151.066 31.5642 179.118 133.522 199.634 133.522C224.193 133.522 255.739 31.5659 278.767 31.5642C304.91 31.5623 334.501 133.525 369.623 133.522"
              stroke="#363636"
              stroke-width="2.36697"
              stroke-linecap="round"
            />
            <path
              d="M31.2009 133.522C31.2009 133.522 40.8308 31.5641 50.042 31.5641C59.2532 31.5641 61.8504 133.523 75.5821 133.522C89.3139 133.521 94.8419 31.564 109.496 31.5641C124.15 31.5642 152.203 133.522 172.718 133.522C197.277 133.522 228.823 31.5659 251.851 31.5642C277.994 31.5623 307.586 133.525 342.707 133.522"
              stroke="#B2B2B2"
              stroke-width="2.36697"
              stroke-linecap="round"
            />
            <path
              d="M394.73 116.274V86.9717H401.915V91.8554H402.196C402.757 90.3211 403.656 89.0113 404.891 87.926C406.126 86.8407 407.847 86.2981 410.055 86.2981C412.076 86.2981 413.816 86.7846 415.275 87.7576C416.735 88.7306 417.82 90.2088 418.531 92.1922H418.644C419.167 90.5456 420.197 89.161 421.731 88.0383C423.303 86.8782 425.267 86.2981 427.625 86.2981C430.507 86.2981 432.715 87.2898 434.249 89.2732C435.821 91.2566 436.607 94.0821 436.607 97.7495V116.274H429.421V98.4793C429.421 94.2879 427.85 92.1922 424.706 92.1922C423.995 92.1922 423.303 92.3045 422.629 92.529C421.993 92.7161 421.413 93.0155 420.889 93.4272C420.402 93.8014 420.009 94.2879 419.71 94.8867C419.411 95.448 419.261 96.1216 419.261 96.9075V116.274H412.076V98.4793C412.076 94.2879 410.504 92.1922 407.361 92.1922C406.687 92.1922 406.013 92.3045 405.34 92.529C404.703 92.7161 404.123 93.0155 403.599 93.4272C403.113 93.8014 402.701 94.2879 402.365 94.8867C402.065 95.448 401.915 96.1216 401.915 96.9075V116.274H394.73ZM466.116 116.274C464.544 116.274 463.291 115.825 462.355 114.927C461.457 113.991 460.896 112.756 460.671 111.222H460.334C459.848 113.13 458.856 114.571 457.359 115.544C455.862 116.48 454.01 116.948 451.802 116.948C448.808 116.948 446.507 116.162 444.897 114.59C443.288 113.018 442.484 110.922 442.484 108.303C442.484 105.272 443.569 103.026 445.739 101.567C447.91 100.07 450.997 99.3213 455.002 99.3213H459.998V97.1882C459.998 95.5416 459.567 94.2692 458.706 93.371C457.846 92.4729 456.461 92.0238 454.553 92.0238C452.868 92.0238 451.503 92.3981 450.455 93.1465C449.444 93.8575 448.584 94.7183 447.873 95.7287L443.606 91.9116C444.692 90.2275 446.132 88.8803 447.929 87.8699C449.725 86.822 452.101 86.2981 455.058 86.2981C459.025 86.2981 462.037 87.1963 464.095 88.9926C466.154 90.7889 467.183 93.371 467.183 96.7391V110.548H470.102V116.274H466.116ZM454.216 111.727C455.825 111.727 457.191 111.372 458.314 110.66C459.436 109.949 459.998 108.902 459.998 107.517V103.644H455.395C451.652 103.644 449.781 104.841 449.781 107.236V108.191C449.781 109.388 450.155 110.286 450.904 110.885C451.69 111.446 452.794 111.727 454.216 111.727ZM475.917 116.274V86.9717H483.102V93.0342H483.383C483.57 92.2484 483.851 91.4999 484.225 90.7889C484.637 90.0404 485.16 89.3855 485.797 88.8242C486.433 88.2628 487.181 87.8137 488.042 87.4769C488.94 87.1401 489.969 86.9717 491.129 86.9717H492.701V93.764H490.456C488.023 93.764 486.19 94.1195 484.955 94.8305C483.72 95.5416 483.102 96.7017 483.102 98.3109V116.274H475.917ZM504.68 116.274L494.912 86.9717H501.985L506.083 99.602L508.946 110.043H509.339L512.202 99.602L516.187 86.9717H523.036L513.212 116.274H504.68ZM539.236 116.948C537.066 116.948 535.12 116.592 533.398 115.881C531.714 115.133 530.273 114.103 529.076 112.794C527.916 111.446 527.018 109.837 526.381 107.966C525.745 106.057 525.427 103.924 525.427 101.567C525.427 99.2465 525.727 97.1508 526.325 95.2796C526.961 93.4085 527.86 91.818 529.02 90.5082C530.18 89.161 531.602 88.1318 533.286 87.4208C534.97 86.6723 536.879 86.2981 539.012 86.2981C541.294 86.2981 543.278 86.691 544.962 87.4769C546.646 88.2628 548.031 89.3294 549.116 90.6766C550.201 92.0238 551.006 93.5956 551.53 95.3919C552.091 97.1508 552.372 99.0406 552.372 101.061V103.419H532.893V104.149C532.893 106.282 533.492 108.003 534.689 109.313C535.887 110.586 537.664 111.222 540.022 111.222C541.818 111.222 543.278 110.848 544.401 110.099C545.561 109.351 546.59 108.396 547.488 107.236L551.361 111.559C550.164 113.243 548.517 114.571 546.421 115.544C544.363 116.48 541.968 116.948 539.236 116.948ZM539.124 91.687C537.215 91.687 535.7 92.3232 534.577 93.5956C533.454 94.868 532.893 96.5146 532.893 98.5354V98.9845H544.906V98.4793C544.906 96.4584 544.401 94.8305 543.39 93.5956C542.417 92.3232 540.995 91.687 539.124 91.687ZM565.879 116.274C563.409 116.274 561.594 115.656 560.434 114.421C559.273 113.187 558.693 111.446 558.693 109.201V74.7344H565.879V110.548H569.752V116.274H565.879ZM579.952 116.891C578.418 116.891 577.276 116.517 576.528 115.769C575.817 114.983 575.461 113.991 575.461 112.794V111.783C575.461 110.586 575.817 109.594 576.528 108.808C577.276 108.022 578.418 107.629 579.952 107.629C581.524 107.629 582.665 108.022 583.376 108.808C584.087 109.594 584.443 110.586 584.443 111.783V112.794C584.443 113.991 584.087 114.983 583.376 115.769C582.665 116.517 581.524 116.891 579.952 116.891Z"
              fill="white"
            />
            <path
              d="M398.03 52.3924V62.8507C398.03 64.1834 398.282 65.1829 398.786 65.8492C399.306 66.5156 400.175 66.8487 401.394 66.8487C402.613 66.8487 403.475 66.5156 403.978 65.8492C404.498 65.1829 404.758 64.1834 404.758 62.8507V52.3924H407.928V62.4363C407.928 63.6877 407.806 64.7684 407.562 65.6786C407.334 66.5887 406.961 67.3444 406.441 67.9457C405.921 68.5471 405.238 68.994 404.393 69.2866C403.564 69.5628 402.556 69.701 401.37 69.701C400.167 69.701 399.151 69.5628 398.323 69.2866C397.51 68.994 396.844 68.5471 396.324 67.9457C395.804 67.3444 395.43 66.5887 395.202 65.6786C394.975 64.7684 394.861 63.6877 394.861 62.4363V52.3924H398.03ZM415.764 69.4084L410.205 52.3924H413.496L416.105 60.681L417.616 66.3368H417.689L419.177 60.681L421.785 52.3924H424.979L419.42 69.4084H415.764ZM433.348 69.701C432.226 69.701 431.211 69.5222 430.3 69.1647C429.407 68.7909 428.635 68.2383 427.985 67.5069C427.351 66.7756 426.863 65.8736 426.522 64.8009C426.181 63.7121 426.01 62.4525 426.01 61.0223C426.01 59.5921 426.181 58.3244 426.522 57.2193C426.863 56.0979 427.351 55.1634 427.985 54.4158C428.635 53.6519 429.407 53.075 430.3 52.6849C431.211 52.2949 432.226 52.0999 433.348 52.0999C434.875 52.0999 436.143 52.4249 437.151 53.075C438.158 53.7251 438.963 54.7083 439.564 56.0248L436.809 57.4875C436.566 56.7236 436.168 56.1141 435.615 55.6591C435.062 55.1878 434.307 54.9521 433.348 54.9521C432.145 54.9521 431.186 55.3584 430.471 56.171C429.772 56.9836 429.423 58.1213 429.423 59.584V62.2656C429.423 63.7446 429.772 64.8822 430.471 65.6786C431.186 66.4587 432.145 66.8487 433.348 66.8487C434.307 66.8487 435.087 66.5887 435.688 66.0686C436.306 65.5485 436.753 64.9066 437.029 64.1427L439.637 65.6786C439.02 66.9462 438.199 67.9376 437.175 68.6527C436.151 69.3516 434.875 69.701 433.348 69.701ZM442.382 69.4084V52.3924H453.596V55.2447H445.6V59.3646H452.67V62.2168H445.6V66.5562H453.596V69.4084H442.382Z"
              fill="#B2B2B2"
            />
            <line
              x1="649"
              y1="0.5"
              y2="0.5"
              stroke="url(#paint1_linear_1078_22)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_1078_22"
                x1="0.000119189"
                y1="97.378"
                x2="649.066"
                y2="89.2938"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#272727" />
                <stop offset="1" stop-color="#1C1C1C" stop-opacity="0.5" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_1078_22"
                x1="649"
                y1="0"
                x2="-13"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="white" />
                <stop offset="1" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ),
      {
        width: 800,
        height: 800,
        fonts: [
          {
            name: "IBM Plex Sans",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
