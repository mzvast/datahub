/**
 * Created by Terry on 2017-5-26.
 */

/**
 * 数据基类
 */
export class BaseDataPack {
  // private head = 0x1ACF; // 帧有效标记2
  // private type; // 数据类型 2
  // private len: number; // 数据长度 4
  control: string; // 系统控制信息64，没说具体是什么，方便存储，用string，转成string hex
  gps: string; // GPS数据4，没说具体是什么，方便存储，用string，转成string hex

  // 接下来数据信息
  // 固定信息
  // private end: number; // 包尾4, 0x0000FC1D
}

/**
 * 标签包 312字节
 */
export class TagDataPack extends BaseDataPack {
  sourceNodeNo: number; // 发方节点号1
  destNodeNo: number; // 收方节点号1
  feedbackCommandNo: number; // 反馈指令序号2
  commandReceiveStatus0: number; // 指令接收状态1 0 指令接收正常；1指令接收出现丢帧；
  commandReceiveStatus1: number; // 指令接收状态1 0 指令解析正常；1 指令解析异常
  taskNo: number; // 任务编号2
  frontWorkTemp: number; // 前端工作温度2
  extWorkTemp: number; // 分机工作温度2
  extWorkStatus0: number; // 分机工作状态1 信道化组件状态 0：正常，1：不正常 TODO 我觉得应该是2字节 文档写4字节
  extWorkStatus1: number; // 分机工作状态1 信号分选组件状态 0：正常，1：不正常
  fullPulseCount: number; // 全脉冲个数统计4
  radiationSourceCount: number; // 辐射源数据包统计4
  ifDataLen: number; // 中频数据统计4
  backup: string; // 备份16
  frontStatusFeedback: string; // 前端状态反馈128,没说具体是什么，方便存储，用string

  description() {
    return '[tag data pack] sourceNodeNo: ${sourceNodeNo}, destNodeNo: ${destNodeNo}, feedbackCommandNo: ${feedbackCommandNo}';
  }
}

/**
 * 啥？
 */
export class PdwDataPack extends BaseDataPack {
}

/**
 * 啥？
 */
export class RadiationDataPack extends BaseDataPack {
}
