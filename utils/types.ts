export type studentMetaData = {
    [key: string]: any
}
export type studentDataType = {
    id:number,
    school_ref:number,
    class_ref:number,
    father_name:string,
    dob:string,
    roll_no:number,
    updated_at:string,
    name:string,
    mother_name:string,
    email:string,
    password:string,
    created_at:string,
    meta_data:studentMetaData
}
export type attendanceCollectionDataType = {
    roll_no:number,
    status:"yes"|"no"
}
export type attandanceDataType = {
    school_id:number,
    class_id:number,
    attandance:{
        data:attendanceCollectionDataType[],
        total_present:number,
        total_absent:number,
        total:number,
        present_percentage:number,
        absent_percentage:number
    },
    created_at?:string
}