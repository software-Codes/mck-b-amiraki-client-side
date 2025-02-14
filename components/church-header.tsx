import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { getSessionUser } from '@/app/utils/sessionManager';

const { width } = Dimensions.get('window');

interface ChurchHeaderProps {
  churchName?: string;
  branchName?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
}

const ChurchHeader: React.FC<ChurchHeaderProps> = ({
  churchName = 'MCK Bishop',
  branchName = 'Amiraki Church',
  showBackButton = false,
  showNotifications = false,
}) => {
  const [userName, setUserName] = useState<string>('');
  const headerHeight = 150;
  const router = useRouter();

  useEffect(() => {
    const loadUserSession = async () => {
      const userData = await getSessionUser();
      if (userData?.full_name) {
        setUserName(userData.full_name);
      }
    };

    loadUserSession();
  }, []);

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
          d={`M0 25 C${width * 0.3} 0, ${width * 0.7} 50, ${width} 25 L${width} 0 L0 0 Z`}
          fill="white"
        />
      </Svg>

      {/* Content */}
      <View className="px-6 pt-8">
        <View className="flex-row items-center">
          {/* Back Button */}
          {showBackButton && (
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-3"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          )}

          {/* Church Info */}
          <View className="flex-1">
            {userName && (
              <View>
                <Text className="text-white text-xs font-jakartaMedium">
                  Hello 👋 <Text className="text-lg font-jakartaBold text-gradient">{userName}</Text> 
                </Text>
                <Text className="text-white text-xs font-jakartaMedium">
                  Welcome to
                </Text>
              </View>
            )}
            <Text className="text-4xl font-jakartaExtraBold gap-4 text-white">
              {churchName}
              <Text className="text-2xl font-jakartaSemiBold text-white opacity-90">
                {branchName}
              </Text>
            </Text>
          </View>

          {/* Right Icons */}
          <View className="flex-row items-center">
            {showNotifications && (
              <TouchableOpacity 
                className="mr-4"
                onPress={() => router.push('/annoucements')}
              >
                <Ionicons 
                  name="notifications-outline" 
                  size={24} 
                  color="white"
                  style={{ opacity: 0.9 }}
                />
              </TouchableOpacity>
            )}

            <Link href="/profile" asChild>
              <TouchableOpacity 
                className="items-center justify-center"
                style={{ minWidth: 60 }}
              >
                <Ionicons 
                  name="person-circle-outline" 
                  size={32} 
                  color="white"
                  style={{ opacity: 0.9 }}
                />
                {userName && (
                  <Text 
                    className="text-white text-xs font-jakartaMedium mt-1"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Profile
                  </Text>
                )}
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default ChurchHeader;
