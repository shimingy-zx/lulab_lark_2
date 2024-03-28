


import express from 'express'
// import { startCronJob } from './cron/cronJob';
import { sync } from './playground/sync'
// import { test } from './playground/test'
// import { Row, Field, Record } from './playground/types'; // 确保路径正确
import bodyParser from 'body-parser'; // Import bodyParser

const app = express()
const port = 3000
app.use(bodyParser.json());


app.post('/sync', async (req, res) => {
    // Extract data from the request body
    const { tableIds, table_ab, table_sync } = req.body;

    // Ensure the required data is present
    if (!tableIds || !table_ab || !table_sync) {
        return res.status(400).send('Missing required data');
    }

    // 立即响应客户端
    res.json({ message: '请求已接收，数据同步中', success: true });
    // Call the sync function with the extracted data
    await sync(tableIds, table_ab, table_sync);
});

// app.get('/stop_cron', (req, res) => {
//     if (cronJob) {
//         cronJob.stop();
//         res.send('Cron job stopped.');
//     } else {
//         res.send('No cron job to stop.');
//     }
// });


// app.get('/test', async (req, res) => {
//     //await test("abc", "123");
//     res.send('Cron job scheduled!');
// });

app.get('/', async (req, res) => {
    //await sync("abc", "123"); 
    res.send('hello world')
});

app.listen(port, () => {
    // Code.....
    console.log('Listening on  127.0.0.1:' + port)
})

