import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  label?: string;
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
};

export default function SingleDatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
}: Props) {
  const [visible, setVisible] = useState(false)
  const [tempDate, setTempDate] = useState(value || new Date())

  const formatDate = (date?: Date) => {
    if (!date) return placeholder
    return date.toLocaleDateString()
  }

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.inputBox}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.dateText}>{formatDate(value)}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setTempDate(selectedDate)
                onChange(selectedDate)
              }
              setVisible(false)
            }}
          />
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
  inputBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dateText: {
    color: "#333",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(196, 47, 47, 0.3)",
    padding: 16,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelBtn: {
    padding: 10,
  },
  okBtn: {
    padding: 10,
  },
  cancelText: {
    color: "red",
    fontWeight: "600",
  },
  okText: {
    color: "green",
    fontWeight: "600",
  },
});
