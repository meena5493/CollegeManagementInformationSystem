# CollegeManagementInformationSystem
CMIS is a comprehensive college management information system built with React, Express.js, and PostgreSQL. The application manages various aspects of college administration including student records, faculty information, course management, marks tracking, fee collection, and reporting. It provides role-based access control for administrators, faculty, and students with different levels of functionality for each user type.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing without React Router complexity
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui design system for consistent, accessible interfaces
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript for type safety across the entire stack
- **Database Integration**: Drizzle ORM for type-safe database operations and schema management
- **API Design**: RESTful endpoints following standard HTTP methods and status codes
- **Development**: Hot reload with Vite integration for seamless full-stack development

### Authentication & Authorization
- **Authentication**: Simple email/password authentication with client-side session storage
- **Authorization**: Role-based access control (RBAC) with three user roles:
  - Admin: Full access to all features including user management
  - Faculty: Access to student records, marks entry, and course management
  - Student: Limited access to personal records, marks viewing, and fee status
- **Route Protection**: Protected routes that redirect unauthorized users based on role requirements

### Data Storage
- **Primary Database**: PostgreSQL for relational data storage
- **ORM**: Drizzle ORM with code-first schema definition
- **Migration Strategy**: Drizzle Kit for database schema migrations and updates
- **Connection**: Neon Database serverless PostgreSQL for cloud hosting

### Core Data Models
- **Users**: Base user information with role-based access
- **Students**: Extended user profiles with academic information
- **Faculty**: Teaching staff with course assignments
- **Courses**: Academic course catalog with department organization
- **Marks**: Student performance tracking across different exam types
- **Fees**: Financial records for student fee management

### Component Architecture
- **Layout Components**: Responsive sidebar navigation and topbar for consistent UI
- **Modal System**: Reusable modal components for data entry forms
- **Form Management**: React Hook Form with Zod validation for type-safe form handling
- **UI Components**: Modular, reusable components built on Radix UI primitives

## External Dependencies

### Core Frameworks
- **@neondatabase/serverless**: Neon PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching

### UI & Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Utility for creating consistent component variants
- **clsx**: Conditional className utility for dynamic styling

### Form Management
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Form validation resolvers for various validation libraries
- **zod**: TypeScript-first schema validation for forms and API data

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking for enhanced developer experience
- **drizzle-kit**: Database migration and schema management tools

### Utility Libraries
- **date-fns**: Modern JavaScript date utility library
- **wouter**: Minimalist routing library for React applications
- **lucide-react**: Consistent icon set for UI components
