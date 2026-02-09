export const scrollToDialogTop = () => {
  if (typeof document === "undefined") return;

  const dialogContainer = document.querySelector<HTMLElement>(
    "[data-fullscreen-dialog=\"true\"]"
  );

  if (dialogContainer) {
    dialogContainer.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
