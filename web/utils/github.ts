import "server-only";

import axios from "axios";
import fs from "fs";
import path from "path";

type GithubFile = { path: string; download_url: string; localPath?: string };

/** `LEVEL<n>.md` files at the root of a course's GitHub repo or local checkout. */
export async function getCourseLevelFiles(repoURL: string) {
  const repoName = repoURL.slice(
    repoURL.search("github.com") + 11 //number of chars in github.com + 1
  );
  const [owner, repo] = repoName.split("/");

  // Check if a local checkout exists in ../courses or scratch/courses
  const possiblePaths = [
    path.resolve(process.cwd(), "..", "courses", repo),
    path.resolve(process.cwd(), "..", "..", "courses", repo),
    path.resolve("C:/Users/mrmak/.gemini/antigravity/scratch/courses", repo),
  ];
  const localDir = possiblePaths.find((p) => fs.existsSync(p));

  if (localDir) {
    const localFiles = fs.readdirSync(localDir);
    return localFiles
      .filter((name) => /^LEVEL\d+\.md$/i.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ""), 10);
        const numB = parseInt(b.replace(/\D/g, ""), 10);
        return numA - numB;
      })
      .map((name) => ({
        path: name,
        download_url: "",
        localPath: path.join(localDir, name),
      }));
  }

  const headers: Record<string, string> = {};
  if (process.env.GITHUB_PAT && !process.env.GITHUB_PAT.startsWith("dummy")) {
    headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
  }
  const files: GithubFile[] = (
    await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/`, {
      headers,
    })
  ).data;
  return files
    .filter((f) => /^LEVEL\d+\.md$/.test(f?.path))
    .sort((a, b) => {
      const numA = parseInt(a.path.replace(/\D/g, ""), 10);
      const numB = parseInt(b.path.replace(/\D/g, ""), 10);
      return numA - numB;
    });
}
