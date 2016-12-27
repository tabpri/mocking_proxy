# i18n Components

## Example

#### リソースの利用

/static/locales/en.json

```js
{
  "ok": "OK"
}
```

/static/locales/ja.json

```js
{
  "ok": "決定"
}
```

index.html

```html
<link rel="import" href="i18n-data.html">

...

<i18n-data value="{{resource}}"></i18n-data>
<button>{{resource.ok}}</button>
```

#### フォーマットの利用

/static/locales/ja.json

```js
{
  "message": "{timestamp, date, short}には{num}件のデータがあります"
}
```

index.html

```html
<link rel="import" href="i18n-data.html">
<link rel="import" href="localize-behavior.html">

...

<i18n-data value="{{R}}"></i18n-data>
<div class="message">{{localize(R.message, 'timestamp', data.timestamp, 'num', data.num)}}</div>

...

Polymer({
  is: 'hoge-app',
  behaviors: [LocalizeBehavior],
  ...
```

書式については[app-localize-behavior](https://elements.polymer-project.org/elements/app-localize-behavior)、 [Format.js](http://formatjs.io/guides/message-syntax/)を参照

#### オブジェクトの多言語対応

index.html

```html
<link rel="import" href="localize-behavior.html">

...

<div class="name">{{localize(thing, 'name')}}</div>
<div class="description">{{localize(thing, 'description')}}</div>

...

Polymer({
  is: 'thing-view',
  behaviors: [LocalizeBehavior],
  ...
```
