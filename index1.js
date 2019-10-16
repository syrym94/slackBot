const SlackBot = require("slackbots");
const Moysklad = require("moysklad");
const schedule = require("node-schedule");

require("isomorphic-fetch");
require("dotenv").config();

const bot = new SlackBot({
  token: process.env.TOKEN,
  name: "reportBot"
});
const ms = Moysklad({
  login: process.env.LOGIN,
  password: process.env.PASSWORD
});
async function getReport() {
  Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [
      this.getFullYear(),
      (mm > 9 ? "" : "0") + mm,
      (dd > 9 ? "" : "0") + dd
    ].join("-");
  };
  var date = new Date();
  let reportDay = await ms.GET("report/dashboard/day");
  let reportMonth = await ms.GET("report/dashboard/month");
  let retailShift = await ms.GET(
    `entity/retailshift?filter=moment>=${date.yyyymmdd()} 00:00:00`
  );
  let arrTerrenkur = [];
  let arrTulebai = [];
  let sumTulebai
  let mediumCheckTulebai
  let sumTerrenkur
  let mediumCheckTerrenkur
  for (let j = 0; j < retailShift.rows.length; j++) {
    if (
      retailShift.rows[j].store.meta.href ===
      "https://online.moysklad.ru/api/remap/1.1/entity/store/f5a37aa8-77d8-11e9-912f-f3d400078b6b"
    ) {
      for (let y = 0; y < retailShift.rows[j].operations.length; y++) {
        if(retailShift.rows[j].operations[y].meta.type === 'retaildemand'){
        arrTulebai.push(retailShift.rows[j].operations[y])
        }
      }
      sumTulebai = (retailShift.rows[j].proceedsNoCash + retailShift.rows[j].proceedsCash)/100
      mediumCheckTulebai = ((retailShift.rows[j].proceedsNoCash + retailShift.rows[j].proceedsCash)/100)/arrTulebai.length
    }

  }
  for (let j = 0; j < retailShift.rows.length; j++) {
    if (
      retailShift.rows[j].store.meta.href === 
      "https://online.moysklad.ru/api/remap/1.1/entity/store/f58fb154-205d-11e9-9ff4-34e80000bb3c"
    ) {
      for (let y = 0; y < retailShift.rows[j].operations.length; y++) {
        if(retailShift.rows[j].operations[y].meta.type === 'retaildemand'){
        arrTerrenkur.push(retailShift.rows[j].operations[y])
        }
      }
      sumTerrenkur = (retailShift.rows[j].proceedsNoCash + retailShift.rows[j].proceedsCash)/100
      mediumCheckTerrenkur = ((retailShift.rows[j].proceedsNoCash + retailShift.rows[j].proceedsCash)/100)/arrTerrenkur.length
    }
  }
  console.log(arrTerrenkur.length, arrTulebai.length);
     bot.postMessage('DMWQAJ151', `Мы имеем такие показатели как:\nЗа день: \nПродажи: ${reportDay.sales.count}\nна сумму: ${reportDay.sales.amount/100}\nпо сравнению с предыдущим днем: ${reportDay.sales.movementAmount/100}\nЗа месяц:\nПродажи: ${reportMonth.sales.count}\nна сумму: ${reportMonth.sales.amount/100}\nпо сравнению с предыдущим месяцем: ${reportMonth.sales.movementAmount/100}\n`)
     bot.postMessage('DMWQAJ151', `По точкам продаж\nТулебаева: \nкол-во продаж: ${arrTulebai.length}\nсумма продаж за день: ${sumTulebai}\nСредний чек: ${mediumCheckTulebai}\nТерренкур: \nкол-во продаж: ${arrTerrenkur.length}\nсумма продаж за день: ${sumTerrenkur}\nСредний чек: ${mediumCheckTerrenkur}`)
}
var j = schedule.scheduleJob("59 19 * * *", function() {
  getReport();
});
// bot.on('start', () => {
//     const params = {
//         icon_emoji: ':smiley:'
//     }
//     bot.postMessage('DN88K2FL0', 'Ready to show data', params)
// })

bot.on("error", err => console.log(err));

bot.on("message", data => {
  if(data.type != 'message'){
      return;
  }
  handleMessage(data.text)
});

function handleMessage(message) {
  if(message.includes(' report')){
    getReport();
  }
}

// 72db291d-8bf4-11e9-9107-504800006c63 - Tulebai
// f59eb287-205d-11e9-9ff4-34e80000bb52 - Terrenkur
