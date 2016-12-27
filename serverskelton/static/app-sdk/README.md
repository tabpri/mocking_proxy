# AppSDK

- 各Webアプリで利用する共通ライブラリ
- デスクトップ連携、API通信、エクステンションのインポートを提供
- apiの実装にFetch APIを使用
- その為、[Fetch API](https://github.com/github/fetch)と[Promise](https://github.com/jakearchibald/es6-promise)のpolyfillを使用

## Example

#### 初期化

HTML Importsで読み込む

```html
<link rel="import" href="app-sdk.html">
```

設定オブジェクトかAPIのアクセストークンを与えて初期化する  
初期化は1度しか行えません

```js
fetch('/oauth2/token', {credentials:'include'}).then(function(res) {
  return res.text();
}).then(function(token) {

  CIOS.init(token);

  // CIOS.init({
  //   api: {
  //     token: token
  //   }
  // });
});
```

設定オブジェクト

```js
{
  // APIデフォルト設定。詳細は後述
  api: {},

  // 組み込みエクステンションのURLリスト
  extensionUrls: []
}
```

#### デスクトップ連携

新規にアプリを開く

```js
CIOS.open('XXXXXXXXXXX'); // App ID
```

iframeで新規にアプリを開く

```js
CIOS.open({
  id: 'XXXXXXXXXXX',
  iframe: true
}).then(function(e) {
  e.iframe; // iframeオブジェクト
});
```

#### API通信

使用するAPIオブジェクトを作成する  
`CIOS.api`にデフォルト設定で作成されているオブジェクトもあるのでそちらを使用してもよい

```js
var api = new CIOS.API({
  // APIデフォルト設定。後述のCONFIG同様
});
```

api.METHOD(URL, [CONFIG])

```js
api.get('/things', {
  params: {
    top: 100,
  }
}).then(function(data) {
  console.log(data);
});

api.get('/things/:id', {
  params: {
    id: 123456,
  }
}).then(function(data) {
  console.log(data);
});

api.patch('/things/:id', {
  params: {
    id: 123456,
  },
  body: {
    name: 'test',
    description: 'hoge'
  }
}).then(function(data) {
  console.log(data);
});
```

`CONFIG`の内容は、基本的にFetch API同様。以下はその他項目  
また、指定されなかった項目は、API作成時の設定、SDK初期化時のAPI設定の順に走査、利用される

```js
{
  // 接続先オリジン
  origin: '',

  // バージョニング文字列。空文字で省略される
  version: 'v1',

  // 基底URL。指定されるとorigin, versionは無視される
  baseUrl: '',

  // レスポンスの形式
  responseType: 'json',

  // websocket時のデータ形式
  binaryType: 'blob',

  // パラメータ。url内に変数展開され、余りはクエリパラメータとして付与される
  params: {},

  // アクセストークン
  token: ''
}
```

api.websocket(URL, [CONFIG])

```js
var ws = api.websocket('/messaging', {
  params: {
    id: 123456,
  }
});

ws.on('message', function(data) {
  console.log(data);
  ws.close();  // code,reasonの指定も可
});

ws.on('close', function(e) {
  console.log(e.code);
});

ws.send('test'); // open後に送られる

```



#### エクステンション

購入済みエクステンションのインポート自体は自動で行われる  
またエクステンションはルートにmanifest.jsonを持ち、記述された設定は`CIOS.extensions`のPromiseにて取得する

エクステンション側 manifest.json

```json
{
  "index": "index.html"
  "contents": {
    "sidePanel": {
      "tagName": "analyze-panel",
    },
    "toolbarItem": {
      "type": "toggle",
      "icon": "icon.png"
    }
  }
}
```

- `index`: インポートする際のファイル名

エクステンション側 index.html

```html
<link rel="import" href="analyze-panel.html">
```

エクステンション側 analyze-panel.html

```html
<link rel="import" href="https://polygit.org/components/polymer/polymer.html">
<dom-module id="analyze-panel">
  ...
</dom-module>
<script>
  Polymer({
    is: 'analyze-panel',
     ...
  })
</script>
```

アプリ側

```js
app.extensions.then(function(items) {

  console.log(items);
  // =>
  // [{
  //   "id": "XXXXXXXXXXXXXXXXXXXX",
  //   "name": "analyze-panel",
  //   "index": "index.html"
  //   "contents": {
  //     "sidePanel": {
  //       "tagName": "analyze-panel",
  //     },
  //     "toolbarItem": {
  //       "type": "toggle",
  //       "icon": "icon.png"
  //     }
  //   }
  // }]
});

```

アプリ内にエクステンションを配置しておく場合

```js
CIOS.init({
  api: {
    token: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'    // アクセストークン
  },
  extensionUrls: ['/extensions/hoge/']             // manifest.jsonが格納されているURL
});
```
