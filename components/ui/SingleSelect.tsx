import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Option = {
    label: string;
    value: string;
};

type Props = {
    label?: string;
    data: Option[];
    selectedValue?: string;
    onSelect: (item: Option) => void;
    placeholder?: string;
};

export default function SingleSelectDropdown({
    label,
    data,
    selectedValue,
    onSelect,
    placeholder = "Select an option",
}: Props) {
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState("");

    const selectedItem = data.find((d) => d.value === selectedValue);

    const filteredData = data.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
    )

    const handleSelect = (item: Option) => {
        onSelect(item)
        setVisible(false)
        setSearch("")
    }

    return (
        <View>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setVisible(true)}
            >
                <Text style={styles.selectedText}>
                    {selectedItem ? selectedItem.label : placeholder}
                </Text>
            </TouchableOpacity>

            <Modal visible={visible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Search */}
                        <TextInput
                            placeholder="Search..."
                            value={search}
                            onChangeText={setSearch}
                            style={styles.searchInput}
                        />

                        {/* Options */}
                        <FlatList
                            data={filteredData}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={styles.itemText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setVisible(false)}
                        >
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        marginBottom: 6,
        fontWeight: "600",
    },
    dropdown: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    selectedText: {
        color: "#333",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        padding: 16,
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        maxHeight: "70%",
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    item: {
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderColor: "#eee",
    },
    itemText: {
        fontSize: 16,
    },
    closeBtn: {
        marginTop: 10,
        alignSelf: "center",
        padding: 10,
    },
    closeText: {
        color: "red",
        fontWeight: "600",
    },
});
