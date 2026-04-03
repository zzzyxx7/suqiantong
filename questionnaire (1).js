// pages/questionnaire/questionnaire.js
var rules = require('../../utils/divorce-rules');
var questionGroups = rules.questionGroups;
var engine = require('../../utils/engine');

Page({
  data: {
    currentGroupIndex: 0,
    totalGroups: questionGroups.length,
    currentGroup: questionGroups[0],
    visibleQuestions: [],
    answers: {},
    progressPercent: 0,
    hasVisibleQuestions: true,
    visibleCount: 0,
    isLastStage: false
  },

  onLoad: function () {
    var app = getApp();
    app.globalData.userAnswers = {};
    this.setData({
      totalGroups: questionGroups.length,
      currentGroup: questionGroups[0],
      answers: {},
      progressPercent: (1 / questionGroups.length) * 100,
      isLastStage: false
    });
    this.refreshQuestions();
  },

  /**
   * 判断单个问题在当前answers下是否可见
   */
  isQuestionVisible: function (q, answers) {
    if (!q.condition) return true;
    if (q.condition.value !== undefined) {
      return answers[q.condition.key] === q.condition.value;
    }
    if (q.condition.notValue !== undefined) {
      return answers[q.condition.key] !== q.condition.notValue &&
             answers[q.condition.key] !== undefined &&
             answers[q.condition.key] !== null;
    }
    return true;
  },

  /**
   * 检查某个阶段是否有至少一个可见问题
   */
  groupHasVisible: function (groupIndex) {
    var group = questionGroups[groupIndex];
    if (!group) return false;
    var answers = this.data.answers;
    for (var i = 0; i < group.questions.length; i++) {
      if (this.isQuestionVisible(group.questions[i], answers)) return true;
    }
    return false;
  },

  /**
   * 查找fromIndex及之后第一个有可见问题的阶段，找不到返回-1
   */
  findNextVisible: function (fromIndex) {
    for (var i = fromIndex; i < questionGroups.length; i++) {
      if (this.groupHasVisible(i)) return i;
    }
    return -1;
  },

  /**
   * 查找fromIndex及之前第一个有可见问题的阶段，找不到返回0
   */
  findPrevVisible: function (fromIndex) {
    for (var i = fromIndex; i >= 0; i--) {
      if (this.groupHasVisible(i)) return i;
    }
    return 0;
  },

  /**
   * 当前阶段之后是否还有有问题的阶段
   */
  hasMoreAfter: function (idx) {
    return this.findNextVisible(idx + 1) !== -1;
  },

  /**
   * 刷新当前阶段的可见问题列表
   */
  refreshQuestions: function () {
    var group = questionGroups[this.data.currentGroupIndex];
    var answers = this.data.answers;
    var displayIndex = 0;
    var self = this;

    var visible = group.questions.map(function (q) {
      var show = self.isQuestionVisible(q, answers);
      if (show) displayIndex++;
      return {
        key: q.key,
        text: q.text,
        hint: q.hint || '',
        type: q.type,
        options: q.options || [],
        unit: q.unit || '',
        required: q.required || false,
        visible: show,
        displayIndex: displayIndex
      };
    });

    this.setData({
      visibleQuestions: visible,
      currentGroup: group,
      hasVisibleQuestions: displayIndex > 0,
      visibleCount: displayIndex,
      isLastStage: !this.hasMoreAfter(this.data.currentGroupIndex)
    });
  },

  /**
   * 跳转到指定阶段
   */
  goToGroup: function (index) {
    this.setData({
      currentGroupIndex: index,
      progressPercent: ((index + 1) / this.data.totalGroups) * 100
    });
    this.refreshQuestions();
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },

  // ===== 用户交互 =====

  onBoolAnswer: function (e) {
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;
    var boolVal = (value === true || value === 'true');
    var answers = this._cloneAnswers();
    answers[key] = boolVal;
    this.setData({ answers: answers }, function () {
      this.refreshQuestions();
    }.bind(this));
  },

  onChoiceAnswer: function (e) {
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;
    var answers = this._cloneAnswers();
    answers[key] = value;
    this.setData({ answers: answers }, function () {
      this.refreshQuestions();
    }.bind(this));
  },

  onNumberInput: function (e) {
    var key = e.currentTarget.dataset.key;
    var val = e.detail.value;
    var answers = this._cloneAnswers();
    answers[key] = val;
    this.setData({ answers: answers });
  },

  _cloneAnswers: function () {
    var old = this.data.answers;
    var copy = {};
    var keys = Object.keys(old);
    for (var i = 0; i < keys.length; i++) {
      copy[keys[i]] = old[keys[i]];
    }
    return copy;
  },

  // ===== 导航 =====

  prevGroup: function () {
    if (this.data.currentGroupIndex <= 0) return;
    var target = this.findPrevVisible(this.data.currentGroupIndex - 1);
    this.goToGroup(target);
  },

  nextGroup: function () {
    // 阶段0：校验前置条件
    if (this.data.currentGroupIndex === 0) {
      var missing = this._validateRequired();
      if (missing.length > 0) {
        wx.showModal({
          title: '请回答必填问题',
          content: missing.join('；'),
          showCancel: false
        });
        return;
      }
      var a = this.data.answers;
      if (!a['存在合法婚姻关系'] || !a['婚姻关系已经解除或正在解除'] || !a['存在房产分割争议']) {
        wx.showModal({
          title: '不满足前置条件',
          content: '必须同时满足三个前提条件才能进行评估：存在合法婚姻关系、婚姻关系已解除或正在解除、存在房产分割争议。',
          confirmText: '我知道了',
          showCancel: false
        });
        return;
      }
    }

    // 找下一个有可见问题的阶段
    var nextIdx = this.findNextVisible(this.data.currentGroupIndex + 1);
    if (nextIdx === -1) {
      // 后面全空，直接提交
      this.submitAnswers();
    } else {
      this.goToGroup(nextIdx);
    }
  },

  skipGroup: function () {
    this.nextGroup();
  },

  _validateRequired: function () {
    var group = questionGroups[this.data.currentGroupIndex];
    var answers = this.data.answers;
    var missing = [];
    for (var i = 0; i < group.questions.length; i++) {
      var q = group.questions[i];
      if (!q.required) continue;
      if (!this.isQuestionVisible(q, answers)) continue;
      if (answers[q.key] === undefined || answers[q.key] === null || answers[q.key] === '') {
        missing.push(q.text);
      }
    }
    return missing;
  },

  // ===== 提交 =====

  submitAnswers: function () {
    wx.showModal({
      title: '确认提交',
      content: '确认提交所有回答并获取裁判预测结果？',
      confirmText: '确认提交',
      cancelText: '再看看',
      success: function (res) {
        if (res.confirm) {
          this.doJudge();
        }
      }.bind(this)
    });
  },

  doJudge: function () {
    wx.showLoading({ title: '推理计算中...', mask: true });
    try {
      var answers = this.data.answers;
      var result = engine.judge(answers);

      var app = getApp();
      app.globalData.userAnswers = answers;
      app.globalData.judgeResult = result;

      wx.hideLoading();
      wx.navigateTo({ url: '/pages/result/result' });
    } catch (err) {
      wx.hideLoading();
      console.error('推理引擎错误:', err);
      wx.showModal({
        title: '推理出错',
        content: '推理过程中发生错误：' + err.message,
        showCancel: false
      });
    }
  }
});
