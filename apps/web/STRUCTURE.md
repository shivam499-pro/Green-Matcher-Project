# Green Matchers - Industry-Grade Web Structure

## Overview

This document describes the restructured `apps/web` directory following industry best practices for a React application with backend integration and AI features.

## Directory Structure

```
apps/web/
├── .env.example
├── Dockerfile
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── public/
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── components/
│   │   ├── __init__.js
│   │   ├── analytics/
│   │   │   ├── AnalyticsOverview.jsx
│   │   │   ├── CareerDemandChart.jsx
│   │   │   ├── SalaryRangeChart.jsx
│   │   │   ├── SDGDistributionChart.jsx
│   │   │   ├── SkillPopularityChart.jsx
│   │   │   └── index.js
│   │   ├── common/
│   │   │   ├── Alert.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── LanguageToggle.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoleGuard.jsx
│   │   │   ├── SDGTag.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── index.js
│   │   ├── employer/
│   │   │   ├── ApplicationList.jsx
│   │   │   ├── JobForm.jsx
│   │   │   ├── JobManagementCard.jsx
│   │   │   ├── EmployerStats.jsx
│   │   │   └── index.js
│   │   └── job-seeker/
│   │       ├── ApplicationForm.jsx
│   │       ├── JobAlertSettings.jsx
│   │       ├── ResumeUploader.jsx
│   │       ├── SavedJobsList.jsx
│   │       ├── SkillGapAnalysis.jsx
│   │       └── index.js
│   ├── config/
│   │   ├── constants.js
│   │   ├── env.js
│   │   └── index.js
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── I18nContext.jsx
│   │   └── index.js
│   ├── hooks/
│   │   ├── index.js
│   │   ├── useAsync.js
│   │   ├── useDebounce.js
│   │   ├── useFetch.js
│   │   ├── useForm.js
│   │   ├── useLocalStorage.js
│   │   ├── useMediaQuery.js
│   │   ├── usePagination.js
│   │   └── useClickOutside.js
│   ├── pages/
│   │   ├── __init__.js
│   │   ├── AdminDashboard.jsx
│   │   ├── Analytics.jsx
│   │   ├── ApplicantView.jsx
│   │   ├── Careers.jsx
│   │   ├── EmployerDashboard.jsx
│   │   ├── EmployerProfile.jsx
│   │   ├── JobDetail.jsx
│   │   ├── Jobs.jsx
│   │   ├── JobSeekerDashboard.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   ├── Recommendations.jsx
│   │   └── Register.jsx
│   ├── services/
│   │   ├── aiService.js
│   │   ├── analyticsService.js
│   │   ├── applicationsService.js
│   │   ├── authService.js
│   │   ├── careersService.js
│   │   ├── jobsService.js
│   │   └── index.js
│   ├── utils/
│   │   ├── __init__.js
│   │   ├── api.js
│   │   ├── i18n.js
│   │   └── translations.js
│   └── types/
│       ├── index.js
│       ├── api.js
│       ├── components.js
│       └── hooks.js
```

## Key Features

### 1. Service Layer Architecture

Each domain has its own service file with organized API calls:

- **authService.js**: Authentication (login, register, logout, profile management)
- **jobsService.js**: Job CRUD, search, recommendations
- **careersService.js**: Career paths, matching, SDG filtering
- **applicationsService.js**: Application management
- **analyticsService.js**: Dashboard analytics and metrics
- **aiService.js**: AI-powered features (recommendations, skill matching, resume analysis)

### 2. Custom React Hooks

Reusable hooks for common functionality:

- **useFetch**: Generic data fetching with loading/error states
- **usePagination**: Infinite scroll and pagination support
- **useForm**: Form state management with validation
- **useDebounce**: Debounced values for search
- **useLocalStorage**: Persistent local state
- **useAsync**: Async operation handling
- **useClickOutside**: Click outside detection

### 3. Context Providers

- **AuthContext.jsx**: Global authentication state and methods
- **I18nContext.jsx**: Multi-language support

### 4. Role-Based Access Control

- **ProtectedRoute.jsx**: Requires authentication
- **RoleGuard.jsx**: Component-level role filtering

### 5. Reusable UI Components

**Common Components**:
- Button, Input, Select, Card, Modal
- Spinner, Alert, Toast notifications
- JobCard, SDGTag for domain-specific display
- EmptyState, LoadingState, ErrorState for UX

**Feature Components**:
- Employer: JobForm, ApplicationList
- Job Seeker: ApplicationForm, SkillGapAnalysis
- Analytics: Chart components, StatCard

### 6. Configuration Management

- **config/env.js**: Environment variables with defaults
- **config/constants.js**: App-wide constants (SDG goals, user roles, API endpoints)
- Centralized configuration prevents magic strings/numbers

### 7. AI/ML Integration

The `aiService.js` provides:
- Job/career recommendations
- Skill matching analysis
- Resume analysis
- Cover letter generation
- Interview tips
- Semantic search

## Integration with Backend

The frontend is designed to work with the FastAPI backend:

| Backend Endpoint | Frontend Service |
|-----------------|------------------|
| `/auth/*` | authService |
| `/jobs/*` | jobsService |
| `/careers/*` | careersService |
| `/applications/*` | applicationsService |
| `/analytics/*` | analyticsService |
| `/ai/*` | aiService |

## Usage Examples

### Using Auth Context
```jsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  // Use auth methods
}
```

### Using Custom Hooks
```jsx
import { useFetch, usePagination } from '@/hooks';

function JobsList() {
  const { data: jobs, loading, error } = useFetch(() => jobsService.getJobs());
  const { data: moreJobs, loadMore, hasMore } = usePagination(jobsService.getJobs);
  // Render jobs
}
```

### Using Services
```jsx
import { jobsService, aiService } from '@/services';

async function getRecommendations() {
  const recommendations = await aiService.getJobRecommendations({
    skills: ['Python', 'React'],
    location: 'Remote'
  });
}
```

## Best Practices Implemented

1. **Separation of Concerns**: Services handle API, components handle UI, hooks handle logic
2. **Reusable Components**: All components are designed for reuse across pages
3. **Error Handling**: Consistent error handling in services and components
4. **Loading States**: All async operations have loading indicators
5. **Type Safety**: JSDoc comments for type inference
6. **Environment Configuration**: Centralized environment variable management
7. **Internationalization**: Multi-language support built-in
8. **Responsive Design**: Tailwind CSS for responsive layouts
9. **Accessibility**: Semantic HTML and ARIA labels
10. **Performance**: Debouncing, pagination, and lazy loading patterns

## Next Steps

1. Add unit tests for services and hooks
2. Implement React Query for server state management
3. Add storybook for component documentation
4. Implement error boundaries for crash reporting
5. Add analytics tracking for user behavior
