import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { supabase } from "./lib/supabase";
import { useEffect, useState } from "react";
import Auth from "./src/screens/Auth";
import { colours } from "./constants/colours";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import { needToUpdate } from "./src/operations/Versions";
import * as Updates from 'expo-updates';

export default function App() {
  // Get session
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Check app version for updates
  const [mandatoryUpdate, setMandatoryUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkVersion = async () => {
      setMandatoryUpdate(
        await needToUpdate()
      );
      setLoading(false);
    };

    checkVersion();
  }, []);

  // Check for over-the-air updates (no need to download a new version)
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, [])

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colours.primary} />
        <Text style={styles.mainText}>Checking for updates...</Text>
      </View>
    );
  }

  if (mandatoryUpdate) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.mainText}>
          {'New update!\nPlease update the app to continue.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {session && session.user ? (
        <BottomTabNavigator session={session} />
      ) : (
        <Auth />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.bg,
  },
  mainText: {
    color: colours.text,
    fontSize: 18,
    textAlign: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  }
});
