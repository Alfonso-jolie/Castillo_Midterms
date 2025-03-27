import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApplicationFormScreenNavigationProp, ApplicationFormRouteProp } from '../types';
import { ThemeContext } from '../App';

type Props = {
  route: ApplicationFormRouteProp;
};

const ApplicationForm: React.FC<Props> = ({ route }) => {
  const { job } = route.params;
  const navigation = useNavigation<ApplicationFormScreenNavigationProp>();
  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null;
  
  const { isDarkMode } = themeContext;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whyHire, setWhyHire] = useState('');

  const validateForm = () => {
    // Name validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name.');
      return false;
    }
    if (name.length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters long.');
      return false;
    }
    if (/\d/.test(name)) {
      Alert.alert('Error', 'Name should not contain numbers.');
      return false;
    }

    // Email validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address (e.g., example@email.com).');
      return false;
    }

    // Phone number validation
    if (!contactNumber.trim()) {
      Alert.alert('Error', 'Please enter your contact number.');
      return false;
    }
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (!phoneRegex.test(contactNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number (minimum 10 digits).');
      return false;
    }

    // Why hire validation
    if (!whyHire.trim()) {
      Alert.alert('Error', 'Please explain why we should hire you.');
      return false;
    }
    if (whyHire.length < 20) {
      Alert.alert('Error', 'Your answer must be at least 20 characters long.');
      return false;
    }
    if (whyHire.length > 500) {
      Alert.alert('Error', 'Your answer must not exceed 500 characters.');
      return false;
    }
    if (whyHire.split(' ').length < 5) {
      Alert.alert('Error', 'Please provide a more detailed answer (at least 5 words).');
      return false;
    }

    return true;
  };

  const saveJob = async () => {
    try {
      const savedJobs = await AsyncStorage.getItem('savedJobs');
      const jobs = savedJobs ? JSON.parse(savedJobs) : [];
      
      // Check if job is already saved
      if (!jobs.some((savedJob: any) => savedJob.id === job.id)) {
        jobs.push(job);
        await AsyncStorage.setItem('savedJobs', JSON.stringify(jobs));
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Save the job first
    await saveJob();

    Alert.alert(
      'Application Submitted',
      `Your application for "${job.title}" at ${job.companyName} has been submitted successfully.`,
      [
        {
          text: 'Okay',
          onPress: () => {
            setName('');
            setEmail('');
            setContactNumber('');
            setWhyHire('');

            // If coming from SavedJobs, navigate back to JobFinder
            navigation.canGoBack() ? navigation.goBack() : navigation.navigate('JobFinderScreen');
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, isDarkMode && styles.darkText]}>Apply for {job.title}</Text>

        <View style={[styles.form, isDarkMode && styles.darkForm]}>
          <TextInput 
            style={[styles.input, isDarkMode && styles.darkInput]} 
            placeholder="Full Name" 
            value={name} 
            onChangeText={setName}
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />
          <TextInput 
            style={[styles.input, isDarkMode && styles.darkInput]} 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />
          <TextInput 
            style={[styles.input, isDarkMode && styles.darkInput]} 
            placeholder="Contact Number" 
            value={contactNumber} 
            onChangeText={setContactNumber} 
            keyboardType="phone-pad"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />
          <TextInput 
            style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]} 
            placeholder="Why should we hire you?" 
            value={whyHire} 
            onChangeText={setWhyHire} 
            multiline
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Application</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  darkContainer: { backgroundColor: '#121212' },
  scrollContent: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  darkText: { color: '#fff' },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 3 },
  darkForm: { backgroundColor: '#333', elevation: 0 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 12, 
    fontSize: 16, 
    color: '#000',
    backgroundColor: '#fff'
  },
  darkInput: { 
    borderColor: '#555',
    backgroundColor: '#444',
    color: '#fff'
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#007bff', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ApplicationForm;
