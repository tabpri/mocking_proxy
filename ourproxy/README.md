## installation
```
git clone このレポジトリ
```
* デフォルト設定でいいなら上記のインストールも不要です。
* 前提:docker cloud_os_front_registryの名前が引ける設定

## run

1. proxyのみ単体で実行
```(run.shが下記と同じ内容)
docker run -itd -p 80:80 cloud_os_front_registry/our_proxy
docker run -itd -p 80:80 our_proxy
```
curl localhost/kernel/context などで開発サーバ（https://gomphrena-api.optim-test.com/context など）がアクセスされるようになります。

2. proxyとmockとなどをまとめて実行
[proxy_mock_recorder_docker_compose](proxy_mock_recorder_docker_composeのREADMEを見てください。)


### proxyに属する機能
1. api Requestの再生可能形式ロギング（ピックアップしてリプレイが可能）
2. http -> https変換（proxyに至るまでの処理をhttpにでき、charlsやfiddlerなどデバッギングプロキシで中身を確認できる）
3. Routing
  バックエンドが用意されていないエンドポイントだけをmockに振り向けたりできる

### 復数のdocker imagesの切り替え方
誰か:
1. proxy.confを変更
2. docker build .
3. docker tag そのイメージ and docker push
メンバー:
1. docker run そのイメージ

#### ユースケース：
バックエンドの開発状況に問題あり、試験できないとき：
フロントエンド開発チームなどで共通的に依存するapiの準備状況に応じてdocker imageを作る。
誰かがproxy/mockのルールのバージョン設定を作り、 → "docker run そのimage" で他のメンバーがプロキシで用いる。


#### 手元で復数のmock/proxyを切り替える：
1. docker stop そのプロキシ
2. docker start 別の設定のプロキシ
あるいは復数のポートでプロキシーごと起動しておき、アプリで切り替える




## Build
```
docker build . -t registry.local:5050/ourproxy
```
