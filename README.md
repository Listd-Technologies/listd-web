# Listd Web Application

A modern real estate listing web application built with Next.js, React, and TypeScript. This application serves as the web counterpart to our existing mobile app, maintaining consistent design language while leveraging web capabilities.

## Core Features

1. **Property Listing Search**
   - Advanced search with filters for location, price, property type, etc.
   - Map-based property exploration with drawing tools
   - Saved searches and alerts

2. **Property Valuation**
   - Automated valuation models
   - Historical price trends
   - Comparable property analysis

3. **User Onboarding & Profiles**
   - Seamless registration and authentication
   - User profile management
   - Preferences and favorites

4. **Messaging System**
   - Direct communication with agents/brokers
   - Inquiry management
   - Notification system

5. **Listing Management**
   - Create and publish listings
   - Update listing information
   - Photo and document uploads
   - Listing analytics

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (with customized color schemes)
- **Form Management**: React Hook Form with Zod validation
- **State Management**: 
  - React Context for app-wide state (where necessary)
  - Props and local state for component-specific state
  - TanStack React Query for server state

### Map Implementation
- Google Maps API with @vis.gl/react-google-maps for React integration
- Custom drawing tools for geographic search
- Position tracking with refs for stable map navigation

### Authentication
- Clerk for user authentication and management

### Data Fetching
- TanStack React Query for data fetching and cache management
- Axios for HTTP requests to external API
- Client-side integration with existing backend services

### UI Components
- Radix UI primitive components (via shadcn/ui)
- Embla Carousel for image galleries
- Lucide React for icons
- TanStack Table for data tables
- Framer Motion for animations and interactive UI elements

### Development Tools
- Biome for linting and formatting
- TypeScript for type-safety

## Getting Started

### Prerequisites
- Node.js 18.17 or later
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/listd-web.git
cd listd-web

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
pnpm dev
```

The application will be available at http://localhost:3000.

### Build for Production

```bash
pnpm build
pnpm start
```

## Development Workflow

### Code Formatting and Linting

```bash
# Format code
pnpm format

# Check formatting and linting
pnpm format:check

# Format and fix linting issues
pnpm check
```

### Project Structure

```
listd-web/
├── app/                # Next.js App Router
│   ├── (auth)/         # Authentication routes
│   ├── (dashboard)/    # Dashboard routes
│   ├── (marketing)/    # Public-facing pages
├── components/         # Reusable components
│   ├── ui/             # UI components (shadcn)
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
├── lib/                # Utility functions
├── context/            # React Context providers
├── hooks/              # Custom React hooks
│   ├── api/            # API integration hooks
├── types/              # TypeScript type definitions
├── services/           # API service integrations
├── styles/             # Global styles
├── public/             # Static assets
```

## Backend Integration

This application does not include API development within Next.js. Instead, it integrates with an existing backend service that provides:

- RESTful/GraphQL API endpoints for property listings and user data
- Authentication services
- Messaging infrastructure
- Media storage and delivery

The frontend uses React Query to efficiently fetch, cache, and synchronize with this backend service.

## Design System

This web application follows the design language established in our mobile app, with customized shadcn components to maintain consistency. The color scheme and component styling are aligned with our brand identity.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and ensure linting passes
4. Submit a pull request

## License

Proprietary - All rights reserved.
