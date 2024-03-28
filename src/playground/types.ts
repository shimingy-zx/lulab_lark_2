// 定义 Row 接口
export interface Row {
    table_a: string;
    table_b: string;
}

// 定义 Field 接口
export interface Field {
    [key: string]: string | undefined;
}

// 定义 Record 接口
export interface Record {
    fields: Field;
    id: string;
    record_id: string;
}


export interface Record_up {
    fields: { [key: string]: string };
    record_id: string;
}
