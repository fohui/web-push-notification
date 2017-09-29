var express = require('express')
var bodyParser = require('body-parser')
var webpush = require('web-push')
var app = express()
var allowCrossDomain = function(req,res,next){
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Credentials','true')
    res.header('Access-Control-Allow-Headers','Content-Type');
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
    next();
}
var local = {
    next: 1,
};
var subscriptions = {
    
}

app.use(allowCrossDomain)
app.use(express.static('./'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var _responeCreater = function(res,opts){
    res.status(opts.status)
    res.setHeader('Content-Type',opts.dataType)
    res.send(JSON.stringify(opts.data))
}
var isValidSaveRequest = function(req){
    if(!req.body || !req.body['body']){
        return false
    }
    return true
}
var isValidPushRequest = function(req,res){
    if(!req.body || !req.body['message']){
        _responeCreater(res,{
            status: 400,
            dataType: 'application/json',
            data: {
                error: '没有信息'
            }
        })
        return false
    }
    return true
}
var triggerPushMsg = function(subscription,dataToSend,res){
    return webpush.sendNotification(subscription, dataToSend)
    .catch((err)=>{
        _responeCreater(res,{
            status: 400,
            dataType: 'application/json',
            data: {
                error: 'Subscription失效'
            }
        })
    })
    .then(data=>{
        _responeCreater(res,{
            status: 200,
            dataType: 'application/json',
            data: {
                msg: '推送成功'
            }
        })
    })
}
var unique = function(subscription){
    for(var key in subscriptions){
        if(subscriptions[key] === subscription) return false;
    }
    return true;
}

var vapidKeys = {
    publicKey:'BL9Q2UwJPt9MzYm0urv4GeVU0-34zpuD30VUbNH5hRNPqV-LwbDO3sJejdwlmr7nyGZ8dL3TBuW-vXsWFkjdSsc',
    privateKey: 'Jck1C1WJQQ4teQb5cdjGTKwNQyz3OKS_tE594bdwYpU'
};
webpush.setVapidDetails(
    'mailto:927978917@qq.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);
webpush.sendNotification(subscription, dataToSend)


app.post('/sendPushMessage',function(req,res){
    local.message = req.body['message']
    var dataToSend = JSON.stringify({
        title: local.message,
        body: '信息体:we are xxx'
    });
    console.log('推送的信息：'+local.message)

    var sendPushTimeout = function(){
        for (var key in subscriptions) {
            var subscription = JSON.parse(subscriptions[key]);
            //todo：变成一个promise链
            triggerPushMsg(subscription, dataToSend,res);
        }
    }
    sendPushTimeout()
})


app.post('/savePushSubscription',function(req,res){
    if(!isValidSaveRequest(req)){
        _responeCreater(res,{
            status: 400,
            dataType: 'application/json',
            data: {
                error: '没有有效信息'
            }
        })
    }
    var key = '_'+local.next;
    var subscription = req.body['body']
    if(!unique(subscription)) return;
    subscription['_id'] = key
    subscriptions[key] = subscription
    local['next'] +=1
    _responeCreater(res,{
        status: 200,
        dataType: 'text/html;charset=utf-8',
        data: {
            data: 'PushSubscription保存成功'
        }
    })
})
app.get('/getPushSubscription',function(req,res){
    _responeCreater(res,{
        status: 200,
        dataType: 'text/html;charset=utf-8',
        data: {
            data: subscriptions
        }
    })
})


app.listen(4000,function(){
    console.log('node app listening on port 4000!')
})