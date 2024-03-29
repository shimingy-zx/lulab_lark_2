/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2024-03-29 02:34:18
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2024-03-30 01:00:10
 * @FilePath: /lulab_lark_2/src/app.ts
 * @Description: 
 * 
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved. 
 */



import express from 'express'
// import { startCronJob } from './cron/cronJob';
import { sync } from './playground/sync'
import bodyParser from 'body-parser'; // Import bodyParser

const app = express()
const port = 3000
app.use(bodyParser.json());


app.post('/sync', async (req, res) => {
    // Extract data from the request body
    const { table_align, field_align, field_sync } = req.body;

    const authHeader = req.headers.authorization;


    if (!authHeader) {
        return res.status(400).send('No token detected');
    }

    // 使用正则表达式匹配Bearer token并提取其中的token值
    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (token != "1234560") {
        return res.status(400).send('token 错误');
    }


    // Ensure the required data is present
    if (!table_align || !field_align || !field_sync) {
        return res.status(400).send('Missing required data');
    }


    // Call the sync function with the extracted data
    try {
        const result = await sync(table_align, field_align, field_sync);
        return res.status(400).send({ result });
    } catch (error) {
        return res.status(400).send({ error: error });
    }
});

// app.get('/stop_cron', (req, res) => {
//     if (cronJob) {
//         cronJob.stop();
//         res.send('Cron job stopped.');
//     } else {
//         res.send('No cron job to stop.');
//     }
// });



app.get('/', async (req, res) => {
    //await sync("abc", "123"); 
    res.send('hello world')
});

app.listen(port, () => {
    // Code.....
    console.log('Listening on  127.0.0.1:' + port)
})

