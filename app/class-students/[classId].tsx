import Loader from '@/components/ui/loader';
import { attandanceDataType, attendanceCollectionDataType } from "@/utils/types";
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
    useLazyGetClassStudentsQuery,
    useTakeClassAttandanceMutation
} from "@/store/services/api";
import { useFocusEffect, useRouter } from 'expo-router';

import { getPersistedAuth } from '@/utils/storage';
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
                console.log(takeAttandanceState.error)
                alert("Error while update the class attandance,Please try after sometime!")
            }
        }
        clearData()
    }, [takeAttandanceState.status])


    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            (async () => {
                try {
                    let raw: any = null;
                    // use centralized persisted-auth helper (handles both web and native)
                    raw = await getPersistedAuth();

                    // read stored attendance history from platform storage
                    const today = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
                    if (Platform.OS === 'web' && typeof globalThis !== 'undefined' && typeof (globalThis as any).localStorage !== 'undefined') {
                        const collectionHistory = (globalThis as any).localStorage.getItem("attandance")
                        if (collectionHistory && typeof collectionHistory === 'string') {
                            try {
                                const parse = JSON.parse(collectionHistory)
                                if (parse?.class_id && Number(classId) === Number(parse.class_id)) {
                                    if (Array.isArray(parse[today]) && parse[today].length > 0) setCollection([...parse[today]])
                                }
                            } catch (e) { /* ignore parse errors */ }
                        }
                    } else {
                        const collectionHistory: any = await SecureStore.getItemAsync("attandance")
                        if (collectionHistory && typeof (collectionHistory) === "string") {
                            const parse = JSON.parse(collectionHistory)
                            if (parse && parse.class_id) {
                                const class_id = parse.class_id
                                if (class_id && Number(classId) === Number(class_id)) {
                                    if (Array.isArray(parse[today]) && parse[today].length > 0) {
                                        setCollection([...parse[today]])
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

                    const parsed = raw ? JSON.parse(raw) : null;
                    if (parsed && typeof parsed === 'object') {
                        // backend may return user under `user` or `user_data`
                        const user_data = parsed
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
    async function removeAttendance(roll_no: string | number) {
        const updated = collection.filter(i => i.roll_no !== roll_no)
        const today = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
        await SecureStore.setItemAsync("attandance", JSON.stringify({
            [today]: updated,
            ["class_id"]: classId
        }))
        setCollection([...updated])
    }

    async function toggleAttendance(roll_no: string | number) {
        const r = Number(roll_no)
        const exists = collection.find(i => i.roll_no === r)
        if (!exists) return updatePresent({ roll_no: r, status: 'yes' })
        if (exists.status === 'yes') return updateAbsent({ roll_no: r, status: 'no' })
        if (exists.status === 'no') return removeAttendance(r)
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
                    present_percentage: Math.trunc((total_present / total) * 100),
                    absent_percentage: Math.trunc((total_absent / total) * 100)
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
                    const initials = (item.name || '').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
                    const status = isPresent?.status
                    const actionLabel = status === 'yes' ? 'Present' : status === 'no' ? 'Absent' : 'Mark'
                    const actionColor = status === 'yes' ? '#2e7d32' : status === 'no' ? '#c62828' : '#757575'

                    return (
                        <ThemedView
                            style={{
                                ...styles.row,
                                backgroundColor:
                                    status === "yes"
                                        ? "#e8f5e9"
                                        : status === "no"
                                            ? "#ffebee"
                                            : "#f5f5f5"
                            }}
                        >
                            <ThemedView style={styles.avatarWrap}>
                                <ThemedView style={[styles.avatar, { backgroundColor: '#e0e7ff' }]}>
                                    <ThemedText type="defaultSemiBold">{initials}</ThemedText>
                                </ThemedView>
                            </ThemedView>

                            <ThemedView style={styles.leftColumn}>
                                <ThemedText type="defaultSemiBold" style={styles.nameText} numberOfLines={2}>
                                    {item.name}
                                </ThemedText>
                                <ThemedText style={styles.rollText}>Roll No: {item.roll_no}</ThemedText>
                            </ThemedView>

                            <ThemedView style={styles.actionContainer}>
                                <TouchableOpacity onPress={() => toggleAttendance(item.roll_no)} activeOpacity={0.8}>
                                    <ThemedView style={[styles.actionBtn, { backgroundColor: actionColor }]}> 
                                        <ThemedText style={styles.btnText}>{actionLabel}</ThemedText>
                                    </ThemedView>
                                </TouchableOpacity>
                            </ThemedView>
                        </ThemedView>
                    )
                }}
            />

            {/* 🔥 Sticky Footer Button */}
            <ThemedView style={styles.footer}>
                <TouchableOpacity onPress={handleSubmitAttendance} activeOpacity={0.85}>
                    <ThemedView style={styles.submitBtn}>
                        <ThemedText style={styles.submitText}>
                            Submit Attendance
                        </ThemedText>
                    </ThemedView>
                </TouchableOpacity>
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
        flexDirection: "row",
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: "rgba(0,0,0,0.04)",
        elevation: 2,
        gap: 12,
        alignItems: 'center'
    },

    leftColumn: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        paddingRight: 12
    },
    avatarWrap: {
        width: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    nameText: {
        fontSize: 16,
        fontWeight: '700'
    },

    

    rollText: {
        fontSize: 14,
        color: "#555",
    },

    actionContainer: {
        flexDirection: "column",
        gap: 8,
        justifyContent: "center",
        alignItems: "flex-end",
        marginLeft: 12
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
    statusBadge: {
        color: '#fff',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
        fontWeight: '700',
        overflow: 'hidden',
        marginLeft: 12
    },
    actionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center'
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
