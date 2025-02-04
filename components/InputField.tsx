import {
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    View,
    Text,
    Platform,
    Keyboard,
    TextInput,
    Image,
} from "react-native";

const InputField = ({
                        label,
                        labelStyle,
                        icon,
                        secureTextEntry = false,
                        containerStyle,
                        inputStyle,
                        iconStyle,
                        className,
                        error,
                        touched,
                        required,
                        ...props
                    }: InputFieldProps) => {
    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className={`my-2 w-full px-5 ${containerStyle}`}>
                    <Text className={`text-lg font-jakartaSemiBold mb-3 ${labelStyle}`}>
                        {label} {required && <Text className="text-red-500">*</Text>}
                    </Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
                        {icon && (
                            <Image
                                source={icon}
                                className={`w-5 h-5 mr-2 ${iconStyle}`}
                                resizeMode="contain"
                            />
                        )}
                        <TextInput
                            className={`flex-1 font-jakartaRegular text-base ${inputStyle}`}
                            secureTextEntry={secureTextEntry}
                            placeholderTextColor="#666"
                            {...props}
                        />
                    </View>
                    {touched && error && (
                        <Text className="text-red-500 text-sm mt-1">{error}</Text>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default InputField;
