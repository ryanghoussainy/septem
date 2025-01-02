import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colours } from '../../constants/colours';

// Get screen width for dynamic scaling
const screenWidth = Dimensions.get('window').width;

const FancyDivider = ({ title }) => {
  // Get title width considering a font size of 16
  const titleWidth = title.length * 8;

  // Total available width and adjust for title
  const dividerWidth = (screenWidth - titleWidth - 40) / 2;

  return (
    <View style={styles.container}>
      {/* Left Divider */}
      <Svg height="30" width={dividerWidth}>
        <Path
          d={`M50 15 Q${dividerWidth / 2} 0, ${dividerWidth} 15 Q${dividerWidth / 2} 30, 0 15`}
          fill="gray"
        />
      </Svg>

      {/* Title in the Middle */}
      <Text style={styles.text}>{title}</Text>

      {/* Right Divider */}
      <Svg height="30" width={dividerWidth}>
        <Path
          d={`M50 15 Q${dividerWidth / 2} 0, ${dividerWidth} 15 Q${dividerWidth / 2} 30, 0 15`}
          fill="gray"
        />
      </Svg>
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
