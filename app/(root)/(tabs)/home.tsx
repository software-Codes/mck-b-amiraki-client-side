import { View, Text, Touchable, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
    return (
        <View className="flex-1 items-center justify-center">
            <Text className=''>Home Screen</Text>
            <TouchableOpacity className="mt-4 p-4 bg-blue-500 rounded-xl">
                <Link href='/(root)/(tabs)/profile' >
                <Text className="text-white">got to my profile</Text>
                </Link>
            </TouchableOpacity>

        </View>
    );
}