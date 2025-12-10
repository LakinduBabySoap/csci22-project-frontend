# Cultural Events Frontend

A React-based Single Page Application for browsing cultural events and venues.

## Tech Stack

- **Framework**: React.js 18.3
- **Build Tool**: Vite 6.0
- **Routing**: React Router DOM 7.1
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Shadcn UI
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Code Formatting**: Prettier

## Current Project Structure

```
csci22-project-frontend/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   └── ui/            # Shadcn UI components (to be added)
│   ├── lib/
│   │   └── utils.js       # Utility functions (cn helper)
│   ├── pages/
│   │   └── Home.jsx       # Home page component
│   ├── App.jsx            # Main app component with routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles & Tailwind directives
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── .prettierrc            # Prettier configuration
├── .prettierignore        # Prettier ignore rules
├── components.json        # Shadcn UI configuration
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd csci22-project-frontend
```

### 2. Install dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### 3. Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Format code with Prettier

```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check
```

### 6. Build for production

```bash
npm run build
```

## Features

### User Features
- View all cultural event locations on map and list
- Filter locations by keywords, areas, and distance
- Sort locations by name, distance, number of events
- View detailed information for each location
- Add locations to favourites
- Add comments to locations

### Admin Features
- CRUD operations on event data
- CRUD operations on user data

### Extra Features
- Dark/Light theme toggle
- Responsive mobile layout
- English/Chinese localization (i18n)
- Sign up flow with validation
- Two-Factor Authentication (2FA) - Bonus

## Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run format` - Format all source files with Prettier
- `npm run format:check` - Check if files are formatted correctly

## Adding Shadcn UI Components

When you need to add a Shadcn UI component:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dropdown-menu
# etc.
```

Components will be added to `src/components/ui/`

## Development Guidelines

- **Formatting**: Run `npm run format` before committing code
- **Imports**: Use `@/` alias for cleaner imports (e.g., `import { cn } from '@/lib/utils'`)
- **Styling**: Use Tailwind CSS utility classes
- **Components**: Build reusable components in `src/components/`
- **Pages**: Create page components in `src/pages/`
- **API Calls**: Centralize API logic in `src/services/api.js`

The frontend is configured to proxy API requests to the backend:

- Backend URL: `http://localhost:5000` (configured in `vite.config.js`)
- API requests to `/api/*` will be automatically proxied to the backend
- Make sure the backend server is running before starting frontend development

Example API call:
```javascript
import axios from 'axios'

// This will call http://localhost:5000/api/locations
const response = await axios.get('/api/locations')
```
