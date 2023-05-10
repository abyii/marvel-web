"use client";
import React from "react";
import { Button } from "ui";

const TracksButton = () => {
  return (
    <Button
      variant="outlined"
      onPress={() => {
        if (typeof window !== "undefined") {
          window.location.hash = "tracks";
        }
      }}
      className="flex-1"
    >
      Tracks
    </Button>
  );
};

export default TracksButton;
