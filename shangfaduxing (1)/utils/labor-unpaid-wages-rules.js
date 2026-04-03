// 劳动争议：拖欠工资（最小可用原型）
const lawDatabase = [
  {
    id: "law_labor_50",
    name: "中华人民共和国劳动法",
    article: "第五十条",
    summary: "工资应当按月支付",
    text: "工资应当以货币形式按月支付给劳动者本人，不得克扣或者无故拖欠劳动者的工资。",
    effectDate: "1995-01-01"
  },
  {
    id: "law_contract_30",
    name: "中华人民共和国劳动合同法",
    article: "第三十条",
    summary: "按约足额支付劳动报酬",
    text: "用人单位应当按照劳动合同约定和国家规定，向劳动者及时足额支付劳动报酬。",
    effectDate: "2008-01-01"
  },
  {
    id: "law_contract_85",
    name: "中华人民共和国劳动合同法",
    article: "第八十五条",
    summary: "未按约支付劳动报酬的法律责任",
    text: "用人单位未及时足额支付劳动报酬的，由劳动行政部门责令限期支付；逾期不支付的，可责令加付赔偿金。",
    effectDate: "2008-01-01"
  },
  {
    id: "law_reg_16",
    name: "工资支付暂行规定",
    article: "第十六条",
    summary: "克扣、拖欠工资处理",
    text: "用人单位不得克扣劳动者工资；无故拖欠劳动者工资的，应依法承担责任。",
    effectDate: "1995-01-01"
  }
];

const questionGroups = [
  {
    groupId: "LW0",
    groupName: "前置事实确认",
    groupDesc: "先确认是否属于拖欠工资纠纷的基本前提",
    icon: "💼",
    questions: [
      { key: "存在劳动关系", text: "你与单位之间是否存在劳动关系？", type: "boolean", required: true },
      { key: "已提供劳动", text: "你是否已经实际提供劳动？", type: "boolean", required: true },
      { key: "存在欠薪", text: "单位是否存在拖欠工资的情形？", type: "boolean", required: true }
    ]
  },
  {
    groupId: "LW1",
    groupName: "劳动关系与工资约定",
    groupDesc: "先把劳动关系和工资标准证据补齐",
    icon: "🧾",
    questions: [
      { key: "入职时间已明确", text: "你的入职时间是否可以明确到年月？", type: "boolean" },
      { key: "离职时间已明确", text: "如已离职，离职时间是否可以明确到年月？", type: "boolean" },
      { key: "欠薪金额", text: "拖欠工资金额大约是多少？", type: "number", unit: "元" },
      { key: "欠薪时长", text: "拖欠工资已持续多久？", type: "number", unit: "个月" },
      { key: "有工资约定依据", text: "是否有劳动合同/工资条等工资约定依据？", type: "boolean" },
      { key: "有考勤或工作记录", text: "是否有考勤记录、工作群记录、工作成果等劳动证据？", type: "boolean" },
      { key: "有工资支付记录", text: "是否有银行流水/工资发放记录？", type: "boolean" },
      { key: "有催要工资记录", text: "是否有催要工资的聊天记录/短信/录音？", type: "boolean" },
      { key: "单位书面承认欠薪", text: "单位是否有书面承认欠薪的材料？", type: "boolean" },
      { key: "有明确工资周期约定", text: "是否有明确工资发放周期约定（按月/按周）？", type: "boolean" }
    ]
  },
  {
    groupId: "LW2",
    groupName: "延伸请求（可选）",
    groupDesc: "如需主张加班费或解除补偿，补充对应事实",
    icon: "📌",
    questions: [
      { key: "主张加班费", text: "你是否希望一并主张加班费？", type: "boolean" },
      {
        key: "有加班事实证据",
        text: "是否有加班记录（考勤、审批、聊天等）？",
        type: "boolean",
        condition: { key: "主张加班费", value: true }
      },
      {
        key: "有加班工资约定依据",
        text: "是否有加班工资计算依据（制度/约定）？",
        type: "boolean",
        condition: { key: "主张加班费", value: true }
      },
      { key: "主张解除补偿", text: "你是否希望主张解除劳动关系经济补偿？", type: "boolean" },
      {
        key: "解除原因偏向单位责任",
        text: "解除劳动关系是否主要因单位未及时足额支付劳动报酬？",
        type: "boolean",
        condition: { key: "主张解除补偿", value: true }
      },
      { key: "已向劳动监察投诉", text: "是否已向劳动监察部门投诉欠薪？", type: "boolean" },
      { key: "单位逾期仍未支付", text: "在催告或责令后单位是否逾期仍未支付？", type: "boolean" }
    ]
  }
];

const step2Targets = [
  {
    targetId: "target_labor_unpaid_wages_full_payment",
    title: "争取尽快足额支付欠薪",
    desc: "重点证成劳动关系、实际劳动及欠薪事实，并补强金额依据。",
    legalRefs: ["law_labor_50", "law_contract_30", "law_contract_85", "law_reg_16"],
    requiredFacts: [
      { key: "存在劳动关系", label: "与单位存在劳动关系" },
      { key: "已提供劳动", label: "已经实际提供劳动" },
      { key: "存在欠薪", label: "存在拖欠工资事实" },
      { key: "有工资约定依据", label: "有工资标准/约定依据（合同、工资条等）" },
      { key: "有工资支付记录", label: "有工资发放/欠发记录（银行流水等）" },
      { key: "有催要工资记录", label: "有催要工资沟通记录" },
      { key: "有明确工资周期约定", label: "有明确工资发放周期约定" }
    ],
    evidenceMap: {
      "存在劳动关系": ["劳动合同", "入职登记信息", "社保缴纳记录", "工资发放记录"],
      "已提供劳动": ["考勤记录", "工作群记录", "工作成果材料", "同事证言"],
      "存在欠薪": ["工资发放明细", "银行流水", "单位通知/公告"],
      "有工资约定依据": ["劳动合同", "工资条", "录用通知", "薪酬制度文件"],
      "有工资支付记录": ["银行流水", "工资转账记录", "工资条", "单位发薪记录截图"],
      "有催要工资记录": ["微信聊天记录", "短信记录", "通话录音", "催告函/邮件"]
      ,
      "有明确工资周期约定": ["劳动合同条款", "薪资制度文件", "offer或录用通知"]
    }
  },
  {
    targetId: "target_labor_unpaid_wages_overtime",
    title: "一并主张加班费",
    desc: "在欠薪之外，主张存在加班且未依法支付加班费。",
    legalRefs: ["law_labor_50", "law_contract_30"],
    requiredFacts: [
      { key: "主张加班费", label: "明确提出加班费请求" },
      { key: "有加班事实证据", label: "有加班事实证据（考勤/审批/聊天）" },
      { key: "有加班工资约定依据", label: "有加班工资计算依据" }
    ],
    evidenceMap: {
      "主张加班费": ["仲裁请求清单", "法律文书草稿"],
      "有加班事实证据": ["考勤记录", "加班审批单", "工作群消息", "门禁记录"],
      "有加班工资约定依据": ["公司规章制度", "劳动合同条款", "薪酬制度文件"]
    }
  },
  {
    targetId: "target_labor_unpaid_wages_termination_compensation",
    title: "争取解除劳动关系并主张经济补偿",
    desc: "当单位长期欠薪时，考虑依法解除并主张经济补偿。",
    legalRefs: ["law_labor_50", "law_contract_30", "law_contract_85"],
    requiredFacts: [
      { key: "主张解除补偿", label: "明确提出解除补偿请求" },
      { key: "存在欠薪", label: "存在拖欠工资事实" },
      { key: "解除原因偏向单位责任", label: "解除原因与单位欠薪行为相关" }
    ],
    evidenceMap: {
      "主张解除补偿": ["解除通知", "仲裁请求清单"],
      "存在欠薪": ["银行流水", "工资条", "欠薪通知", "催薪记录"],
      "解除原因偏向单位责任": ["解除前催告记录", "单位回复记录", "解除沟通记录"]
    }
  },
  {
    targetId: "target_labor_unpaid_wages_additional_compensation",
    title: "争取逾期支付加付赔偿金",
    desc: "针对欠薪且经催告/责令后仍不支付的情形，主张加付赔偿金。",
    legalRefs: ["law_contract_85", "law_reg_16"],
    requiredFacts: [
      { key: "存在欠薪", label: "存在拖欠工资事实" },
      { key: "已向劳动监察投诉", label: "已向劳动监察投诉或提出正式催告" },
      { key: "单位逾期仍未支付", label: "单位逾期仍未支付" }
    ],
    evidenceMap: {
      "存在欠薪": ["工资条", "银行流水", "单位发薪明细"],
      "已向劳动监察投诉": ["投诉回执", "受理通知", "催告函及送达证明"],
      "单位逾期仍未支付": ["限期支付通知", "逾期未支付证明", "后续沟通记录"]
    }
  }
];

module.exports = {
  lawDatabase: lawDatabase,
  questionGroups: questionGroups,
  step2Targets: step2Targets
};

