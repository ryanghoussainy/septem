import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colours } from '../../constants/colours';
import { useWindowDimensions } from 'react-native';


const FancyDivider = ({ title }) => {
  // Get screen width
  const { width: screenWidth } = useWindowDimensions();

  // Get title width considering a font size of 16
  const titleWidth = title.length * 8;

  // Total available width and adjust for title
  const dividerWidth = (screenWidth - titleWidth - 40) / 2;

  const HalfDivider = () => (
    <Svg height="30" width={dividerWidth}>
      <Path
        d={`M${dividerWidth / 2} 15 Q${dividerWidth / 2} 0, ${dividerWidth} 15 Q${dividerWidth / 2} 30, 0 15`}
        fill="gray"
      />
    </Svg>
  )

  return (
    <View style={styles.container}>
      {/* Left Divider */}
      <HalfDivider />

      {/* Title in the Middle */}
      <Text style={styles.text}>{title}</Text>

      {/* Right Divider */}
      <HalfDivider />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  text: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: colours.text,
  },
});

export default FancyDivider;
