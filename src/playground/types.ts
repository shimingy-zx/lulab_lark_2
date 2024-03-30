/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2024-03-29 02:34:18
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2024-03-30 14:32:37
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


export interface Record_up {
    fields: { [key: string]: string };
    record_id: string;
}

export interface Record {
    fields: {
        [key: string]: string | any[];
    };
    id: string;
    record_id: string;
}




// 定义请求字段返回数据结构的接口
export interface FieldItem {
    field_id: string;
    field_name: string;
    is_primary: boolean;
    property: any;
    type: number;
    ui_type: "Text" | "Barcode" | "Number" | "Progress" | "Currency" | "Rating" | "SingleSelect" | "MultiSelect" | "DateTime" | "Checkbox" | "User" | "GroupChat" | "Phone" | "Url" | "Attachment" | "SingleLink" | "Formula" | "DuplexLink" | "Location" | "CreatedTime" | "ModifiedTime" | "CreatedUser" | "ModifiedUser" | "AutoNumber" | undefined;
    description: string;
    is_hidden?: boolean;
}

export interface Person {
    email: string;
    en_name: string;
    name: string;
    avatar_url: string;
}