import { useState } from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { colours } from "../../constants/colours";

const HeavyButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  borderColor,
  color,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={1} // Prevent fading when button is pressed
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      style={[styles.buttonContainer, style]}
    >
      <View
        style={[
          styles.button,
          isPressed ? styles.buttonPressed : styles.buttonUnpressed,
          borderColor && { borderColor: borderColor },
          color && { backgroundColor: color },
        ]}
      >
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    height: 75, // Necessary to prevent screen from jumping when button is pressed
  },
  button: {
    borderWidth: 2,
    borderColor: colours.buttonBorder,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: colours.greyButtonBG,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonUnpressed: {
    borderBottomWidth: 4,
  },
  buttonPressed: {
    transform: [{ translateY: 3 }],
  },
  buttonText: {
    color: colours.text,
  },
});

export default HeavyButton;
