import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import HeavyButton from "../components/HeavyButton";
import { colours } from "../../constants/colours";
import { Divider, Text } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";

export default function Auth() {
  // User's details
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Loading state for sign in and sign up
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);

  // Function to sign in with first name and password
  const signIn = async () => {
    // Ensure first name and password are provided
    if (!firstName || !password) {
      Alert.alert("First name and password are required");
      return;
    }

    setSignInLoading(true);

    // Dummy email to sign in with password
    const dummyEmail = `${firstName}@dummy.com`;

    // Attempt to sign in
    const { error } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password,
    });
    if (error) Alert.alert(error.message);

    setSignInLoading(false);
  };

  // Function to sign up with first name and password
  const signUp = async () => {
    // Ensure first name and password are provided
    if (!firstName || !password) {
      Alert.alert("First name and password are required");
      return;
    }

    setSignUpLoading(true);

    // Dummy email to sign up with password
    const dummyEmail = `${firstName}@dummy.com`;

    // Attempt to create a new auth user
    const { error } = await supabase.auth.signUp({
      email: dummyEmail,
      password,
      // Provide first name as metadata
      // This will be added to the user's table through a trigger when the auth user is created
      options: {
        data: { firstName },
      },
    });
    if (error) Alert.alert(error.message);

    setSignUpLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Welcome to Septem</Text>

      {/* Input box for first name */}
      <TextInput
        style={styles.inputBox}
        placeholderTextColor={colours.placeholder}
        placeholder="first name"
        onChangeText={setFirstName}
      />

      {/* Input box for password */}
      <View style={styles.pwdInputContainer}>
        <TextInput
          style={styles.inputBox}
          placeholderTextColor={colours.placeholder}
          placeholder="password"
          secureTextEntry={!passwordVisible}
          onChangeText={setPassword}
        />

        {/* Button to toggle password visibility */}
        <TouchableOpacity
          style={styles.pwdVisibility}
          onPress={() => setPasswordVisible(!passwordVisible)}
        >
          <Ionicons
            name={passwordVisible ? "eye" : "eye-off"}
            size={24}
            color={colours.text}
          />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <Divider
        style={{ width: "90%", marginVertical: 10 }}
        color={colours.text}
      />

      {/* Button to sign in */}
      <HeavyButton
        style={styles.button}
        title={signInLoading ? <ActivityIndicator color="#fff" /> : "Sign in"}
        onPress={signIn}
        // Disable sign in if either sign in or sign up is loading
        disabled={signInLoading || signUpLoading}
      />

      {/* Button to sign up */}
      <HeavyButton
        style={styles.button}
        title={signUpLoading ? <ActivityIndicator color="#fff" /> : "Sign up"}
        onPress={signUp}
        // Disable sign up if either sign in or sign up is loading
        disabled={signInLoading || signUpLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  title: {
    fontSize: 24,
    color: colours.text,
    marginBottom: 40,
  },
  inputBox: {
    width: "80%",
    borderColor: "gray",
    borderWidth: 2,
    borderRadius: 15,
    marginVertical: 10,
    padding: 12,
    color: colours.text,
  },
  button: {
    width: "80%",
  },
  pwdInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pwdVisibility: {
    position: "absolute",
    right: 10,
  },
});
