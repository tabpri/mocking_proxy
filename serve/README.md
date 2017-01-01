
# installation
```
npm install -g coffee-script
npm install -g shelljs

sudo vi  /private/etc/hosts
## 以下の行を追加 : "127.0.0.1  registry.local"
## windowsではsystem以下のetc/hosts
```

# 使い方
frontend のアプリにて./serveする

２つのフロントアプリを起動したいときは
```
docker run -p そのport:8081 -itd registry.local:5050/serverskelton
```
