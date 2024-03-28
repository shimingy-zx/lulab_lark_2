import { fetchField, fetchTableRecord, batchUpdate, batchCreate } from './lark_client';
import { Row, Field, Record } from './types'; // 确保路径正确
import { processData } from './convertDate';


// //表ID
// let tableIds: Row[] = [
//     { table_a: "tblofVnOtmB3bkNz", table_b: "tblX4oyTPrF5UwAv" }
// ];

// //基准字段
// let table_ab: Row[] = [{ table_a: "客户姓名", table_b: "real_name" }];

// //同步字段
// let table_sync: Row[] = [
//     { table_a: "手机号码", table_b: "phone" },
//     { table_a: "wechat",  table_b: "wechat" },
//     { table_a: "抖音",    table_b: "抖音" },
//     { table_a: "家长职务", table_b: "职务" }
// ];



export async function sync(tableIds: Row, table_ab: Row[], table_sync: Row[]) {


    let standard_a: string[] = table_ab.map(row => row.table_a);
    let standard_b: string[] = table_ab.map(row => row.table_b);
    let sync_a: string[] = table_sync.map(row => row.table_a);
    let sync_b: string[] = table_sync.map(row => row.table_b);
    let combinedFields_a: string[] = [...standard_a, ...sync_a];
    let combinedFields_b: string[] = [...standard_b, ...sync_b];
    let combined_all = [...table_ab, ...table_sync];

    let TABLE_A_ID = tableIds.table_a;
    let TABLE_B_ID = tableIds.table_b;

    console.log('>>> A表基准字段：', JSON.stringify(standard_a));
    console.log('>>> A表同步字段：', JSON.stringify(sync_a));
    console.log('>>> B表基准字段：', JSON.stringify(standard_b));
    console.log('>>> B表同步字段：', JSON.stringify(sync_b));


    //获取A、B表所有字段
    console.log('>>> 开始获取AB表字段列表');
    const fields_a = await fetchField(TABLE_A_ID);
    const fields_b = await fetchField(TABLE_B_ID);

    console.log('>>> 已获取到的表A字段列表');
    console.log('>>> 已获取到的表B字段列表');
    // console.log('>>> Text fields', JSON.stringify(fields_a));
    // console.log('>>> Text fields', JSON.stringify(fields_b));


    // 定义比较函数
    function compareTypes(A_id: any[], B_id: any[], table: Row[]) {
        for (const row of table) {
            const aType = A_id.find(item => item.field_name === row.table_a)?.type;
            const bType = B_id.find(item => item.field_name === row.table_b)?.type;

            if (aType !== bType) {
                throw new Error('>>> AB表对应字段类型不匹配');
            }
        }
    }

    // 进行比较
    compareTypes(fields_a, fields_b, table_ab);
    compareTypes(fields_a, fields_b, table_sync);
    console.log('>>> 校验完成字段类型数据');





    // 获取AB表数据
    let itemList_a = await fetchTableRecord(combinedFields_a, TABLE_A_ID);
    let itemList_b = await fetchTableRecord(combinedFields_b, TABLE_B_ID);
    // 使用返回的 itemList 进行后续操作
    console.log('>>> A表检索完成，A表检索数据例子', itemList_a.slice(0, 1));
    console.log('>>> B表检索完成，B表检索数据例子', itemList_b.slice(0, 1));


    //删除空字段数据
    const filterData = (data: Record[], standard: string[]): Record[] => {
        return data.filter(row => {
            return standard.every(field => {
                return row.fields[field] !== "" && row.fields[field] !== undefined;
            });
        });
    };

    const filteredRecords = filterData(itemList_a, standard_a);

    let sub = itemList_a.length - filteredRecords.length
    console.log('>>> 空值数据个数', sub);





    // 移除itemList_a&fields_b 中 'fields' 的所有 'id' 字段
    const A_List = filteredRecords.map(({ id, ...rest }) => rest);
    const B_List = itemList_b.map(({ id, ...rest }) => rest);

    console.log('>>> A表ID字段删除完成，数据例子', A_List.slice(0, 1));
    console.log('>>> B表ID字段删除完成，数据例子', B_List.slice(0, 1));


    // 根据上传数据要求更改数据类型
    const returnA = processData(A_List, fields_a);
    const returnB = processData(B_List, fields_b);


    // 替换B表字段名称到A表数据
    function syncFields(A: Record_up, combined_all: Row[]): Record_up {
        let newFields: { [key: string]: string } = {};

        // 遍历A的fields，并使用combined_all中的映射关系来修改键
        for (let key in A.fields) {
            let mapping = combined_all.find(row => row.table_a === key);
            if (mapping) {
                newFields[mapping.table_b] = A.fields[key];
            } else {
                newFields[key] = A.fields[key];
            }
        }
        return {
            ...A,
            fields: newFields
        };
    }



    // 第三步：进行数据匹配和处理
    let update_1: any[] = [];
    let update_2: any[] = [];

    returnA.forEach((aItem: any) => {
        const match = returnB.find((bItem: any) =>
            table_ab.every(tab => aItem.fields[tab.table_a] === bItem.fields[tab.table_b])
        );
        if (match) {
            aItem.record_id = match.record_id;
            const replacedA = syncFields(aItem, combined_all);
            update_1.push(replacedA);
        } else {
            const replacedB = syncFields(aItem, combined_all);
            const { record_id, ...recordWithoutId } = replacedB;
            update_2.push(recordWithoutId);
        }
    });
    // AB表数据对比检索完成
    console.log('>>> A表预备数据例子', update_1.slice(0, 2));
    console.log('>>> B表预备数据例子', update_2.slice(0, 2));

    // // 根据上传数据要求更改数据类型
    // const returnA = processData(update_1, fields_b);
    // const returnB = processData(update_2, fields_b);

    // 上传和更新B表数据
    await batchUpdate(TABLE_B_ID, update_1);
    await batchCreate(TABLE_B_ID, update_2);


    console.log("成功同步所有数据");


}
