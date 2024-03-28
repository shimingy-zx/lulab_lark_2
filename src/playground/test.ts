import { BaseClient } from "@lark-base-open/node-sdk";

const APP_TOKEN = process.env["APP_TOKEN"];
const PERSONAL_BASE_TOKEN = process.env["PERSONAL_BASE_TOKEN"];

export async function test(from: string, to: string) {
  // new BaseClient，fill appToken & personalBaseToken
  const client = new BaseClient({
    appToken: APP_TOKEN,
    personalBaseToken: PERSONAL_BASE_TOKEN,
  });

  await client.base.appTableRecord.batchUpdate({
    path: {
      table_id: "tblX4oyTPrF5UwAv",
    },



    data: {
      records: [
        {
          fields: {
            wechat: '文磊',
            客户姓名: '甄文磊',
            手机号码: '13700292882',
            抖音: '胡子茬茬',
            real_name: '甄文磊'
          },
          record_id: 'rec5K3ReVK'
        },
        {
          fields: {
            wechat: 'test',
            客户姓名: '支昱然',
            手机号码: '',
            real_name: '高蓉'
          },
          record_id: 'recZctAdTF'
        }
      ]
    }
    //data: modifiedItemList2,
    //data: { records: modifiedItemList1 }
    // data: {
    //   records: [{
    //     fields: {
    //       wechat:"test"
    //     },
    //     record_id: 'rec5K3ReVK',
    //   },{
    //               fields: {
    //                 wechat:"test"
    //               },
    //               record_id: 'recZctAdTF',
    //             }],
    // },


  });




  // let page_token = null;
  // let has_more = true;

  // while (has_more) {
  //   const res = await client.base.appTableRecord.list({
  //     params: {
  //       page_size: 3,
  //       field_names: '["客户姓名","手机号码"]',
  //       page_token: page_token
  //     },
  //     path: {
  //       table_id: "tblofVnOtmB3bkNz",
  //     },
  //   });

  //   console.log('>>> Text fields', JSON.stringify(res));

  //   has_more = res.data.has_more;
  //   page_token = res.data.page_token;

  // }

  console.log("success");
}

console.log("start");



