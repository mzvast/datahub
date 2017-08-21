// TODO 每次修改代码给他们的时候，修改这里，可以让用户知道是不是时候用了新版
export const codeVersion = 'V20170816-1';
// 当前自定义协议里的PROTOCOL_ID
export let IN_USE_PROTOCOL_ID_TYPE0 = 0; // 标签包
export let IN_USE_PROTOCOL_ID_TYPE1 = 0; // 窄带全脉冲数据包
export let IN_USE_PROTOCOL_ID_TYPE5 = 0; // 窄带辐射源数据包
// 当前自定义协议里的PROTOCOL
export let IN_USE_PROTOCOL_TYPE0: JSON;
export let IN_USE_PROTOCOL_TYPE1: JSON;
export let IN_USE_PROTOCOL_TYPE5: JSON;

export class Page {
  size = 0;
  totalElements = 0;
  totalPages = 0;
  pageNumber = 0;
}

/**
 * 检测是否有效的协议，返回协议一共用了多少字节，如果协议有问题，返回-1
 */
export function validateProtocol(json: JSON) {
  const result = {result: false, message: '', bytes: 0};
  let bytes = 0;
  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      const item = json[key];
      const idx = parseInt(key, 10) + 1;
      // console.log(`idx:${idx}`);
      if (!item.hasOwnProperty('name')) {
        result.message = '协议检测错误，第' + idx + '项缺少名称（name）';
        return result;
      }
      if (!item.hasOwnProperty('bytes')) {
        result.message = '协议检测错误，第' + idx + '项缺少字节数（bytes）';
        return result;
      }
      if (!item.hasOwnProperty('type')) {
        result.message = '协议检测错误，第' + idx + '项缺少类型（type）';
        return result;
      }
      const b = item['bytes'];
      if (typeof b !== 'number') {
        result.message = '协议检测错误，第' + idx + '项字节数（bytes）必须是number';
        return result;
      }
      if (b <= 0) {
        result.message = '协议检测错误，第' + idx + '项字节数（bytes）不能为: ' + b;
        return result;
      }
      const type = item['type'];
      if (type !== 'number' && type !== 'flag' && type !== 'string') {
        result.message = '协议检测错误，第' + idx + '项类型（type）不能为: ' + type;
        return result;
      }
      if (type === 'number' || type === 'flag') {
        if (b > 4) {
          result.message = '协议检测错误，第' + idx + '项字节数（bytes）不能大于: ' + b;
          return result;
        }
      }
      if (type === 'number') {
        if (item.hasOwnProperty('enum')) {
          // 这里暂时不检查了
        } else {
          if (!item.hasOwnProperty('multiple')) {
            result.message = '协议检测错误，第' + idx + '项缺少倍数（multiple）';
            return result;
          }
          const multiple = item['multiple'];
          if (typeof multiple !== 'number') {
            result.message = '协议检测错误，第' + idx + '项倍数（multiple）必须是number';
            return result;
          }
        }
      }
      bytes = bytes + b;
    }
  }
  if (bytes <= 0) {
    result.message = '协议检测错误，总字节数不能为: ' + bytes;
    return result;
  }
  // console.log(`json length:${json.length}`);
  result.result = true;
  result.bytes = bytes;
  return result;
}
