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

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── Navbar.jsx          # Navigation with avatar dropdown
│   ├── LocationList.jsx    # List view with filtering/sorting
│   ├── LocationMap.jsx     # Map view of all locations
│   ├── LocationDetail.jsx  # Single location focused view
│   └── ThemeToggle.jsx     # Dark/light theme switcher
├── pages/
│   ├── Login.jsx           # Login page
│   ├── SignUp.jsx          # Sign up page
│   ├── Home.jsx            # Main page with map & list
│   ├── UserProfile.jsx     # User's favourite venues
│   ├── EventList.jsx       # Admin: CRUD events
│   └── UserList.jsx        # Admin: CRUD users
├── services/
│   └── api.js              # API calls to backend
├── contexts/
│   ├── AuthContext.jsx     # Authentication state
│   ├── ThemeContext.jsx    # Theme state
│   └── LanguageContext.jsx # i18n state
├── lib/
│   └── utils.js            # Utility functions
├── App.jsx                 # Main app component
├── main.jsx                # Entry point
└── index.css               # Global styles
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

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for production

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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

