// pages/result/result.js
Page({
  data: {
    result: {
      success: false,
      message: '暂无结果',
      detail: '',
      facts: {},
      activatedPaths: [],
      conclusions: [],
      finalResults: [],
      lawsApplied: []
    },
    expandedLaws: {},
    typeLabels: {
      'property_nature': '房产定性',
      'split_rule': '分割规则',
      'split_adjustment': '分割调整',
      'labor_payment': '工资支付',
      'labor_contract': '合同责任',
      'labor_termination': '解除争议'
    },
    levelLabels: {
      'critical': '关键',
      'important': '重要',
      'warning': '注意',
      'info': '参考'
    }
  },

  onLoad() {
    const app = getApp();
    const result = app.globalData.judgeResult;

    if (result) {
      this.setData({ result });
    } else {
      wx.showToast({
        title: '未找到评估结果',
        icon: 'none'
      });
    }
  },

  /**
   * 展开/收起法条原文
   */
  toggleLawText(e) {
    const id = e.currentTarget.dataset.id;
    const expanded = { ...this.data.expandedLaws };
    expanded[id] = !expanded[id];
    this.setData({ expandedLaws: expanded });
  },

  /**
   * 重新评估
   */
  restart() {
    const app = getApp();
    app.globalData.userAnswers = {};
    app.globalData.judgeResult = null;
    const causeCode = app.globalData.causeCode || 'divorce_property';

    wx.redirectTo({
      url: '/pages/questionnaire/questionnaire?causeCode=' + causeCode
    });
  },

  /**
   * 返回首页
   */
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 我不满这个结果 - 跳转其他可争取结果选择页
   */
  goToOtherResults() {
    wx.navigateTo({
      url: '/pages/other-results/other-results'
    });
  }
});

