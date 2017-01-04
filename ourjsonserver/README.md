# build
docker build . -t registry.local:5050/ourjsonserver

# 実行 ( run  )
docker run -itd -p 3000:3000 registry.local:5050/ourjsonserver
