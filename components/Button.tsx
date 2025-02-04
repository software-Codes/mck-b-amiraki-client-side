import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import type { ButtonProps } from "@/types";

const Button: React.FC<ButtonProps> = ({
                                           title,
                                           bgVariant = "primary",
                                           textVariant = "default",
                                           IconLeft,
                                           IconRight,
                                           className = "",
                                           disabled = false,
                                           onPress,
                                           ...props
                                       }) => {
    const getBackgroundColor = () => {
        if (disabled) return "bg-secondary-300";

        switch (bgVariant) {
            case "primary":
                return "bg-primary-500";
            case "secondary":
                return "bg-secondary-500";
            case "danger":
                return "bg-danger-500";
            case "success":
                return "bg-success-500";
            case "outline":
                return "bg-transparent border border-primary-500";
            default:
                return "bg-primary-500";
        }
    };

    const getTextColor = () => {
        if (disabled) return "text-secondary-500";

        if (bgVariant === "outline") {
            return "text-primary-500";
        }

        switch (textVariant) {
            case "primary":
                return "text-primary-500";
            case "secondary":
                return "text-secondary-500";
            case "danger":
                return "text-danger-500";
            case "success":
                return "text-success-500";
            default:
                return "text-white";
        }
    };

    const baseButtonStyle = "flex-row items-center justify-center rounded-lg px-4 py-3";
    const buttonStyle = `${baseButtonStyle} ${getBackgroundColor()} ${className}`;
    const textStyle = `text-center font-jakartaSemiBold text-base ${getTextColor()}`;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={buttonStyle}
            activeOpacity={0.7}
            {...props}
        >
            {IconLeft && (
                <View className="mr-2">
                    <IconLeft size={20} color={textVariant === "default" && bgVariant !== "outline" ? "white" : undefined} />
                </View>
            )}

            <Text className={textStyle}>{title}</Text>

            {IconRight && (
                <View className="ml-2">
                    <IconRight size={20} color={textVariant === "default" && bgVariant !== "outline" ? "white" : undefined} />
                </View>
            )}
        </TouchableOpacity>
    );
};

export default Button;