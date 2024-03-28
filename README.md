# 餐廳論壇

## 功能

### 後台

- 具備權限的管理者可以進入網站後台進行操作。
- 管理者可以在後台新增、修改、刪除餐廳資料。
- 管理者可以在後台修改使用者的權限。

### 環境要求

- Node.js v14
- MySQL v8

## 安裝

1. clone 本專案後 cd 至專案資料夾，並執行以下命令安裝相關套件。

```
npm install
```

2. 至 `config/config.json` 檔案調整資料庫設定，並執行以下命令進行資料庫環境建置。

```
npm run db:setup
```

3. 創建環境變數檔案，命名方式為 .env.{{當前環境}} 。

- 若是創建 development 環境變數檔，可使用以下命令：

```
npm run env-dev:create
```

- 參考下方格式調整環境變數：

```
# session config
SESSION_SECRET={{YOUR_SESSION_SECRET}}
SESSION_RE_SAVE=false
SESSION_SAVE_UNINITIALIZED=false

ROOT_ADMIN_EMAIL="root@example.com"
```

4. 設置環境變數 NODE_ENV={{當前環境}}，並使用以下命令來執行本專案。

```
npm run start
```

5. 啟動伺服器後，開啟瀏覽器連線至網頁 http://localhost:3000 。

```
可使用以下兩組帳號密碼進行登入

- 帳號：root@example.com / 密碼：12345678
- 帳號：user1@example.com / 密碼：12345678
```
