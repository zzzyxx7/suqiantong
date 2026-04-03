/**
 * 诉前通本地规则引擎
 */

const { lawDatabase, step2Targets = [] } = require('./divorce-rules');
const laborUnpaidRules = require('./labor-unpaid-wages-rules');
const laborNoContractRules = require('./labor-no-contract-rules');
const laborIllegalTerminationRules = require('./labor-illegal-termination-rules');

function b(v) { return v === true; }

// ========================
// 离婚房产：事实提取
// ========================
function extractFacts(answers) {
  const facts = {};
  facts["存在合法婚姻关系"] = b(answers["存在合法婚姻关系"]);
  facts["婚姻关系已经解除或正在解除"] = b(answers["婚姻关系已经解除或正在解除"]);
  facts["存在房产分割争议"] = b(answers["存在房产分割争议"]);

  facts["房产购置时间_婚前"] = answers["房产购置时间"] === "婚前";
  facts["房产购置时间_婚后"] = answers["房产购置时间"] === "婚后";
  facts["出资主体_一方个人"] = answers["房产出资主体"] === "一方个人";
  facts["出资主体_双方共同"] = answers["房产出资主体"] === "双方共同";
  facts["出资主体_父母出资"] = answers["房产出资主体"] === "父母出资" || answers["房产出资主体"] === "双方父母";
  facts["出资性质_全款"] = answers["房产出资性质"] === "全款";
  facts["出资性质_按揭"] = answers["房产出资性质"] === "按揭";
  facts["登记_出资方个人"] = answers["产权登记主体"] === "出资方个人";
  facts["登记_双方共同"] = answers["产权登记主体"] === "双方共同";
  facts["登记_父母名下"] = answers["产权登记主体"] === "父母名下";
  facts["婚后共同还贷"] = b(answers["婚后共同还贷"]);
  facts["增值_自然增值"] = answers["房产增值类型"] === "自然增值";
  facts["增值_投资收益"] = answers["房产增值类型"] === "投资收益";

  facts["签订离婚协议"] = b(answers["签订离婚协议"]);
  facts["协议约定房产分割"] = b(answers["协议约定房产分割"]);
  facts["存在房产赠与约定"] = b(answers["存在房产赠与约定"]);
  facts["赠与_未过户"] = answers["赠与完成过户"] === "未过户";
  facts["赠与_已过户"] = answers["赠与完成过户"] === "已过户";
  facts["赠与房产认定为彩礼"] = b(answers["赠与房产认定为彩礼"]);
  facts["双方已办结婚登记"] = b(answers["双方已办结婚登记"]);
  facts["登记后共同生活"] = b(answers["登记后共同生活"]);
  facts["婚前给付导致生活困难"] = b(answers["婚前给付导致生活困难"]);
  facts["存在赠与撤销法定情形"] = b(answers["存在赠与撤销法定情形"]);

  facts["父母出资_婚前"] = answers["父母出资时间"] === "婚前";
  facts["父母出资_婚后"] = answers["父母出资时间"] === "婚后";
  facts["父母出资_全额"] = answers["父母出资比例"] === "全额";
  facts["父母出资_部分"] = answers["父母出资比例"] === "部分";
  facts["存在书面赠与合同"] = b(answers["存在书面赠与合同"]);
  facts["赠与合同归己方子女"] = b(answers["赠与合同归己方子女"]);
  facts["赠与合同赠与双方"] = b(answers["赠与合同赠与双方"]);

  facts["婚姻存续时长"] = parseInt(answers["婚姻存续时长"], 10) || 0;
  facts["存在过错情形"] = !!answers["存在过错情形"] && answers["存在过错情形"] !== "无";
  facts["过错类型"] = answers["存在过错情形"] || "无";
  facts["过错有充分证据"] = b(answers["过错有充分证据"]);
  facts["主张方为无过错方"] = b(answers["主张方为无过错方"]);
  facts["存在财产处置不当行为"] = b(answers["存在财产处置不当行为"]);
  facts["存在家务劳动超额负担"] = b(answers["存在家务劳动超额负担"]);

  facts["婚前承租婚后购买公房"] = b(answers["婚前承租婚后购买公房"]);
  facts["父母名义房改房"] = b(answers["父母名义房改房"]);
  facts["双方对房屋价值归属无法协议"] = b(answers["双方对房屋价值归属无法协议"]);
  facts["房屋处置意愿"] = answers["房屋处置意愿"] || "";
  return facts;
}

function evaluateCompositeElements(facts) {
  const composite = {};
  const activatedPaths = [];
  const add = (name, conditions, lawRef, calc) => activatedPaths.push({ name, conditions, lawRef, calc: calc || "与" });

  composite["婚前个人全款"] = facts["房产购置时间_婚前"] && facts["出资主体_一方个人"] && facts["出资性质_全款"] && facts["登记_出资方个人"];
  if (composite["婚前个人全款"]) add("婚前个人全款房产", ["婚前购置", "个人出资", "全款", "登记个人"], "law_1063");

  composite["婚前首付婚后共同还贷"] = facts["房产购置时间_婚前"] && facts["出资主体_一方个人"] && facts["出资性质_按揭"] && facts["登记_出资方个人"] && facts["婚后共同还贷"];
  if (composite["婚前首付婚后共同还贷"]) add("婚前首付婚后共同还贷", ["婚前按揭", "婚后共同还贷"], "law_jsyi_78");

  composite["婚后共同出资"] = facts["房产购置时间_婚后"] && facts["出资主体_双方共同"];
  if (composite["婚后共同出资"]) add("婚后共同出资", ["婚后购置", "双方共同出资"], "law_1062");

  composite["婚后登记双方"] = facts["房产购置时间_婚后"] && facts["登记_双方共同"];
  if (composite["婚后登记双方"]) add("婚后登记双方", ["婚后购置", "登记双方"], "law_1062");

  composite["父母婚后出资未约定仅赠一方"] = facts["出资主体_父母出资"] && facts["父母出资_婚后"] && !facts["赠与合同归己方子女"];
  if (composite["父母婚后出资未约定仅赠一方"]) add("父母婚后出资未约定仅赠一方", ["父母婚后出资", "未明确仅赠与一方"], "law_jser_8");

  composite["父母明确赠与双方"] = facts["出资主体_父母出资"] && facts["赠与合同赠与双方"];
  if (composite["父母明确赠与双方"]) add("父母明确赠与双方", ["父母出资", "明确赠与双方"], "law_1062");

  composite["婚前承租婚后购买公房"] = facts["婚前承租婚后购买公房"];
  if (composite["婚前承租婚后购买公房"]) add("婚前承租婚后购买公房", ["婚前承租", "婚后购买"], "law_jsyi_27");

  composite["父母名义房改房"] = facts["父母名义房改房"];
  if (composite["父母名义房改房"]) add("父母名义房改房", ["以父母名义房改"], "law_jsyi_79");

  composite["有效离婚协议"] = facts["签订离婚协议"] && facts["协议约定房产分割"];
  if (composite["有效离婚协议"]) add("有效离婚协议分割", ["签订离婚协议", "约定分割"], "law_1076");

  composite["可撤销未过户赠与"] = facts["存在房产赠与约定"] && facts["赠与_未过户"];
  if (composite["可撤销未过户赠与"]) add("未过户赠与可撤销", ["存在赠与约定", "未过户"], "law_jsyi_32");

  composite["可争议已过户短婚赠与"] = facts["存在房产赠与约定"] && facts["赠与_已过户"] && facts["婚姻存续时长"] < 24;
  if (composite["可争议已过户短婚赠与"]) add("已过户短婚赠与可争议", ["已过户", "婚姻存续较短"], "law_jsyi_32");

  composite["符合彩礼返还"] = facts["赠与房产认定为彩礼"] && (!facts["双方已办结婚登记"] || !facts["登记后共同生活"] || facts["婚前给付导致生活困难"]);
  if (composite["符合彩礼返还"]) add("符合彩礼返还", ["彩礼性质", "满足返还条件"], "law_jsyi_5", "与/或");

  composite["无过错方多分"] = facts["存在过错情形"] && facts["过错有充分证据"] && facts["主张方为无过错方"];
  if (composite["无过错方多分"]) add("无过错方多分", ["存在过错", "证据充分", "主张方无过错"], "law_1087");

  composite["过错方少分不分"] = facts["存在财产处置不当行为"];
  if (composite["过错方少分不分"]) add("过错方少分不分", ["存在财产处置不当行为"], "law_1092");

  composite["家务劳动补偿"] = facts["存在家务劳动超额负担"];
  if (composite["家务劳动补偿"]) add("家务劳动补偿", ["家务劳动超额负担"], "law_1088");

  return { composite, activatedPaths };
}

function evaluateIntermediateResults(composite, facts) {
  const intermediate = {};
  const conclusions = [];
  const add = (type, result, reason, lawRefs, level) => conclusions.push({ type, result, reason, lawRefs: lawRefs || [], level: level || "important" });

  intermediate["房产为个人财产"] = composite["婚前个人全款"];
  intermediate["房产为共同财产"] = composite["婚后共同出资"] || composite["婚后登记双方"] || composite["父母婚后出资未约定仅赠一方"] || composite["父母明确赠与双方"] || composite["婚前承租婚后购买公房"] || facts["增值_投资收益"];
  intermediate["房产为混合财产"] = composite["婚前首付婚后共同还贷"];
  intermediate["不纳入分割"] = composite["父母名义房改房"] || composite["符合彩礼返还"];

  if (intermediate["房产为个人财产"]) add("property_nature", "该房产应认定为一方个人财产", "满足婚前个人全款且登记个人。", ["law_1063"], "critical");
  if (intermediate["房产为共同财产"]) add("property_nature", "该房产应认定为夫妻共同财产", "满足婚后取得/共同出资/共同登记或相关推定规则。", ["law_1062", "law_jser_8", "law_jsyi_27"], "critical");
  if (intermediate["房产为混合财产"]) add("property_nature", "该房产应认定为混合财产（个人+共同权益）", "婚前按揭购房，婚后共同还贷形成补偿权益。", ["law_jsyi_78"], "critical");
  if (intermediate["不纳入分割"]) add("property_nature", "该房产不纳入离婚财产分割", composite["父母名义房改房"] ? "登记在父母名下，不属于夫妻共同财产。" : "符合彩礼返还法定条件。", composite["父母名义房改房"] ? ["law_jsyi_79"] : ["law_jsyi_5"], "critical");

  if (intermediate["房产为共同财产"] || intermediate["房产为混合财产"]) add("split_rule", "适用夫妻共同财产分割规则", "共同财产及共同还贷对应增值部分应纳入分割。", ["law_1087", "law_jsyi_76", "law_jsyi_78"]);
  if (composite["有效离婚协议"]) add("split_rule", "优先按离婚协议处理", "存在合法有效离婚协议且有明确分割约定。", ["law_1076"]);
  if (composite["可撤销未过户赠与"] || composite["可争议已过户短婚赠与"] || facts["存在赠与撤销法定情形"]) add("split_rule", "可主张撤销赠与", "满足赠与撤销或争议撤销情形。", ["law_jsyi_32"]);
  if (composite["符合彩礼返还"]) add("split_rule", "可主张返还彩礼性质房产", "彩礼返还条件成立。", ["law_jsyi_5"]);
  if (composite["无过错方多分"]) add("split_adjustment", "可主张无过错方适当多分", "存在过错情形且证据充分。", ["law_1087", "law_1091"]);
  if (composite["过错方少分不分"]) add("split_adjustment", "可请求对过错方少分或不分", "存在隐藏、转移等财产处置不当行为。", ["law_1092"]);
  if (composite["家务劳动补偿"]) add("split_adjustment", "可请求家务劳动补偿", "一方承担较多家务劳动义务。", ["law_1088"]);

  return { intermediate, conclusions };
}

function generateFinalResult(intermediate, composite, facts) {
  const finalResults = [];
  const push = (item, result, detail) => finalResults.push({ item, result, detail });

  if (intermediate["房产为个人财产"]) push("房产最终产权归属", "归产权登记方一方所有", "属于个人财产，原则上不参与离婚分割。");
  else if (intermediate["房产为共同财产"]) push("房产最终产权归属", "归夫妻双方共同共有", "属于夫妻共同财产，应依法分割。");
  else if (intermediate["房产为混合财产"]) push("房产最终产权归属", "原则上归登记方所有，另一方享有补偿请求权", "婚后共同还贷及对应增值部分应予补偿。");
  else if (intermediate["不纳入分割"]) push("房产最终产权归属", composite["父母名义房改房"] ? "归父母名下权利人" : "应返还给付方", "该房产不纳入夫妻共同财产分割范围。");

  push("是否纳入离婚财产分割", intermediate["不纳入分割"] ? "否" : "是", intermediate["不纳入分割"] ? "不纳入分割范围。" : "应纳入分割范围。");

  if (intermediate["房产为共同财产"] && facts["双方对房屋价值归属无法协议"]) {
    let method = "由法院根据具体情况裁量处理";
    if (facts["房屋处置意愿"] === "竞价") method = "双方竞价取得";
    if (facts["房屋处置意愿"] === "评估补偿") method = "评估后由取得方补偿另一方";
    if (facts["房屋处置意愿"] === "拍卖变卖") method = "拍卖/变卖后分割价款";
    push("共同房产最终分割方式", method, "双方无法协商一致时，按法定规则处理。");
  }

  if (composite["有效离婚协议"]) push("离婚协议效力", "优先按离婚协议执行", "已存在有效协议且约定明确。");
  if (composite["可撤销未过户赠与"] || composite["可争议已过户短婚赠与"] || facts["存在赠与撤销法定情形"]) push("赠与约定处理", "可主张撤销赠与", "结合是否过户、婚姻存续时长及法定情形综合判断。");
  if (intermediate["房产为混合财产"]) push("共同还贷及增值补偿", "登记方应补偿另一方", "依据共同还贷金额及对应增值核算。");
  if (composite["家务劳动补偿"]) push("家务劳动补偿", "负担较多义务方可获补偿", "补偿数额由法院综合因素确定。");
  if (composite["过错方少分不分"]) push("过错方分割比例调整", "可对过错方少分或不分", "存在财产处置不当行为。");
  if (composite["无过错方多分"]) push("无过错方权益照顾", "无过错方可主张多分", "法院分割时可照顾无过错方权益。");
  return finalResults;
}

function judge(answers) {
  const facts = extractFacts(answers || {});
  const preconditionMet = facts["存在合法婚姻关系"] && facts["婚姻关系已经解除或正在解除"] && facts["存在房产分割争议"];
  if (!preconditionMet) {
    return {
      success: false,
      message: "不满足离婚房产分割的前置条件",
      detail: !facts["存在合法婚姻关系"]
        ? "双方不存在合法婚姻关系，不适用离婚房产分割规则。"
        : (!facts["婚姻关系已经解除或正在解除"] ? "婚姻关系尚未解除且未在解除过程中，暂不适用该规则。" : "不存在房产分割争议，无需启动裁判程序。"),
      facts, activatedPaths: [], conclusions: [], finalResults: [], lawsApplied: [],
      step2: buildStep2MetaForCause(step2Targets, facts)
    };
  }

  const { composite, activatedPaths } = evaluateCompositeElements(facts);
  const { intermediate, conclusions } = evaluateIntermediateResults(composite, facts);
  const finalResults = generateFinalResult(intermediate, composite, facts);
  const lawRefIds = new Set();
  activatedPaths.forEach(p => { if (p.lawRef) lawRefIds.add(p.lawRef); });
  conclusions.forEach(c => (c.lawRefs || []).forEach(r => lawRefIds.add(r)));
  const lawsApplied = lawDatabase.filter(l => lawRefIds.has(l.id));
  return { success: true, message: "裁判推理完成", facts, activatedPaths, conclusions, finalResults, lawsApplied, step2: buildStep2MetaForCause(step2Targets, facts) };
}

// ========================
// 劳动：拖欠工资
// ========================
function judgeLaborUnpaidWages(answers) {
  const facts = {
    "存在劳动关系": b(answers["存在劳动关系"]),
    "已提供劳动": b(answers["已提供劳动"]),
    "存在欠薪": b(answers["存在欠薪"]),
    "欠薪金额": parseFloat(answers["欠薪金额"]) || 0,
    "欠薪时长": parseInt(answers["欠薪时长"], 10) || 0,
    "有工资约定依据": b(answers["有工资约定依据"]),
    "有考勤或工作记录": b(answers["有考勤或工作记录"]),
    "有工资支付记录": b(answers["有工资支付记录"]),
    "有催要工资记录": b(answers["有催要工资记录"]),
    "单位书面承认欠薪": b(answers["单位书面承认欠薪"]),
    "有明确工资周期约定": b(answers["有明确工资周期约定"]),
    "主张加班费": b(answers["主张加班费"]),
    "有加班事实证据": b(answers["有加班事实证据"]),
    "有加班工资约定依据": b(answers["有加班工资约定依据"]),
    "主张解除补偿": b(answers["主张解除补偿"]),
    "解除原因偏向单位责任": b(answers["解除原因偏向单位责任"]),
    "已向劳动监察投诉": b(answers["已向劳动监察投诉"]),
    "单位逾期仍未支付": b(answers["单位逾期仍未支付"])
  };

  if (!(facts["存在劳动关系"] && facts["已提供劳动"] && facts["存在欠薪"])) {
    return { success: false, message: "不满足拖欠工资纠纷的前置条件", detail: "需同时满足：存在劳动关系、已提供劳动、存在欠薪。", facts, activatedPaths: [], conclusions: [], finalResults: [], lawsApplied: [], step2: buildStep2MetaForCause(laborUnpaidRules.step2Targets || [], facts) };
  }

  const activatedPaths = [];
  const conclusions = [];
  const finalResults = [];
  const lawRefIds = new Set();
  const evidenceStrong = facts["有工资约定依据"] || facts["有考勤或工作记录"] || facts["单位书面承认欠薪"] || facts["有工资支付记录"];
  const evidenceMedium = facts["有催要工资记录"] || facts["有明确工资周期约定"];

  if (evidenceStrong) {
    activatedPaths.push({ name: "拖欠工资核心事实成立", conditions: ["存在劳动关系=是", "已提供劳动=是", "存在欠薪=是", "存在核心证据之一=是"], calc: "与+或", lawRef: "law_contract_30" });
    conclusions.push({ type: "labor_payment", result: "欠薪请求具有较高支持可能性", reason: "已具备劳动关系、劳动提供、欠薪事实及核心证据链。", lawRefs: ["law_labor_50", "law_contract_30", "law_contract_85"], level: "important" });
    finalResults.push({ item: "欠薪支付请求", result: "可优先主张足额支付拖欠工资", detail: "建议申请劳动仲裁并提交劳动关系、劳动提供、欠薪金额及催要记录等证据。" });
  } else if (evidenceMedium) {
    conclusions.push({ type: "labor_payment", result: "欠薪主张具备一定基础，但仍需补强核心证据", reason: "已有催要记录或工资周期约定，但劳动提供与工资发放链条仍需强化。", lawRefs: ["law_labor_50", "law_contract_30"], level: "warning" });
    finalResults.push({ item: "欠薪支付请求", result: "可主张，建议先补齐核心证据", detail: "建议补齐工资条、银行流水、考勤记录后再进入仲裁程序。" });
  } else {
    conclusions.push({ type: "labor_payment", result: "欠薪主张存在证据不足风险", reason: "工资约定依据、工作记录或单位承认材料不足。", lawRefs: ["law_contract_30"], level: "warning" });
    finalResults.push({ item: "欠薪支付请求", result: "可主张，但需补强证据", detail: "请补充劳动合同、工资条、考勤记录、催要沟通记录等关键证据。" });
  }

  if (facts["主张加班费"] && facts["有加班事实证据"] && facts["有加班工资约定依据"]) {
    activatedPaths.push({ name: "加班费请求要件路径命中", conditions: ["主张加班费=是", "有加班事实证据=是", "有加班工资约定依据=是"], calc: "与", lawRef: "law_contract_30" });
    conclusions.push({ type: "labor_payment", result: "加班费请求具备基础支持条件", reason: "已明确加班请求，且有加班事实证据及计算依据。", lawRefs: ["law_contract_30"], level: "important" });
    finalResults.push({ item: "加班费请求", result: "可一并主张", detail: "建议按工作日/休息日/法定节假日分开整理加班证据并核算金额。" });
  } else if (facts["主张加班费"]) {
    conclusions.push({ type: "labor_payment", result: "加班费请求证据链不完整", reason: "已提出加班费请求，但加班事实证据或计算依据缺失。", lawRefs: ["law_contract_30"], level: "warning" });
  }

  if (facts["主张解除补偿"] && facts["存在欠薪"] && facts["解除原因偏向单位责任"]) {
    activatedPaths.push({ name: "欠薪解除补偿路径命中", conditions: ["主张解除补偿=是", "存在欠薪=是", "解除原因偏向单位责任=是"], calc: "与", lawRef: "law_contract_85" });
    conclusions.push({ type: "labor_contract", result: "解除补偿请求有一定支持可能", reason: "存在欠薪，且解除原因与单位违约行为相关。", lawRefs: ["law_contract_85"], level: "important" });
    finalResults.push({ item: "解除补偿请求", result: "可结合欠薪事实一并主张", detail: "建议保留解除前催告记录与解除通知，形成完整时间线。" });
  } else if (facts["主张解除补偿"]) {
    conclusions.push({ type: "labor_contract", result: "解除补偿请求仍需补强", reason: "尚需证明解除原因与单位欠薪行为存在直接关联。", lawRefs: ["law_contract_85"], level: "warning" });
  }

  if (facts["已向劳动监察投诉"] && facts["单位逾期仍未支付"]) {
    activatedPaths.push({ name: "欠薪逾期支付路径命中", conditions: ["存在欠薪=是", "已投诉/催告=是", "单位逾期仍未支付=是"], calc: "与", lawRef: "law_contract_85" });
    conclusions.push({ type: "labor_payment", result: "可进一步主张逾期支付加付赔偿金", reason: "欠薪在投诉/催告后仍未改正，符合加付赔偿金主张方向。", lawRefs: ["law_contract_85", "law_reg_16"], level: "important" });
    finalResults.push({ item: "加付赔偿金请求", result: "具备主张基础", detail: "建议提交投诉回执、限期支付通知及逾期未支付证明材料。" });
  }

  conclusions.forEach(c => (c.lawRefs || []).forEach(r => lawRefIds.add(r)));
  activatedPaths.forEach(p => { if (p.lawRef) lawRefIds.add(p.lawRef); });
  const lawsApplied = (laborUnpaidRules.lawDatabase || []).filter(l => lawRefIds.has(l.id));
  return { success: true, message: "拖欠工资纠纷推理完成", facts, activatedPaths, conclusions, finalResults, lawsApplied, step2: buildStep2MetaForCause(laborUnpaidRules.step2Targets || [], facts) };
}

function judgeLaborNoContract(answers) {
  const facts = {
    "存在劳动关系": b(answers["存在劳动关系"]),
    "未签书面劳动合同": b(answers["未签书面劳动合同"]),
    "入职月数": parseInt(answers["入职月数"], 10) || 0,
    "已补签劳动合同": b(answers["已补签劳动合同"]),
    "有工资支付记录": b(answers["有工资支付记录"]),
    "有工作管理证据": b(answers["有工作管理证据"]),
    "单位拒绝签合同": b(answers["单位拒绝签合同"]),
    "主张补签书面合同": b(answers["主张补签书面合同"]),
    "主张无固定期限合同": b(answers["主张无固定期限合同"]),
    "满足无固定期限条件": b(answers["满足无固定期限条件"])
  };

  if (!(facts["存在劳动关系"] && facts["未签书面劳动合同"])) {
    return { success: false, message: "不满足未签劳动合同纠纷的前置条件", detail: "需同时满足：存在劳动关系、未签书面劳动合同。", facts, activatedPaths: [], conclusions: [], finalResults: [], lawsApplied: [], step2: buildStep2MetaForCause(laborNoContractRules.step2Targets || [], facts) };
  }

  const activatedPaths = [];
  const conclusions = [];
  const finalResults = [];
  const lawRefIds = new Set();
  const canClaimDouble = facts["入职月数"] > 1 && !facts["已补签劳动合同"] && facts["有工资支付记录"];
  const relationStrong = facts["有工资支付记录"] && facts["有工作管理证据"];
  if (relationStrong) {
    activatedPaths.push({ name: "劳动关系证据链较完整", conditions: ["有工资支付记录=是", "有工作管理证据=是"], calc: "与", lawRef: "law_contract_10" });
  }

  if (canClaimDouble) {
    activatedPaths.push({ name: "未签合同双倍工资要件成立", conditions: ["存在劳动关系=是", "未签书面劳动合同=是", "超过1个月仍未签=是", "有工资支付记录=是"], calc: "与", lawRef: "law_contract_82" });
    conclusions.push({ type: "labor_contract", result: "可主张未签书面劳动合同期间双倍工资", reason: "入职超过一个月未签劳动合同且有工资支付事实支持。", lawRefs: ["law_contract_10", "law_contract_82"], level: "important" });
    finalResults.push({ item: "双倍工资请求", result: "可主张（符合法定要件）", detail: "建议按入职时间线整理证据，核算可主张区间后通过劳动仲裁主张。" });
  } else {
    conclusions.push({ type: "labor_contract", result: "双倍工资请求存在要件不足", reason: "可能未满足“超过一个月仍未签”或关键证据不足。", lawRefs: ["law_contract_10", "law_contract_82"], level: "warning" });
    finalResults.push({ item: "双倍工资请求", result: "暂不稳妥", detail: "建议补充入职时间、工资支付、管理从属性证据后再评估。" });
  }

  if (facts["主张补签书面合同"] && facts["未签书面劳动合同"]) {
    activatedPaths.push({ name: "补签劳动合同请求路径命中", conditions: ["存在劳动关系=是", "未签书面劳动合同=是", "主张补签合同=是"], calc: "与", lawRef: "law_contract_10" });
    conclusions.push({ type: "labor_contract", result: "可请求单位补签书面劳动合同", reason: "劳动关系存续且未签书面合同，补签请求具有正当性。", lawRefs: ["law_contract_10"], level: "important" });
    finalResults.push({ item: "补签劳动合同请求", result: "可主张", detail: "建议先发出书面补签申请并保留送达凭证。" });
  }

  if (facts["主张无固定期限合同"]) {
    if (facts["满足无固定期限条件"]) {
      conclusions.push({ type: "labor_contract", result: "无固定期限合同请求有支持可能", reason: "已明确主张且满足法定条件。", lawRefs: ["law_contract_14"], level: "important" });
      finalResults.push({ item: "无固定期限合同请求", result: "可主张", detail: "建议提交工龄、续签记录等证明满足法定条件。" });
    } else {
      conclusions.push({ type: "labor_contract", result: "无固定期限合同请求要件不足", reason: "目前尚未证明满足法定条件。", lawRefs: ["law_contract_14"], level: "warning" });
    }
  }

  if (facts["单位拒绝签合同"]) {
    activatedPaths.push({ name: "单位拒绝签约事实路径命中", conditions: ["未签书面劳动合同=是", "单位拒绝签合同=是"], calc: "与", lawRef: "law_contract_10" });
    conclusions.push({ type: "labor_contract", result: "可强调单位主观拒签责任", reason: "存在单位拒签沟通记录，可强化双倍工资主张说服力。", lawRefs: ["law_contract_10", "law_contract_82"], level: "important" });
  }

  conclusions.forEach(c => (c.lawRefs || []).forEach(r => lawRefIds.add(r)));
  activatedPaths.forEach(p => { if (p.lawRef) lawRefIds.add(p.lawRef); });
  const lawsApplied = (laborNoContractRules.lawDatabase || []).filter(l => lawRefIds.has(l.id));
  return { success: true, message: "未签劳动合同纠纷推理完成", facts, activatedPaths, conclusions, finalResults, lawsApplied, step2: buildStep2MetaForCause(laborNoContractRules.step2Targets || [], facts) };
}

function judgeLaborIllegalTermination(answers) {
  const reasonType = answers["解除理由类型"] || "unknown";
  const facts = {
    "存在劳动关系": b(answers["存在劳动关系"]),
    "已被解除或辞退": b(answers["已被解除或辞退"]),
    "有解除通知": b(answers["有解除通知"]),
    "解除通知为书面": b(answers["解除通知为书面"]),
    "解除理由_39": reasonType === "article_39",
    "解除理由_40": reasonType === "article_40",
    "解除理由_41": reasonType === "article_41",
    "解除理由不明确": reasonType === "unknown",
    "提前30日通知或支付代通知金": b(answers["提前30日通知或支付代通知金"]),
    "单位是否履行工会程序": b(answers["单位是否履行工会程序"]),
    "规章制度已公示且合法": b(answers["规章制度已公示且合法"]),
    "处于特殊保护期": b(answers["处于特殊保护期"]),
    "单位有严重违纪证据": b(answers["单位有严重违纪证据"]),
    "经济性裁员符合法定人数与报告程序": b(answers["经济性裁员符合法定人数与报告程序"]),
    "主张继续履行劳动合同": b(answers["主张继续履行劳动合同"]),
    "主张停工期间工资损失": b(answers["主张停工期间工资损失"])
  };

  if (!(facts["存在劳动关系"] && facts["已被解除或辞退"])) {
    return { success: false, message: "不满足违法解除劳动关系纠纷的前置条件", detail: "需同时满足：存在劳动关系，且已发生解除/辞退。", facts, activatedPaths: [], conclusions: [], finalResults: [], lawsApplied: [], step2: buildStep2MetaForCause(laborIllegalTerminationRules.step2Targets || [], facts) };
  }

  const activatedPaths = [];
  const conclusions = [];
  const finalResults = [];
  const lawRefIds = new Set();
  const illegalLikely =
    facts["解除理由不明确"] ||
    (facts["有解除通知"] && !facts["解除通知为书面"]) ||
    (facts["解除理由_40"] && !facts["提前30日通知或支付代通知金"]) ||
    (facts["解除理由_39"] && (!facts["单位有严重违纪证据"] || !facts["规章制度已公示且合法"])) ||
    (facts["解除理由_41"] && !facts["经济性裁员符合法定人数与报告程序"]) ||
    !facts["单位是否履行工会程序"] ||
    facts["处于特殊保护期"];
  facts["解除程序或理由存在瑕疵"] = illegalLikely;

  if (illegalLikely) {
    activatedPaths.push({ name: "违法解除判断路径命中", conditions: ["存在劳动关系=是", "已被解除或辞退=是", "理由或程序存在违法瑕疵=是"], calc: "与/或", lawRef: "law_contract_48" });
    conclusions.push({ type: "labor_termination", result: "解除行为存在较高概率被认定为违法", reason: "解除理由或程序不符合法定要求，或存在特殊保护期内解除风险。", lawRefs: ["law_contract_39", "law_contract_40", "law_contract_41", "law_contract_48", "law_contract_87"], level: "important" });
    finalResults.push({ item: "违法解除判断", result: "可优先主张认定为违法解除", detail: "建议围绕解除理由合法性、解除程序合法性、特殊保护期事实整理证据。" });
  } else {
    conclusions.push({ type: "labor_termination", result: "目前证据显示解除较可能符合法定情形", reason: "解除理由类型指向法定条款且程序上未见明显违法点。", lawRefs: ["law_contract_39", "law_contract_40", "law_contract_41"], level: "warning" });
    finalResults.push({ item: "违法解除判断", result: "暂无充分依据支持违法解除", detail: "可补充解除通知、规章制度公示、工会意见、保护期证明等材料后再评估。" });
  }

  if (facts["解除理由_39"] && !facts["单位有严重违纪证据"]) {
    activatedPaths.push({ name: "第39条理由证据不足路径命中", conditions: ["解除理由=第39条", "单位无严重违纪证据"], calc: "与", lawRef: "law_contract_39" });
  }
  if (facts["解除理由_40"] && !facts["提前30日通知或支付代通知金"]) {
    activatedPaths.push({ name: "第40条通知义务缺失路径命中", conditions: ["解除理由=第40条", "未提前30日通知或代通知金"], calc: "与", lawRef: "law_contract_40" });
  }
  if (facts["解除理由_41"] && !facts["经济性裁员符合法定人数与报告程序"]) {
    activatedPaths.push({ name: "第41条裁员程序不足路径命中", conditions: ["解除理由=第41条", "未满足法定人数或报告程序"], calc: "与", lawRef: "law_contract_41" });
  }

  if (!facts["单位是否履行工会程序"]) {
    conclusions.push({ type: "labor_termination", result: "解除程序存在工会程序瑕疵风险", reason: "单位未充分履行工会程序，程序合法性存在明显争议点。", lawRefs: ["law_contract_41", "law_contract_48"], level: "warning" });
  }

  if (facts["解除理由_41"] && !facts["经济性裁员符合法定人数与报告程序"]) {
    conclusions.push({ type: "labor_termination", result: "经济性裁员程序合法性不足", reason: "经济性裁员未充分体现法定人数或报告程序要求。", lawRefs: ["law_contract_41", "law_contract_48"], level: "warning" });
  }

  if (facts["主张继续履行劳动合同"]) finalResults.push({ item: "诉请方向", result: "可请求继续履行劳动合同", detail: "如劳动者主张继续履行且用人单位仍可继续履行，可作为主要请求。" });
  if (facts["主张停工期间工资损失"]) finalResults.push({ item: "诉请方向", result: "可主张停工期间工资损失", detail: "建议结合停工期间证据材料核算损失并一并主张。" });

  conclusions.forEach(c => (c.lawRefs || []).forEach(r => lawRefIds.add(r)));
  activatedPaths.forEach(p => { if (p.lawRef) lawRefIds.add(p.lawRef); });
  const lawsApplied = (laborIllegalTerminationRules.lawDatabase || []).filter(l => lawRefIds.has(l.id));
  return { success: true, message: "违法解除劳动关系纠纷推理完成", facts, activatedPaths, conclusions, finalResults, lawsApplied, step2: buildStep2MetaForCause(laborIllegalTerminationRules.step2Targets || [], facts) };
}

function buildTargetChecklist(target, facts) {
  const requiredFacts = target.requiredFacts || [];
  const factChecklist = [];
  const evidenceChecklist = [];
  let provedCount = 0;
  for (let i = 0; i < requiredFacts.length; i++) {
    const rf = requiredFacts[i];
    const proved = facts[rf.key] === true;
    if (proved) provedCount++;
    factChecklist.push({ key: rf.key, label: rf.label, proved: proved });
    if (!proved) {
      evidenceChecklist.push({
        factKey: rf.key,
        factLabel: rf.label,
        evidenceTypes: (target.evidenceMap && target.evidenceMap[rf.key]) || []
      });
    }
  }
  return { factChecklist, evidenceChecklist, provedCount, totalCount: requiredFacts.length };
}

function buildStep2MetaForCause(targets, facts) {
  const scored = (targets || []).map(t => {
    const checklist = buildTargetChecklist(t, facts || {});
    return {
      targetId: t.targetId,
      title: t.title,
      desc: t.desc,
      matchScore: checklist.totalCount > 0 ? checklist.provedCount / checklist.totalCount : 0
    };
  }).sort((a, b2) => b2.matchScore - a.matchScore);
  return {
    targets: scored,
    suggestedTargetIds: scored.filter(t => t.matchScore >= 0.5).map(t => t.targetId)
  };
}

function buildStep2PlanFromResultAndRules(result, rulesData, targetId) {
  const targets = rulesData.step2Targets || [];
  const target = targets.find(t => t.targetId === targetId) || targets[0];
  if (!target) return { targetId: "", title: "暂无可争取目标", legalRefs: [], factChecklist: [], evidenceChecklist: [] };
  const checklist = buildTargetChecklist(target, (result && result.facts) || {});
  const laws = (rulesData.lawDatabase || []).filter(l => (target.legalRefs || []).indexOf(l.id) !== -1);
  return {
    targetId: target.targetId,
    title: target.title,
    desc: target.desc,
    legalRefs: laws,
    factChecklist: checklist.factChecklist,
    evidenceChecklist: checklist.evidenceChecklist,
    provedCount: checklist.provedCount,
    totalCount: checklist.totalCount
  };
}

function judgeByCause(causeCode, answers) {
  if (causeCode === "labor_unpaid_wages") return judgeLaborUnpaidWages(answers || {});
  if (causeCode === "labor_no_contract") return judgeLaborNoContract(answers || {});
  if (causeCode === "labor_illegal_termination") return judgeLaborIllegalTermination(answers || {});
  return judge(answers || {});
}

function buildStep2PlanByCause(causeCode, answers, targetId) {
  if (causeCode === "labor_unpaid_wages") return buildStep2PlanFromResultAndRules(judgeLaborUnpaidWages(answers || {}), laborUnpaidRules, targetId);
  if (causeCode === "labor_no_contract") return buildStep2PlanFromResultAndRules(judgeLaborNoContract(answers || {}), laborNoContractRules, targetId);
  if (causeCode === "labor_illegal_termination") return buildStep2PlanFromResultAndRules(judgeLaborIllegalTermination(answers || {}), laborIllegalTerminationRules, targetId);
  return buildStep2PlanFromResultAndRules(judge(answers || {}), { lawDatabase, step2Targets }, targetId);
}

module.exports = {
  judgeByCause,
  buildStep2PlanByCause,
  judge,
  extractFacts,
  evaluateCompositeElements,
  evaluateIntermediateResults,
  generateFinalResult
};
