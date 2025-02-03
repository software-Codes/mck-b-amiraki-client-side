import {SafeAreaView} from "react-native-safe-area-context";
import {ScrollView, Text, View} from "react-native";
const HomeScreen = () => {
    return (
        <SafeAreaView className="h-full items-center flex-1 justify-center mt-12 " >
            <ScrollView className=" " >
                <Text className="text-3xl" >
                    Home tabs
                </Text>
            </ScrollView>
        </SafeAreaView>
    )
}
export default HomeScreen;