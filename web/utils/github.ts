import "server-only";

import axios from "axios";

type GithubFile = { path: string; download_url: string };

/** `LEVEL<n>.md` files at the root of a course's GitHub repo. */
export async function getCourseLevelFiles(repoURL: string) {
  const repoName = repoURL.slice(
    repoURL.search("github.com") + 11 //number of chars in github.com + 1
  );
  const [owner, repo] = repoName.split("/");
  const files: GithubFile[] = (
    await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PAT}`,
      },
    })
  ).data;
  return files.filter((f) => /^LEVEL\d+\.md$/.test(f?.path));
}
