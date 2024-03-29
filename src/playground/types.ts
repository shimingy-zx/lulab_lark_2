/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2024-03-29 02:34:18
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2024-03-29 18:16:23
 * @FilePath: /lulab_lark_2/src/playground/types.ts
 * @Description: 
 * 
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved. 
 */


// 定义 Row 接口
export interface Tableal1ign {
    table_a: string;
    table_b: string;
}

export interface Fieldalign {
    field_a: string;
    field_b: string;
}

export interface TableEntry {
    name: string;
    revision: number | null;
    table_id: string;
}


export interface TableResponse {
    code: number;
    data: TableData;
    msg: string;
}



interface TableData {
    has_more: boolean;
    items: TableItem[];
    page_token: string;
    total: number;
}

interface TableItem {
    name: string;
    revision: number;
    table_id: string;
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
