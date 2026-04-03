// pages/my/my.js
Page({
  data: {
    currentTab: 0,
    workOrders: [
      {
        id: 1,
        title: '房产分割咨询',
        statusText: '待处理',
        statusClass: 'pending',
        desc: '已提交工单，等待志愿者接单',
        time: '2025-01-15 14:30'
      }
    ],
    cases: [
      {
        id: 1,
        name: '离婚房产分割案',
        type: '婚姻家庭',
        statusText: '已完成',
        statusClass: 'completed',
        date: '2025-01-10',
        hasPrediction: true,
        hasEvidence: true,
        hasQuestionnaire: false
      },
      {
        id: 2,
        name: '抚养权纠纷',
        type: '婚姻家庭',
        statusText: '进行中',
        statusClass: 'processing',
        date: '2025-01-12',
        hasPrediction: false,
        hasEvidence: true,
        hasQuestionnaire: true
      }
    ]
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentTab: index
    });
  },

  submitWorkOrder() {
    wx.showModal({
      title: '提交咨询工单',
      content: '您是否已完成智能问卷？人工法律援助需要基于您的问卷结果提供更精准的指导。',
      confirmText: '已完成后提交',
      cancelText: '先去填写',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '工单已提交',
            icon: 'success'
          });
        } else {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }
    });
  },

  viewCaseDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '查看案件详情',
      icon: 'none'
    });
  },

  editContact() {
    wx.showToast({
      title: '联系方式维护',
      icon: 'none'
    });
  },

  privacySettings() {
    wx.showToast({
      title: '隐私授权设置',
      icon: 'none'
    });
  },

  viewAgreement() {
    wx.showModal({
      title: '用户协议与免责声明',
      content: '本系统提供的裁判预测仅供参考，不构成法律意见。具体案件请咨询专业律师或向法院咨询。用户数据仅在本地处理，不上传服务器。',
      showCancel: false,
      confirmText: '我知道了'
    });
  }
});