import { Link, Stack, } from 'expo-router';
import { Text, View } from 'react-native';
import React from 'react';


export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen  options={{ title: 'Oops!' }}  />
      <View className=' bg-slate-700 h-full items-center justify-center  flex'  >
        <Text className='text-red-500 text-2xl' >Sorry, This screen doesn' exist.</Text>
        <Link href="/" >
          <Text className='text-white text-2xl' >Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

