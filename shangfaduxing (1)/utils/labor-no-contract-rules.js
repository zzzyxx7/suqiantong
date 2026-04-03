// 劳动争议：未签劳动合同（最小可用原型）
const lawDatabase = [
  {
    id: "law_contract_10",
    name: "中华人民共和国劳动合同法",
    article: "第十条",
    summary: "建立劳动关系应订立书面劳动合同",
    text: "建立劳动关系，应当订立书面劳动合同。已建立劳动关系，未同时订立书面劳动合同的，应当自用工之日起一个月内订立书面劳动合同。",
    effectDate: "2008-01-01"
  },
  {
    id: "law_contract_82",
    name: "中华人民共和国劳动合同法",
    article: "第八十二条",
    summary: "未签书面劳动合同的双倍工资责任",
    text: "用人单位自用工之日起超过一个月不满一年未与劳动者订立书面劳动合同的，应当向劳动者每月支付二倍工资。",
    effectDate: "2008-01-01"
  },
  {
    id: "law_contract_14",
    name: "中华人民共和国劳动合同法",
    article: "第十四条",
    summary: "无固定期限劳动合同情形",
    text: "符合连续订立合同等法定条件的，劳动者有权要求订立无固定期限劳动合同。",
    effectDate: "2008-01-01"
  }
];

const questionGroups = [
  {
    groupId: "LN0",
    groupName: "前置事实确认",
    groupDesc: "确认是否属于未签劳动合同争议",
    icon: "📄",
    questions: [
      { key: "存在劳动关系", text: "你与单位之间是否存在劳动关系？", type: "boolean", required: true },
      { key: "未签书面劳动合同", text: "你是否未与单位签订书面劳动合同？", type: "boolean", required: true }
    ]
  },
  {
    groupId: "LN1",
    groupName: "关键要件补全",
    groupDesc: "确认用工时长、补签情况及基础证据",
    icon: "🧩",
    questions: [
      { key: "入职月数", text: "从入职至今（或离职时）共工作了几个月？", type: "number", unit: "个月" },
      { key: "已补签劳动合同", text: "后续是否已经补签过劳动合同？", type: "boolean" },
      { key: "有工资支付记录", text: "是否有工资发放记录（转账、工资条等）？", type: "boolean" },
      { key: "有工作管理证据", text: "是否有考勤、工作安排、工牌等管理从属性证据？", type: "boolean" },
      { key: "单位拒绝签合同", text: "是否有单位拒绝签订书面合同的沟通记录？", type: "boolean" }
    ]
  },
  {
    groupId: "LN2",
    groupName: "延伸请求（可选）",
    groupDesc: "补充无固定期限合同等进阶诉请",
    icon: "📌",
    questions: [
      { key: "主张补签书面合同", text: "你是否主张补签书面劳动合同？", type: "boolean" },
      { key: "主张无固定期限合同", text: "你是否主张签订无固定期限劳动合同？", type: "boolean" },
      {
        key: "满足无固定期限条件",
        text: "你是否已满足无固定期限劳动合同法定条件？",
        type: "boolean",
        condition: { key: "主张无固定期限合同", value: true }
      }
    ]
  }
];

const step2Targets = [
  {
    targetId: "target_labor_no_contract_double_wage",
    title: "争取未签合同期间双倍工资",
    desc: "重点证明劳动关系成立、未签合同持续时间及工资支付事实。",
    legalRefs: ["law_contract_10", "law_contract_82"],
    requiredFacts: [
      { key: "存在劳动关系", label: "与单位存在劳动关系" },
      { key: "未签书面劳动合同", label: "超过一个月未签书面劳动合同" },
      { key: "有工资支付记录", label: "存在工资发放/约定事实" }
    ],
    evidenceMap: {
      "存在劳动关系": ["考勤记录", "工作安排聊天记录", "工牌/工服", "同事证言"],
      "未签书面劳动合同": ["合同缺失说明", "沟通记录", "单位规章及入职材料"],
      "有工资支付记录": ["银行流水", "工资条", "转账记录", "薪资确认记录"]
    }
  },
  {
    targetId: "target_labor_no_contract_sign_contract",
    title: "请求补签书面劳动合同",
    desc: "在劳动关系持续期间，要求单位补签书面劳动合同。",
    legalRefs: ["law_contract_10"],
    requiredFacts: [
      { key: "存在劳动关系", label: "与单位存在劳动关系" },
      { key: "未签书面劳动合同", label: "尚未签订书面劳动合同" },
      { key: "主张补签书面合同", label: "已明确请求补签合同" }
    ],
    evidenceMap: {
      "存在劳动关系": ["考勤记录", "工作安排记录", "工牌/工服", "同事证言"],
      "未签书面劳动合同": ["合同缺失说明", "入职材料", "沟通记录"],
      "主张补签书面合同": ["书面申请", "聊天记录", "邮件记录"]
    }
  },
  {
    targetId: "target_labor_no_contract_open_term",
    title: "请求订立无固定期限劳动合同",
    desc: "符合条件时请求订立无固定期限劳动合同。",
    legalRefs: ["law_contract_14"],
    requiredFacts: [
      { key: "存在劳动关系", label: "与单位存在劳动关系" },
      { key: "主张无固定期限合同", label: "已明确主张无固定期限合同" },
      { key: "满足无固定期限条件", label: "已满足无固定期限合同法定条件" }
    ],
    evidenceMap: {
      "存在劳动关系": ["劳动关系证明材料", "工资发放记录", "社保记录"],
      "主张无固定期限合同": ["请求书", "沟通记录", "仲裁请求"],
      "满足无固定期限条件": ["工龄证明", "续签记录", "单位人事档案材料"]
    }
  }
];

module.exports = {
  lawDatabase: lawDatabase,
  questionGroups: questionGroups,
  step2Targets: step2Targets
};

