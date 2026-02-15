/**
 * Green Matchers - Components
 * Reusable React components
 * 
 * This file provides a central export point for all components.
 * Instead of importing from individual files, you can import from here:
 * 
 * Example:
 * import { Button, Card, JobCard } from '../components';
 */

// Common UI Components
export {
  Button,
  Card,
  ErrorMessage,
  LoadingSpinner,
  Modal,
  Navigation,
  LanguageToggle,
  NotificationCenter,
  ProtectedRoute,
  SearchBar,
  SDGTag,
  SuccessMessage,
  UserSettings,
  Input,
} from './common';

// Analytics Components
export {
  default as AnalyticsOverview,
} from './analytics/AnalyticsOverview';
export {
  default as CareerDemandChart,
} from './analytics/CareerDemandChart';
export {
  default as SalaryRangeChart,
} from './analytics/SalaryRangeChart';
export {
  default as SDGDistributionChart,
} from './analytics/SDGDistributionChart';
export {
  default as SkillPopularityChart,
} from './analytics/SkillPopularityChart';

// Employer Components
export { default as JobCard } from './employer/JobCard';
export { default as JobForm } from './employer/JobForm';

// Job Seeker Components
export { default as AIFeatures } from './job-seeker/AIFeatures';
export { default as ApplicationCard } from './job-seeker/ApplicationCard';
export { default as BrowseHistory } from './job-seeker/BrowseHistory';
export { default as CareerCard } from './job-seeker/CareerCard';
export { default as JobAlertsManager } from './job-seeker/JobAlertsManager';
export { default as JobSeekerJobCard } from './job-seeker/JobCard';