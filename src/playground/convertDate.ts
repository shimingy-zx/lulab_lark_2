/*
 * @Author: 杨仕明 63637615+shimingy-zx@users.noreply.github.com
 * @Date: 2024-03-29 01:33:04
 * @LastEditors: 杨仕明 63637615+shimingy-zx@users.noreply.github.com
 * @LastEditTime: 2024-03-29 01:51:32
 * @FilePath: \lulab_lark\playground\convertDate.ts
 * @Description: 
 * 
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved. 
 */
export function processData(data: any[], fieldTypeMap: Map<string, number>): any[] {

    return data.map(item => {
        const fields = item.fields;
        //console.log(item.fields);
        Object.keys(fields).forEach(fieldName => {
            const fieldType = fieldTypeMap.find(item => item.field_name === fieldName)?.type;
            switch (fieldType) {
                //多行文本
                case 1:
                    break;
                //数字（默认值）、进度、货币、评分
                case 2:
                    fields[fieldName] = Number(fields[fieldName]);
                    break;
                case 3:
                    break;
                case 4:
                    break;
                case 5:
                    break;
                case 7:
                    break;
                case 11:
                    fields[fieldName] = fields[fieldName].map(({ email, avatar_url, en_name, name, ...rest }) => rest);
                    break;
                case 13:
                    break;
                case 15:
                    break;
                case 21:
                    fields[fieldName] = [item.record_id]
                    break;
                case 1003:
                    fields[fieldName] = fields[fieldName].map(({ en_name, email, name, ...rest }) => rest);
                    break;
                case 1004:
                    fields[fieldName] = fields[fieldName].map(({ en_name, email, name, ...rest }) => rest);
                    break;
                default:
                    delete item.fields;
                    break;
            }
        });
        return item;
    });
}

//参考资料
//https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-field/guide

// 字段类型（相同字段类型用ui_type区分）：
// 1：多行文本（默认值）、条码
// 2：数字（默认值）、进度、货币、评分
// 3：单选
// 4：多选
// 5：日期
// 7：复选框
// 11：人员
// 13：电话号码
// 15：超链接
// 17：附件
// 18：单向关联
// 19：查找引用
// 20：公式
// 21：双向关联
// 22：地理位置
// 23：群组
// 1001：创建时间
// 1002：最后更新时间
// 1003：创建人
// 1004：修改人
// 1005：自动编号