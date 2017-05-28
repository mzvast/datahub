var PORT = 8511;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var tag =
            /**
             * 固定信息
             */
            '1acf'//起始码：0x1ACF
            +'0000'//网络接口数据类型
            +'00000138'//从帧有限标记到包尾的字节数
            +'00'.repeat(64)//系统控制信息
            +'00'.repeat(64)//GPS数据
            /**
             * 数据信息
             */
            +'02'//发方节点号
            +'01'//收方节点号
            +'0000'//反馈指令序号
            +'0000'//指令接收状态
            +'0000'//任务编号
            +'1900'//前端工作温度
            +'1800'//分机工作温度
            +'00000000'//分机工作状态
            +'00000001'//全脉冲个数统计
            +'00000001'//辐射源数据包统计
            +'00000001'//中频数据统计
            +'00'.repeat(16)//备份
            +'00'.repeat(128)//前端状态反馈
            /**
             * 固定信息
             */
            +'0000fc1d'//包尾
            ;
// console.log(tag.length/2);

var pdw =
            /**
             * 固定信息
             */
            '1acf'//起始码：0x1ACF
            +'0002'//网络接口数据类型
            +'00000138'//从帧有限标记到包尾的字节数
            +'00'.repeat(64)//系统控制信息
            +'00'.repeat(64)//GPS数据
            /**
             * 数据信息
             */
            +'00000001'//全脉冲个数
            //全脉冲描述字1
            +'00000001'//到达时间 单位：32ns
            +'00000001'//脉宽 单位：32ns
            +'0901'//引导中心频率 单位：MHz
            +'00'//备份
            +'00'//粗测频个数/  粗测频类型 BIT0-3：≤3 BIT4-7：0-常规；1-分集；2-调频
            +'00'.repeat(4)//粗测中频1-4 单位:15.625MHz,当类型为2时，第一个字节表示中心频率，第二个字节表示带宽
            +'0100'//数字幅度 单位：1dB
            +'22'//DLVA幅度 单位：1dB
            +'00'//备份
            +'00002233'//精测中频
            +'00'.repeat(4)//备份
            +'00'.repeat(32)//备份
            /**
             * 固定信息
             */
            +'0000fc1d'//包尾
            ;

// console.log(pdw.length/2);

var radiation =
            /**
             * 固定信息
             */
            '1acf'//起始码：0x1ACF
            +'0003'//网络接口数据类型
            +'00000138'//从帧有限标记到包尾的字节数
            +'00'.repeat(64)//系统控制信息
            +'00'.repeat(64)//GPS数据
            /**
             * 数据信息
             */
            +'00000001'//辐射源个数
            //辐射源描述字1
            +'0001'//辐射源序号
            +'00000001'//辐射源首脉冲到达时间
            /**
             * 载频
             */
            +'00'//脉间类型
            +'00'//脉内类型
            +'0001'//个数n
            +'0000'//脉组内脉冲数
            +'0000'//备份
            +'00'.repeat(4)//RF1
            +'00'.repeat(4)//RF2
            +'00'.repeat(4)//RF3
            +'00'.repeat(4)//RF4
            +'00'.repeat(4)//RF5
            +'00'.repeat(4)//RF6
            +'00'.repeat(4)//RF7
            +'00'.repeat(4)//RF8,单位0.1MHz
            /**
             * 重频
             */
            +'0000'//类型
            +'0001'//个数m
            +'00000001'//脉组内脉冲数
            +'00'.repeat(4)//周期PRI1
            +'00'.repeat(4)//周期PRI2
            +'00'.repeat(4)//周期PRI3
            +'00'.repeat(4)//周期PRI4
            +'00'.repeat(4)//周期PRI5
            +'00'.repeat(4)//周期PRI6
            +'00'.repeat(4)//周期PRI7
            +'00'.repeat(4)//周期PRI8,单位0.1MHz
            /**
             * 脉宽
             */
            +'0000'//类型
            +'0001'//个数l
            +'00000001'//脉组内脉冲数
            +'00'.repeat(4)//PW1
            +'00'.repeat(4)//PW2
            +'00'.repeat(4)//PW3
            +'00'.repeat(4)//PW4
            +'00'.repeat(4)//PW5
            +'00'.repeat(4)//PW6
            +'00'.repeat(4)//PW7
            +'00'.repeat(4)//PW8,单位????
            +'00'.repeat(4)//脉幅(平均)
            /**
             * 位置信息
             */
            +'0001'//方位角1
            +'0001'//仰角1
            +'0001'//方位角2
            +'0001'//仰角2
            +'0001'//方位角3
            +'0001'//仰角3
            +'0001'//方位角4
            +'0001'//仰角4,单位：0.1度
            /**
             * 定位结果
             */
            +'12341234'//位置信息
            /**
             * 脉内调制信息
             */
            +'23'.repeat(4)//脉内有效标志
            +'12'.repeat(116)//脉内特征信息
            +'00'.repeat(2)//备份码
            +'aa55'//终止码

            ;

// console.log(radiation.length/2);

var message = Buffer.from(tag, 'hex');

function packageMessage(msg) {
  var paddingData = Buffer.from('00'.repeat(1000-msg.length), 'hex');

  var header = Buffer.from([0x55, 0x55]);
  var len = Buffer.from(numberTo2Bytes(msg.length));
  // console.log("msg length(2): "+len.toString('hex'));
  // var len2 = Buffer.from(numberTo4Bytes(msg.length));
  // console.log("msg length(4): "+len2.toString('hex'));
  var source = Buffer.from([0x00, 0x00]);
  var dest = Buffer.from([0x00, 0x00]);
  var idcodePrimary = Buffer.from([0x00, 0x00]);
  var idcodeSecondly = Buffer.from([0x00, 0x00]);
  var serial = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  var frameCount = Buffer.from([0x00, 0x00, 0x00, 0x01]);
  var checkSum = Buffer.from([0x00, 0x00]); // 和检验暂时没搞
  var end = Buffer.from([0xAA, 0xAA]);

  return Buffer.concat([header, len,source,dest,idcodePrimary, idcodeSecondly, serial, frameCount, msg, paddingData, checkSum, end]);
}

/**
 * 把number转成2个字节
 * @param num
 * @returns {[number,number]}
 */
function numberTo2Bytes(num) {
  var b = [0,0];

  for (var i=0; i<2; i++) {
    b[i] =  num >> 8 * (1 - i) & 0xFF;
  }
  return b;
}

/**
 * 把number转成4个字节
 * @param num
 * @returns {[number,number,number,number]}
 */
function numberTo4Bytes(num) {
  var b = [0,0,0,0];
  b[0] = num >>> 24;
  b[1] = num >>> 16;
  b[2] = num >>> 8;
  b[3] = num;
  return b;
}

/**
 * Client
 */
var client = dgram.createSocket('udp4');

var msgToSend = packageMessage(message);

client.send(msgToSend, 0, msgToSend.length, PORT, HOST, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + HOST +':'+ PORT);
    client.close();
});
