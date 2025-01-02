import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, Modal, TouchableOpacity } from "react-native";
import { colours } from "../../constants/colours";
import HeavyButton from "../components/HeavyButton";
import { supabase } from "../../lib/supabase";

const Settings = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  const SignOutModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={signOutModalVisible}
        onRequestClose={() => setSignOutModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContainer}
          onPress={() => setSignOutModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalTouchableContainer}
              activeOpacity={1}
              onPress={() => {
                /* Prevent closing modal when badge is pressed */
              }}
            >
              <Text style={styles.modalTitle}>Are you sure you want to sign out?</Text>
              <HeavyButton
                style={styles.button}
                title="Sign Out"
                onPress={handleSignOut}
                disabled={loading}
                color={colours.redButtonBG}
                borderColor={colours.redButtonBorder}
              />
              <HeavyButton
                style={styles.button}
                title="Cancel"
                onPress={() => setSignOutModalVisible(false)}
                disabled={loading}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error signing out", error.message);
    }
    setLoading(false);
  };

  const handleNotifications = () => {
    Alert.alert("Notifications", "Manage your notification preferences.");
  };

  const handleTutorial = () => {
    Alert.alert("Tutorial", "Start the tutorial to learn more about the app.");
  };

  const handlePrivacyPolicy = () => {
    Alert.alert("Privacy Policy", "Read our privacy policy.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <HeavyButton
        style={styles.button}
        title={loading ? "Signing out..." : "Sign Out"}
        onPress={() => setSignOutModalVisible(true)}
        disabled={loading}
      />

      <HeavyButton
        style={styles.button}
        title="Notifications"
        onPress={handleNotifications}
      />

      <SignOutModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colours.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colours.text,
    marginBottom: 32,
  },
  button: {
    width: "85%",
    backgroundColor: colours.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colours.bg,
    borderRadius: 8,
    elevation: 5,
  },
  modalTouchableContainer: {
    padding: 20,
    paddingTop: 30,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colours.text,
    marginBottom: 32,
  },
});

export default Settings;
