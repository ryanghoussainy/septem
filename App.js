import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from './lib/supabase';
import { useEffect, useState } from 'react';
import Auth from './src/Auth';
import { colours } from './constants/colours';

export default function App() {

  // Get session
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {session && session.user ? <Text>Logged in</Text> : <Auth />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
