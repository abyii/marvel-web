import type { Meta, StoryObj } from "@storybook/react";
import { MdLaunch } from "react-icons/md";

//@ts-ignore
import { IconButton } from "ui";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["standard", "outlined", "text"], // values
      control: {
        type: "radio",
      },
      table: {
        type: { summary: "One of 3 Variants of the Button component" },
        defaultValue: { summary: "standard" },
      },
    },
    size: {
      options: ["small", "medium", "large"], // values
      control: {
        type: "radio",
      },
      table: {
        type: {
          summary: "One of 3 Button sizes.",
        },
        defaultValue: { summary: "medium" },
      },
    },
    disabled: {
      control: {
        type: "boolean",
      },
      table: {
        type: {
          summary: "Disabled?",
        },
        defaultValue: { summary: false },
      },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const DefaultStandardIconButton: Story = {
  render: ({ ...args }) => {
    return (
      <IconButton {...args}>
        <MdLaunch />
      </IconButton>
    );
  },
};

export const ButtonVariants: Story = {
  render: ({ ...args }) => {
    return (
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <IconButton {...args} variant="standard">
          <MdLaunch />
        </IconButton>
        <IconButton {...args} variant="outlined">
          <MdLaunch />
        </IconButton>
        <IconButton {...args} variant="text">
          <MdLaunch />
        </IconButton>
      </div>
    );
  },
  args: {
    size: "medium",
  },
};

export const DisabledIconButtons: Story = {
  render: () => {
    return (
      <div className="flex gap-5 flex-wrap">
        <IconButton disabled>
          <MdLaunch />
        </IconButton>
        <IconButton variant="outlined" disabled>
          <MdLaunch />
        </IconButton>
        <IconButton variant="text" disabled>
          <MdLaunch />
        </IconButton>
      </div>
    );
  },
};

export const IconButtonSizes: Story = {
  render: () => {
    return (
      <div className="flex gap-5 flex-wrap items-center">
        <IconButton size="small">
          <MdLaunch />
        </IconButton>
        <IconButton size="medium">
          <MdLaunch />
        </IconButton>
        <IconButton size="large">
          <MdLaunch />
        </IconButton>
      </div>
    );
  },
};
