var HOST = 'http://localhost:4000'
var messageBox = $('#message-online')
var isSubscribed;

function isEmptyObject(o) {    
    for (let i in o) {
        return !1;
    }
    return !0;
}
function printInPage(msg){
    var nowTime = new Date().toLocaleString()
    var preStr = '<p>'+nowTime+'</p>'
    messageBox.append(preStr+'<p>'+msg+'</p>')
}
function checkFeatures(){
    if (!('serviceWorker' in navigator))  {
        return "Service Worker isn't supported on this browser"
    }
    if (!('PushManager' in window)) {
        return "Push isn't supported on this browser"
    }
    return true


}
function savePushSubscription(pushSubscription){
    $.ajax({
        type:"POST",
        url: HOST+'/savePushSubscription',
        data: {
            "body": JSON.stringify(pushSubscription)
        },
        success: function(res){
            printInPage('PushSubscription信息上传成功')
        },
        dataType: "json"
    })
}

function getSWRegistration() {
    return navigator.serviceWorker.register('/service-worker.js')
    .then(function(SWRegistration) {
        printInPage('Service worker 注册成功');
        return SWRegistration;
    })
    .catch(function(err) {
        printInPage('service worker 注册失败: '+err);
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
                    .replace(/\-/g, '+')
                    .replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function checkSubscription(){
    return getSWRegistration()
    .then(function(registration) {
        return registration.pushManager.getSubscription()
    })
}
// https://web-push-codelab.appspot.com/?hl=zh-cn
// 私钥：Jck1C1WJQQ4teQb5cdjGTKwNQyz3OKS_tE594bdwYpU
//为了用户安全, 每次收到推送的消息，都需要展示通知

function subscribePush(){
    return getSWRegistration()
    .then(function(SWRegistration){
        const subscribeOptions = {
            userVisibleOnly: true, 
            applicationServerKey: urlBase64ToUint8Array('BL9Q2UwJPt9MzYm0urv4GeVU0-34zpuD30VUbNH5hRNPqV-LwbDO3sJejdwlmr7nyGZ8dL3TBuW-vXsWFkjdSsc')
        };
        return SWRegistration.pushManager.subscribe(subscribeOptions)
    })
    .then(function(pushSubscription){
        printInPage('初次订阅push service成功: '+JSON.stringify(pushSubscription));
        return pushSubscription;
    })
    .catch(function(err){
        printInPage('初次订阅push service失败: '+ JSON.stringify(err) );
    })
}

function subscribeUserToPush() {
    checkSubscription().then(function(subscription){
        isSubscribed = !(subscription === null);
        if(isSubscribed){
            printInPage('push service 已经订阅');
            return subscription
        }
        return subscribePush()
    })
    .then(function(pushSubscription){
        if(!isEmptyObject(pushSubscription)) savePushSubscription(pushSubscription)
        printInPage('PushSubscription信息: '+JSON.stringify(pushSubscription));
    })   
}

window.clickHandler = function(){
    if(checkFeatures()===true) {
        subscribeUserToPush()
    }else {
        printInPage(checkFeatures())
    }
}
window.getBackInfo = function(){
    $.ajax({
        type:"GET",
        url: HOST+'/getPushSubscription',
        success: function(res){
            printInPage('检测后台保存的pushSubscription：'+JSON.stringify(res))
        }
    })
}
window.sendMsg = function(){
    var message = $('#js-msg-input').val().trim()
    if(message.length===0) {
        alert('请输入内容');
        return;
    }
    $.ajax({
        type: 'POST',
        url: HOST+'/sendPushMessage',
        data: {
            message: message
        },
        dataType: 'json',
        success: function(res){
            printInPage('已经推送的消息：'+JSON.stringify(res))
        }
    })
}