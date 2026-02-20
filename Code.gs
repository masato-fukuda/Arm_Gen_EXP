/**
 * クライアントからの POST リクエストを受け取り、
 * スプレッドシートに追記する関数
 */
function doPost(e) {
  try {
    // 連携しているスプレッドシートのアクティブシートを取得
    // ※Standalone Scriptの場合は、openById等で指定してください
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 最初の行になにもなければヘッダーを作成
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["タイムスタンプ", "メインフォルダ", "動画パス", "評価1(内容合致)", "評価2(自然さ)"]);
    }

    // フロントエンドから 'text/plain' で送信された body (JSON文字列) を取得してパース
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received");
    }
    const payload = JSON.parse(e.postData.contents);

    const mainFolder = payload.mainFolder;
    const results = payload.results;
    const timestamp = new Date();

    // 一括でスプレッドシートに書き込むための2次元配列を作成
    const rows = [];
    
    // 各動画の評価結果を1行ずつのデータに展開
    results.forEach(function(result) {
      rows.push([
        timestamp,
        mainFolder,
        result.videoPath,
        result.score1,
        result.score2
      ]);
    });

    // 配列データをスプレッドシートの最終行の下に一括で追記
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }

    // クライアントへ成功のレスポンスを返す
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success", 
      "message": "Data saved successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // エラーキャッチ時
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error", 
      "message": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 動作確認用 (ブラウザから直接アクセスされた場合用)
 */
function doGet(e) {
  return ContentService.createTextOutput("GAS backend is running correctly!");
}
