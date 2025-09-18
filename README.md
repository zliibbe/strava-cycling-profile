# Strava Cycling Profile

A React SPA that integrates with the Strava API to display comprehensive cycling statistics and achievements for authenticated users.

## Features

- **Strava OAuth 2.0 Authentication** - Secure login with your Strava account
- **Multiple Time Periods** - View stats for week, 30 days, and 60 days
- **Comprehensive Metrics** - Total distance, elevation gain, ride count, and moving time
- **Interactive Dashboard** - Dynamic filtering and responsive design
- **Imperial Units** - Distance in miles and elevation in feet for American users
- **Mobile Responsive** - Optimized for all device sizes
- **Privacy Focused** - Read-only access, revocable anytime

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **CSS Modules** for scoped styling
- **ESLint** for code quality

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Strava API v3** integration
- **CORS** enabled for cross-origin requests

## Prerequisites

- Node.js 18+ and npm
- Strava Developer Account
- Strava API Application (Client ID and Secret)

## Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd strava-cycling-profile
```

### 2. Configure Strava API

1. Go to [Strava Developers](https://developers.strava.com/)
2. Create a new application
3. Set Authorization Callback Domain to: `localhost`
4. Note your Client ID and Client Secret

### 3. Backend Setup

```bash
cd backend
npm install
```

Copy environment configuration:
```bash
cp .env.example .env
```

Edit `.env` with your Strava credentials:
```env
STRAVA_CLIENT_ID=your_strava_client_id_here
STRAVA_CLIENT_SECRET=your_strava_client_secret_here
STRAVA_REDIRECT_URI=http://localhost:3001/auth/strava/callback
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

## Running the Application

### Development Mode

Start both backend and frontend servers:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:5173

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Usage

1. Navigate to http://localhost:5173
2. Click "Connect with Strava"
3. Authorize the application in Strava
4. View your cycling statistics on the dashboard
5. Use the time period filters to analyze different date ranges

## API Endpoints

- `GET /auth/strava` - Initiate OAuth flow
- `GET /auth/strava/callback` - Handle OAuth callback
- `GET /api/stats` - Fetch aggregated cycling statistics

## Project Structure

```
strava-cycling-profile/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── app.ts          # Express app
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API integration
│   │   └── App.tsx         # Main app
│   └── package.json
└── README.md
```

## Development Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STRAVA_CLIENT_ID` | Your Strava app client ID | Required |
| `STRAVA_CLIENT_SECRET` | Your Strava app client secret | Required |
| `STRAVA_REDIRECT_URI` | OAuth callback URL | `http://localhost:3001/auth/strava/callback` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## Troubleshooting

### Common Issues

**OAuth Callback Error:**
- Verify your Strava app's Authorization Callback Domain is set to `localhost`
- Ensure `STRAVA_REDIRECT_URI` matches your Strava app configuration

**CORS Issues:**
- Check that `FRONTEND_URL` in backend `.env` matches your frontend URL
- Verify both servers are running on correct ports

**No Data Displayed:**
- Ensure you have cycling activities in your Strava account
- Check browser console for API errors
- Verify your Strava app has appropriate permissions

### Port Conflicts

If default ports are in use:

**Backend (change PORT in .env):**
```env
PORT=3002
```

**Frontend (use --port flag):**
```bash
npm run dev -- --port 5174
```

Remember to update CORS and redirect URIs accordingly.

## License

This project is for an interview and should not be copied.

## Screenshot of App
### v1
<img width="983" height="549" alt="image" src="https://github.com/user-attachments/assets/f199c949-a891-4889-bdc0-a16c3148f179" />

### v2
Work done after the time limit was complete
See the following branches: 1) ui-improvements 2) oauth-popup-flow 3) javascript-only
<img width="1390" height="1050" alt="image" src="https://github.com/user-attachments/assets/82151f93-2677-447d-93a7-d5a758d48a34" />


