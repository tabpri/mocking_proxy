# Code front

## Getting Started

1. このリポジトリをクローンする
```
 $ git clone http://gitbucket.tokyo.optim.co.jp/gitbucket/git/cloud_os_apps/cloud_os_code_front_end.git
```

2. Server Skelton for OAuth2.0 Clientをビルドする
フロントのappをローカルで実行する場合に必要。これを実行するとlocalhost:port番号でアクセスできる

3. bowerを使ってフロントで使用しているライブラリのインストール
```
# at project root
 $ bower install
```

4. Server Skelton for OAuth2.0 Clientを実行

    - unix
```
# at project root
 $ ./bin/main -server
```
    - windows
```
# at project root
 $ bin/main server
```

5. アクセス
localhost:8081

# Server Skelton for OAuth2.0 Client

## Getting Started

0. 前提
    * [gb](https://github.com/constabulary/gb)が入っていること
    * ```go get github.com/constabulary/gb/...```

1. Build (if necesarry)

        # at project root
        gb vendor restore
        gb build all

2. Setup

        # at project root
        bin/main init

    - staticディレクトリがなければ作成される
    - pagesディレクトリがなけでば作成される
    - config.jsonがなければ作成される

3.  Run
        # at project root
        bin/main server

※windowsの場合、bin/main -server

## Configuration

    # config.json
    {
        "authz_endpoint": "http://localhost:8080/oauth2/authorize",
        "client_id": "client",
        "oauth_state": "dummy",
        "port": "8081",
        "redirect_url": "http://localhost:8081/oauth2/callback",
        "session_name": "4l2v9z3l",
        "token_endpoint": "http://localhost:8080/oauth2/token",
        "logout_endpoint": "http://localhost:8080/logout",
        "postlogout_url": "http://optim.co.jp"
    }


- **authz_endpoint** OAuth2.0 Providerの認可エンドポイント
- **token_endpoint** OAuth2.0 Providerのトークンエンドポイント
- **logout_endpoint** ログアウトエンドポイント
- **client_id** OAuth2.0のクライアントを特定するクライアントID
- **oauth_state** OAuth2.0の認可フローの中で用いるステート
- **redirect_url** OAuth2.0の認可フローの中で用いるリダイレクトURL(◯◯/oauth2/callback)
- **post** 本サーバが待ち受けるポート番号
- **session_name** 本サーバが認証機能を提供する際に利用するセッションの名前(クッキーのパラメータ名となる)
- **postlogout_url**  ログアウトし、セッションを破棄した後のアクセス先URL

## APIs

- __/oauth2/callback__ (GET)

    - OAuth2.0の認可コードフローにおけるリダイレクト先API
    - config.jsonでは、/oauth2/callbackを固定として、インターネットからアクセスできるドメイン等を指定する

- __/oauth2/token__ (GET)
    - 既にOAuth2.0の認可フローで認証・認可済みのセッションが保有するアクセストークンを返す
        - アクセストークンの見返し、リフレッシュトークンは返さない
        - リフレッシュトークンはサーバが保持し、適宜更新を行う(TODO)

- __/logout__ (GET)
    - OAuth2.0での認証・認可済みセッションを破棄、つまり本サーバからログアウトする
    - ログアウト後は、postlogout_urlで指定したURLにリダイレクトされる

- __/static/*__ (GET)
    - staticディレクトリ以下のHTML、CSS、JSなどの、認証を掛けない静的ファイルをホスティングする
    - css、jsライブラリを始め、画像やWebComponentのエレメントなHTMLをホストするために使用する

- __/*__ (GET)
    - パスは上記で指定されたもの以外とする
    - pagesディレクトリ以下に存在するHTMLをスキャンし、pagesディレクトリからの相対パスで各HTMLをホスティングする
    - index.htmlの場合、ファイル名を除くパスを用いる

## TODO

- oauth echo実装
- エラーハンドリングの実装
