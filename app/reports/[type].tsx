// ClassAttendanceReport.tsx
import AppButton from '@/components/ui/Button';
import SingleDatePicker from '@/components/ui/DatePicker';
import Loader from '@/components/ui/loader';
import SingleSelectDropdown from '@/components/ui/SingleSelect';
import {
    useLazyGetAttandanceByDayQuery,
    useLazyGetAttandanceInRangeQuery,
    useLazyGetClassesQuery,
    useLazyGetClassStudentsQuery,
    useLazyGetFullYearAttandanceQuery
} from "@/store/services/api";
import { getPersistedAuth } from '@/utils/storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    View
} from "react-native";


export default function ClassAttendanceReport() {
    const { type } = useLocalSearchParams()
    const router = useRouter()
    const [selectedClass, setSelectedClass] = useState("Class 10")
    const [selectedDate, setSelectedDate] = useState(`${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`)
    const [date, setDate] = useState<Date | undefined>()
    const [endDate, setEndDate] = useState<Date | undefined>()
    const [students, setStudents] = useState<student[]>([])
    const [studentRange, setStudentRange] = useState<studentRecordRangeType[][]>([])
    const [stats,setStats] = useState<rangeStatstype | null>(null)


    const [getDayAttendance, getDayAttendanceState] = useLazyGetAttandanceByDayQuery()
    const [getRangeAttendance, getRangeAttendanceState] = useLazyGetAttandanceInRangeQuery()
    const [getFullYearAttendance, getFullYearAttendanceState] = useLazyGetFullYearAttandanceQuery()
    const [getClasses, getClassesState] = useLazyGetClassesQuery()
    const [getClassStudents, getClassStudentState] = useLazyGetClassStudentsQuery()

    useEffect(() => {
        if (getFullYearAttendanceState.isSuccess && getClassStudentState.isSuccess) {
            const students: studentRecordRangeType[][] = []
            const sCollection = getClassStudentState.currentData?.list
            const sData = getFullYearAttendanceState.currentData
            let total:number = 0 ,present:number = 0,absent:number = 0,present_percent:number = 0,absent_percent:number = 0
            if (sCollection && sData && sCollection?.length >= 0 && sData?.length > 0) {
                sData.forEach((item) => {
                    const data = item.attandance.data
                    const dayStudentCollection: studentRecordRangeType[] = []
                    const dayStudent: student[] = []
                    data.forEach((subItem) => {
                        sCollection.forEach((student) => {
                            if (subItem.roll_no === student.roll_no) {
                                dayStudent.push({
                                    roll_no: student.roll_no,
                                    name: student.name,
                                    status: subItem.status === "yes" ? "Present" : "Absent"
                                })
                                total += 1
                                if(subItem.status === "yes"){
                                    present += 1
                                }else{
                                    absent += 1
                                }
                            }
                        })
                    })
                    if (item?.created_at) {
                        dayStudentCollection.push({
                            date: item.created_at,
                            data: dayStudent
                        })
                        students.push(dayStudentCollection)
                    }
                })
            }
            present_percent = (present / total) * 100
            absent_percent = (absent / total) * 100
            setStudentRange(students)
            setStats({
                total:total,
                absent:absent,
                present_percent:present_percent,
                absent_percent:absent_percent,
                present:present
            })
            getDayAttendanceState.reset()
            getRangeAttendanceState.reset()
        }
        if (getFullYearAttendanceState.isError) {
            alert("Error while fetch the student attendance records,Pleae try again after sometime!")
        }
    }, [getFullYearAttendanceState.status])

    useEffect(() => {
        if (getRangeAttendanceState.isSuccess && getClassStudentState.isSuccess) {
            const students: studentRecordRangeType[][] = []
            const sCollection = getClassStudentState.currentData?.list
            const sData = getRangeAttendanceState.currentData
            let total:number = 0 ,present:number = 0,absent:number = 0,present_percent:number = 0,absent_percent:number = 0
            if (sCollection && sData && sCollection?.length >= 0 && sData?.length > 0) {
                sData.forEach((item) => {
                    const data = item.attandance.data
                    const dayStudentCollection: studentRecordRangeType[] = []
                    const dayStudent: student[] = []
                    data.forEach((subItem) => {
                        sCollection.forEach((student) => {
                            if (subItem.roll_no === student.roll_no) {
                                dayStudent.push({
                                    roll_no: student.roll_no,
                                    name: student.name,
                                    status: subItem.status === "yes" ? "Present" : "Absent"
                                })
                                total += 1
                                if(subItem.status === "yes"){
                                    present += 1
                                }else{
                                    absent += 1
                                }
                            }
                        })
                    })
                    if (item?.created_at) {
                        dayStudentCollection.push({
                            date: item.created_at,
                            data: dayStudent
                        })
                        students.push(dayStudentCollection)
                    }
                })
            }
            present_percent = (present / total) * 100
            absent_percent = (absent / total) * 100
            setStudentRange(students)
            setStats({
                total:total,
                absent:absent,
                present_percent:present_percent,
                absent_percent:absent_percent,
                present:present
            })
            getDayAttendanceState.reset()
            getFullYearAttendanceState.reset()
        }
        if (getRangeAttendanceState.isError) {
            alert("Error while fetch the student attendance records,Pleae try again after sometime!")
        }
    }, [getRangeAttendanceState.status])

    useEffect(() => {
        if (getDayAttendanceState.isSuccess && getClassStudentState.isSuccess) {
            const students: student[] = []
            const adata = getDayAttendanceState.currentData?.attandance?.data
            const sData = getClassStudentState.currentData?.list
            if (adata && sData) {
                sData.forEach((item) => {
                    adata.forEach((sub_item) => {
                        if (item.roll_no === sub_item.roll_no) {
                            students.push({
                                name: item.name,
                                status: sub_item.status === "yes" ? "Present" : "Absent",
                                roll_no: item.roll_no
                            })
                        }
                    })
                })
            }
            setStudents(students)
            getRangeAttendanceState.reset()
            getFullYearAttendanceState.reset()
        }
    }, [getDayAttendanceState.status])

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            (async () => {
                try {
                    let raw: any = null
                    raw = await getPersistedAuth()
                    if (!mounted) return
                    if (!raw) {
                        router.replace('/login')
                        return
                    }

                    const parsed = JSON.parse(raw);
                    if (typeof parsed === 'object') {
                        // backend may return user under `user` or `user_data`
                        const user_data = parsed
                        if (user_data) {
                            // set local state for display/use elsewhere
                            const name = `${user_data.firstname ?? user_data.first_name ?? ''} ${user_data.lastname ?? user_data.last_name ?? ''}`.trim()

                            const meta_data = user_data.meta_data ?? user_data.meta ?? null;
                            const platformId = meta_data?.user_platform ?? meta_data?.platform_id ?? null
                            if (platformId) {
                                getClasses({ id: Number(platformId) })
                            }
                        }
                    }
                } catch (e) {
                    router.replace('/login');
                }
            })();

            return () => {
                mounted = false
            }
        }, [router, type, getClasses])
    )

    const renderClasses = () => {
        const classes = getClassesState.currentData?.list
        if (!classes || classes?.length === 0) return (
            <Text style={styles.name} >Class List Empty!</Text>
        )
        let options: Option[] = []
        classes.forEach((item) => {
            options.push({ label: item.class_name, value: item.class_name })
        })
        return (
            <SingleSelectDropdown
                label='Select Class'
                data={options}
                selectedValue={selectedClass}
                onSelect={(e) => {
                    setSelectedClass(e.value)
                    let findClass = classes.find(cl => cl.class_name === e.label)
                    if (findClass) {
                        getClassStudents({
                            school_id: findClass.institution_ref,
                            class_id: findClass.id
                        })
                    }
                }}
                placeholder='Select Class'
            />
        )
    }
    const renderDatePicker = () => {
        if (type === "Day") {
            return (
                <SingleDatePicker
                    label='Select Date'
                    value={date}
                    onChange={(d) => setDate(d)}
                />
            )
        } else if (type === "range") {
            return (
                <View style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                }}>
                    <SingleDatePicker
                        label='Select Start Date'
                        value={date}
                        onChange={(d) => setDate(d)}
                    />
                    <SingleDatePicker
                        label='Select End Date'
                        value={endDate}
                        onChange={(d) => setEndDate(d)}
                    />
                </View>
            )
        } else {
            return null
        }
    }

    const renderStudent = ({ item }: { item: student }) => (
        <View style={styles.row}>
            <Text style={styles.name}>{item.roll_no}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text
                style={[
                    styles.status,
                    item.status === "Present" ? styles.present : styles.absent
                ]}
            >
                {item.status}
            </Text>
        </View>
    )
    const renderDaySummary = ({
        type
    }: {
        type: string
    }) => (
        <View style={{
            padding:0
        }}>
            <Text style={styles.title}>Class Attendance Report {type} Wise</Text>

            {/* Filters */}
            <View style={styles.filterBox}>
                <Text style={styles.label}>Class:</Text>
                <Text style={styles.value}>{selectedClass}</Text>
            </View>

            <View style={styles.filterBox}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{selectedDate}</Text>
            </View>

            {/* Summary */}
            {
                type === "Day" && getDayAttendanceState.isSuccess && getDayAttendanceState.currentData?.attandance && (
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryNumber}>{getDayAttendanceState.currentData.attandance.total.toString()}</Text>
                            <Text>Total</Text>
                        </View>

                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNumber, styles.present]}>
                                {getDayAttendanceState.currentData.attandance.total_present.toString()}
                            </Text>
                            <Text>Present</Text>
                        </View>

                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNumber, styles.absent]}>
                                {getDayAttendanceState.currentData.attandance.total_absent.toString()}
                            </Text>
                            <Text>Absent</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNumber, styles.absent]}>
                                {getDayAttendanceState.currentData.attandance.absent_percentage.toPrecision(4).toString()}
                            </Text>
                            <Text>Absent%</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNumber, styles.absent]}>
                                {getDayAttendanceState.currentData.attandance.present_percentage.toPrecision(4).toString()}
                            </Text>
                            <Text>Present%</Text>
                        </View>
                    </View>
                )
            }
            {
                (type === "range" || type === "year") && stats &&
                stats.total !== undefined &&
                stats.present !== undefined &&
                stats.absent !== undefined &&
                stats.absent_percent !== undefined &&
                stats.present_percent !== undefined && (
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryNumber}>{stats?.total.toString()}</Text>
                            <Text>Total</Text>
                        </View>

                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNumber, styles.present]}>
                                {stats?.present.toString()}
                            </Text>
                            <Text>Present</Text>
                        </View>

                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNumber, styles.absent]}>
                                {stats?.absent.toString()}
                            </Text>
                            <Text>Absent</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNumber, styles.absent]}>
                                {stats?.absent_percent.toPrecision(4).toString()}
                            </Text>
                            <Text>Absent%</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNumber, styles.absent]}>
                                {stats?.present_percent.toPrecision(4).toString()}
                            </Text>
                            <Text>Present%</Text>
                        </View>
                    </View>
                )
            }
        </View>
    )

    function handleFetchData() {
        if (!selectedClass || !getClassesState?.currentData?.list) return

        const findClass = getClassesState.currentData.list.find(i => i.class_name === selectedClass)
        if (!findClass) return

        if (type === "Day") {
            if (!date) {
                alert("Please Select Date")
                return
            }
            const splitDate: string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            getDayAttendance({
                class_id: findClass.id,
                school_id: findClass.institution_ref,
                date: splitDate
            })
        } else if (type === "range") {
            if (!date || !endDate) {
                alert("please select start and end date!")
                return
            }
            const start_time: string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            const end_time: string = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`
            getRangeAttendance({
                school_id: findClass.institution_ref,
                class_id: findClass.id,
                start_date: start_time,
                end_date: end_time
            })
        }else if(type === "year"){
            getFullYearAttendance({
                school_id:findClass.institution_ref,
                class_id:findClass.id,
                year:`${new Date().getFullYear()}`
            })
        }
    }
    function RenderDayReport() {

    }

    if (
        getDayAttendanceState.isLoading ||
        getFullYearAttendanceState.isLoading ||
        getRangeAttendanceState.isLoading ||
        getClassesState.isLoading ||
        getClassStudentState.isLoading
    ) {
        return (
            <Loader
                message='Loading attendance reports...'
            />
        )
    }

    return (
        <View>
            {
                type === "Day" && (
                    <FlatList
                        data={students || []}
                        keyExtractor={(item) => item.name}
                        renderItem={renderStudent}
                        ListHeaderComponent={
                            <>
                                {renderClasses()}
                                {renderDatePicker()}
                                <AppButton
                                    title='SUBMIT'
                                    loading={getClassesState.isLoading || getRangeAttendanceState.isLoading || getDayAttendanceState.isLoading || getFullYearAttendanceState.isLoading}
                                    color="gray"
                                    onPress={handleFetchData}
                                />
                                {renderDaySummary({ type: type as string })}
                            </>
                        }
                        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    />
                )
            }
            {
                (type === "range" || type === "year") && (
                    <FlatList
                        data={studentRange}
                        keyExtractor={(_, idx) => `range-${idx}`}
                        renderItem={({ item }) => {
                            const dateLabel = item[0]?.date ?? ''
                            return (
                                <View style={styles.rangeCard}>
                                    <View style={styles.rangeHeader}>
                                        <Text style={styles.rangeHeaderLabel}>Attendance —</Text>
                                        <Text style={styles.rangeHeaderDate}>{dateLabel}</Text>
                                    </View>
                                    <View style={styles.rangeBody}>
                                        {(item[0].data || []).map((sub_item, index) => (
                                            <View key={`${sub_item.roll_no}-${index}`} style={[styles.rangeRow, index % 2 === 0 ? styles.rangeRowEven : styles.rangeRowOdd]}>
                                                <View style={styles.rangeStudentInfo}>
                                                    <Text style={styles.rangeStudentName}>{sub_item.name}</Text>
                                                    <Text style={styles.rangeStudentRoll}>Roll: {sub_item.roll_no}</Text>
                                                </View>
                                                <View style={styles.rangeStudentStatus}>
                                                    <Text style={[styles.statusBadge, sub_item.status === 'Present' ? styles.present : styles.absent]}>{sub_item.status}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )
                        }}
                        ListHeaderComponent={
                            <>
                                {renderClasses()}
                                {renderDatePicker()}
                                <AppButton
                                    title='SUBMIT'
                                    loading={getClassesState.isLoading || getRangeAttendanceState.isLoading || getDayAttendanceState.isLoading || getFullYearAttendanceState.isLoading}
                                    color="gray"
                                    onPress={handleFetchData}
                                />
                                {renderDaySummary({ type: type as string })}
                            </>
                        }
                        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    />
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#fff",
        overflow: "scroll",
        maxHeight: 400
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        color: "pink"
    },
    filterBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8
    },
    label: {
        fontWeight: "600",
        color: "pink"
    },
    value: {
        color: "pink",
    },
    summaryBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#f3f3f3",
        padding: 12,
        borderRadius: 10,
        marginVertical: 16,
        flexWrap: "wrap"
    },
    summaryItem: {
        alignItems: "center"
    },
    summaryNumber: {
        fontSize: 18,
        fontWeight: "bold"
    },
    present: {
        color: "green"
    },
    absent: {
        color: "red"
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderColor: "#ddd"
    },
    name: {
        fontSize: 15,
        color: "#bd7171ff"
    },
    status: {
        fontWeight: "600"
    }
    ,
    rangeCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2
    },
    rangeHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8
    },
    rangeHeaderLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 6
    },
    rangeHeaderDate: {
        fontSize: 16,
        fontWeight: '700'
    },
    rangeBody: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: 8,
        paddingTop: 8
    },
    rangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 6
    },
    rangeRowEven: {
        backgroundColor: 'rgba(240,240,255,0.6)'
    },
    rangeRowOdd: {
        backgroundColor: 'rgba(250,250,250,0.6)'
    },
    rangeStudentInfo: {
        flex: 1,
        paddingRight: 8
    },
    rangeStudentName: {
        fontSize: 15,
        fontWeight: '600'
    },
    rangeStudentRoll: {
        color: '#666',
        marginTop: 2
    },
    rangeStudentStatus: {
        minWidth: 88,
        alignItems: 'flex-end'
    },
    statusBadge: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
        color: '#fff',
        fontWeight: '700'
    }
})

type Option = {
    label: string;
    value: string;
}
type student = {
    name: string
    roll_no: number
    status: "Present" | "Absent"
}

type studentRecordRangeType = {
    date: string,
    data: student[]
}

const getRandomColor = (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}
type rangeStatstype = {
    total:number,
    present:number,
    absent:number,
    present_percent:number,
    absent_percent:number
}