import { fetchField, fetchTableRecord, batchUpdate, batchCreate, getappTable } from './lark_client';
import { Tableal1ign, Record, Fieldalign, TableEntry, Record_up, FieldItem } from './types';
import { processData } from './convertDate';




export async function sync(table_align: Tableal1ign, field_align: Fieldalign[], field_sync: Fieldalign[]) {

    let re_sync: Fieldalign[] = field_sync;


    // 检测同步字段是否包含对准字段
    console.log("检测同步字段是否包含对准字段");
    try {
        checkFieldSync(field_align, re_sync);
    } catch (error) {
        throw error
    }


    // 获取多维表所有数据表
    console.log("开始查询所有数据表");
    const tablelist: TableEntry[] = await getappTable();


    // 查找表格对应的table_id
    console.log("查找表格对应的table_id");
    const TABLE_A_ID = findTableId(table_align.table_a, tablelist);
    const TABLE_B_ID = findTableId(table_align.table_b, tablelist);

    if (!TABLE_A_ID) { throw "找不到" + table_align.table_a + "的数据表" }
    if (!TABLE_B_ID) { throw "找不到" + table_align.table_b + "的数据表" }

    console.log('>>> A表ID为：', JSON.stringify(TABLE_A_ID));
    console.log('>>> B表ID为：', JSON.stringify(TABLE_B_ID));



    // 分离两表field_align字段
    let field_align_a: string[] = field_align.map(row => row.field_a);
    let field_align_b: string[] = field_align.map(row => row.field_b);

    // 分离两表field_sync字段
    let field_sync_a: string[] = field_sync.map(row => row.field_a);
    let field_sync_b: string[] = field_sync.map(row => row.field_b);

    //根据field_align和field_sync组合两表字段
    let combinedFields_a: string[] = [...field_align_a, ...field_sync_a];
    let combinedFields_b: string[] = [...field_align_b, ...field_sync_b];

    //合并field_align和field_sync
    let combined_all = [...field_align, ...field_sync];



    console.log('>>> A表基准字段：', JSON.stringify(field_align_a));
    console.log('>>> A表同步字段：', JSON.stringify(field_sync_a));
    console.log('>>> B表基准字段：', JSON.stringify(field_align_b));
    console.log('>>> B表同步字段：', JSON.stringify(field_sync_b));


    //获取A、B表所有字段
    console.log('>>> 开始获取AB表字段列表');
    const fields_a = await fetchField(TABLE_A_ID);
    const fields_b = await fetchField(TABLE_B_ID);

    console.log('>>> 已获取到的表A字段列表');
    console.log('>>> 已获取到的表B字段列表');


    // 进行AB表对应字段类型的比较
    compareTypes(fields_a, fields_b, field_align);
    console.log('>>> 校验基准字段类型数据,数据类型对应无误');


    // 获取AB表数据
    let itemList_a: Record[];
    let itemList_b: Record[];

    //检测A表是否含有单项关联和多项管理字段

    const filter_fields_a = await fields_a.filter(field => field.type === 18 || field.type === 21);
    // const filter_fields_b = await fields_a.filter(field => field.type === 18 || field.type === 21);

    if (filter_fields_a.length > 0) {
        // 进行AB表对应字段类型的比较
        compareTypes2(fields_a, fields_b, re_sync);
        console.log('>>> 校验A表关联字段类型数据,数据类型对应无误');

        // 获取AB表数据
        let filter_a = 'NOT(CurrentValue.[' + field_align_a + '] ="")'
        let filter_b = 'NOT(CurrentValue.[' + field_align_b + '] ="")'
        itemList_a = await fetchTableRecord(filter_a, combinedFields_a, TABLE_A_ID);
        itemList_b = await fetchTableRecord(filter_b, combinedFields_b, TABLE_B_ID);

        // 使用返回的 itemList 进行后续操作
        console.log('>>> A表检索完成，A表检索数据例子', itemList_a.slice(0, 1));
        console.log('>>> B表检索完成，B表检索数据例子', itemList_b.slice(0, 1));

        // 处理单项关联和多项管理字段
        console.log('>>> 先处理单项关联和多项关联字段');
        const resultsForAllSyncs = forMultipleSyncs(field_align, field_sync, itemList_a, itemList_b);
        // console.log(resultsForAllSyncs);

        for (const key of resultsForAllSyncs) {
            await batchUpdate(TABLE_A_ID, key);
        }
        console.log('>>> 处理完成单项关联和多项关联字段');


        // 移除关联字段相关的field_sync
        re_sync = filterFieldSync(filter_fields_a, field_sync);
        console.log('>>> 移除关联字段相关的field_sync');
        console.log(re_sync);

        // const filteredFields_a = fields_a.filter(field => field.type !== 18 && field.type !== 21);
        // const filteredFields_b = fields_b.filter(field => field.type !== 18 && field.type !== 21);
    } else {

        compareTypes(fields_a, fields_b, re_sync);
        console.log('>>> 校验完成同步字段类型数据,数据类型对应无误');
        // 获取AB表数据
        let filter_a = 'NOT(CurrentValue.[' + field_align_a + '] ="")'
        let filter_b = 'NOT(CurrentValue.[' + field_align_b + '] ="")'
        itemList_a = await fetchTableRecord(filter_a, combinedFields_a, TABLE_A_ID);
        itemList_b = await fetchTableRecord(filter_b, combinedFields_b, TABLE_B_ID);

        // 使用返回的 itemList 进行后续操作
        console.log('>>> A表检索完成，A表检索数据例子', itemList_a.slice(0, 1));
        console.log('>>> B表检索完成，B表检索数据例子', itemList_b.slice(0, 1));

    }


    // //根据检索数据删除空字段数据
    // const filteredRecords = filterData(itemList_a, field_align_a);

    // let sub = itemList_a.length - filteredRecords.length
    // console.log('>>> 空值数据个数', sub);


    // 移除itemList_a&fields_b 中 'fields' 的所有 'id' 字段
    const A_List = itemList_a.map(({ id, ...rest }) => rest);
    const B_List = itemList_b.map(({ id, ...rest }) => rest);

    console.log('>>> A表ID字段删除完成，数据例子', A_List.slice(0, 1));
    console.log('>>> B表ID字段删除完成，数据例子', B_List.slice(0, 1));


    // 根据上传数据要求更改数据类型
    const returnA = processData(A_List, fields_a);
    const returnB = processData(B_List, fields_b);
    console.log('>>> A表更改数据类型完成，数据例子', returnA.slice(0, 2));
    console.log('>>> B表更改数据类型完成，数据例子', returnB.slice(0, 2));

    // 剔除A表同步字段相同的记录
    console.log('>>> 除A表同步字段相同的记录');
    const filteredReturnA = filterReturnA(returnA, returnB, re_sync);


    // 进行数据ID、字段匹配替换和处理
    let update: any[] = [];
    let create: any[] = [];

    filteredReturnA.forEach((aItem: any) => {
        const match = returnB.find((bItem: any) =>
            field_align.every(tab => aItem.fields[tab.field_a] === bItem.fields[tab.field_b])
        );
        if (match) {
            aItem.record_id = match.record_id;
            const replacedA = syncFields(aItem, [...field_align, ...re_sync]);
            update.push(replacedA);
        } else {
            const replacedB = syncFields(aItem, [...field_align, ...re_sync]);
            const { record_id, ...recordWithoutId } = replacedB;
            create.push(recordWithoutId);
        }
    });



    // AB表数据对比检索完成
    console.log('>>> A表预备数据例子', update.slice(0, 1));
    console.log('>>> B表预备数据例子', create.slice(0, 1));



    // 上传和更新B表数据
    await batchUpdate(TABLE_B_ID, update);
    console.log('>>> 累计更新B表', update.length, "条数据");
    await batchCreate(TABLE_B_ID, create);
    console.log('>>> 累计增加B表', create.length, "条数据");


    console.log("成功同步所有数据");
    return { state: "成功同步所有数据" };

}


function checkFieldSync(field_align: Fieldalign[], field_sync: Fieldalign[]): void {
    // 遍历 field_sync 中的每个元素
    field_sync.forEach(syncItem => {
        // 检查 field_align 是否包含一个其 field_a 与当前 field_sync 元素的 field_a 相同的元素
        const hasMatch = field_align.some(alignItem => alignItem.field_a === syncItem.field_a);
        if (hasMatch) {
            // 如果找到匹配，抛出错误
            throw `Error: Matching field_a found between field_sync and field_align for value '${syncItem.field_a}'.`
        }
    });
    field_sync.forEach(syncItem => {
        // 检查 field_align 是否包含一个其 field_a 与当前 field_sync 元素的 field_a 相同的元素
        const hasMatch = field_align.some(alignItem => alignItem.field_b === syncItem.field_b);
        if (hasMatch) {
            // 如果找到匹配，抛出错误
            throw `Error: Matching field_a found between field_sync and field_align for value '${syncItem.field_b}'.`
        }
    });
}


// 查找table_id的函数，现在接受两个参数：一个是表名，另一个是表列表数组
function findTableId(name: string, tables: TableEntry[]): string | undefined {
    const entry = tables.find(table => table.name === name);
    return entry?.table_id;
}


// 定义比较函数
function compareTypes(A_id: any[], B_id: any[], table: Fieldalign[]) {
    for (const row of table) {
        const aType = A_id.find(item => item.field_name === row.field_a)?.type;
        const bType = B_id.find(item => item.field_name === row.field_b)?.type;

        if (!aType) {
            const e = ">>>数据表A字段" + row.field_a + "不存在"
            throw e;
        }
        if (!bType) {
            const e = ">>>数据表B字段" + row.field_b + "不存在"
            throw e;
        }
        if (aType !== bType) {
            const e = ">>>数据表A字段" + row.field_a + "和数据表B字段" + row.field_b + "对应类型不匹配"
            throw e;
        }
    }
}

// 定义比较函数(不要求双边类型相同)
function compareTypes2(A_id: any[], B_id: any[], table: Fieldalign[]) {
    for (const row of table) {
        const aType = A_id.find(item => item.field_name === row.field_a)?.type;
        const bType = B_id.find(item => item.field_name === row.field_b)?.type;

        if (!aType) {
            const e = ">>>数据表A字段" + row.field_a + "不存在"
            throw e;
        }
        if (!bType) {
            const e = ">>>数据表B字段" + row.field_b + "不存在"
            throw e;
        }
    }
}

// //根据检索数据删除空字段数据
// const filterData = (data: Record[], standard: string[]): Record[] => {
//     return data.filter(row => {
//         return standard.every(field => {
//             return row.fields[field] !== "" && row.fields[field] !== undefined;
//         });
//     });
// };


function filterReturnA(returnA: any[], returnB: any[], field_sync: { field_a: string, field_b: string }[]): any[] {
    return returnA.filter((aItem: any) => {
        const match = returnB.find((bItem: any) =>
            field_sync.every(tab => deepEqual(aItem.fields[tab.field_a], bItem.fields[tab.field_b]))
        );
        return !match; // 返回为假（false）的项将被保留
    });
}

// 比较两个对象是否相同
function deepEqual(obj1: any, obj2: any): boolean {
    // 若类型不同，则直接返回 false
    if (typeof obj1 !== typeof obj2) {
        return false;
    }

    // 若是数组，逐个比较数组元素
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        for (let i = 0; i < obj1.length; i++) {
            if (!deepEqual(obj1[i], obj2[i])) {
                return false;
            }
        }
        return true;
    }

    // 若是对象，逐个比较属性值
    if (typeof obj1 === 'object' && obj1 !== null && typeof obj2 === 'object' && obj2 !== null) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (const key of keys1) {
            if (!obj2.hasOwnProperty(key) || !deepEqual(obj1[key], obj2[key])) {
                return false;
            }
        }
        return true;
    }

    // 其他类型直接比较值
    return obj1 === obj2;
}





// 替换B表字段名称到A表数据
function syncFields(A: Record_up, combined_all: Fieldalign[]): Record_up {
    let newFields: { [key: string]: string } = {};

    // 遍历A的fields，并使用combined_all中的映射关系来修改键
    for (let key in A.fields) {
        let mapping = combined_all.find(row => row.field_a === key);
        if (mapping) {
            newFields[mapping.field_b] = A.fields[key];
        } else {
            newFields[key] = A.fields[key];
        }
    }
    return {
        ...A,
        fields: newFields
    };
}
// 处理关联表字段
const forMultipleSyncs = (field_align: Fieldalign[], field_sync: Fieldalign[], itemList_a: Record[], itemList_b: Record[]) => {
    return field_sync.map(sync => {
        // 对于field_sync数组中的每个同步配置单独执行数据处理
        const result = itemList_a.map(recordA => {
            const matchingRecords = itemList_b.filter(recordB => {
                const align = field_align.find(a => recordA.fields[a.field_a] === recordB.fields[a.field_b]);
                return !!align;
            });

            const fields: { [key: string]: string[] } = {};
            // 仅处理当前同步配置中指定的字段
            fields[sync.field_a] = matchingRecords.map(r => r.record_id);

            return {
                fields,
                id: recordA.record_id,
                record_id: recordA.record_id,
            };

        });

        return result;
    });
};

function filterFieldSync(
    filter_fields_a: FieldItem[],
    field_sync: Fieldalign[]
): Fieldalign[] {
    // Convert filter_fields_a field_names to a Set for O(1) access
    const fieldNames = new Set(filter_fields_a.map(field => field.field_name));

    // Filter out field_sync items where field_a matches any field_name in filter_fields_a
    return field_sync.filter(sync => !fieldNames.has(sync.field_a));
}