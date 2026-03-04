import { BACKEND_BASE_URL, service_path } from '@/utils/apiUtils';
import { getStoredAuthToken, setStoredAuthToken, setStoredUserData } from "@/utils/storage";
import {
    attandanceDataType,
    studentDataType
} from "@/utils/types";
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
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

// API error types (for components using RTK Query error values)
export type ApiErrorData = {
    message?: string;
    detail?: string;
    error?: string;
    [key: string]: any;
};
export type ApiError = (FetchBaseQueryError & { data?: ApiErrorData }) | SerializedError;

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: BACKEND_BASE_URL,
        prepareHeaders: async (headers) => {
            const token = await getStoredAuthToken();
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return headers;
        }
    }),
    tagTypes: ['Classes', 'Students', 'Attendance',"auth"],
    endpoints: (builder) => ({
        getClasses: builder.query<ClassesResponse, {id:number}>({
            query: ({id}) => ({
                url:`${service_path.class}/classes/${id}`,
                method:"GET",
            }),
            providesTags: ['Classes'],
        }),
        takeClassAttandance:builder.mutation<any,attandanceDataType>({
            query:(data)=> ({
                url:`${service_path.class}/attandance`,
                body:data,
                method:"POST",
            })
        }),
        getAttandanceByDay:builder.query<attandanceDataType,{school_id:number,class_id:number,date:string}>({
            query:({
                school_id,
                class_id,
                date // YY-MM-DD
            })=> ({
                url:`${service_path.class}/attandance/${school_id}/${class_id}/${date}`,
                method:"GET",
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
                method:"GET",
            })
        }),
        getFullYearAttandance:builder.query<attandanceDataType[],{school_id:number,class_id:number,year:string}>({
            query:({
                school_id,
                class_id,
                year // yy
            })=> ({
                url:`${service_path.class}/attandance-year/${school_id}/${class_id}/${year}`,
                method:"GET",
            })
        }),
        markAttendance: builder.mutation<void, { classId: string; attendance: Record<string, boolean> }>({
            query: ({ classId, attendance }) => ({ 
                url: `/classes/${classId}/attendance`, 
                method: 'POST', 
                body: attendance,
            }),
            invalidatesTags: (result, error, { classId }) => [{ type: 'Attendance', id: classId }],
        }),
        userLogin: builder.mutation<{ token: string; user_data?: any }, { email: string; password: string }>(
            {
                query: ({ email, password }) => ({
                    url: `${service_path.auth}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
                    method: 'POST',
                    responseHandler: async (response) => {
                        if(response.status >= 400){
                            // Attempt to parse error response for better error messages
                            let errorData: ApiErrorData | null = null;
                            try {
                                const text = await response.text();
                                errorData = JSON.parse(text);
                            } catch (e) {
                                // ignore parsing errors, we'll return a generic message
                            }
                            const message = errorData?.message || errorData?.detail || errorData?.error || 'Login failed with status ' + response.status;
                            throw new Error(message);
                        }
                        const data = await response.json() as { token: string; user_data?: any,message?:string };
                        if (data.token) {
                            await setStoredAuthToken(data.token);
                        }
                        if(data.user_data){
                            await setStoredUserData(data.user_data);
                        }
                        return data;
                    }
                }),
            }
        ),
        getClassStudents:builder.query<ClassStudentListResponse,{class_id:number,school_id:number}>({
            query:({class_id,school_id})=> ({
                url:`${service_path.student}/get_class_student/${class_id}/${school_id}`,
                method:"GET",
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
