import React from "react";
import {
    ActivityIndicator,
    GestureResponderEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

type Props = {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    loading?: boolean;
    disabled?: boolean;
    color?: string;
};

export default function AppButton({
    title,
    onPress,
    loading = false,
    disabled = false,
    color = "#4CAF50",
}: Props) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                { backgroundColor: color },
                (disabled || loading) && styles.disabled,
            ]}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
        margin:4
    },
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
    disabled: {
        opacity: 0.6,
    },
});
