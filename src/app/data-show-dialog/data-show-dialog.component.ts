import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Inject, Optional } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';
import {ProtocolPack} from '../protocol/protocol-pack';
import {BaseDataPack} from '../protocol/data-pack';
import {Buffer} from 'buffer';

@Component({
  selector: 'app-data-show-dialog',
  templateUrl: './data-show-dialog.component.html',
  styleUrls: ['./data-show-dialog.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})

export class DataShowDialogComponent implements OnInit {

  keyValues: Map<string, string>;
  error: string;

  constructor(@Optional() @Inject(MD_DIALOG_DATA) public data: any) {
    // console.log(data);
    const raw = data.raw;
  }

  parserRaw(raw: string) {
    const workingBuffer = Buffer.from(raw, 'hex');
    const len: number = workingBuffer.readUInt16LE(2, false); // 数据长度
    const source: number = workingBuffer.readUInt16LE(4, false); // 源地址
    const dest: number = workingBuffer.readUInt16LE(6, false); // 目的地址
    const idcodePrimary: number = workingBuffer.readUInt16LE(8, false); // 主识别码
    const idcodeSecondly: number = workingBuffer.readUInt16LE(10, false); // 子识别码
    const serial: number = workingBuffer.readUInt32LE(12, false); // 帧序号
    const frameCount: number = workingBuffer.readUInt32LE(16, false); // 帧包数
    const data = workingBuffer.slice(20, 20 + len); // 数据字段
    const protocolPack = new ProtocolPack(source, dest, idcodePrimary, idcodeSecondly, serial, frameCount, data);
    const dataPack: BaseDataPack = protocolPack.parserDataPack(false); // 解析包数据
  }

  ngOnInit() {
    this.keyValues = new Map();
  }

}
