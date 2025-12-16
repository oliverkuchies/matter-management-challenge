import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from '../components/pagination/Pagination';

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
    limit: {
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
    total: 250,
    limit: 25,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onLimitChange: (limit: number) => console.log('Limit changed to:', limit),
  },
};

// Middle page
export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    total: 250,
    limit: 25,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onLimitChange: (limit: number) => console.log('Limit changed to:', limit),
  },
};

// Last page
export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    total: 250,
    limit: 25,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onLimitChange: (limit: number) => console.log('Limit changed to:', limit),
  },
};

// Single page (no pagination needed)
export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    total: 15,
    limit: 25,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onLimitChange: (limit: number) => console.log('Limit changed to:', limit),
  },
};

// Many pages
export const ManyPages: Story = {
  args: {
    currentPage: 50,
    totalPages: 100,
    total: 2500,
    limit: 25,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onLimitChange: (limit: number) => console.log('Limit changed to:', limit),
  },
};

// Small items per page
export const SmallItemsPerPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 100,
    total: 1000,
    limit: 10,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onLimitChange: (limit: number) => console.log('Limit changed to:', limit),
  },
};

// Large items per page
export const LargeItemsPerPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    total: 1000,
    limit: 100,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    onLimitChange: (limit: number) => console.log('Limit changed to:', limit),
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    currentPage: 1,
    totalPages: 20,
    total: 500,
    limit: 25,
    onPageChange: (page: number) => alert(`Navigate to page: ${page}`),
    onLimitChange: (limit: number) => alert(`Change limit to: ${limit}`),
  },
};
