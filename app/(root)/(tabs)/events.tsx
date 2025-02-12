import { View, Text } from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";

export default  function Events (){
    return (
        <SafeAreaView>
            <View className="flex-1 items-center justify-center">
                <Text>Events Screen</Text>
            </View>
        </SafeAreaView>

    );
}