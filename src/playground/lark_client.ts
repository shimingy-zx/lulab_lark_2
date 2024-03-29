import { BaseClient } from "@lark-base-open/node-sdk";
import { TableResponse } from './types'; // 确保路径正确
require("dotenv").config();

// 假设环境变量的类型是 string 或 undefined
const APP_TOKEN: string | undefined = process.env["APP_TOKEN"];
const PERSONAL_BASE_TOKEN: string | undefined = process.env["PERSONAL_BASE_TOKEN"];

// 确保令牌存在，否则抛出错误
if (!APP_TOKEN || !PERSONAL_BASE_TOKEN) {
    throw new Error("App token or Personal base token is not defined in the environment variables");
}

const client = new BaseClient({
    appToken: APP_TOKEN,
    personalBaseToken: PERSONAL_BASE_TOKEN,
});





// 定义 Item 和 ItemList 类型，根据您的实际数据结构调整这些类型
interface Fields {
    "客户姓名"?: string;
    "手机号码"?: string;
    "wechat"?: string;
    "real_name"?: string;
    "phone"?: string;
}

interface Item {
    fields: Fields;
    id: string;
    record_id: string;
}

type ItemList = Item[];



// 定义返回数据结构的接口
interface FieldItem {
    field_id: string;
    field_name: string;
    is_primary: boolean;
    property: any;
    type: number;
    ui_type: string;
}

interface ResponseData {
    has_more: boolean;
    items: FieldItem[];
    page_token: string;
    total: number;
}

interface ApiResponse {
    code: number;
    data: ResponseData;
    msg: string;
}


/**
 * @description: 
 * @return {*}
 */

async function getappTable() {

    let tables: { name: string; revision: number | null; table_id: string; }[] = []; // 使用显式类型
    try {
        const response = await client.base.appTable.list({
            params: {
                page_size: 500,
            },
        });

        tables = response.data?.items?.map(item => ({
            name: item.name || "", // 为undefined的name提供默认空字符串
            revision: item.revision || null, // 为undefined的revision提供默认null
            table_id: item.table_id || "", // 为undefined的table_id提供默认空字符串
        })) || [];
    } catch (error) {
        console.error("创建时发生错误:", error);
    }
    return tables
}



/**
 * @description: 
 * @param {string} table_id
 * @return {*}
 */
async function fetchField(table_id: string): Promise<FieldItem[]> {

    let page_token = null;
    let has_more = true;
    let itemList: FieldItem[] = [];

    while (has_more) {
        try {
            const resA: ApiResponse = await client.base.appTableField.list({
                params: {
                    page_size: 100,
                    page_token // 使用page_token获取下一页数据
                },
                path: {
                    table_id: table_id,
                },
            });

            // 合并当前页的项目到itemList
            itemList = itemList.concat(resA.data.items);
            has_more = resA.data.has_more;
            page_token = resA.data.page_token;


        } catch (error) {
            console.log('=======从指定的表中获取字段发生错误========');
            console.log(error);
            console.log('======================================');
            if (error.response.status === 429) {
                // 当遇到429错误时等待
                const waitTime = 5;
                console.log(`Rate limit reached. Waiting for ${waitTime} seconds.`);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            } else {
                // 其他错误则抛出
                throw error;
            }
        }
    }

    return itemList;
}




/**
 * 从指定的表中检索数据
 * @param client - BaseClient 实例
 * @param combinedFields - 需要检索的字段列表
 * @param table_id - 要检索的表的 ID
 * @returns 返回检索到的数据列表
 */
async function fetchTableRecord(field_align: string[], field_sync: string[], table_id: string): Promise<ItemList> {

    let page_token = "";
    let has_more = true;
    let itemList: ItemList = [];
    let combinedFields: string[] = [...field_align, ...field_sync];
    let filter = 'NOT(CurrentValue.[' + field_align + '] ="")'
    console.log(`>>> 开始请求${table_id}数据`);

    while (has_more) {
        try {
            const res = await client.base.appTableRecord.list({
                params: {
                    page_size: 400,
                    field_names: JSON.stringify(combinedFields),
                    page_token,
                    filter,
                },
                path: {
                    table_id: table_id,
                },
            });


            // console.log(res.code);
            // if(res.code==)

            itemList = itemList.concat(res.data.items);
            console.log(`>>> 已获取表${table_id}数据个数：`, itemList.length);

            // 更新循环条件
            has_more = res.data.has_more;
            page_token = res.data.page_token;


        } catch (error) {
            console.log('=======从指定的表中检索数据发生错误========');
            console.log(error);
            console.log('======================================');
            if (error.response.status === 429) {
                // 当遇到429错误时等待
                const waitTime = 5;
                console.log(`Rate limit reached. Waiting for ${waitTime} seconds.`);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            } else if (error.data.code === 1254607) {
                const waitTime = 5;
                console.log(`Rate limit reached. Waiting for ${waitTime} seconds.`);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }


            else {
                // 其他错误则抛出
                throw error;
            }

        }

    }

    console.log(`>>> 累计获取表${table_id}数据个数：`, itemList.length);

    return itemList;
}


/**
 * @description: 
 * @param {string} tableId
 * @param {any} recordsToUpdate
 * @return {*}
 */
async function batchUpdate(table_id: string, records: any[]): Promise<void> {
    const MAX_RECORDS_PER_BATCH = 500;

    // Utility function to split the records into chunks of size MAX_RECORDS_PER_BATCH
    const chunkArray = (array: any[], size: number) => {
        const chunkedArr = [];
        for (let i = 0; i < array.length; i += size) {
            const chunk = array.slice(i, i + size);
            chunkedArr.push(chunk);
        }
        return chunkedArr;
    };

    // Split the records into chunks
    const chunks = chunkArray(records, MAX_RECORDS_PER_BATCH);


    for (const chunk of chunks) {
        try {
            const result = await client.base.appTableRecord.batchUpdate({
                path: {
                    table_id,
                },
                data: { records: chunk }
            });

            console.log(`更新了 ${chunk.length} 条数据。`);
        } catch (error) {
            console.error("创建时发生错误:", error);
            throw error
        }
    }
}

/**
 * @description: 批量创建数据记录
 * @param {string} table_id - 表的ID
 * @param {any[]} records - 需要创建的数据记录数组
 * @return {Promise<void>}
 */
async function batchCreate(table_id: string, records: any[]): Promise<void> {

    const MAX_RECORDS_PER_BATCH = 500;

    // Utility function to split the records into chunks of size MAX_RECORDS_PER_BATCH
    const chunkArray = (array: any[], size: number) => {
        const chunkedArr = [];
        for (let i = 0; i < array.length; i += size) {
            const chunk = array.slice(i, i + size);
            chunkedArr.push(chunk);
        }
        return chunkedArr;
    };

    // Split the records into chunks
    const chunks = chunkArray(records, MAX_RECORDS_PER_BATCH);


    for (const chunk of chunks) {
        try {
            const result = await client.base.appTableRecord.batchCreate({
                path: {
                    table_id,
                },
                data: { records: chunk }
            });
            if (result.code == 0) { }

            console.log(`添加了 ${chunk.length} 条数据。`);
        } catch (error) {
            console.error("创建时发生错误:", error);
            throw error
        }
    }
}




export default client;

// 导出函数以便在其他文件中使用
export { fetchField, fetchTableRecord, batchUpdate, batchCreate, getappTable };


