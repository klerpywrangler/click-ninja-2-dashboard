# Modern Dashboard with Records

A sleek and modern dashboard application built with React, TypeScript, and shadcn/ui components. The dashboard displays records fetched from a REST API in a sidebar, with detailed views for each record.

## Features

- Modern UI with shadcn/ui components
- Responsive sidebar layout
- Real-time data fetching with TanStack Query
- Toast notifications for error handling
- TypeScript for type safety
- Tailwind CSS for styling

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API URL:
```env
VITE_API_URL=https://api.example.com/records
```

4. Start the development server:
```bash
npm run dev
```

## Development

The project uses:
- Vite for fast development and building
- React for the UI framework
- TypeScript for type safety
- TanStack Query for data fetching
- shadcn/ui for UI components
- Tailwind CSS for styling

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT
