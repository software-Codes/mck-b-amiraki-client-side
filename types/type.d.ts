interface ButtonProps extends TouchableOpacityProps {
    title: string;
    bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
    textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
    IconLeft?: React.ComponentType<any>;
    IconRight?: React.ComponentType<any>;
    className?: string;
    onPress?: () => void;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
}
interface InputFieldProps extends TextInputProps {
    label: string;
    icon?: any;
    secureTextEntry?: boolean;
    labelStyle?: string;
    containerStyle?: string;
    inputStyle?: string;
    iconStyle?: string;
    className?: string;
    error?: string;
    touched?: boolean;
    required?: boolean;
    type?: "text" | "email" | "password" | "phone" | "number";
    isAdmin?: boolean;
    keyboardType?: string;
    value: string;
    onChangeText: (text: string) => void;


}
