const ws=require("./node_modules/ws");
const fs=require("fs");
const chats=require("./node_modules/sendchat").dx.chats;
const subscribes=require("./node_modules/订阅事件").dx.subscribes;
const fk=require("./fk").fk.g//方块库
const server=new ws.Server({port:8080});
/*
计划：
先搞一个方块库 完成
然后搞定位算法 完成
当客户端监听到消息返回数据字符串是get pos就
用querytarget获取玩家的位置去除小数点将位置放在一个对象
执行两次获取对角线 完成

怎么获取对角线的立体的体积
怎么检测体积里面的每一个小立方体
testforblock方块匹配获取位置以及方块名称和数据值 未完成
可以尝试用forEach
命令:execute 定位到的位置 fill ~位置 ~位置 方块名称 数据值
生成命令放在mcfunction命令包了 位置应该用相对位置
//导入建筑


怎么在用get pos的地方执行命令包?
用execute和
*/
//对角线坐标
var djx={
    upper:"",
    position1:{},
    lower:"",
    position2:{}
};
//处理数组提取坐标
var sz=0;
function xyz(li,callback){
    if(djx.lower!=undefined){
        var x=/"x" : .*,/,y=/"y" : .*,/,z=/"z" : .*\n/;
        djx.position1.x=parseInt(x.exec(djx.lower)[0].split(" ")[2]);
        djx.position1.y=parseInt(y.exec(djx.lower)[0].split(" ")[2]);
        djx.position1.z=parseInt(z.exec(djx.lower)[0].split(" ")[2]);
        console.log(djx.position1);
        callback();
    };
}

function xyz1(li,callback){
    if(djx.upper!=undefined){
        var x=/"x" : .*,/,y=/"y" : .*,/,z=/"z" : .*\n/;
        djx.position2.x=parseInt(x.exec(djx.upper)[0].split(" ")[2]);
        djx.position2.y=parseInt(y.exec(djx.upper)[0].split(" ")[2]);
        djx.position2.z=parseInt(z.exec(djx.upper)[0].split(" ")[2]);
        console.log(djx.position2);
        callback();
    };
}


//方块探测及生成命令包
function love(li,s,bc){
    //x1是下棱住,x2是上
    var x1=djx.position1.x,y1=djx.position1.y,z1=djx.position1.z;
    var x2=djx.position2.x,y2=djx.position2.y,z2=djx.position2.z;
    return bc();
}

server.on("connection",(li)=>{
    //玩家消息事件
    subscribes("PlayerMessage",li);

    //玩家破坏方块事件BlockBroken
    //subscribes("BlockBroken",li);

    //玩家放置方块事件BlockPlaced
    //subscribes("BlockPlaced",li);

    //玩家移动事件PlayerTransform
    //subscribes("PlayerTransform",li)
   
//会话输入信息发送命令
process.stdin.on("data",(d)=>{
    chats(d,li)
})
    //监听消息传输
    li.on("message",(m)=>{
        var s=JSON.parse(m);
        //判断属于什么事件的返回并且执行一定操作
        //玩家消息
        if(s.body.eventName=="PlayerMessage"&&s.body.properties.MessageType=="chat"&&s.body.properties.Message=="测试"){
           chats("me 大家好",li);
        }
        //玩家破坏方块
        //if(s.body.eventName=="BlockBroken"){console.log(s);chats(`me ${s.body.properties.Block}`,li);}

        //玩家放置方块
        //if(s.body.eventName=="BlockPlaced"){console.log(s);chats(`me 放置`,li);}

         //玩家移动
         //if(s.body.eventName=="PlayerTransform"){console.log(s);chats(`me 移动了`,li);}
         //获取体对角线下棱
         if(s.body.eventName=="PlayerMessage"&&s.body.properties.MessageType=="chat"&&s.body.properties.Message=="getx pos"){
            chats(`querytarget ${s.body.properties.Sender}`,li);
         }
         if(s.body.details!=undefined&&sz===0){
             djx.lower=s.body.details;
             xyz(li,()=>{sz=1});
             console.log("下 :"+s.body.details);
         }
    
         //获取体对角线上棱
         if(s.body.eventName=="PlayerMessage"&&s.body.properties.MessageType=="chat"&&s.body.properties.Message=="gets pos"){
            chats(`querytarget ${s.body.properties.Sender}`,li);
            sz+=2;
         }
         if(s.body.details!=undefined&&sz===3){
            djx.upper=s.body.details;
            xyz1(li,()=>{sz=0;});
            console.log("上:"+s.body.details);
        }

        //发送对角线位置
        if(s.body.eventName=="PlayerMessage"&&s.body.properties.MessageType=="chat"&&s.body.properties.Message=="位置"){
            chats(`me 下:x:${djx.position1.x} y:${djx.position1.y} z:${djx.position1.z} 上:x:${djx.position2.x} y:${djx.position2.y} z:${djx.position2.z}`,li);
         }

         //启动获取方块生成命令
         if(s.body.eventName=="PlayerMessage"&&s.body.properties.MessageType=="chat"&&s.body.properties.Message=="开始"){
            love(li,s);
         }

         if(s.body.matches==true){
            console.log(s);
         }

    })

})
