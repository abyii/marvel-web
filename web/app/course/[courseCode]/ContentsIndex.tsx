"use client";

import { Paper } from "@marvel/ui/ui";
import { Button } from "@marvel/ui/ui/client";

const ContentsIndex = ({ totalLevels }: { totalLevels: number }) => {
  return (
    <Paper className="rounded-lg p-5 bg-p-9 dark:bg-p-1">
      <h3 className="text-lg">Jump to:</h3>
      <div className="flex gap-5 flex-wrap mt-5">
        {Array.from({ length: totalLevels }).map((_, i) => (
          <Button
            key={i}
            onPress={() => (window.location.hash = "#" + (i + 1))}
          >
            Level {i + 1}
          </Button>
        ))}
      </div>
    </Paper>
  );
};

export default ContentsIndex;
