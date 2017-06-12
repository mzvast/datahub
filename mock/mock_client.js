let PORT = 8512;
let HOST = '127.0.0.1';

let dgram = require('dgram');

const randomBytes = (dig) => {
  return ('0000'+Math.floor(Math.random() *Math.pow(10,dig*2))+'').slice(-2*dig)
}
// console.log(tag.length/2);
const makeTag = () => {
  return (
    /**
     * 固定信息
     */
      'cf1a'//起始码：0x1ACF
    + '0000'//网络接口数据类型
    + '38010000'//从帧有限标记到包尾的字节数
    + '00'.repeat(64)//系统控制信息
    + '00'.repeat(64)//GPS数据
    /**
     * 数据信息
     */
    + '02'//发方节点号
    + '01'//收方节点号
    + '0000'//反馈指令序号
    + '0000'//指令接收状态
    + '0000'//任务编号
    + randomBytes(2)//前端工作温度
    + randomBytes(2)//分机工作温度
    + '00000000'//分机工作状态
    + '00000001'//全脉冲个数统计
    + '00000001'//辐射源数据包统计
    + '00000001'//中频数据统计
    + '00'.repeat(16)//备份
    + '00'.repeat(128)//前端状态反馈
    /**
     * 固定信息
     */
    + '1dfc0000'//包尾
  )}

const makePDW = () => {
  return (
  /**
   * 固定信息
   */
  'cf1a'//起始码：0x1ACF
  + '0100'//网络接口数据类型
  + 'd0000000'//从帧有限标记到包尾的字节数
  + '00'.repeat(64)//系统控制信息
  + '00'.repeat(64)//GPS数据
  /**
   * 数据信息
   */
  + '01000000'//全脉冲个数
  //全脉冲描述字1
  + randomBytes(4)//到达时间 单位：4.46ns
  + randomBytes(4)//脉宽 单位：4.46ns
  + randomBytes(2)//脉冲计数
  + randomBytes(2)//波段码 Mhz
  + randomBytes(2)//前沿频率 0.01Mhz
  + randomBytes(2)//最小频率，当分集信号时，为频率1(单位 0.01MHz)
  + randomBytes(2)//最大频率，当分集信号时，为频率2(单位 0.01MHz)
  + randomBytes(2)//当分集信号时，为频率3(单位 0.01MHz)
  + randomBytes(2)//当分集信号时，为频率4(单位 0.01MHz)
  + '00'//脉冲类型; 【Bit0-1：Bit2-3】：0-脉冲Pdw，1-连续波Pdw,3-分集信号 【Bit4-7】：分集个数
  + '00'//线调标记；0表示递增，1表示递减，2表示混合，3 表示不是线调
  + randomBytes(2)//相位1 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位2 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位3 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位4 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位5 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位6 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位7 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位8 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位9 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位10 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位11 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位12 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位13 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位14 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位15 （单位 0.007度，范围-180~180度）
  + randomBytes(2)//相位16 （单位 0.007度，范围-180~180度）
  + randomBytes(1)//数字幅度1（单位1dB）
  + randomBytes(1)//数字幅度2（单位1dB）
  + randomBytes(1)//数字幅度3（单位1dB）
  + randomBytes(1)//数字幅度4（单位1dB）
  + randomBytes(1)//数字幅度5（单位1dB）
  + randomBytes(1)//数字幅度6（单位1dB）
  + randomBytes(1)//数字幅度7（单位1dB）
  + randomBytes(1)//数字幅度8（单位1dB）
  /**
   * 固定信息
   */
  + '1dfc0000'//包尾
  )}

// console.log(pdw.length/2);

const makeRadiation = ()=>{
  return (
 /**
   * 固定信息
   */
  'cf1a'//起始码：0x1ACF
  + '0500'//网络接口数据类型
  + 'a4010000'//从帧有限标记到包尾的字节数
  + '00'.repeat(64)//系统控制信息
  + '00'.repeat(64)//GPS数据
  /**
   * 数据信息
   */
  + '01000000'//辐射源个数
  //辐射源描述字1
  + '55aa'//起始码
  + '0001'//辐射源序号
  + '00000001'//辐射源首脉冲到达时间
  /**
   * 载频
   */
  + '00'//脉间类型
  + '00'//脉内类型
  + '0001'//个数n
  + '0000'//脉组内脉冲数
  + '0000'//备份
  + randomBytes(4)//RF1
  + randomBytes(4)//RF2
  + randomBytes(4)//RF3
  + randomBytes(4)//RF4
  + randomBytes(4)//RF5
  + randomBytes(4)//RF6
  + randomBytes(4)//RF7
  + randomBytes(4)//RF8,单位0.1MHz
  /**
   * 重频
   */
  + '0000'//类型
  + '0001'//个数m
  + '00000001'//脉组内脉冲数
  + randomBytes(4)//周期PRI1
  + randomBytes(4)//周期PRI2
  + randomBytes(4)//周期PRI3
  + randomBytes(4)//周期PRI4
  + randomBytes(4)//周期PRI5
  + randomBytes(4)//周期PRI6
  + randomBytes(4)//周期PRI7
  + randomBytes(4)//周期PRI8,单位0.1MHz
  /**
   * 脉宽
   */
  + '0000'//类型
  + '0001'//个数l
  + '00000001'//脉组内脉冲数
  + randomBytes(4)//PW1
  + randomBytes(4)//PW2
  + randomBytes(4)//PW3
  + randomBytes(4)//PW4
  + randomBytes(4)//PW5
  + randomBytes(4)//PW6
  + randomBytes(4)//PW7
  + randomBytes(4)//PW8,单位????
  + randomBytes(4)//脉幅(平均)
  /**
   * 位置信息
   */
  + '0001'//方位角1
  + '0001'//仰角1
  + '0001'//方位角2
  + '0001'//仰角2
  + '0001'//方位角3
  + '0001'//仰角3
  + '0001'//方位角4
  + '0001'//仰角4,单位：0.1度
  /**
   * 定位结果
   */
  + '12341234'//位置信息
  /**
   * 脉内调制信息
   */
  + randomBytes(4)//脉内有效标志
  + '12'.repeat(116)//脉内特征信息
  + '00'.repeat(2)//备份码
  + 'aa55'//终止码
  /**
     * 固定信息
     */
    + '1dfc0000'//包尾
  )
}



const packageMessage = (msg)=> {
  let paddingData = Buffer.from('00'.repeat(1000 - msg.length), 'hex');

  let header = Buffer.from([0x55, 0x55]);
  let len = Buffer.allocUnsafe(2);
  len.writeIntLE(msg.length,0,2)
  let source = Buffer.from([0x00, 0x00]);
  let dest = Buffer.from([0x00, 0x00]);
  let idcodePrimary = Buffer.from([0x00, 0x00]);
  let idcodeSecondly = Buffer.from([0x00, 0x00]);
  let serial = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  let frameCount = Buffer.from([0x01, 0x00, 0x00, 0x00]);
  let checkSum = Buffer.from([0x00, 0x00]); // 和检验暂时没搞
  let end = Buffer.from([0xAA, 0xAA]);

  return Buffer.concat([header, len, source, dest, idcodePrimary, idcodeSecondly, serial, frameCount, msg, paddingData, checkSum, end]);
}

/**
 * 把number转成2个字节
 * @param num
 * @returns {[number,number]}
 */
const numberTo2Bytes = (num) => {
  let b = [0, 0];

  for (let i = 0; i < 2; i++) {
    b[i] = num >> 8 * (1 - i) & 0xFF;
  }
  return b;
}

/**
 * 把number转成4个字节
 * @param num
 * @returns {[number,number,number,number]}
 */
const numberTo4Bytes = (num)=> {
  let b = [0, 0, 0, 0];
  b[0] = num >>> 24;
  b[1] = num >>> 16;
  b[2] = num >>> 8;
  b[3] = num;
  return b;
}

/**
 * Client
 */



const doSendTag = () => {
  let hexMsg = makeTag();
  let message = Buffer.from(hexMsg, 'hex');
  let msgToSend = packageMessage(message);
  let client = dgram.createSocket('udp4');
  client.send(msgToSend, 0, msgToSend.length, PORT, HOST, function (err, bytes) {
    if (err) throw err;
    console.log('Tag message sent to ' + HOST + ':' + PORT);
    client.close();
  });
}

const doSendPDW = () => {
  let hexMsg = makePDW();
  let message = Buffer.from(hexMsg, 'hex');
  let msgToSend = packageMessage(message);
  let client = dgram.createSocket('udp4');
  client.send(msgToSend, 0, msgToSend.length, PORT, HOST, function (err, bytes) {
    if (err) throw err;
    console.log('PDW message sent to ' + HOST + ':' + PORT);
    client.close();
  });
}

const doSendRadiation = () => {
  let hexMsg = makeRadiation();
  let message = Buffer.from(hexMsg, 'hex');
  let msgToSend = packageMessage(message);
  let client = dgram.createSocket('udp4');
  client.send(msgToSend, 0, msgToSend.length, PORT, HOST, function (err, bytes) {
    if (err) throw err;
    console.log('Radiation message sent to ' + HOST + ':' + PORT);
    client.close();
  });
}

setInterval(function () {
  doSendTag();
  doSendPDW();
  doSendRadiation();
}, 1500)


