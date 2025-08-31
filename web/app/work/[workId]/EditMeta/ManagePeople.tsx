"use client";
import { Button, Paper } from "@marvel/ui/ui";
import { TextField } from "@marvel/ui/ui";
import { Avatar } from "../../../../components/Avatar";
import axios, { AxiosError } from "axios";
import { memo, useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { Role, Status } from "@prisma/client";
import { useRouter } from "next/navigation";
import { managePeopleOnWork } from "../actions";

const ManagePeople = ({ work }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    data: peopleFromSearch,
    isLoading: isPeopleLoading,
    refetch: fetchPeople,
  } = useQuery({
    queryKey: ["people", search],
    queryFn: async () =>
      (await axios.get("/api/people/search?q=" + search + "&limit=5")).data
        ?.data,
    enabled: false,
  });
  const peopleList = peopleFromSearch?.filter(
    (p) => !work?.People?.map((p) => p?.personId)?.includes(p?.id)
  );

  const handleManagePeople = async (args: {
    action: "add-person" | "remove-person" | "change-status";
    personId: string;
    status: Status;
    role: Role;
  }) => {
    setError(null);
    startTransition(async () => {
      const response = await managePeopleOnWork(work.id, args);
      if (response.success) {
        router.refresh();
      } else {
        setError(response.message);
      }
    });
  };

  return (
    <Paper
      border
      className={`rounded-lg p-5 flex gap-5 flex-wrap ${
        isPending && "opacity-50 pointer-events-none"
      }`}
    >
      <h6 className="text-2xl w-full">People</h6>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {/* searching to add authors */}
      <div className="overflow-x-auto w-full">
        <table className="w-full whitespace-nowrap">
          <tbody>
            {work?.People?.sort((p) => (p?.role === "AUTHOR" ? -1 : 1))?.map(
              (p, i) => (
                <tr key={i} className="border-y p-5 border-p-5 dark:border-p-3">
                  <td className="flex gap-3 items-center py-3 px-5 text-base">
                    <Avatar
                      className="w-6"
                      alt={p?.person?.name}
                      src={p?.person?.profilePic}
                    />
                    {p?.person?.name}
                  </td>
                  <td className="px-5 py-3 text-xs">{p?.role}</td>
                  <td className="px-5 py-3 text-xs">
                    <select
                      className="block bg-transparent py-1 border-0 border-b"
                      defaultValue={p?.status}
                      onChange={(e) =>
                        handleManagePeople({
                          action: "change-status",
                          personId: p?.personId,
                          role: p?.role,
                          status: e?.target?.value as Status,
                        })
                      }
                    >
                      <option className="bg-p-0" value={"ACTIVE"}>
                        ACTIVE
                      </option>
                      <option className="bg-p-0" value={"INACTIVE"}>
                        INACTIVE
                      </option>
                    </select>
                  </td>
                  <td>
                    <Button
                      onPress={() =>
                        handleManagePeople({
                          action: "remove-person",
                          personId: p?.personId,
                          role: p?.role,
                          status: p?.status,
                        })
                      }
                      isDisabled={
                        (p?.role === "AUTHOR" &&
                          work?.People?.filter(
                            (p) => p?.role == "AUTHOR" && p?.status == "ACTIVE"
                          ).length <= 1) ||
                        (p?.role === "COORDINATOR" &&
                          work?.People?.filter(
                            (p) =>
                              p?.role == "COORDINATOR" && p?.status == "ACTIVE"
                          ).length <= 1)
                      }
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="flex w-full gap-5">
        <TextField
          fullWidth
          className="flex-1"
          value={search}
          onChange={(e) => setSearch(e)}
          placeholder="Search to add Authors or Coordinators..."
        />
        <Button
          onPress={() => fetchPeople()}
          isDisabled={search === "" || isPeopleLoading}
        >
          Search
        </Button>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left whitespace-nowrap">
          {peopleList?.length === 0 ? (
            <div className="flex justify-center items-center py-4">
              <p className="text-p-5 text-base">We found nothing.</p>
            </div>
          ) : (
            <tbody>
              {peopleList?.map((p, i) => (
                <tr key={i} className="border-y p-5 border-p-5 dark:border-p-3">
                  <td className="flex gap-3 items-center py-3 text-base">
                    <Avatar className="w-6" alt={p?.name} src={p?.profilePic} />
                    {p?.name}
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {work?.typeOfWork === "PROJECT" &&
                      ["CRDN", "ADMIN"].some((s) =>
                        p?.scope?.map((s) => s?.scope)?.includes(s)
                      ) && (
                        <Button
                          onPress={() =>
                            handleManagePeople({
                              action: "add-person",
                              personId: p?.id,
                              role: "COORDINATOR",
                              status: "ACTIVE",
                            })
                          }
                        >
                          Add as Coordinator
                        </Button>
                      )}
                  </td>
                  <td className="px-5 py-3 text-xs">
                    <Button
                      onPress={() =>
                        handleManagePeople({
                          action: "add-person",
                          personId: p?.id,
                          role: "AUTHOR",
                          status: "ACTIVE",
                        })
                      }
                    >
                      Add as Author
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </Paper>
  );
};

export default memo(ManagePeople);
