// pages/other-results/other-results.js
Page({
  data: {
    currentResult: {
      result: '判决准予离婚',
      detail: '法院认定感情破裂，房产归女方所有'
    },
    otherResults: [
      {
        id: 1,
        name: '判决不准予离婚',
        difficulty: 'low',
        difficultyText: '难度低',
        description: '如果对方不同意离婚且感情尚未完全破裂，法院可能判决不准予离婚。',
        legalBasis: '《民法典》第1079条：感情确已破裂，调解无效，应准予离婚。'
      },
      {
        id: 2,
        name: '财产适当多分',
        difficulty: 'medium',
        difficultyText: '难度中',
        description: '如存在对方过错（如出轨、家暴），可主张适当多分财产。',
        legalBasis: '《民法典》第1087条：离婚时，可根据具体情况照顾子女、女方和无过错方权益。'
      },
      {
        id: 3,
        name: '主张家务补偿',
        difficulty: 'medium',
        difficultyText: '难度中',
        description: '如您在婚姻中承担较多家务，可主张家务劳动补偿。',
        legalBasis: '《民法典》第1088条：夫妻一方因抚育子女、照料老人等负担较多义务的，离婚时有权向另一方请求补偿。'
      },
      {
        id: 4,
        name: '主张损害赔偿',
        difficulty: 'high',
        difficultyText: '难度高',
        description: '如对方存在重婚、与他人同居、实施家庭暴力等过错，可主张损害赔偿。',
        legalBasis: '《民法典》第1091条：因重婚、与他人同居、实施家庭暴力等导致离婚的，无过错方有权请求损害赔偿。'
      }
    ]
  },

  onLoad() {
    const app = getApp();
    if (app.globalData.judgeResult) {
      const result = app.globalData.judgeResult;
      if (result.finalResults && result.finalResults.length > 0) {
        this.setData({
          'currentResult.result': result.finalResults[0].result,
          'currentResult.detail': result.finalResults[0].detail
        });
      }
      if (result.step2 && result.step2.targets && result.step2.targets.length > 0) {
        const dynamicTargets = result.step2.targets.map((t, idx) => {
          const score = Math.round((t.matchScore || 0) * 100);
          const difficulty = score >= 70 ? 'low' : (score >= 40 ? 'medium' : 'high');
          const difficultyText = score >= 70 ? '把握较高' : (score >= 40 ? '可争取' : '待补证');
          return {
            id: idx + 1,
            targetId: t.targetId,
            name: t.title,
            difficulty: difficulty,
            difficultyText: difficultyText,
            description: t.desc,
            legalBasis: '匹配度 ' + score + '%'
          };
        });
        this.setData({ otherResults: dynamicTargets });
      }
    }
  },

  selectResult(e) {
    const id = e.currentTarget.dataset.id;
    const selectedResult = this.data.otherResults.find(item => item.id === id);
    
    wx.setStorageSync('selectedTarget', selectedResult || {});
    
    wx.navigateTo({
      url: '/pages/legal-basis/legal-basis?targetId=' + ((selectedResult && selectedResult.targetId) || '')
    });
  },

  goBack() {
    wx.navigateBack();
  }
});