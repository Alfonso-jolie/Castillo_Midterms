import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../App'; // ✅ Ensure ThemeContext is used correctly
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const SavedJobsScreen = () => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null; // ✅ Prevents undefined errors
  const { isDarkMode } = themeContext;

  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedJobs');
      if (saved) {
        setSavedJobs(JSON.parse(saved));
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load saved jobs.');
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

  const removeJob = async (jobId: string) => {
    const updatedJobs = savedJobs.filter((job) => job.id !== jobId);
    setSavedJobs(updatedJobs);
    await AsyncStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>Saved Jobs</Text>

      {loading ? (
        <ActivityIndicator size="large" color={isDarkMode ? 'white' : 'blue'} />
      ) : savedJobs.length === 0 ? (
        <Text style={[styles.noJobs, isDarkMode && styles.darkText]}>No saved jobs yet.</Text>
      ) : (
        <FlatList
          data={savedJobs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={[styles.jobCard, isDarkMode && styles.darkCard]}>
              <Text style={[styles.jobTitle, isDarkMode && styles.darkText]}>{item.title}</Text>
              <Text style={[styles.companyName, isDarkMode && styles.darkText]}>{item.companyName}</Text>
              <Text style={[styles.salary, isDarkMode && styles.darkText]}>
                Salary: {item.minSalary ?? 'N/A'} - {item.maxSalary ?? 'N/A'}
              </Text>
              <View style={styles.buttonContainer}>
                <Button title="Remove" onPress={() => removeJob(item.id)} color={isDarkMode ? '#FF5555' : 'red'} />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

// ✅ Styles with Dark Mode Support
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  darkContainer: { backgroundColor: '#121212' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: 'black' },
  darkText: { color: 'white' },
  noJobs: { fontSize: 16, textAlign: 'center', marginTop: 20, color: 'black' },
  jobCard: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  darkCard: { backgroundColor: '#333' },
  jobTitle: { fontSize: 18, fontWeight: 'bold', color: 'black' },
  companyName: { fontSize: 16, color: 'black' },
  salary: { fontSize: 14, color: 'black' },
  buttonContainer: { marginTop: 10 },
});

export default SavedJobsScreen;
