// pages/index/index.js
Page({
  data: {},

  onLoad() {
    const app = getApp();
    app.globalData.caseDescription = '';
    app.globalData.userAnswers = {};
    app.globalData.judgeResult = null;
  },

  startQuestionnaire() {
    wx.navigateTo({
      url: '/pages/case-entry/case-entry'
    });
  }
});
