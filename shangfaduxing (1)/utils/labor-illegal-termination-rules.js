// 劳动争议：违法解除劳动关系（最小可用原型）
const lawDatabase = [
  {
    id: "law_contract_39",
    name: "中华人民共和国劳动合同法",
    article: "第三十九条",
    summary: "过失性解除",
    text: "劳动者存在严重违纪等法定情形的，用人单位可以解除劳动合同。",
    effectDate: "2008-01-01"
  },
  {
    id: "law_contract_40",
    name: "中华人民共和国劳动合同法",
    article: "第四十条",
    summary: "无过失性解除",
    text: "用人单位依据法定事由解除劳动合同的，应提前三十日书面通知或额外支付一个月工资。",
    effectDate: "2008-01-01"
  },
  {
    id: "law_contract_41",
    name: "中华人民共和国劳动合同法",
    article: "第四十一条",
    summary: "经济性裁员",
    text: "经济性裁员应符合法定人数、程序和向工会及劳动行政部门说明情况等要求。",
    effectDate: "2008-01-01"
  },
  {
    id: "law_contract_48",
    name: "中华人民共和国劳动合同法",
    article: "第四十八条",
    summary: "违法解除后果",
    text: "用人单位违法解除劳动合同的，劳动者可请求继续履行劳动合同或者请求支付赔偿金。",
    effectDate: "2008-01-01"
  },
  {
    id: "law_contract_87",
    name: "中华人民共和国劳动合同法",
    article: "第八十七条",
    summary: "违法解除赔偿金",
    text: "违法解除劳动合同的，应按经济补偿标准的二倍向劳动者支付赔偿金。",
    effectDate: "2008-01-01"
  }
];

const questionGroups = [
  {
    groupId: "LT0",
    groupName: "前置事实确认",
    groupDesc: "先确认是否属于违法解除劳动争议的基本前提",
    icon: "📌",
    questions: [
      { key: "存在劳动关系", text: "你与单位之间是否存在劳动关系？", type: "boolean", required: true },
      { key: "已被解除或辞退", text: "你是否已被解除劳动合同或辞退？", type: "boolean", required: true }
    ]
  },
  {
    groupId: "LT1",
    groupName: "解除事实",
    groupDesc: "补充解除通知、解除理由及程序事实",
    icon: "📄",
    questions: [
      { key: "有解除通知", text: "单位是否向你发出过解除/辞退通知？", type: "boolean" },
      {
        key: "解除通知为书面",
        text: "该解除通知是否为书面形式？",
        type: "boolean",
        condition: { key: "有解除通知", value: true }
      },
      {
        key: "解除理由类型",
        text: "单位主张的解除理由属于哪一类？",
        type: "choice",
        options: [
          { label: "过失性解除（第39条）", value: "article_39" },
          { label: "无过失性解除（第40条）", value: "article_40" },
          { label: "经济性裁员（第41条）", value: "article_41" },
          { label: "无法说明或其他", value: "unknown" }
        ]
      },
      {
        key: "提前30日通知或支付代通知金",
        text: "如属第40条情形，单位是否提前30日书面通知或支付代通知金？",
        type: "boolean",
        condition: { key: "解除理由类型", value: "article_40" }
      },
      {
        key: "单位是否履行工会程序",
        text: "单位解除前是否履行通知工会等程序？",
        type: "boolean"
      },
      {
        key: "规章制度已公示且合法",
        text: "单位依据的规章制度是否经过民主程序并已公示？",
        type: "boolean"
      }
    ]
  },
  {
    groupId: "LT2",
    groupName: "延伸事实",
    groupDesc: "核对特殊保护期及单位证据情况",
    icon: "🧩",
    questions: [
      { key: "处于特殊保护期", text: "解除时你是否处于医疗期/孕期/工伤停工留薪期等特殊保护期？", type: "boolean" },
      { key: "单位有严重违纪证据", text: "单位是否能提供你严重违纪的明确证据？", type: "boolean" },
      { key: "经济性裁员符合法定人数与报告程序", text: "如属经济性裁员，单位是否满足法定人数与报告程序？", type: "boolean" },
      { key: "主张继续履行劳动合同", text: "你是否希望优先主张恢复劳动关系（继续履行劳动合同）？", type: "boolean" },
      { key: "主张停工期间工资损失", text: "你是否主张停工期间工资损失（或等待恢复期间损失）？", type: "boolean" }
    ]
  }
];

const step2Targets = [
  {
    targetId: "target_illegal_termination_compensation",
    title: "主张违法解除赔偿金",
    desc: "重点证明解除缺乏法定事由或程序违法，进而请求二倍赔偿。",
    legalRefs: ["law_contract_48", "law_contract_87", "law_contract_39", "law_contract_40", "law_contract_41"],
    requiredFacts: [
      { key: "存在劳动关系", label: "与单位存在劳动关系" },
      { key: "已被解除或辞退", label: "已发生解除/辞退事实" },
      { key: "解除程序或理由存在瑕疵", label: "解除理由或程序存在违法情形" },
      { key: "单位是否履行工会程序", label: "单位未充分履行工会程序（反向佐证）" }
    ],
    evidenceMap: {
      "存在劳动关系": ["劳动合同", "社保记录", "工资发放记录", "考勤或工作安排记录"],
      "已被解除或辞退": ["解除通知书", "辞退聊天记录", "离职手续记录"],
      "解除程序或理由存在瑕疵": ["解除通知内容截图", "单位规章制度", "缺少民主程序/告知程序材料", "工会意见材料缺失证明"],
      "单位是否履行工会程序": ["工会通知材料", "单位解除审批流", "工会意见记录"]
    }
  },
  {
    targetId: "target_illegal_termination_reinstatement",
    title: "请求继续履行劳动合同",
    desc: "在违法解除情形下，优先请求恢复劳动关系并继续履行合同。",
    legalRefs: ["law_contract_48", "law_contract_39", "law_contract_40", "law_contract_41"],
    requiredFacts: [
      { key: "存在劳动关系", label: "与单位存在劳动关系" },
      { key: "已被解除或辞退", label: "已发生解除/辞退事实" },
      { key: "主张继续履行劳动合同", label: "已明确请求恢复劳动关系" }
    ],
    evidenceMap: {
      "存在劳动关系": ["劳动合同", "社保记录", "工资条或银行流水"],
      "已被解除或辞退": ["解除通知书", "辞退通告", "HR沟通记录"],
      "主张继续履行劳动合同": ["仲裁请求书", "向单位发送的复工申请/函件", "要求继续履行的聊天记录"]
    }
  },
  {
    targetId: "target_illegal_termination_wage_gap",
    title: "主张停工期间工资损失",
    desc: "在解除违法且未及时恢复岗位时，主张停工待岗期间工资等损失。",
    legalRefs: ["law_contract_48", "law_contract_87"],
    requiredFacts: [
      { key: "存在劳动关系", label: "与单位存在劳动关系" },
      { key: "已被解除或辞退", label: "已发生解除/辞退事实" },
      { key: "主张停工期间工资损失", label: "已明确主张停工期间工资损失" }
    ],
    evidenceMap: {
      "存在劳动关系": ["劳动合同", "工资发放记录", "社保缴费记录"],
      "已被解除或辞退": ["解除通知书", "系统停权记录", "门禁停用记录"],
      "主张停工期间工资损失": ["工资标准依据", "历史工资流水", "停工期间求职/等待记录", "仲裁请求书"]
    }
  },
  {
    targetId: "target_illegal_termination_revoke_decision",
    title: "确认解除决定违法并撤销",
    desc: "重点要求确认解除决定违法，作为赔偿或恢复劳动关系的前置支撑。",
    legalRefs: ["law_contract_39", "law_contract_40", "law_contract_41", "law_contract_48"],
    requiredFacts: [
      { key: "存在劳动关系", label: "与单位存在劳动关系" },
      { key: "已被解除或辞退", label: "已发生解除/辞退事实" },
      { key: "解除理由不明确", label: "解除理由不明确或与法条不匹配" },
      { key: "解除通知为书面", label: "解除通知书面瑕疵（反向佐证）" }
    ],
    evidenceMap: {
      "存在劳动关系": ["劳动合同", "工资流水", "社保缴费记录"],
      "已被解除或辞退": ["解除通知", "门禁/系统停权记录", "HR聊天记录"],
      "解除理由不明确": ["解除通知内容", "单位说明材料", "规章制度条款对照"],
      "解除通知为书面": ["书面通知原件", "电子通知截图", "送达记录"]
    }
  }
];

module.exports = {
  lawDatabase: lawDatabase,
  questionGroups: questionGroups,
  step2Targets: step2Targets
};
