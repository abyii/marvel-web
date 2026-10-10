import dbClient from "../../utils/dbConnector";
import SearchBar from "./components/SearchBar";
import ProjectCard from "./components/ProjectCard";
import { Pagination } from "../../components/Pagination";

import { unstable_cache } from "next/cache";
import { cacheTags } from "../../utils/cache";
import { getTotalPages, parsePage } from "../../utils/pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
const MAX_QUERY_LENGTH = 60;

const getWhere = (query: string) => ({
    typeOfWork: "PROJECT" as const,
    ...(query && {
        OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { note: { contains: query, mode: "insensitive" as const } },
        ],
    }),
});

const getProjectsListRaw = async (page: number, query: string) => {
    console.log("get projects list raw query: ", query);
    return await dbClient.work.findMany({
        where: getWhere(query),
        select: {
            name: true,
            note: true,
            id: true,
            People: {
                select: {
                    role: true,
                    person: {
                        select: {
                            name: true,
                            slug: true,
                            profilePic: true,
                        }
                    }
                }
            }
        },
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
    });
};

// the unfiltered list is cached; searches hit the DB
const getProjectsList = async (page: number, query: string) => {
    if (!query) {
        return await unstable_cache(
            async () => getProjectsListRaw(page, query),
            [`projects-list-${page}`],
            { tags: [cacheTags.projects] }
        )();
    }
    return await getProjectsListRaw(page, query);
};

const getProjectsCount = async (query: string) => {
    if (!query) {
        return await unstable_cache(
            async () => dbClient.work.count({ where: getWhere(query) }),
            ["projects-count"],
            { tags: [cacheTags.projects] }
        )();
    }
    return await dbClient.work.count({ where: getWhere(query) });
};

export default async function page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
    const { page, q } = await searchParams;
    const currentPage = parsePage(page);
    const query = (q || "").slice(0, MAX_QUERY_LENGTH);

    const totalPages = getTotalPages(currentPage, await getProjectsCount(query), PAGE_SIZE);
    const projects = await getProjectsList(currentPage, query);

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full px-5 flex justify-center md:justify-end">
                <SearchBar />
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-5 z-10 mx-auto">
                {projects.map((project, i) => (
                    <ProjectCard
                        key={i}
                        project={project as any}
                        hrefClassName="flex flex-col h-full"
                    />
                ))}
                {projects.length === 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 text-p-4">
                        No projects found.
                    </div>
                )}
            </div>

            <Pagination
                pathname={query ? `/projects?q=${encodeURIComponent(query)}` : "/projects"}
                page={currentPage}
                totalPages={totalPages}
            />
        </div>
    );
}
