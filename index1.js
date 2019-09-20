const SlackBot = require('slackbots')
const Moysklad  = require("moysklad")
const schedule = require('node-schedule')

require("isomorphic-fetch");
require("dotenv").config();

const bot = new SlackBot({
    token: process.env.TOKEN,
    name: 'reportBot'
})
const ms = Moysklad({
    login: process.env.LOGIN,
    password: process.env.PASSWORD
  });
  async function getReport(){
    Date.prototype.yyyymmdd = function() {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();
      
        return [this.getFullYear(),
                (mm>9 ? '' : '0') + mm,
                (dd>9 ? '' : '0') + dd
               ].join('-');
      };
      var date = new Date();
   let reportDay = await ms.GET('report/dashboard/day')
   let reportMonth = await ms.GET('report/dashboard/month')
   let retailShift = await ms.GET(`entity/retailshift?filter=moment>=${date.yyyymmdd()} 00:00:00`)
   let arrTerrenkur = []
   let arrTulebai = []
   for(let i = 0; i<retailShift.rows[0].operations.length; i++){
       if(retailShift.rows[0].operations[i].meta.type === 'retaildemand'){
           arrTerrenkur.push(retailShift.rows[0].operations[i])
       }
   }
   for(let y = 0; y<retailShift.rows[1].operations.length; y++){
    if(retailShift.rows[1].operations[y].meta.type === 'retaildemand'){
        arrTulebai.push(retailShift.rows[1].operations[y])
    }
}
   bot.postMessage('DN88K2FL0', `Мы имеем такие показатели как:\nЗа день: \nПродажи: ${reportDay.sales.count}\nна сумму: ${reportDay.sales.amount/100}\nпо сравнению с предыдущим днем: ${reportDay.sales.movementAmount/100}\nЗа месяц:\nПродажи: ${reportMonth.sales.count}\nна сумму: ${reportMonth.sales.amount/100}\nпо сравнению с предыдущим месяцем: ${reportMonth.sales.movementAmount/100}\n`)
   bot.postMessage('DN88K2FL0', `По точкам продаж\nТулебаева: \nкол-во продаж: ${arrTulebai.length}\nсумма продаж за день: ${(retailShift.rows[1].proceedsNoCash+retailShift.rows[1].proceedsCash)/100}\nСредний чек: ${((retailShift.rows[1].proceedsNoCash+retailShift.rows[1].proceedsCash)/100)/arrTulebai.length}\nТерренкур: \nкол-во продаж: ${arrTerrenkur.length}\nсумма продаж за день: ${(retailShift.rows[0].proceedsNoCash+retailShift.rows[0].proceedsCash)/100}\nСредний чек: ${((retailShift.rows[0].proceedsNoCash+retailShift.rows[0].proceedsCash)/100)/arrTerrenkur.length}`)
}
  var j = schedule.scheduleJob('30 22 * * *', function(){
    getReport()
  });
bot.on('start', () => {
    const params = {
        icon_emoji: ':smiley:'
    }
    bot.postMessage('DN88K2FL0', 'Ready to show data', params)
})

bot.on('error', (err) => console.log(err))

bot.on('message', (data) => {
    if(data.type != 'message'){
        return;
    }

    handleMessage(data.text)
})

function handleMessage(message) {
    if(message.includes(' report')){
        getReport()
    }
}

// 72db291d-8bf4-11e9-9107-504800006c63 - Tulebai
// f59eb287-205d-11e9-9ff4-34e80000bb52 - Terrenkur