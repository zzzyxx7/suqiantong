// pages/evidence/evidence.js
Page({
  data: {
    unprovedFacts: [
      {
        id: 1,
        factName: '对方有支付能力',
        evidenceTypes: ['银行流水', '工资证明', '房产证明', '车辆证明', '股票账户', '收入证明'],
        evidenceDesc: '证明对方有足够的经济能力支付家务补偿费用，包括但不限于工资收入、银行存款、房产、车辆等资产。',
        hasEvidence: null
      },
      {
        id: 2,
        factName: '家务劳动价值',
        evidenceTypes: ['家务记录', '邻居证言', '照片视频', '购物记录', '子女接送记录', '社区证明'],
        evidenceDesc: '证明您在婚姻期间承担的家务劳动具体内容和时间，可通过日常记录、照片视频、邻居证言等方式佐证。',
        hasEvidence: null
      }
    ],
    otherEvidence: ''
  },

  onLoad() {
    const plan = wx.getStorageSync('selectedStep2Plan') || {};
    const dynamicUnproved = (plan.evidenceChecklist || []).map((item, idx) => ({
      id: idx + 1,
      factName: item.factLabel,
      evidenceTypes: item.evidenceTypes || [],
      evidenceDesc: '围绕该要件准备客观材料，优先提交原件或可核验记录。',
      hasEvidence: null
    }));
    if (dynamicUnproved.length > 0) {
      this.setData({ unprovedFacts: dynamicUnproved });
    }
  },

  toggleHasEvidence(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.currentTarget.dataset.value === 'true';
    const facts = [...this.data.unprovedFacts];
    facts[index].hasEvidence = value;
    this.setData({ unprovedFacts: facts });
  },

  onOtherEvidenceInput(e) {
    this.setData({ otherEvidence: e.detail.value });
  },

  requestHumanHelp() {
    wx.showModal({
      title: '申请人工帮助',
      content: '您可以提交人工法律援助申请，志愿者将协助您准备证据材料。',
      confirmText: '去申请',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/my/my'
          });
        }
      }
    });
  },

  exportEvidenceList() {
    let listText = '证据清单\n\n';
    
    this.data.unprovedFacts.forEach((fact, index) => {
      listText += `${index + 1}. ${fact.factName}\n`;
      listText += `   推荐证据：${fact.evidenceTypes.join('、')}\n`;
      listText += `   说明：${fact.evidenceDesc}\n`;
      listText += `   已有：${fact.hasEvidence === true ? '是' : fact.hasEvidence === false ? '否' : '未选择'}\n\n`;
    });
    
    if (this.data.otherEvidence) {
      listText += `\n其他补充：\n${this.data.otherEvidence}`;
    }
    
    wx.setStorageSync('evidenceList', listText);
    
    wx.showToast({
      title: '清单已保存',
      icon: 'success'
    });
  },

  goBack() {
    wx.navigateBack();
  }
});