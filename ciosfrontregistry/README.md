
# setup
registryのサーバーになるマシーンにて
```
docker run  -itd -p 5050:5000 registry
```
ポートに注意！5050を使います。


## 使い方
このregistryから特定のコンテナー（e.g.: our_full_mock など) をpullしたい場合は
```
docker pull registry.local:5050/our_full_mock
```



# run
## 一式を起動したい場合
```
./serve
```
内部的には docker-compose して、proxy,registry proxy, mock serverたちなど一式を起動する。


### 内部実装説明

proxy（nginx）にregistryへのIPアドレス（registyrのサーバーがたってるパソコン）が書いてあります。localhost/proxyにregistoryとしてアクセスすれば、これが実際には共有のregistryです。

※ dnsを書き換えるのは色々問題がありそうなのでこうなっています。
