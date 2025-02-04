import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  View,
  Text,
  Platform,
  Keyboard,
  Image,
  TextInput,
  KeyboardTypeOptions,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData
} from "react-native";
import { useState } from "react";

interface InputFieldProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  icon?: any;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  onChangeText: (text: string) => void;
}

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
  onChangeText,
  required,
  ...props
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      props.onBlur?.(e);
  };

  return (
      <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className={`w-full mb-4 ${containerStyle || ''}`}
      >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="w-full">
                  <Text className={`text-base font-jakartaSemiBold mb-2 ${labelStyle || ''}`}>
                      {label} {required && <Text className="text-danger-500">*</Text>}
                  </Text>
                  <View className={`
                      flex-row items-center
                      bg-neutral-100 rounded-lg
                      border-2 ${isFocused ? 'border-primary-500' : 'border-neutral-200'}
                      ${error && touched ? 'border-danger-500' : ''}
                      ${className || ''}
                  `}>
                      {icon && (
                          <Image
                              source={icon}
                              className={`w-5 h-5 ml-4 ${iconStyle || ''}`}
                          />
                      )}
                      <TextInput
                          className={`py-3 px-4 font-jakartaMedium text-base flex-1 ${inputStyle || ''}`}
                          secureTextEntry={secureTextEntry}
                          onFocus={() => setIsFocused(true)}
                          onBlur={handleBlur}
                          onChangeText={onChangeText}
                          placeholderTextColor="#9CA3AF"
                          {...props}
                      />
                  </View>
                  {error && touched && (
                      <Text className="text-danger-500 text-sm mt-1">{error}</Text>
                  )}
              </View>
          </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
  );
};

export default InputField;