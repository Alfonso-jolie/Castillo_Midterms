import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  JobFinderScreen: undefined;
  SavedJobsScreen: undefined;
  ApplicationForm: { job: Job };
};

export type Job = {
  id: string;
  title: string;
  mainCategory: string;
  companyName: string;
  jobType: string;
  location: string;
  minSalary: string;
  maxSalary: string;
  description: string;
  icon: string;
};

// Navigation type for ApplicationForm screen
export type ApplicationFormScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ApplicationForm'>;

// Route type for ApplicationForm screen
export type ApplicationFormRouteProp = RouteProp<RootStackParamList, 'ApplicationForm'>;
