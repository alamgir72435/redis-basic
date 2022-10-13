
const express = require('express');
const app = express();
const axios = require('axios');

var isRedisConnect = false;
var errorCount = 0;
const Redis = require("redis");
// const client = Redis.createClient();

const client = Redis.createClient({
  socket: {
    host: "redis-14288.c13.us-east-1-3.ec2.cloud.redislabs.com",
    port: 14288,
  },
  username: "admin",
  password: "#Abc123#",
});




client.connect().then(async() => {
  console.log('Connected with Redis')
  //  Test Data
  await client.set('ping', 'PONG')
  let pong = await client.get('ping');
  console.log(pong)
  isRedisConnect = true;
}).catch(err => {
  isRedisConnect = false;
  console.log(err)
})

client.disconnect().then(() => {
  console.log('Disconnect')
}).catch(err => {
  console.log('Disconnected ', )
})


setTimeout(() => {
  client.flushAll().then(() => {
    console.log("data FLused");
  });
}, 2000)

app.get("/redis", async (req, res) => {
  await checkCache({ res, label: `test` });
  return res.json({});
});

app.get('/redis/photos', async (req, res) => {  
  const cache = await checkCache({ res, label: `photos` });
  if(cache) return res.json(cache);
  const { data } = await axios.get("https://jsonplaceholder.typicode.com/todos/1");
  client.set("photos", JSON.stringify(data));
  res.json(data);
})


app.get("/redis/cached/photos", async (req, res) => {
  const getData = await client.get("photos");
  if (getData) {
    return res.json(JSON.parse(getData));
  }
  res.json(getData);
});



async function checkCache({ res, label}) {
  const cachedData = await cache(label);
  if (cachedData) {
    console.log('Cached Data Served for', label)
    return JSON.parse(cachedData); 
  };
  return null;
}

async function cache(label) {
  return new Promise(async (resolve, reject) => {
    
    if (!isRedisConnect) {
      return resolve(null)
    }

    const data = await client.get(label);
    if (data) {
      resolve(data);
    } 
    resolve(null)
  })
}

app.listen(9500, () => console.log('Running ...'))