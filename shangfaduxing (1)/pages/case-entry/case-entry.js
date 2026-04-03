Page({
  data: {
    caseDescription: '',
    selectedCauseCode: '',
    candidateReasons: [
      '婚约财产纠纷',
      '离婚纠纷',
      '离婚后财产纠纷',
      '拖欠工资',
      '未签劳动合同',
      '违法解除劳动关系',
      '工伤赔偿',
      '加班费争议'
    ]
  },

  onLoad() {
    this.setData({
      caseDescription: wx.getStorageSync('caseDescription') || ''
    });
  },

  onInputChange(e) {
    this.setData({
      caseDescription: e.detail.value
    });
  },

  fillCandidate(e) {
    const reason = e.currentTarget.dataset.reason;
    const causeCodeMap = {
      '拖欠工资': 'labor_unpaid_wages',
      '未签劳动合同': 'labor_no_contract',
      '违法解除劳动关系': 'labor_illegal_termination',
      '违法解除劳动关系': 'labor_illegal_termination',
      '离婚纠纷': 'divorce_property',
      '离婚后财产纠纷': 'divorce_property',
      '婚约财产纠纷': 'divorce_property'
    };
    this.setData({
      caseDescription: reason,
      selectedCauseCode: causeCodeMap[reason] || ''
    });
  },

  submitCase() {
    const content = (this.data.caseDescription || '').trim();

    if (!content) {
      wx.showToast({
        title: '请输入案例描述',
        icon: 'none'
      });
      return;
    }

    wx.setStorageSync('caseDescription', content);
    const causeCode = this.data.selectedCauseCode || (content.indexOf('拖欠工资') !== -1
      ? 'labor_unpaid_wages'
      : ((content.indexOf('未签劳动合同') !== -1)
        ? 'labor_no_contract'
        : ((content.indexOf('违法解除劳动关系') !== -1)
          ? 'labor_illegal_termination'
          : 'divorce_property')));
    wx.navigateTo({
      url: '/pages/questionnaire/questionnaire?causeCode=' + causeCode
    });
  }
});

