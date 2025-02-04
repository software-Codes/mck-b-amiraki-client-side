import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Image, ScrollView } from "react-native";
import InputField from "@/components/InputField";
import {icons, images} from "@/constants";
import { useState } from "react";
import Button from "@/components/Button";
const Membersignup = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        PhoneNumber: "",
    })
  return (
    <ScrollView className=" flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px] ">
          <Image source={images.membersignup} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl font-jakartaSemiBold text-black absolute left-5 bottom-5">
            Create your account
          </Text>
        </View>
        <InputField label="Name"
                    icon={icons.person}
        />
          <Button />
      </View>
    </ScrollView>
  );
};
export default Membersignup;
