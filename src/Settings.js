import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { colours } from '../constants/colours';
import HeavyButton from './components/HeavyButton';
import { supabase } from '../lib/supabase';

const Settings = ({ session }) => {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error signing out', error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <HeavyButton
        style={styles.button}
        title={loading ? 'Signing out...' : 'Sign Out'}
        onPress={handleSignOut}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: colours.text,
    marginBottom: 40,
  },
  button: {
    width: '80%',
  },
});

export default Settings;
