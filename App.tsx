import React, { useState, createContext, useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import JobFinderScreen from './screens/JobFinderScreen';
import SavedJobsScreen from './screens/SavedJobsScreen';
import ApplicationForm from './screens/ApplicationForm';

// Define Stack Param List
export type RootStackParamList = {
  MainTabs: undefined;
  ApplicationForm: { job: any };
};

// ✅ Create Theme Context
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Theme Toggle Button
const ThemeToggleButton = () => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null;

  return <Switch value={themeContext.isDarkMode} onValueChange={themeContext.toggleTheme} />;
};

// ✅ Bottom Tab Navigator
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';
          if (route.name === 'JobFinder') iconName = 'briefcase';
          if (route.name === 'SavedJobs') iconName = 'heart';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="JobFinder" component={JobFinderScreen} />
      <Tab.Screen name="SavedJobs" component={SavedJobsScreen} />
    </Tab.Navigator>
  );
};

// ✅ Fixed Theme Context Usage
const App = () => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null; // Ensure context is defined

  const { isDarkMode } = themeContext;

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{
            headerRight: () => <ThemeToggleButton />,
            headerTitle: 'Job Finder App',
          }}
        />
        <Stack.Screen name="ApplicationForm" component={ApplicationForm} options={{ title: 'Apply Now' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
