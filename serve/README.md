
# installation
以下、最初（インストール時）のみ実行が必要。
```
npm install -g coffee-script
npm install -g shelljs

sudo vi  /private/etc/hosts
## 以下の行を追加 : "127.0.0.1  registry.local"
## windowsではsystem以下のetc/hosts
```

# 使い方
frontend のアプリのフォルダに移動して、コマンドライン（terminalやmingw、コマンドプロンプト）にて
```
./serve
```

２つのフロントアプリを起動したいときは
```
docker run -p そのport:8081 -itd registry.local:5050/serverskelton
```
# 更新
最新版は常に自動的にアップデートされます。最新を利用する場合は配布は不要です。
(これは、docker-compose.ymlにて指定された各コンポーネントのdocker imageの:latestタグが付いたものが利用されます。)
imageを更新する人は、docker pushで行って下さい。

# mock/proxy mockなどの挙動の切り替え
mock, proxyの挙動、loggingを、latest以外のものを用いたい場合、docker-composeにて、利用したいイメージに書き換えるか、
```
docker run それ
```
を起動してください。


# 必要なファイル
./serveは現在5つの機能（server skelton、mock、proxy、logger、replayer）を持っていますが、単体として利用可能です。./serverやdocker-composeはこの全機能を同時に起動するためのもので、server skeltonなどを単体利用する場合は不要です。

# server skeltonに必要なファイル
server skeltonのバイナリやsrcはdocker imageに梱包されているため、不要です。gb でのビルド、パッケージのダウンロードは不要です。server skeltonの実行はdocker run コマンドのみが必要で、configで挙動を指定したい場合はconfig.jsonを配置してください。詳細は serverskelton/README.md を参照のこと。
