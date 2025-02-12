import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, Dimensions, FlatList, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { images } from '@/constants';
import ChurchHeader from '@/components/church-header';

const { width } = Dimensions.get('window');

interface Event {
  id: number;
  title: string;
  date: string;
  image: number;
}

interface Announcement {
  id: number;
  title: string;
  description: string;
}

function HomeScreen() {
    const [loading, setLoading] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);
    const flatListRef = useRef<FlatList>(null);
  
    // Move the viewability config outside the component body
    const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 50
    }).current;
  
    // Use useCallback for the onViewableItemsChanged handler
    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setActiveSlide(viewableItems[0].index);
      }
    }, []);
  
    useEffect(() => {
      setTimeout(() => setLoading(false), 3000);
    }, []);
  
    const events: Event[] = [
      {
        id: 1,
        title: "Sunday Service",
        date: "Every Sunday, 9:00 AM",
        image: images.onboarding1
      },
      {
        id: 2,
        title: "Bible Study",
        date: "Every Wednesday, 6:00 PM",
        image: images.onboarding2
      },
      {
        id: 3,
        title: "Youth Fellowship",
        date: "Every Saturday, 4:00 PM",
        image: images.onboarding3
      }
    ];
  
    const announcements: Announcement[] = [
      {
        id: 1,
        title: "Easter Service",
        description: "Join us for special Easter celebrations"
      },
      {
        id: 2,
        title: "Community Outreach",
        description: "Monthly food drive this weekend"
      }
    ];
  
    const renderEventCard = ({ item }: { item: Event }) => (
        <View className="w-[320px] mx-2">
          <Animated.View 
            entering={FadeInRight.delay(200)}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <Image
              source={item.image}  // Changed from {uri: item.image} to directly use the imported image
              className="w-full h-48 rounded-t-xl"
              resizeMode="cover"
            />
            <View className="p-4">
              <Text className="text-lg font-jakartaBold text-secondary-900">
                {item.title}
              </Text>
              <Text className="mt-1 font-jakartaMedium text-secondary-700">
                {item.date}
              </Text>
            </View>
          </Animated.View>
        </View>
      );
  
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#0286FF" />
          <Text className="mt-4 font-jakartaMedium text-secondary-700">
            Loading...
          </Text>
        </View>
      );
    }

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      {/* Header */}
<ChurchHeader />

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <Animated.View 
          entering={FadeInDown.delay(100)}
          className="px-4 py-6"
        >
          <Text className="text-lg font-jakartaMedium text-secondary-700">
            Welcome to
          </Text>
          <Text className="text-2xl font-jakartaBold text-primary-900 mt-1">
            Our Church Community
          </Text>
        </Animated.View>

        {/* Events FlatList */}
        <Animated.View 
          entering={FadeInDown.delay(300)}
          className="mb-6"
        >
          <View className="px-4 flex-row items-center justify-between mb-4">
            <Text className="text-xl font-jakartaBold text-secondary-900">
              Upcoming Events
            </Text>
            <Link href="/events" asChild>
              <Text className="font-jakartaSemiBold text-primary-500">
                See All
              </Text>
            </Link>
          </View>
          <FlatList
        ref={flatListRef}
        data={events}
        renderItem={renderEventCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={324}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
          <View className="flex-row justify-center mt-4 space-x-2">
            {events.map((_, index) => (
              <View
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === activeSlide ? 'bg-primary-500' : 'bg-primary-300'
                }`}
              />
            ))}
          </View>
        </Animated.View>

        {/* Announcements */}
        <Animated.View 
          entering={FadeInDown.delay(300)}
          className="px-4 mb-6"
        >
          <Text className="text-xl font-jakartaBold text-secondary-900 mb-4">
            Announcements
          </Text>
          {announcements.map((announcement) => (
            <View 
              key={announcement.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
            >
              <Text className="font-jakartaBold text-secondary-900">
                {announcement.title}
              </Text>
              <Text className="mt-1 font-jakartaMedium text-secondary-700">
                {announcement.description}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Quick Links */}
        <Animated.View 
          entering={FadeInDown.delay(400)}
          className="px-4 mb-8"
        >
          <Text className="text-xl font-jakartaBold text-secondary-900 mb-4">
            Quick Links
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {['Sermons', 'Give', 'Prayer', 'Connect'].map((item) => (
              <View 
                key={item}
                className="bg-white w-[48%] rounded-xl p-4 mb-3 items-center shadow-sm"
              >
                <Ionicons 
                  name={
                    item === 'Sermons' ? 'book-outline' :
                    item === 'Give' ? 'gift-outline' :
                    item === 'Prayer' ? 'heart-outline' : 'people-outline'
                  }
                  size={24}
                  color="#0286FF"
                />
                <Text className="mt-2 font-jakartaSemiBold text-secondary-900">
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;