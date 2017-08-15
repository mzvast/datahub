export class MySettings {
  local_port: number; // 本地端口号
  local_host: string;
  remote_port: number;
  remote_host: string;
  debug: boolean; // 调试模式
  record: boolean; // 数据记录
  intf: string; // 中频设置json字符串
  other: string; // 其他设置json字符串，以后多增加的设置放这里，不然增加字段比较麻烦
}
