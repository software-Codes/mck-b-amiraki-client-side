import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { router } from "expo-router";
import { useRef, useState } from "react";
import Swiper from "react-native-swiper";
import { onboarding } from "@/constants";
import CustomButton from "@/components/CustomButton";

const { width, height } = Dimensions.get('window');

const Onboarding = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Skip Button */}
      <View className="flex-row justify-end p-4">
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/sign-in")}
          className="self-end"
        >
          <Text className="text-black text-base font-jakartaBold">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Swiper Content */}
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View 
            className="w-8 h-1 mx-1 bg-[#E2E8F0] rounded-full" 
            style={{ width: width * 0.08 }}
          />
        }
        activeDot={
          <View 
            className="w-8 h-1 mx-1 bg-[#0286FF] rounded-full" 
            style={{ width: width * 0.08 }}
          />
        }
        onIndexChanged={(index) => setActiveIndex(index)}
        paginationStyle={{ 
          bottom: height * 0.15,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {onboarding.map((item) => (
          <View 
            key={item.id} 
            className="flex-1 items-center justify-center px-4"
            style={{ 
              paddingTop: height * 0.05,
              paddingBottom: height * 0.1 
            }}
          >
            {/* Image */}
            <Image
              source={item.image}
              className="mb-6"
              style={{
                width: width * 0.8,
                height: height * 0.4,
                maxHeight: 600
              }}
              resizeMode="contain"
            />

            {/* Title */}
            <Text 
              className="text-black text-2xl md:text-3xl font-bold text-center mb-4 px-4"
              style={{ maxWidth: width * 0.9 }}
            >
              {item.title}
            </Text>

            {/* Description */}
            <Text 
              className="text-base md:text-lg font-jakartaSemiBold text-center text-[#858588] px-4"
              style={{ maxWidth: width * 0.9 }}
            >
              {item.description}
            </Text>
          </View>
        ))}
      </Swiper>

      {/* Next/Get Started Button */}
      <View 
        className="absolute bottom-0 w-full items-center pb-6"
        style={{ paddingHorizontal: width * 0.05 }}
      >
        <CustomButton
          title={isLastSlide ? "Get Started" : "Next"}
          onPress={() =>
            isLastSlide
              ? router.replace("/(auth)/sign-up")
              : swiperRef.current?.scrollBy(1)
          }
          className="w-full max-w-xl p-4"
        />
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;