import { BACKEND_BASE_URL, service_path } from '@/utils/apiUtils';
import {
    attandanceDataType,
    studentDataType
} from "@/utils/types";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// Types
type ClassMeta = {
    subjects?: Array<{ name: string; teachers?: any[] }>
    monthlyFee?: Array<{ feeName: string; feeAmount: string }>
    feeStructure?: Array<{ feeName: string; feeAmount: string }>
    [key: string]: any
}
type ClassItem = { id: number; institution_ref: number; class_name: string; meta_data?: ClassMeta };
type ClassesResponse = { list: ClassItem[] };
type Student = { id: string; name: string };
type ClassStudentListResponse = {list:studentDataType[]}

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: BACKEND_BASE_URL }),
    tagTypes: ['Classes', 'Students', 'Attendance',"auth"],
    endpoints: (builder) => ({
        getClasses: builder.query<ClassesResponse, {id:number}>({
            query: ({id}) => ({
                url:`${service_path.class}/classes/${id}`,
                method:"GET"
            }),
            providesTags: ['Classes'],
        }),
        takeClassAttandance:builder.mutation<any,attandanceDataType>({
            query:(data)=> ({
                url:`${service_path.class}/attandance`,
                body:data,
                method:"POST"
            })
        }),
        getAttandanceByDay:builder.query<attandanceDataType,{school_id:number,class_id:number,date:string}>({
            query:({
                school_id,
                class_id,
                date // YY-MM-DD
            })=> ({
                url:`${service_path.class}/attandance/${school_id}/${class_id}/${date}`,
                method:"GET"
            })
        }),
        getAttandanceInRange:builder.query<attandanceDataType[],{school_id:number,class_id:number,start_date:string,end_date:string}>({
            query:({
                school_id,
                class_id,
                start_date,//YY-MM-DD
                end_date //YY-MM-DD
            })=> ({
                url:`${service_path.class}/attandance-range/${school_id}/${class_id}/${start_date}/${end_date}`,
                method:"GET"
            })
        }),
        getFullYearAttandance:builder.query<attandanceDataType[],{school_id:number,class_id:number,year:string}>({
            query:({
                school_id,
                class_id,
                year // yy
            })=> ({
                url:`${service_path.class}/attandance-year/${school_id}/${class_id}/${year}`,
                method:"GET"
            })
        }),
        markAttendance: builder.mutation<void, { classId: string; attendance: Record<string, boolean> }>({
            query: ({ classId, attendance }) => ({ url: `/classes/${classId}/attendance`, method: 'POST', body: attendance }),
            invalidatesTags: (result, error, { classId }) => [{ type: 'Attendance', id: classId }],
        }),
        userLogin: builder.mutation<{ token: string; user_data?: any }, { email: string; password: string }>(
            {
                query: ({ email, password }) => ({
                    url: `${service_path.auth}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
                    method: 'POST',
                }),
            }
        ),
        getClassStudents:builder.query<ClassStudentListResponse,{class_id:number,school_id:number}>({
            query:({class_id,school_id})=> ({
                url:`${service_path.student}/get_class_student/${class_id}/${school_id}`,
                method:"GET"
            })
        })
    }),
});

export const {
    useGetClassStudentsQuery,
    useMarkAttendanceMutation,
    useUserLoginMutation,
    useLazyGetClassesQuery,
    useLazyGetClassStudentsQuery,
    useTakeClassAttandanceMutation,
    useLazyGetAttandanceByDayQuery,
    useLazyGetAttandanceInRangeQuery,
    useLazyGetFullYearAttandanceQuery
} = api;
