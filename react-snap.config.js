module.exports = {
  // Директория с собранным сайтом
  source: "dist/public",
  
  // Настройки минификации (отключены для безопасности)
  minifyHtml: {
    collapseWhitespace: false,
    removeComments: false
  },
  
  // Puppeteer аргументы для работы в CI/CD
  puppeteerArgs: [
    "--no-sandbox",
    "--disable-setuid-sandbox"
  ],
  
  // Включить кэширование
  cacheAjaxRequests: false,
  
  // Порт для pre-rendering (по умолчанию 45678)
  port: 45678
};
