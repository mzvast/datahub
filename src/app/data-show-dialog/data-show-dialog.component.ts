import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Inject, Optional } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';
import {ProtocolPack} from '../protocol/protocol-pack';
import {Buffer} from 'buffer';
import {
  NarrowBandFullPulseDictionary, NarrowBandFullPulseDataPack, BaseDataPack, TagDataPack,
  NarrowBandSourceDataPack, BaseDictionary, TagDataPackDictionary, NarrowBandRadiationDictionary
} from './../protocol/data-pack';

@Component({
  selector: 'app-data-show-dialog',
  templateUrl: './data-show-dialog.component.html',
  styleUrls: ['./data-show-dialog.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})

export class DataShowDialogComponent implements OnInit {

  items = [];

  constructor(@Optional() @Inject(MD_DIALOG_DATA) public data: any) {
    // console.log(data);
    this.parserRaw(data.raw);
  }

  parserRaw(raw: string) {
    // 数据库里前面的东西没有存，没用，只存了data，所以放一些0
    const protocolPack = new ProtocolPack(0, 0, 0, 0, 0, 1, Buffer.from(raw, 'hex'));
    const dataPack: BaseDataPack = protocolPack.parserDataPack(false); // 解析包数据
    console.log(`data pack parser ok, type: ${dataPack.type}`);

    switch (dataPack.type) {
      case 0:
        this.parserTagDataPack(dataPack);
        break;
      case 1:
        this.parserNarrowBandFullPulseDataPack(dataPack);
        break;
      case 5:
        this.parserNarrowBandSourceDataPack(dataPack);
        break;
    }

  }

  parserNarrowBandSourceDataPack(baseDataPack: BaseDataPack) {
    const pack: NarrowBandSourceDataPack = baseDataPack as NarrowBandSourceDataPack;
    // console.log(`pack data: ${pack.datas[0]}`);
    const message = pack.parserDescription(pack.datas[0]);
    this.setItems(message, new NarrowBandRadiationDictionary());
  }

  parserTagDataPack(baseDataPack: BaseDataPack) {
    const pack: TagDataPack = baseDataPack as TagDataPack;
    // console.log(`pack data: ${pack.datas[0]}`);
    const message = pack.parserDescription(pack.datas[0]);
    this.items = pack.parserDescriptionLocalized(message);
  }

  parserNarrowBandFullPulseDataPack(baseDataPack: BaseDataPack) {
    const pack: NarrowBandFullPulseDataPack = baseDataPack as NarrowBandFullPulseDataPack;
    // console.log(`pack data: ${pack.datas[0]}`);
    const message = pack.parserDescription(pack.datas[0]);
    this.items = pack.parserDescriptionLocalized(message);
  }

  setItems(message: Object, dictionary: BaseDictionary): void {
    const keys = Object.keys(dictionary); // 控制显示的字段
    this.items = keys.map((curVal, index, arr) => {
      // console.log(`key: ${dictionary[curVal]}, value: ${message[curVal]}`);
      const obj = {};
      obj['name'] = dictionary[curVal];
      obj['value'] = message[curVal];
      return obj;
    });
  }

  ngOnInit() { }

}
