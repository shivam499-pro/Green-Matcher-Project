/**
 * Simple translation utility
 * Returns the text as-is for now (can be enhanced later for i18n)
 */
export const t = (key, fallback) => {
  // If a fallback is provided, use it
  if (fallback !== undefined) {
    return fallback;
  }

  // Simple key-to-text mapping for common translations
  const translations = {
    // Auth
    'Login': 'Login',
    'SignIn': 'Sign In',
    'Register': 'Register',
    'SignUp': 'Sign Up',
    'EmailAddress': 'Email Address',
    'Enter your password': 'Enter your password',
    'ConfirmPassword': 'Confirm Password',
    'FullName': 'Full Name',
    'SelectRole': 'Select Role',
    'Already have an account?': 'Already have an account?',
    'LoginHere': 'Login here',
    'No account yet?': "Don't have an account?",
    'RegisterHere': 'Register here',
    'BackToHome': 'Back to Home',
    'auth.jobSeeker': 'Job Seeker',
    'auth.employer': 'Employer',

    // Common
    'common.loading': 'Loading...',

    // Errors
    'errors.passwordMismatch': 'Passwords do not match',
    'errors.somethingWentWrong': 'Something went wrong. Please try again.',
    'errors.invalidCredentials': 'Invalid email or password',

    // Jobs
    'Green Jobs': 'Green Jobs',
    'Search': 'Search',
    'Filters': 'Filters',
    'Location': 'Location',
    'All SDGs': 'All SDGs',
    'Clear Filters': 'Clear Filters',
    'No jobs found': 'No jobs found',
    'Try adjusting your search or filters': 'Try adjusting your search or filters',
    'Verified': 'Verified',
    'Save': 'Save',
    'View Details': 'View Details',
    'jobs.fetchError': 'Failed to load jobs',
    'jobs.searchPlaceholder': 'Search jobs by title, skills, or keywords...',
    'jobs.locationPlaceholder': 'e.g., Mumbai, Delhi',
    'jobs.minSalary': 'Minimum Salary (₹/year)',
    'jobs.subtitle': 'Find your next opportunity in the green economy',
    'jobs.showingResults': 'Showing {count} jobs',

    // Careers
    'Green Careers': 'Green Careers',
    'Explore sustainable career paths in the green economy': 'Explore sustainable career paths in the green economy',
    'careers.allSDGs': 'All SDGs',
    'careers.searchPlaceholder': 'Search careers by title, skills, or keywords...',
    'careers.showingResults': 'Showing {count} career(s)',
    'No Careers Found': 'No Careers Found',
    'careers.fetchError': 'Failed to load careers. Please try again.',
    'careers.searchError': 'Failed to search careers. Please try again.',
    'Required Skills': 'Required Skills',
    'Career Demand': 'Career Demand',
    'Try adjusting your filters or search criteria': 'Try adjusting your filters or search criteria',
    'No careers available at the moment': 'No careers available at the moment',

    // Job Detail
    'jobDetail.fetchError': 'Failed to load job details',

    // Dashboard
    'dashboard.fetchError': 'Failed to load data. Please try again.',
    'dashboard.titleRequired': 'Job title is required',
    'dashboard.descriptionRequired': 'Job description is required',
    'dashboard.locationRequired': 'Location is required',
    'dashboard.validMinSalary': 'Please enter a valid minimum salary',
    'dashboard.validMaxSalary': 'Please enter a valid maximum salary',
    'dashboard.salaryRangeError': 'Maximum salary must be greater than minimum salary',
    'dashboard.createJobError': 'Failed to create job. Please try again.',
    'dashboard.deleteJobError': 'Failed to delete job. Please try again.',
    'dashboard.updateApplicationError': 'Failed to update application. Please try again.',

    // Applicant View
    'applicantView.invalidId': 'Invalid applicant ID',

    // Admin
    'admin.fetchError': 'Failed to load data. Please try again.',
    'admin.verifyJobError': 'Failed to verify job. Please try again.',
    'admin.deleteJobError': 'Failed to delete job. Please try again.',
    'admin.deleteCareerError': 'Failed to delete career. Please try again.',

    // Analytics
    'Error loading analytics data': 'Error loading analytics data',
  };

  return translations[key] || key;
};
