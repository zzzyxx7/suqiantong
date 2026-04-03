// 多案由演示样例（用于联调/答辩演示）
const scenarios = {
  labor_unpaid_wages: [
    {
      name: "欠薪证据充分+可主张加付赔偿金",
      answers: {
        "存在劳动关系": true,
        "已提供劳动": true,
        "存在欠薪": true,
        "欠薪金额": 26000,
        "欠薪时长": 3,
        "有工资约定依据": true,
        "有考勤或工作记录": true,
        "有工资支付记录": true,
        "有催要工资记录": true,
        "单位书面承认欠薪": false,
        "有明确工资周期约定": true,
        "主张加班费": true,
        "有加班事实证据": true,
        "有加班工资约定依据": true,
        "主张解除补偿": true,
        "解除原因偏向单位责任": true,
        "已向劳动监察投诉": true,
        "单位逾期仍未支付": true
      },
      expected: ["欠薪支付请求", "加班费请求", "加付赔偿金请求"]
    }
  ],
  labor_no_contract: [
    {
      name: "双倍工资+补签合同并行主张",
      answers: {
        "存在劳动关系": true,
        "未签书面劳动合同": true,
        "入职月数": 7,
        "已补签劳动合同": false,
        "有工资支付记录": true,
        "有工作管理证据": true,
        "单位拒绝签合同": true,
        "主张补签书面合同": true,
        "主张无固定期限合同": false,
        "满足无固定期限条件": false
      },
      expected: ["双倍工资请求", "补签劳动合同请求"]
    }
  ],
  labor_illegal_termination: [
    {
      name: "第40条程序违法+请求恢复劳动关系",
      answers: {
        "存在劳动关系": true,
        "已被解除或辞退": true,
        "有解除通知": true,
        "解除通知为书面": false,
        "解除理由类型": "article_40",
        "提前30日通知或支付代通知金": false,
        "单位是否履行工会程序": false,
        "规章制度已公示且合法": false,
        "处于特殊保护期": false,
        "单位有严重违纪证据": false,
        "经济性裁员符合法定人数与报告程序": false,
        "主张继续履行劳动合同": true,
        "主张停工期间工资损失": true
      },
      expected: ["违法解除判断", "诉请方向"]
    }
  ]
};

module.exports = scenarios;
