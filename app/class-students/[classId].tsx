import Loader from '@/components/ui/loader';
import { attandanceDataType, attendanceCollectionDataType } from "@/utils/types";
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, TouchableNativeFeedback } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
    useLazyGetClassStudentsQuery,
    useTakeClassAttandanceMutation
} from "@/store/services/api";
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';


const CLASS_META = {
    'class-101': { title: 'Algebra I' },
    'class-102': { title: 'Biology' },
    'class-103': { title: 'English Literature' },
    'class-104': { title: 'World History' },
};

export default function ClassStudentsScreen() {
    const router = useRouter()
    const { classId } = useLocalSearchParams()
    const [school_id, setSchoolid] = useState<number | null>(null)
    const [collection, setCollection] = useState<attendanceCollectionDataType[]>([])

    const [getStudent, getStudentState] = useLazyGetClassStudentsQuery()
    const [takeAttandance, takeAttandanceState] = useTakeClassAttandanceMutation()

    useEffect(() => {
        const clearData = async () => {
            if (takeAttandanceState.isSuccess) {
                await SecureStore.deleteItemAsync("attandance")
                takeAttandanceState.reset()
                setCollection([])
                alert("Class Attandance Updated!")
                router.back()
            }
            if(takeAttandanceState.isError){
                alert("Error while update the class attandance,Please try after sometime!")
            }
        }
        clearData()
    }, [takeAttandanceState.status])

    console.log(takeAttandanceState)

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            (async () => {
                try {
                    let raw: any = null;
                    if (Platform.OS === 'web' && typeof globalThis !== 'undefined' && typeof (globalThis as any).localStorage !== 'undefined') {
                        raw = (globalThis as any).localStorage.getItem('auth')
                        const today = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
                        const collectionHistory = localStorage.getItem(today)
                    } else {
                        raw = await SecureStore.getItemAsync('auth');
                        const today = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
                        const collectionHistory: any = await SecureStore.getItemAsync("attandance")
                        if (collectionHistory && typeof (collectionHistory) === "string") {
                            const parse = JSON.parse(collectionHistory)
                            if (parse.hasOwnProperty("class_id")) {
                                const class_id = parse.class_id
                                if (class_id && Number(classId) === Number(class_id)) {
                                    if (Object.keys(parse)[0] === today) {
                                        const historyData: attendanceCollectionDataType[] = parse[today]
                                        if (historyData.length > 0) {
                                            setCollection([...historyData])
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!mounted) return;
                    if (!raw) {
                        router.replace('/login');
                        return;
                    }

                    const parsed = JSON.parse(raw);
                    if (typeof parsed === 'object') {
                        // backend may return user under `user` or `user_data`
                        const user_data = parsed.user_data ?? parsed.user ?? null;
                        if (user_data) {
                            // set local state for display/use elsewhere
                            const name = `${user_data.firstname ?? user_data.first_name ?? ''} ${user_data.lastname ?? user_data.last_name ?? ''}`.trim();


                            const meta_data = user_data.meta_data ?? user_data.meta ?? null;
                            const platformId = meta_data?.user_platform ?? meta_data?.platform_id ?? null
                            if (platformId && classId) {
                                getStudent({
                                    class_id: Number(classId),
                                    school_id: Number(platformId)
                                })
                                setSchoolid(Number(platformId))
                            }
                        }
                    }
                } catch (e) {
                    router.replace('/login');
                }
            })();

            return () => {
                mounted = false;
            };
        }, [router])
    )

    if (getStudentState.isLoading) {
        return (
            <Loader message='Class Student List Loading...' />
        )
    }
    async function updatePresent(data: attendanceCollectionDataType) {
        const isExist = collection.find(i => i.roll_no === data.roll_no)
        if (isExist) {
            const updatedData: attendanceCollectionDataType[] = collection.map((item) => {
                if (item.roll_no === data.roll_no) {
                    return {
                        roll_no: item.roll_no,
                        status: "yes"
                    }
                } else return item
            })
            const today = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
            await SecureStore.setItemAsync("attandance", JSON.stringify({
                [today]: updatedData,
                ["class_id"]: classId
            }))
            setCollection([...updatedData])
        } else {
            const updated: attendanceCollectionDataType[] = [...collection, { roll_no: data.roll_no, status: "yes" }]
            const today = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
            await SecureStore.setItemAsync("attandance", JSON.stringify({
                [today]: updated,
                ["class_id"]: classId
            }))
            setCollection([...updated])
        }
    }
    async function updateAbsent(data: attendanceCollectionDataType) {
        const isExist = collection.find(i => i.roll_no === data.roll_no)
        if (isExist) {
            const updatedData: attendanceCollectionDataType[] = collection.map((item) => {
                if (item.roll_no === data.roll_no) {
                    return {
                        roll_no: item.roll_no,
                        status: "no"
                    }
                } else return item
            })
            const today = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
            await SecureStore.setItemAsync("attandance", JSON.stringify({
                [today]: updatedData,
                "class_id": classId
            }))
            setCollection([...updatedData])
        } else {
            const updated: attendanceCollectionDataType[] = [...collection, { roll_no: data.roll_no, status: "no" }]
            const today = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
            await SecureStore.setItemAsync("attandance", JSON.stringify({
                [today]: updated,
                ["class_id"]: classId
            }))
            setCollection([...updated])
        }
    }
    function handleSubmitAttendance() {
        if (collection.length === 0) {
            alert("Please mark attendance first");
            return
        }
        if (getStudentState.isSuccess && getStudentState.currentData?.list && classId && school_id) {
            let total_present: number = 0, total_absent: number = 0, total: number = getStudentState.currentData.list.length
            collection.forEach((i) => {
                if (i.status === "yes") {
                    total_present += 1
                } else {
                    total_absent += 1
                }
            })


            let data: attandanceDataType = {
                class_id: Number(classId),
                school_id: school_id,
                attandance: {
                    total: total,
                    total_absent: total_absent,
                    total_present: total_present,
                    data: collection,
                    present_percentage: (total_present / total) * 100,
                    absent_percentage: (total_absent / total) * 100
                }
            }
            takeAttandance(data)
        }
    }


    if (getStudentState.isSuccess && getStudentState.currentData?.list.length === 0) {
        return (
            <ThemedText style={{
                textAlign: "center",
                fontSize: 24,
                marginTop: 30
            }}>
                Students empty on this class
            </ThemedText>
        )
    }
    return (
        <ThemedView style={{ flex: 1 }}>
            <FlatList
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                data={getStudentState.currentData?.list}
                keyExtractor={(i) => i.email}
                ListEmptyComponent={
                    <ThemedText style={styles.subtitle}>
                        No students found for this class.
                    </ThemedText>
                }
                renderItem={({ item }) => {
                    const isPresent = collection.find(i => i.roll_no === item.roll_no)
                    return (
                        <ThemedView
                            style={{
                                ...styles.row,
                                backgroundColor:
                                    isPresent?.status === "yes"
                                        ? "#e8f5e9"
                                        : isPresent?.status === "no"
                                            ? "#ffebee"
                                            : "#f5f5f5"
                            }}
                        >
                            <ThemedView style={styles.subRow}>
                                <ThemedText type="defaultSemiBold">
                                    Roll-No : {item.roll_no}
                                </ThemedText>

                                <ThemedText
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style={{ flex: 1, marginLeft: 10 }}
                                    type="defaultSemiBold"
                                >
                                    Name: {item.name}
                                </ThemedText>
                            </ThemedView>

                            <ThemedView style={styles.actionContainer}>
                                <TouchableNativeFeedback
                                    onPress={() =>
                                        updatePresent({ roll_no: item.roll_no, status: "yes" })
                                    }
                                    disabled={isPresent?.status === "yes"}
                                >
                                    <ThemedView style={styles.buttonWrapper}>
                                        <ThemedView style={styles.presentBtn}>
                                            <ThemedText style={styles.btnText}>Present</ThemedText>
                                        </ThemedView>
                                    </ThemedView>
                                </TouchableNativeFeedback>

                                <TouchableNativeFeedback
                                    onPress={() =>
                                        updateAbsent({ roll_no: item.roll_no, status: "no" })
                                    }
                                    disabled={isPresent?.status === "no"}
                                >
                                    <ThemedView style={styles.buttonWrapper}>
                                        <ThemedView style={styles.absentBtn}>
                                            <ThemedText style={styles.btnText}>Absent</ThemedText>
                                        </ThemedView>
                                    </ThemedView>
                                </TouchableNativeFeedback>
                            </ThemedView>

                            {isPresent && (
                                <ThemedText
                                    style={{
                                        color: isPresent.status === "yes" ? "green" : "red",
                                        backgroundColor: "white",
                                        padding: 6,
                                        borderRadius: 6,
                                        textAlign: "center",
                                        fontWeight: "600"
                                    }}
                                >
                                    {isPresent.status === "yes" ? "PRESENT" : "ABSENT"}
                                </ThemedText>
                            )}
                        </ThemedView>
                    )
                }}
            />

            {/* 🔥 Sticky Footer Button */}
            <ThemedView style={styles.footer}>
                <TouchableNativeFeedback onPress={handleSubmitAttendance}>
                    <ThemedView style={styles.submitBtn}>
                        <ThemedText style={styles.submitText}>
                            Submit Attendance
                        </ThemedText>
                    </ThemedView>
                </TouchableNativeFeedback>
            </ThemedView>
            {
                (
                    takeAttandanceState.isLoading
                ) && (
                    <Loader
                        message='Updating class attandance...'
                    />
                )
            }
        </ThemedView>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },

    subtitle: {
        color: "#666",
        marginBottom: 12,
        fontSize: 14,
    },

    row: {
        flexDirection: "column",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: "rgba(0,0,0,0.04)",
        elevation: 2,
        gap: 12,
    },

    subRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        gap: 4,
        backgroundColor: ""
    },

    nameText: {
        fontSize: 16,
        fontWeight: "600",
    },

    rollText: {
        fontSize: 14,
        color: "#555",
    },

    actionContainer: {
        flexDirection: "row",
        gap: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: ""
    },

    buttonWrapper: {
        overflow: "hidden",
        borderRadius: 8,
        backgroundColor: ""
    },

    presentBtn: {
        backgroundColor: "#4CAF50",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },

    absentBtn: {
        backgroundColor: "#F44336",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },

    btnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        elevation: 10
    },

    submitBtn: {
        backgroundColor: "#0a84ff",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },

    submitText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700"
    }

});
