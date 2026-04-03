// pages/legal-basis/legal-basis.js
const engine = require('../../utils/engine');

Page({
  data: {
    targetResult: {
      name: '主张家务补偿'
    },
    legalBasis: [
      {
        id: 1,
        name: '《中华人民共和国民法典》',
        article: '1088',
        content: '夫妻一方因抚育子女、照料老人、协助另一方工作等负担较多义务的，离婚时有权向另一方请求补偿，另一方应当给予补偿。具体办法由双方协议；协议不成的，由人民法院判决。'
      }
    ],
    elements: [
      {
        id: 1,
        name: '婚姻关系存续期间',
        proved: true,
        description: '双方在婚姻关系存续期间（2020年1月-2024年6月）'
      },
      {
        id: 2,
        name: '一方承担较多家务',
        proved: true,
        description: '您在婚姻期间主要负责照顾孩子和料理家务，有相关证据支持'
      },
      {
        id: 3,
        name: '对方有支付能力',
        proved: false,
        description: '需要证明对方有经济能力支付家务补偿'
      },
      {
        id: 4,
        name: '家务劳动价值',
        proved: false,
        description: '需要提供家务劳动的具体内容和时间的证据'
      }
    ]
  },

  onLoad(options) {
    const selectedTarget = wx.getStorageSync('selectedTarget') || {};
    const app = getApp();
    const answers = app.globalData.userAnswers || {};
    const causeCode = app.globalData.causeCode || 'divorce_property';
    const targetId = (options && options.targetId) || selectedTarget.targetId || '';
    const plan = engine.buildStep2PlanByCause(causeCode, answers, targetId);

    const legalBasis = (plan.legalRefs || []).map((law, idx) => ({
      id: idx + 1,
      name: law.name,
      article: law.article,
      content: law.text
    }));

    const elements = (plan.factChecklist || []).map((f, idx) => ({
      id: idx + 1,
      name: f.label,
      proved: f.proved,
      description: f.proved ? '当前问卷信息已可支撑该要件。' : '该要件尚未证成，建议补充对应证据材料。'
    }));

    this.setData({
      targetResult: {
        name: plan.title || selectedTarget.name || this.data.targetResult.name,
        targetId: plan.targetId || targetId
      },
      legalBasis: legalBasis,
      elements: elements
    });

    wx.setStorageSync('selectedStep2Plan', plan);
  },

  goToEvidence() {
    wx.navigateTo({
      url: '/pages/evidence/evidence'
    });
  },

  goBack() {
    wx.navigateBack();
  }
});