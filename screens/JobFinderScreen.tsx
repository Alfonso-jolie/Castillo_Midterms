import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import uuid from 'react-native-uuid';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemeContext } from '../App'; // ✅ Import ThemeContext
import { RootStackParamList } from '../App'; // ✅ Import Navigation Types

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

const API_URL = 'https://empllo.com/api/v1';

const JobFinderScreen: React.FC = () => {
  // ✅ Fix: Prevent useContext(ThemeContext) from being undefined
  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null; // ✅ Prevents crashes
  
  const { isDarkMode } = themeContext;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadSavedJobs = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedJobs');
      if (saved) setSavedJobs(JSON.parse(saved));
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);

      if (!response.data || !Array.isArray(response.data.jobs)) {
        throw new Error('Unexpected API response format');
      }

      const formattedJobs: Job[] = response.data.jobs.map((job: any) => ({
        id: job.id ? String(job.id) : uuid.v4() as string,
        title: job.title || 'N/A',
        mainCategory: job.mainCategory || 'Unknown',
        companyName: job.companyName || 'Unknown',
        jobType: job.jobType || 'Not specified',
        location: job.location || 'Remote',
        minSalary: job.minSalary || 'Not provided',
        maxSalary: job.maxSalary || 'Not provided',
        description: job.description || 'No description available',
        icon: job.companyLogo || 'https://via.placeholder.com/50',
      }));

      setJobs(formattedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      Alert.alert('Error', 'Could not fetch jobs. Please check the API response.');
    } finally {
      setLoading(false);
    }
  };

  // Add focus effect to reload jobs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSavedJobs();
    }, [])
  );

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, []);

  const handleSaveJob = async (job: Job) => {
    const jobExists = savedJobs.some((saved) => saved.id === job.id);
    if (jobExists) {
      Alert.alert('Job Already Saved', 'This job is already in your saved jobs.');
      return;
    }

    let updatedSavedJobs = [...savedJobs, job];
    setSavedJobs(updatedSavedJobs);
    await AsyncStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    Alert.alert('Success', 'Job saved successfully!');
  };

  if (loading) {
    return <ActivityIndicator size="large" color={isDarkMode ? 'white' : 'blue'} style={styles.loader} />;
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={[styles.item, isDarkMode && styles.darkItem]}>
            <Image source={{ uri: item.icon }} style={styles.icon} />
            <View style={styles.jobDetails}>
              <Text style={[styles.title, isDarkMode && styles.darkText]}>{item.title}</Text>
              <Text style={[styles.text, isDarkMode && styles.darkText]}>{item.companyName}</Text>
              <Text style={[styles.text, isDarkMode && styles.darkText]}>{item.location}</Text>
              <Text style={[styles.text, isDarkMode && styles.darkText]}>Type: {item.jobType}</Text>
              <Text style={[styles.text, isDarkMode && styles.darkText]}>
                Salary: {item.minSalary} - {item.maxSalary}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                savedJobs.some((saved) => saved.id === item.id) && styles.savedButton,
                isDarkMode && styles.darkSaveButton
              ]}
              onPress={() => handleSaveJob(item)}
              disabled={savedJobs.some((saved) => saved.id === item.id)}
            >
              <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>
                {savedJobs.some((saved) => saved.id === item.id) ? 'Saved' : 'Save Job'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.applyButton, isDarkMode && styles.darkApplyButton]}
              onPress={() => navigation.navigate('ApplicationForm', { job: item })}
            >
              <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  darkContainer: { backgroundColor: '#121212' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white',
  },
  darkItem: {
    backgroundColor: '#333',
    borderBottomColor: '#555',
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  jobDetails: {
    flex: 1,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: 'black' },
  text: { color: 'black' },
  darkText: { color: 'white' },
  saveButton: {
    backgroundColor: '#f5a623',
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  savedButton: {
    backgroundColor: '#888',
  },
  darkSaveButton: {
    backgroundColor: '#555',
  },
  applyButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5,
  },
  darkApplyButton: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  darkButtonText: {
    color: '#fff',
  },
});

export default JobFinderScreen;
