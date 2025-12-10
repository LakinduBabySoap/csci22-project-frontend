# Cultural Events Frontend

A React-based Single Page Application for browsing cultural events and venues.

## Tech Stack

- **Framework**: React.js ([Doc](https://react.dev/reference/react))
- **Build Tool**: Vite
- **Routing**: TanStack Router ([Doc](https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts))
- **Styling**: Tailwind CSS ([Doc](https://tailwindcss.com/docs/editor-setup#intellisense-for-vs-code))
- **UI Components**: Shadcn UI ([Doc](https://ui.shadcn.com/docs/components))

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/LakinduBabySoap/csci22-project-frontend.git
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
BACKEND_API_URL=http://localhost:3000
MAP_API_KEY=your_map_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Development Guidelines

- **Branching**: Create a new branch from the main branch in git `git checkout -b new-branch-name` to work on your part. Remember to pull the changes from main branch before merging your branch back to main.
- **Code Files**: Create pages in the [corresponding directory](#Project-Structure). Follow [File-based Routing](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing#directory-routes) for creating pages.
- **React.js**: Use only **functional components**.
- **Styling**:
   - Use [Tailwind CSS](https://tailwindcss.com/docs/styling-with-utility-classes) utility classes. **NEVER** write inline CSS using `style` attribute.
   - Use Theme Colors and components from [Shadcn](https://ui.shadcn.com/docs/theming#convention).
- **Formatting**: Use Prettier to format on save. (Recommendation: Install [Prettier in your IDE](https://prettier.io/docs/editors#visual-studio-code))
- **Imports**: Use `@/` alias for cleaner imports (e.g., `import { cn } from '@/lib/utils'`)

The frontend is configured to proxy API requests to the backend:

- Backend URL: `http://localhost:3000` (configured in `.env`)
- API requests to `/api/*` will be automatically proxied to the backend
- Make sure the backend server is running before starting frontend development

Example API call:

```javascript
import axios from 'axios'

// This will call http://localhost:3000/api/venues
const response = await axios.get('/api/venues')
```

## Features

### User Features

- View all cultural event venues on map and list
- Filter venues by keywords, areas, and distance
- Sort venues by name, distance, number of events
- View detailed information for each venue
- Add venues to favourites
- Add comments to venues

### Admin Features

- CRUD operations on event data
- CRUD operations on user data

### Extra Features

- Dark/Light theme toggle
- Responsive mobile layout
- English/Chinese localization (i18n)
- Sign up flow with validation
- Two-Factor Authentication (2FA) - Bonus

## Project Structure

```
csci22-project-frontend/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── ui/            # Shadcn UI components (e.g., Button, Input, etc.)
│   │   └── ...            # Other reusable components (e.g., Navbar, VenueList)
│   ├── lib/
│   │   └── utils.js       # Utility functions (cn helper)
│   ├── routes/            # File-based routes
│   │   ├── __root.jsx     # Root layout (Navbar, Outlet)
│   │   ├── index.jsx      # Home page (/)
│   │   ├── login/
│   │   │   └── index.jsx  # Login page (/login)
│   │   ├── signup/
│   │   │   └── index.jsx  # Signup page (/signup)
│   │   ├── profile/
│   │   │   └── index.jsx  # User favorite venues page (/profile)
│   │   ├── events/
│   │   │   └── index.jsx  # Events List (/events)
│   │   └── users/
│   │       └── index.jsx  # Users List (/users)
│   ├── services/
│   │   ├── auth.js        # Authenication API logic
│   │   ├── events.js      # Events API logic
│   │   └── venues.js      # Venues API logic
│   ├── hooks/             # Custom React hooks (if needed)
│   ├── contexts/          # React contexts (e.g., for theme, auth)
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles and themes
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── .prettierrc            # Prettier configuration
├── .prettierignore        # Prettier ignore rules
├── components.json        # Shadcn UI configuration
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite configuration
```
