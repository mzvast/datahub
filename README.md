
![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/github/mzvast/datahub?branch=master&retina=true)
# 开发

确保机子装有NodeJS v6.9.0以上和[Angular CLI](https://github.com/angular/angular-cli)

由于要通过node-gyp将sqlite3编译到electron平台，需要确保装有相关build工具，详见[node-gyp](https://github.com/nodejs/node-gyp)。

主要命令如下，更多参见package.json
- `npm start` 启动开发服务器（Angular2）
- `npm run electron` 启动Electron
- `npm run mock` 启动mock服务
- `npm run replay` 回放已记录的数据库文件（确保安装了java,数据库文件位置./mock/dev_db.sqlite）

---以下为Angular CLI自动生成---

# Datahub

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
