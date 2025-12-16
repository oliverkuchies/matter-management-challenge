import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from '../components/Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
    },
    totalPages: {
      control: { type: 'number', min: 1 },
    },
    itemsPerPage: {
      control: 'select',
      options: [10, 25, 50, 100],
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// First page
export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    totalItems: 250,
    itemsPerPage: 25,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onItemsPerPageChange: (limit: number) => console.log('Items per page changed to:', limit),
  },
};

// Middle page
export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    totalItems: 250,
    itemsPerPage: 25,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onItemsPerPageChange: (limit: number) => console.log('Items per page changed to:', limit),
  },
};

// Last page
export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    totalItems: 250,
    itemsPerPage: 25,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onItemsPerPageChange: (limit: number) => console.log('Items per page changed to:', limit),
  },
};

// Single page (no pagination needed)
export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 15,
    itemsPerPage: 25,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onItemsPerPageChange: (limit: number) => console.log('Items per page changed to:', limit),
  },
};

// Many pages
export const ManyPages: Story = {
  args: {
    currentPage: 50,
    totalPages: 100,
    totalItems: 2500,
    itemsPerPage: 25,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onItemsPerPageChange: (limit: number) => console.log('Items per page changed to:', limit),
  },
};

// Small items per page
export const SmallItemsPerPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 100,
    totalItems: 1000,
    itemsPerPage: 10,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onItemsPerPageChange: (limit: number) => console.log('Items per page changed to:', limit),
  },
};

// Large items per page
export const LargeItemsPerPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    totalItems: 1000,
    itemsPerPage: 100,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onItemsPerPageChange: (limit: number) => console.log('Items per page changed to:', limit),
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    currentPage: 1,
    totalPages: 20,
    totalItems: 500,
    itemsPerPage: 25,
    onPageChange: (page: number) => alert(`Navigate to page: ${page}`),
    onItemsPerPageChange: (limit: number) => alert(`Change items per page to: ${limit}`),
  },
};
