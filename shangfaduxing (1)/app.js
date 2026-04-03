// app.js
App({
  onLaunch() {
    console.log('诉前通小程序启动');
  },
  globalData: {
    appName: '诉前通',
    version: '1.0.0',
    caseDescription: '',
    userAnswers: {},
    judgeResult: null
  }
});
