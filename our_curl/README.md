

## preperation
in environmental vars of your default ( such as .bash_profile or .zsh, fish's config )
this script takes uses environmental variables to specify the data.
以下の情報、切り替えの用意性、環境変数使います。

1. OUR_TOKEN
2. OUR_HOST

to set default behaivor, use bash_profile or those configs.

```vi ~.bash_profile
export kernel_dev_host=https://gomphrena-api.optim-test.com
export OUR_HOST=$kernel_dev_host
```

switching them if you need to change it.
or make environmental var files, and source it.
```
source local_proxy_full_set
```
if you are using the local proxy and mock kit, the file local_proxy_full_set is the one to use.
proxy + mockを使っているならば、上記の設定で問題ありません。
check and see [local_proxy_full_set](./local_proxy_full_set) file.
just copy token into it.

```
set OUR_HOST=http://another.host.com
set OUR_TOKEN=86aX34LhMPxqyWveqDe6lqCYB2TYJq4a6HpC6WoPd4du7aYw0fX55dljDEEhodSI2uo9OyQb4xdZFGMCLYX2DJEELrumDobilkavD9yl2NePGCcjv5xbapTH4hU1iHEzClwD5waU4eWn4h5vqSwV7PZkTtlGTYPYxU8mLqxaHlPRICHnREiOvsQyEIfB6AOdPUm2bkZciWNzOovYFeVDGAXp0BG8QQ9jNUsoz5nxJ8JUpJjIURNr6akm38usglrF
```

## 3.make request json files.
see the [context.json](./context.json) as example.

## execution
```
./our_curl.coffee context
```

## jsonFileの作り方 how to create the request json files.
### 1. モデルからコードジェネレーションする

### 2. proxy mockのlogから選ぶ
proxyモックのログのapiコールはそのままこのour_curlで実行可能です。

### 3. postmanから作る

### 4. chromeのdevelopment menuから


## 複雑な使い方
### seedingする
データをまとまって投入したいなどの場合、File群の一覧を作り、これをxargsします。
例えばあるseedingする用のFileを一式いれたフォルダの場合
0.user.json
1.lamdas.json
2.artifact.json
3.operation.json
などを配置しておき、dc_basic_seeding/と命名し
```
ls -v dc_basic_seeding | xargs ./our_curl.coffee
```
で順次実行します。

フォルダにフラットに置かれたFile群をピックアップして実行した場合は、seeding_cloud_os_code.txtなどを作り
```
cat  seeding_cloud_os_code.txt | xargs -I{} ./our_curl.coffee {}
```

### proxy mockからseedingを作って実行
