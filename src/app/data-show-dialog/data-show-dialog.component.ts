import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Inject, Optional } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';
import {ProtocolPack} from '../protocol/protocol-pack';
import {Buffer} from 'buffer';
import {
  NarrowBandFullPulseDataPack, BaseDataPack, TagDataPack,
  NarrowBandSourceDataPack
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
  dataPack: BaseDataPack;

  constructor(@Optional() @Inject(MD_DIALOG_DATA) public data: any) {
    // console.log(data);
    this.parserRaw(data.raw);
  }

  parserRaw(raw: string) {
    // 数据库里前面的东西没有存，没用，只存了data，所以放一些0
    const protocolPack = new ProtocolPack(0, 0, 0, 0, 0, 1, Buffer.from(raw, 'hex'));
    this.dataPack = protocolPack.parserDataPack(false); // 解析包数据
    console.log(`data pack parser ok, type: ${this.dataPack.type}`);
    if (this.dataPack) {
      const gps = this.dataPack.gps;
      this.dataPack.gps = [gps.slice(0, 64), gps.slice(64)].join('\n');
      const control = this.dataPack.control;
      this.dataPack.control = [control.slice(0, 64), control.slice(64)].join('\n');
      switch (this.dataPack.type) {
        case 0:
          this.parserTagDataPack(this.dataPack);
          break;
        case 1:
          this.parserNarrowBandFullPulseDataPack(this.dataPack);
          break;
        case 5:
          this.parserNarrowBandSourceDataPack(this.dataPack);
          break;
      }
    }

  }

  parserNarrowBandSourceDataPack(baseDataPack: BaseDataPack) {
    const pack: NarrowBandSourceDataPack = baseDataPack as NarrowBandSourceDataPack;
    // console.log(`pack data: ${pack.datas[0]}`);
    const message = pack.parserDescription(pack.datas[0]);
    this.items = pack.parserDescriptionLocalized(message);
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

  ngOnInit() { }

}
