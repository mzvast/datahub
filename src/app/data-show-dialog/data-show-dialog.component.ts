import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  ViewEncapsulation
} from '@angular/core';
import {MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {ProtocolPack} from '../protocol/protocol-pack';
import {Buffer} from 'buffer';
import {
  BaseDataPack,
  NarrowBandFullPulseDataPack,
  NarrowBandSourceDataPack,
  TagDataPack
} from './../protocol/data-pack';

@Component({
  selector: 'app-data-show-dialog',
  templateUrl: './data-show-dialog.component.html',
  styleUrls: ['./data-show-dialog.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})

export class DataShowDialogComponent implements OnInit, OnDestroy {

  items = [];
  dataPack: BaseDataPack;
  raw: string;

  constructor(@Optional() @Inject(MD_DIALOG_DATA) public data: any, private snackBar: MdSnackBar) {
    // console.log(data);
    if (data.type === 'pkg') {
      this.raw = data.raw;
    } else {
      this.parserRaw(data.remote_host, data.raw, data.protoId, data.proto);
    }

  }

  parserRaw(host: string, raw: string, protoId: number, proto: JSON) {
    // 数据库里前面的东西没有存，没用，只存了data，所以放一些0
    const protocolPack = new ProtocolPack(host, 0, 0, 0, 0, 0, 1, Buffer.from(raw, 'hex'));
    this.dataPack = protocolPack.parserDataPack(false); // 解析包数据
    this.dataPack.proto = proto;
    this.dataPack.protoId = protoId;
    console.log(`data pack parser ok, type: ${this.dataPack.type}, protoId: ${protoId}`);
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
    this.items = pack.parseItems(pack.datas[0]);
  }

  parserTagDataPack(baseDataPack: BaseDataPack) {
    const pack: TagDataPack = baseDataPack as TagDataPack;
    // console.log(`pack data: ${pack.datas[0]}`);
    this.items = pack.parseItems(pack.data);
  }

  parserNarrowBandFullPulseDataPack(baseDataPack: BaseDataPack) {
    const pack: NarrowBandFullPulseDataPack = baseDataPack as NarrowBandFullPulseDataPack;
    // console.log(`pack data: ${pack.datas[0]}`);
    this.items = pack.parseItems(pack.datas[0]);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.items = [];
    this.dataPack = null;
  }

  valueCopied(value) {
    if (!value) {
      return;
    }
    if (value.length > 64) {
      value = value.substr(0, 64) + '...';
    }
    this.showToast('已复制: ' + value);
  }

  showToast(message: string) {
    const config = new MdSnackBarConfig();
    config.duration = 5000;
    this.snackBar.open(message, null, config);
  }
}
