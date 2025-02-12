import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface ChurchHeaderProps {
  churchName?: string;
  branchName?: string;
}

const ChurchHeader: React.FC<ChurchHeaderProps> = ({
  churchName = 'MCK Bishop',
  branchName = 'Amiraki Church'
}) => {
  const headerHeight = 150;  // Increased height to accommodate the wave

  return (
    <Animated.View
      entering={FadeInDown}
      className="relative"
      style={{ height: headerHeight }}
    >
      {/* Background Color */}
      <View className="absolute w-full h-full bg-primary-500" />
      
      {/* Wave Pattern */}
      <Svg
        style={{
          position: 'absolute',
          bottom: -1,
          width: width,
          height: 50
        }}
        viewBox={`0 0 ${width} 50`}
      >
        <Path
          d={`
            M0 25
            C${width * 0.3} 0, ${width * 0.7} 50, ${width} 25
            L${width} 0
            L0 0
            Z
          `}
          fill="white"
        />
      </Svg>

      {/* Content */}
      <View className="px-6 pt-8">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-jakartaBold text-white">
              {churchName}
            </Text>
            <Text className="text-xl font-jakartaSemiBold text-white opacity-90">
              {branchName}
            </Text>
          </View>
          <Link href="/profile" asChild>
            <Ionicons 
              name="person-circle-outline" 
              size={32} 
              color="white"
              style={{ opacity: 0.9 }}
            />
          </Link>
        </View>
      </View>
    </Animated.View>
  );
};

export default ChurchHeader;