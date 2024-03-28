import { BaseClient } from "@lark-base-open/node-sdk";
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



async function fetchField(table_id: string): Promise<FieldItem[]> {

    let page_token = null;
    let has_more = true;
    let itemList: FieldItem[] = [];

    while (has_more) {
        try {
            const resA: ApiResponse = await client.base.appTableField.list({
                params: {
                    page_size: 100,
                    page_token: page_token // 使用page_token获取下一页数据
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
            console.log('+++++错误===================');
            // console.log(error.response.status);
            console.log('+++++错误===================');
            if (error.response && error.response.status === 429) {
                // 当遇到429错误时等待
                const waitTime = error.response.headers['x-ogw-ratelimit-reset'] || 60;
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
 * @param table_a_id - 要检索的表的 ID
 * @returns 返回检索到的数据列表
 */
async function fetchTableRecord(combinedFields: string[], table_a_id: string): Promise<ItemList> {

    let page_token = null;
    let has_more = true;
    let itemList: ItemList = [];
    console.log(`>>> 开始请求${table_a_id}数据`);

    while (has_more) {
        try {
            const res = await client.base.appTableRecord.list({
                params: {
                    page_size: 400,
                    field_names: JSON.stringify(combinedFields),
                    page_token: page_token,
                },
                path: {
                    table_id: table_a_id,
                },
            });

            itemList = itemList.concat(res.data.items);
            console.log(`>>> 已获取表${table_a_id}数据个数：`, itemList.length);

            // 更新循环条件
            has_more = res.data.has_more;
            page_token = res.data.page_token;


        } catch (error) {
            console.log('+++++错误===================');
            console.log(error.response);
            console.log('+++++错误===================');
            if (error.response && error.response.status === 429) {
                // 当遇到429错误时等待
                const waitTime = error.response.headers['x-ogw-ratelimit-reset'] || 60;
                console.log(`Rate limit reached. Waiting for ${waitTime} seconds.`);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            } else {
                // 其他错误则抛出
                throw error;
            }
        }

    }

    console.log(`>>> 累计获取表${table_a_id}数据个数：`, itemList.length);

    return itemList;
}



async function batchUpdate(tableId: string, recordsToUpdate: any[]): Promise<void> {
    try {
        await client.base.appTableRecord.batchUpdate({
            path: {
                table_id: tableId,
            },
            data: { records: recordsToUpdate }
        });
        console.log("更新数据完成");
    } catch (error) {
        console.error("更新时发生错误:", error);
    }
}


async function batchCreate(tableId: string, newRecords: any[]): Promise<void> {
    try {
        await client.base.appTableRecord.batchCreate({
            path: {
                table_id: tableId,
            },
            data: { records: newRecords }
        });
        console.log("创建数据完成");
    } catch (error) {
        console.error("创建时发生错误:", error);
    }
}




export default client;
// 导出函数以便在其他文件中使用
export { fetchField, fetchTableRecord, batchUpdate, batchCreate };


