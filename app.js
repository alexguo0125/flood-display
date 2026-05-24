/* ═══════════════════════════════════════════════════════
   Flood Display — PWA App Logic
   ═══════════════════════════════════════════════════════ */

'use strict';

// Deployment config -------------------------------------------------------
// GitHub Pages hosts this frontend. OpenRouter must be called only by the
// backend, so replace this placeholder with your deployed Vercel backend URL.
// For local testing through `npm start`, localhost uses same-origin `/api`.
const API_BASE_URL = window.FLOOD_API_BASE_URL || (
  ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? ''
    : 'https://YOUR-VERCEL-BACKEND.vercel.app' // TODO: replace after Vercel deployment
);
const API_TIMEOUT_MS = 12000;


// ─── PWA service worker registration ─────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .catch(e => console.warn('Service worker registration failed:', e));
}

// ─── Translations ─────────────────────────────────────────
const T = {
  "English": {
    title: "FLOOD  DISPLAY",
    low: "Low", medium: "Medium", high: "High",
    happening_label: "What's currently happening:",
    action_label: "Action:",
    normal_mode: "Normal Mode",
    low_battery_mode: "Low Battery Mode",
    connection_lost_mode: "Connection Lost Mode",
    sim_low: "Historical Scenario: Ready",
    sim_med: "Historical Scenario: Prepare",
    sim_high: "Historical Scenario: Act Now",
    low_battery_title: "LOW BATTERY",
    low_battery_msg: "Please charge the device.",
    connection_lost_title: "Connection Lost",
    no_signal: "NO SIGNAL",
    last_known: "Displaying last known update.",
    last_known_risk: "Last known risk",
    night_mode_chk: "Night Mode",
    happening: {
      LOW:    "River levels are within normal range near Maribyrnong.",
      MEDIUM: "River level is rising near Maribyrnong.",
      HIGH:   "Emergency flood warning has been detected near Maribyrnong.",
    },
    actions: {
      LOW:    ["You are currently safe.",
               "Keep monitoring updates.",
               "Review your household flood plan."],
      MEDIUM: ["Prepare your emergency bag.",
               "Move important items above floor level.",
               "Check road conditions before travelling."],
      HIGH:   ["Move your car to higher ground.",
               "Avoid walking or driving through floodwater.",
               "Keep your phone charged.",
               "Prepare to leave if advised by authorities."],
    },
  },
  "中文": {
    title: "洪水显示",
    low: "低", medium: "中", high: "高",
    happening_label: "当前情况：",
    action_label: "建议行动：",
    normal_mode: "正常模式",
    low_battery_mode: "低电量模式",
    connection_lost_mode: "断线模式",
    sim_low: "模拟低风险",
    sim_med: "模拟中等风险",
    sim_high: "模拟高风险",
    low_battery_title: "电量不足",
    low_battery_msg: "请为设备充电。",
    connection_lost_title: "连接中断",
    no_signal: "无信号",
    last_known: "显示最后已知更新。",
    last_known_risk: "最后已知风险",
    night_mode_chk: "夜间模式",
    happening: {
      LOW:    "马里比农附近河流水位处于正常范围内。",
      MEDIUM: "马里比农附近河流水位正在上升。",
      HIGH:   "马里比农附近已发出紧急洪水预警。",
    },
    actions: {
      LOW:    ["您目前安全。", "继续监控更新。", "检查您家庭的洪水应急计划。"],
      MEDIUM: ["准备好紧急物品包。", "将重要物品移至地板以上。", "出行前检查道路状况。"],
      HIGH:   ["将您的车移至高处。", "避免步行或驾车穿越洪水。",
               "保持手机充电。", "如当局建议，做好撤离准备。"],
    },
  },
  "Tiếng Việt": {
    title: "HIỂN THỊ LŨ",
    low: "Thấp", medium: "Trung bình", high: "Cao",
    happening_label: "Điều đang xảy ra:",
    action_label: "Hành động:",
    normal_mode: "Chế độ thường",
    low_battery_mode: "Pin yếu",
    connection_lost_mode: "Mất kết nối",
    sim_low: "Mô phỏng rủi ro thấp",
    sim_med: "Mô phỏng rủi ro trung bình",
    sim_high: "Mô phỏng rủi ro cao",
    low_battery_title: "PIN YẾU",
    low_battery_msg: "Vui lòng sạc thiết bị.",
    connection_lost_title: "Mất kết nối",
    no_signal: "KHÔNG CÓ TÍN HIỆU",
    last_known: "Hiển thị cập nhật đã biết cuối cùng.",
    last_known_risk: "Rủi ro đã biết cuối cùng",
    night_mode_chk: "Chế độ đêm",
    happening: {
      LOW:    "Mực nước sông ở mức bình thường gần Maribyrnong.",
      MEDIUM: "Mực nước sông đang tăng gần Maribyrnong.",
      HIGH:   "Đã phát hiện cảnh báo lũ khẩn cấp gần Maribyrnong.",
    },
    actions: {
      LOW:    ["Bạn hiện đang an toàn.", "Tiếp tục theo dõi cập nhật.",
               "Xem lại kế hoạch phòng chống lũ lụt của gia đình."],
      MEDIUM: ["Chuẩn bị túi khẩn cấp.", "Di chuyển đồ quan trọng lên cao hơn mặt sàn.",
               "Kiểm tra tình trạng đường trước khi đi."],
      HIGH:   ["Di chuyển xe đến vùng đất cao hơn.", "Tránh đi bộ hoặc lái xe qua nước lũ.",
               "Giữ điện thoại đầy pin.", "Chuẩn bị sơ tán nếu chính quyền yêu cầu."],
    },
  },
  "Français": {
    title: "AFFICHAGE CRUE",
    low: "Faible", medium: "Moyen", high: "Élevé",
    happening_label: "Ce qui se passe actuellement :",
    action_label: "Action :",
    normal_mode: "Mode normal",
    low_battery_mode: "Batterie faible",
    connection_lost_mode: "Connexion perdue",
    sim_low: "Simuler risque faible",
    sim_med: "Simuler risque moyen",
    sim_high: "Simuler risque élevé",
    low_battery_title: "BATTERIE FAIBLE",
    low_battery_msg: "Veuillez charger l'appareil.",
    connection_lost_title: "Connexion perdue",
    no_signal: "AUCUN SIGNAL",
    last_known: "Affichage de la dernière mise à jour connue.",
    last_known_risk: "Dernier risque connu",
    night_mode_chk: "Mode nuit",
    happening: {
      LOW:    "Les niveaux de la rivière sont normaux près de Maribyrnong.",
      MEDIUM: "Le niveau de la rivière monte près de Maribyrnong.",
      HIGH:   "Une alerte d'inondation d'urgence a été détectée près de Maribyrnong.",
    },
    actions: {
      LOW:    ["Vous êtes actuellement en sécurité.", "Continuez à surveiller les mises à jour.",
               "Révisez votre plan d'inondation familial."],
      MEDIUM: ["Préparez votre sac d'urgence.", "Déplacez les objets importants au-dessus du sol.",
               "Vérifiez les conditions routières avant de voyager."],
      HIGH:   ["Déplacez votre voiture en terrain plus élevé.",
               "Évitez de marcher ou conduire dans les eaux de crue.",
               "Gardez votre téléphone chargé.",
               "Préparez-vous à partir si les autorités le conseillent."],
    },
  },
  "日本語": {
    title: "洪水表示",
    low: "低", medium: "中", high: "高",
    happening_label: "現在の状況：",
    action_label: "対応：",
    normal_mode: "通常モード",
    low_battery_mode: "低バッテリー",
    connection_lost_mode: "接続切断",
    sim_low: "低リスクをシミュレート",
    sim_med: "中リスクをシミュレート",
    sim_high: "高リスクをシミュレート",
    low_battery_title: "バッテリー残量低下",
    low_battery_msg: "デバイスを充電してください。",
    connection_lost_title: "接続が切断されました",
    no_signal: "信号なし",
    last_known: "最後の既知の更新を表示しています。",
    last_known_risk: "最後の既知のリスク",
    night_mode_chk: "ナイトモード",
    happening: {
      LOW:    "マリビルノン付近の河川水位は正常範囲内です。",
      MEDIUM: "マリビルノン付近で河川水位が上昇しています。",
      HIGH:   "マリビルノン付近で緊急洪水警報が検出されました。",
    },
    actions: {
      LOW:    ["現在安全です。", "引き続き更新情報を確認してください。",
               "家庭の洪水計画を見直してください。"],
      MEDIUM: ["非常用袋を準備してください。", "重要な物を床より高い場所に移動してください。",
               "外出前に道路状況を確認してください。"],
      HIGH:   ["車を高い場所に移動してください。", "洪水の中を歩いたり運転したりしないでください。",
               "携帯電話を充電しておいてください。", "当局の指示があれば避難の準備をしてください。"],
    },
  },
  "한국어": {
    title: "홍수 표시",
    low: "낮음", medium: "보통", high: "높음",
    happening_label: "현재 상황:",
    action_label: "행동 지침:",
    normal_mode: "일반 모드",
    low_battery_mode: "배터리 부족",
    connection_lost_mode: "연결 끊김",
    sim_low: "낮은 위험 시뮬레이션",
    sim_med: "중간 위험 시뮬레이션",
    sim_high: "높은 위험 시뮬레이션",
    low_battery_title: "배터리 부족",
    low_battery_msg: "장치를 충전하세요.",
    connection_lost_title: "연결이 끊겼습니다",
    no_signal: "신호 없음",
    last_known: "마지막으로 알려진 업데이트를 표시합니다.",
    last_known_risk: "마지막으로 알려진 위험",
    night_mode_chk: "야간 모드",
    happening: {
      LOW:    "마리비르농 근처 강 수위가 정상 범위 내에 있습니다.",
      MEDIUM: "마리비르농 근처 강 수위가 상승하고 있습니다.",
      HIGH:   "마리비르농 근처에서 긴급 홍수 경보가 감지되었습니다.",
    },
    actions: {
      LOW:    ["현재 안전합니다.", "계속해서 업데이트를 모니터링하세요.",
               "가정 홍수 계획을 검토하세요."],
      MEDIUM: ["비상 가방을 준비하세요.", "중요한 물건을 바닥 위로 이동하세요.",
               "이동 전 도로 상황을 확인하세요."],
      HIGH:   ["차량을 높은 곳으로 이동하세요.", "홍수 물을 걷거나 운전해서 통과하지 마세요.",
               "휴대폰을 충전 상태로 유지하세요.", "당국의 지시가 있으면 대피 준비를 하세요."],
    },
  },
  "Français": {
    controls: {
      current: "Mode officiel actuel",
      ready: "Scénario historique : prêt",
      prepare: "Scénario historique : préparer",
      actNow: "Scénario historique : agir maintenant",
      leaveNow: "Scénario historique : partir maintenant",
      offline: "Scénario historique : connexion perdue",
      historicalStatus: "Mode scénario historique - données contrôlées du prototype.",
      currentLoaded: "Mode officiel actuel chargé depuis le fichier local.",
      currentNeedsBackend: "Le mode actuel utilise les données de démonstration locales.",
      officialUnavailable: "Source officielle indisponible ; fichier du mode officiel actuel utilisé.",
      officialNoWarning: "Sources officielles vérifiées : aucune alerte de crue actuelle pour Maribyrnong.",
      officialMatched: "La source officielle correspond à des données d'événement Maribyrnong.",
    },
    trace: {
      title: "TRAÇABILITÉ DES DONNÉES",
      mode: "Mode",
      scenario: "Scénario",
      warning: "Alerte",
      source: "Source",
      updated: "Mis à jour",
      status: "Statut",
      rule: "Règle",
      real: "Réel actuel",
      yes: "oui",
      no: "non",
      controlledNote: "Scénario contrôlé du prototype, pas une alerte en direct.",
      currentNote: "Vérification de la source officielle actuelle.",
    },
    modeLabels: { current: "Mode officiel actuel", historical: "Mode scénario historique", manual: "Contrôle manuel de démo" },
    scenarioNames: { CURRENT_NORMAL: "Situation actuelle normale", READY: "Prêt", PREPARE: "Préparer", ACT_NOW: "Agir maintenant", LEAVE_NOW: "Partir maintenant", OFFLINE: "Connexion perdue" },
    dataStatus: { current: "actuel", controlled_demo: "données contrôlées du prototype", connection_lost: "connexion perdue", stale: "périmé" },
    rules: {
      READY: "Aucune alerte -> PRÊT",
      PREPARE: "Advice -> PRÉPARER",
      ACT_NOW: "Watch and Act -> AGIR MAINTENANT",
      LEAVE_NOW: "Emergency Warning/Evacuate -> PARTIR MAINTENANT",
      OFFLINE: "périmé/connexion perdue -> HORS LIGNE",
    },
    riskBadges: { READY: "FAIBLE", PREPARE: "MOYEN", ACT_NOW: "ÉLEVÉ", LEAVE_NOW: "GRAVE", OFFLINE: "DERNIER CONNU" },
    route: {
      label: "ITINÉRAIRE SÛR",
      diagram: "VOUS -> TERRAIN ÉLEVÉ -> CENTRE OFFICIEL SI ANNONCÉ",
      note: "Ne marchez, roulez ou conduisez jamais dans l'eau de crue. Évitez les berges et routes inondées.",
    },
    help: ["000 Urgence", "SES 132 500"],
    offline: {
      noSignal: "AUCUN SIGNAL",
      mode: "Mode hors ligne actif",
      lastUpdate: "Dernière mise à jour connue",
      source: "Source",
      lastRisk: "Dernier risque connu",
      lastAction: "Dernière action conseillée",
      demoMode: "Mode démo",
      ruleUsed: "Règle utilisée",
      checklist: "Image de liste d'urgence",
      language: "Langue",
      download: "Télécharger l'image",
      scan: "Scanner pour télécharger",
    },
    scenarios: {
      CURRENT_NORMAL: {
        actionState: "PRÊT",
        warning: "AUCUNE ALERTE",
        action: "Restez préparé. Vérifiez votre plan de crue.",
        happening: "Aucune alerte de crue pour Maribyrnong.",
        actions: ["Gardez le téléphone chargé.", "Connaissez votre itinéraire.", "Suivez les mises à jour officielles."],
      },
      READY: {
        actionState: "PRÊT",
        warning: "AUCUNE ALERTE",
        action: "Restez préparé. Vérifiez votre plan de crue.",
        happening: "Aucune alerte de crue pour Maribyrnong.",
        actions: ["Gardez le téléphone chargé.", "Connaissez votre itinéraire.", "Suivez les mises à jour officielles."],
      },
      PREPARE: {
        actionState: "PRÉPARER",
        warning: "ADVICE",
        action: "Préparez-vous maintenant. Les conditions peuvent changer.",
        happening: "La pluie et les niveaux de rivière peuvent augmenter.",
        actions: ["Préparez médicaments, pièce d'identité et chargeur.", "Mettez les objets précieux en hauteur.", "Vérifiez vos voisins."],
      },
      ACT_NOW: {
        actionState: "AGIR MAINTENANT",
        warning: "WATCH AND ACT",
        action: "Soyez prêt à partir. N'attendez pas.",
        happening: "Le risque d'inondation augmente dans les zones basses.",
        actions: ["Mettez le sac d'urgence près de la porte.", "Chargez le téléphone et la batterie.", "Préparez animaux, médicaments et documents."],
      },
      LEAVE_NOW: {
        actionState: "PARTIR MAINTENANT",
        warning: "ALERTE D'URGENCE",
        action: "Suivez les instructions d'évacuation maintenant.",
        happening: "L'inondation peut toucher les maisons ou les routes.",
        actions: ["Prenez le sac d'urgence.", "Prenez médicaments, animaux et documents.", "Allez vers un terrain élevé ou un centre officiel."],
      },
      OFFLINE: {
        actionState: "HORS LIGNE",
        warning: "DERNIÈRE ALERTE CONNUE",
        action: "Connexion perdue. Suivez la dernière alerte.",
        happening: "L'écran ne peut pas se mettre à jour maintenant.",
        actions: ["Suivez la dernière alerte affichée.", "Vérifiez téléphone, radio ou mises à jour officielles.", "Appelez le 000 si une vie est en danger."],
      },
    },
  },
  "日本語": {
    controls: {
      current: "現在の公式モード",
      ready: "履歴シナリオ：準備完了",
      prepare: "履歴シナリオ：準備",
      actNow: "履歴シナリオ：今すぐ行動",
      leaveNow: "履歴シナリオ：今すぐ避難",
      offline: "履歴シナリオ：接続切断",
      historicalStatus: "履歴シナリオモード - 管理されたプロトタイプデータ。",
      currentLoaded: "現在の公式モードをローカルデータから読み込みました。",
      currentNeedsBackend: "現在のモードはローカルのデモデータを使用します。",
      officialUnavailable: "公式エンドポイントに接続できません。現在の公式モードファイルを使用します。",
      officialNoWarning: "公式情報を確認：Maribyrnong の現在の洪水警報は見つかりません。",
      officialMatched: "公式情報で Maribyrnong の事象データが一致しました。",
    },
    trace: {
      title: "データ追跡",
      mode: "モード",
      scenario: "シナリオ",
      warning: "警報",
      source: "情報源",
      updated: "更新",
      status: "状態",
      rule: "規則",
      real: "現在実データ",
      yes: "はい",
      no: "いいえ",
      controlledNote: "管理されたプロトタイプシナリオであり、現在の警報ではありません。",
      currentNote: "現在の公式情報の確認。",
    },
    modeLabels: { current: "現在の公式モード", historical: "履歴シナリオモード", manual: "手動デモ操作" },
    scenarioNames: { CURRENT_NORMAL: "現在正常", READY: "準備完了", PREPARE: "準備", ACT_NOW: "今すぐ行動", LEAVE_NOW: "今すぐ避難", OFFLINE: "接続切断" },
    dataStatus: { current: "現在", controlled_demo: "管理されたプロトタイプデータ", connection_lost: "接続切断", stale: "古い" },
    rules: {
      READY: "警報なし -> 準備完了",
      PREPARE: "Advice -> 準備",
      ACT_NOW: "Watch and Act -> 今すぐ行動",
      LEAVE_NOW: "Emergency Warning/Evacuate -> 今すぐ避難",
      OFFLINE: "古い/接続切断 -> オフライン",
    },
    riskBadges: { READY: "低", PREPARE: "中", ACT_NOW: "高", LEAVE_NOW: "重大", OFFLINE: "最後の情報" },
    route: {
      label: "安全な経路",
      diagram: "あなた -> 高台 -> 発表された場合は公式救援センター",
      note: "洪水の中を歩く、走る、運転することは絶対に避けてください。川沿いの道や冠水道路を避けてください。",
    },
    help: ["000 緊急", "SES 132 500"],
    offline: {
      noSignal: "信号なし",
      mode: "オフラインモード",
      lastUpdate: "最後の更新を表示",
      source: "情報源",
      lastRisk: "最後のリスク",
      lastAction: "最後の行動指示",
      demoMode: "デモモード",
      ruleUsed: "使用規則",
      checklist: "緊急チェックリスト画像",
      language: "言語",
      download: "画像をダウンロード",
      scan: "スキャンしてダウンロード",
    },
    scenarios: {
      CURRENT_NORMAL: {
        actionState: "準備完了",
        warning: "警報なし",
        action: "備えを保ち、洪水計画を確認しましょう。",
        happening: "マリビルノンに洪水警報はありません。",
        actions: ["携帯電話を充電してください。", "安全な経路を確認してください。", "公式情報を確認してください。"],
      },
      READY: {
        actionState: "準備完了",
        warning: "警報なし",
        action: "備えを保ち、洪水計画を確認しましょう。",
        happening: "マリビルノンに洪水警報はありません。",
        actions: ["携帯電話を充電してください。", "安全な経路を確認してください。", "公式情報を確認してください。"],
      },
      PREPARE: {
        actionState: "準備",
        warning: "ADVICE",
        action: "今すぐ準備を。状況は変わる可能性があります。",
        happening: "雨と川の水位が上昇する可能性があります。",
        actions: ["薬、身分証、充電器を準備してください。", "貴重品を高い場所に移動してください。", "近隣の方を確認してください。"],
      },
      ACT_NOW: {
        actionState: "今すぐ行動",
        warning: "WATCH AND ACT",
        action: "避難の準備をしてください。待たないでください。",
        happening: "低地で洪水リスクが高まっています。",
        actions: ["非常用バッグを玄関に置いてください。", "携帯とモバイルバッテリーを充電してください。", "ペット、薬、書類を準備してください。"],
      },
      LEAVE_NOW: {
        actionState: "今すぐ避難",
        warning: "緊急警報",
        action: "今すぐ避難指示に従ってください。",
        happening: "洪水が住宅や道路に影響する可能性があります。",
        actions: ["非常用バッグを持ってください。", "薬、ペット、書類を持ってください。", "高台または公式の救援センターに避難してください。"],
      },
      OFFLINE: {
        actionState: "オフライン",
        warning: "最後の警報",
        action: "通信切断。最後の警報に従ってください。",
        happening: "現在、表示を更新できません。",
        actions: ["最後に表示された警報に従ってください。", "携帯、ラジオ、公式情報を確認してください。", "生命の危険がある場合は 000 に電話してください。"],
      },
    },
  },
  "한국어": {
    controls: {
      current: "현재 공식 모드",
      ready: "과거 시나리오: 준비 완료",
      prepare: "과거 시나리오: 준비",
      actNow: "과거 시나리오: 즉시 행동",
      leaveNow: "과거 시나리오: 즉시 대피",
      offline: "과거 시나리오: 연결 끊김",
      historicalStatus: "과거 시나리오 모드 - 통제된 프로토타입 데이터.",
      currentLoaded: "현재 공식 모드를 로컬 데이터 파일에서 불러왔습니다.",
      currentNeedsBackend: "현재 모드는 로컬 데모 데이터를 사용합니다.",
      officialUnavailable: "공식 엔드포인트를 사용할 수 없어 현재 공식 모드 파일을 사용합니다.",
      officialNoWarning: "공식 정보를 확인했습니다: Maribyrnong 현재 홍수 경보 없음.",
      officialMatched: "공식 정보가 Maribyrnong 이벤트 데이터와 일치했습니다.",
    },
    trace: {
      title: "데이터 추적",
      mode: "모드",
      scenario: "시나리오",
      warning: "경보",
      source: "출처",
      updated: "업데이트",
      status: "상태",
      rule: "규칙",
      real: "현재 실제",
      yes: "예",
      no: "아니오",
      controlledNote: "통제된 프로토타입 시나리오이며 실시간 경보가 아닙니다.",
      currentNote: "현재 공식 출처 확인.",
    },
    modeLabels: { current: "현재 공식 모드", historical: "과거 시나리오 모드", manual: "수동 데모 제어" },
    scenarioNames: { CURRENT_NORMAL: "현재 정상", READY: "준비 완료", PREPARE: "준비", ACT_NOW: "즉시 행동", LEAVE_NOW: "즉시 대피", OFFLINE: "연결 끊김" },
    dataStatus: { current: "현재", controlled_demo: "통제된 프로토타입 데이터", connection_lost: "연결 끊김", stale: "오래됨" },
    rules: {
      READY: "경보 없음 -> 준비 완료",
      PREPARE: "Advice -> 준비",
      ACT_NOW: "Watch and Act -> 즉시 행동",
      LEAVE_NOW: "Emergency Warning/Evacuate -> 즉시 대피",
      OFFLINE: "오래됨/연결 끊김 -> 오프라인",
    },
    riskBadges: { READY: "낮음", PREPARE: "보통", ACT_NOW: "높음", LEAVE_NOW: "심각", OFFLINE: "마지막 정보" },
    route: {
      label: "안전 경로",
      diagram: "나 -> 높은 지대 -> 발표 시 공식 구호 센터",
      note: "홍수 물을 걷거나 타거나 운전해서 지나가지 마세요. 강변 길과 침수 도로를 피하세요.",
    },
    help: ["000 긴급", "SES 132 500"],
    offline: {
      noSignal: "신호 없음",
      mode: "오프라인 모드 활성",
      lastUpdate: "마지막 업데이트 표시",
      source: "출처",
      lastRisk: "마지막 위험",
      lastAction: "마지막 권고 행동",
      demoMode: "데모 모드",
      ruleUsed: "사용 규칙",
      checklist: "비상 체크리스트 이미지",
      language: "언어",
      download: "이미지 다운로드",
      scan: "스캔하여 다운로드",
    },
    scenarios: {
      CURRENT_NORMAL: {
        actionState: "준비 완료",
        warning: "경보 없음",
        action: "준비하세요. 오늘 홍수 계획을 확인하세요.",
        happening: "마리비르농에 홍수 경보가 없습니다.",
        actions: ["휴대폰을 충전해 두세요.", "안전 경로를 확인하세요.", "공식 업데이트를 확인하세요."],
      },
      READY: {
        actionState: "준비 완료",
        warning: "경보 없음",
        action: "준비하세요. 오늘 홍수 계획을 확인하세요.",
        happening: "마리비르농에 홍수 경보가 없습니다.",
        actions: ["휴대폰을 충전해 두세요.", "안전 경로를 확인하세요.", "공식 업데이트를 확인하세요."],
      },
      PREPARE: {
        actionState: "준비",
        warning: "ADVICE",
        action: "지금 준비하세요. 상황이 바뀔 수 있습니다.",
        happening: "비와 강 수위가 상승할 수 있습니다.",
        actions: ["약, 신분증, 충전기를 챙기세요.", "귀중품을 높은 곳으로 옮기세요.", "이웃을 확인하세요."],
      },
      ACT_NOW: {
        actionState: "즉시 행동",
        warning: "WATCH AND ACT",
        action: "떠날 준비를 하세요. 기다리지 마세요.",
        happening: "저지대에서 홍수 위험이 증가하고 있습니다.",
        actions: ["비상 가방을 문 근처에 두세요.", "휴대폰과 보조 배터리를 충전하세요.", "반려동물, 약, 서류를 준비하세요."],
      },
      LEAVE_NOW: {
        actionState: "즉시 대피",
        warning: "긴급 경보",
        action: "지금 즉시 대피 지시를 따르세요.",
        happening: "홍수가 집이나 도로에 영향을 줄 수 있습니다.",
        actions: ["비상 가방을 가져가세요.", "약, 반려동물, 서류를 가져가세요.", "높은 지대 또는 공식 구호 센터로 가세요."],
      },
      OFFLINE: {
        actionState: "오프라인",
        warning: "마지막 경보",
        action: "연결 끊김. 마지막 경보를 따르세요.",
        happening: "현재 화면을 업데이트할 수 없습니다.",
        actions: ["마지막으로 표시된 경보를 따르세요.", "휴대폰, 라디오 또는 공식 업데이트를 확인하세요.", "생명이 위험하면 000에 전화하세요."],
      },
    },
  },
};

// ─── Emergency display copy ───────────────────────────────
const EMERGENCY_COPY = {
  "English": {
    labels: {
      mainAlert: "Main Alert",
      risk: "Risk:",
      happening: "WHAT IS HAPPENING",
      doNow: "DO NOW",
      safeRoute: "SAFE ROUTE",
      help: "HELP",
      source: "Source: VicEmergency / VICSES / Maribyrnong Council",
      updated: "Updated",
      connectionLost: "CONNECTION LOST",
      showingLastKnown: "Showing last known warning",
      followLastInstruction: "Follow the last instruction.",
    },
    warningType: {
      LOW: "FLOOD STATUS",
      MEDIUM: "FLOOD WATCH",
      HIGH: "EMERGENCY FLOOD WARNING",
    },
    primaryAction: {
      LOW: "STAY AWARE",
      MEDIUM: "PREPARE TO LEAVE",
      HIGH: "MOVE TO HIGHER GROUND",
    },
    happening: {
      LOW: "River levels are within normal range near Maribyrnong.",
      MEDIUM: "River level is rising near Maribyrnong. Flood conditions may develop.",
      HIGH: "Flood warning near Maribyrnong River. Water may rise quickly.",
    },
    actions: {
      LOW: [
        "Keep monitoring updates.",
        "Review your household flood plan.",
        "Keep phone charged.",
        "Know your safe route.",
      ],
      MEDIUM: [
        "Pack phone, keys, medicine, and documents.",
        "Move valuables above floor level.",
        "Move car and pets to higher ground.",
        "Check family and neighbours.",
      ],
      HIGH: [
        "Take phone, keys, medicine, and documents.",
        "Move car and pets to higher ground.",
        "Do not walk or drive through floodwater.",
        "Check family and neighbours.",
      ],
    },
    route: {
      diagram: ["You", "High Ground", "Relief Centre"],
      note: "Avoid flooded roads and river paths.",
      nearest: "Nearest safe point: Local high ground / relief centre.",
    },
    help: [
      "000 Emergency",
      "SES 132 500",
    ],
  },
  "中文": {
    labels: {
      mainAlert: "主要警报",
      risk: "风险：",
      happening: "当前情况",
      doNow: "立即行动",
      safeRoute: "安全路线",
      help: "求助",
      source: "来源：VicEmergency / VICSES / Maribyrnong Council",
      updated: "更新",
      connectionLost: "连接中断",
      showingLastKnown: "显示最后已知警告",
      followLastInstruction: "遵循最后指示。",
    },
    warningType: {
      LOW: "洪水状态",
      MEDIUM: "洪水观察",
      HIGH: "紧急洪水警报",
    },
    primaryAction: {
      LOW: "保持关注",
      MEDIUM: "准备撤离",
      HIGH: "前往高处",
    },
    happening: {
      LOW: "马里比农附近河流水位处于正常范围内。",
      MEDIUM: "马里比农附近河流水位正在上升，可能出现洪水情况。",
      HIGH: "马里比农河附近已发出洪水警报，水位可能快速上升。",
    },
    actions: {
      LOW: [
        "持续关注更新。",
        "检查家庭洪水应急计划。",
        "保持手机电量。",
        "确认安全路线。",
      ],
      MEDIUM: [
        "准备手机、钥匙、药物和重要文件。",
        "将贵重物品移到高处。",
        "将车辆和宠物转移到高地。",
        "确认家人和邻居安全。",
      ],
      HIGH: [
        "带上手机、钥匙、药物和重要文件。",
        "将车辆和宠物转移到高地。",
        "不要步行或驾车穿越洪水。",
        "确认家人和邻居安全。",
      ],
    },
    route: {
      diagram: ["你的位置", "高地", "救援中心"],
      note: "避开积水道路和河边小路。",
      nearest: "最近安全点：当地高地 / 救援中心。",
    },
    help: [
      "000 紧急情况",
      "SES 132 500",
    ],
  },
};

function emergencyCopy() {
  return EMERGENCY_COPY[state.lang] || EMERGENCY_COPY.English;
}

// Add emergency-screen translations for languages beyond English and Chinese.
Object.assign(EMERGENCY_COPY, {
  "Tiếng Việt": {
    labels: {
      mainAlert: "Cảnh báo chính",
      risk: "Rủi ro:",
      happening: "ĐIỀU ĐANG XẢY RA",
      doNow: "LÀM NGAY",
      safeRoute: "TUYẾN ĐƯỜNG AN TOÀN",
      help: "TRỢ GIÚP",
      source: "Nguồn: VicEmergency / VICSES / Hội đồng Maribyrnong",
      updated: "Cập nhật",
      connectionLost: "MẤT KẾT NỐI",
      showingLastKnown: "Hiển thị cảnh báo đã biết cuối cùng",
      followLastInstruction: "Làm theo hướng dẫn cuối cùng.",
    },
    warningType: {
      LOW: "TÌNH TRẠNG LŨ",
      MEDIUM: "THEO DÕI LŨ",
      HIGH: "CẢNH BÁO LŨ KHẨN CẤP",
    },
    primaryAction: {
      LOW: "TIẾP TỤC THEO DÕI",
      MEDIUM: "CHUẨN BỊ RỜI ĐI",
      HIGH: "DI CHUYỂN LÊN VÙNG CAO",
    },
    happening: {
      LOW: "Mực nước sông gần Maribyrnong đang trong phạm vi bình thường.",
      MEDIUM: "Mực nước sông gần Maribyrnong đang tăng. Lũ có thể xảy ra.",
      HIGH: "Có cảnh báo lũ gần sông Maribyrnong. Nước có thể dâng nhanh.",
    },
    actions: {
      LOW: [
        "Tiếp tục theo dõi cập nhật.",
        "Xem lại kế hoạch ứng phó lũ của gia đình.",
        "Giữ điện thoại đầy pin.",
        "Biết tuyến đường an toàn của bạn.",
      ],
      MEDIUM: [
        "Chuẩn bị điện thoại, chìa khóa, thuốc và giấy tờ.",
        "Di chuyển vật dụng quan trọng lên cao hơn mặt sàn.",
        "Đưa xe và thú cưng lên vùng cao.",
        "Kiểm tra gia đình và hàng xóm.",
      ],
      HIGH: [
        "Mang theo điện thoại, chìa khóa, thuốc và giấy tờ.",
        "Đưa xe và thú cưng lên vùng cao.",
        "Không đi bộ hoặc lái xe qua nước lũ.",
        "Kiểm tra gia đình và hàng xóm.",
      ],
    },
    route: {
      diagram: ["Bạn", "Vùng cao", "Trung tâm cứu trợ"],
      note: "Tránh đường ngập nước và lối đi ven sông.",
      nearest: "Điểm an toàn gần nhất: vùng cao địa phương / trung tâm cứu trợ.",
    },
    help: ["000 Khẩn cấp", "SES 132 500"],
  },

  "Français": {
    labels: {
      mainAlert: "Alerte principale",
      risk: "Risque :",
      happening: "CE QUI SE PASSE",
      doNow: "À FAIRE MAINTENANT",
      safeRoute: "ITINÉRAIRE SÛR",
      help: "AIDE",
      source: "Source : VicEmergency / VICSES / Conseil de Maribyrnong",
      updated: "Mis à jour",
      connectionLost: "CONNEXION PERDUE",
      showingLastKnown: "Affichage de la dernière alerte connue",
      followLastInstruction: "Suivez la dernière instruction.",
    },
    warningType: {
      LOW: "ÉTAT D’INONDATION",
      MEDIUM: "SURVEILLANCE D’INONDATION",
      HIGH: "ALERTE D’INONDATION URGENTE",
    },
    primaryAction: {
      LOW: "RESTEZ INFORMÉ",
      MEDIUM: "PRÉPAREZ-VOUS À PARTIR",
      HIGH: "MONTEZ VERS UN TERRAIN ÉLEVÉ",
    },
    happening: {
      LOW: "Le niveau de la rivière près de Maribyrnong est normal.",
      MEDIUM: "Le niveau de la rivière près de Maribyrnong monte. Des inondations peuvent se développer.",
      HIGH: "Alerte d’inondation près de la rivière Maribyrnong. L’eau peut monter rapidement.",
    },
    actions: {
      LOW: [
        "Continuez à surveiller les mises à jour.",
        "Révisez le plan d’inondation de votre foyer.",
        "Gardez votre téléphone chargé.",
        "Connaissez votre itinéraire sûr.",
      ],
      MEDIUM: [
        "Préparez téléphone, clés, médicaments et documents.",
        "Déplacez les objets importants au-dessus du sol.",
        "Déplacez voiture et animaux vers un terrain élevé.",
        "Vérifiez votre famille et vos voisins.",
      ],
      HIGH: [
        "Prenez téléphone, clés, médicaments et documents.",
        "Déplacez voiture et animaux vers un terrain élevé.",
        "Ne marchez pas et ne conduisez pas dans l’eau de crue.",
        "Vérifiez votre famille et vos voisins.",
      ],
    },
    route: {
      diagram: ["Vous", "Terrain élevé", "Centre de secours"],
      note: "Évitez les routes inondées et les chemins près de la rivière.",
      nearest: "Point sûr le plus proche : terrain élevé local / centre de secours.",
    },
    help: ["000 Urgence", "SES 132 500"],
  },

  "日本語": {
    labels: {
      mainAlert: "主要警報",
      risk: "リスク：",
      happening: "現在の状況",
      doNow: "今すぐ行うこと",
      safeRoute: "安全な経路",
      help: "支援",
      source: "情報源：VicEmergency / VICSES / Maribyrnong Council",
      updated: "更新",
      connectionLost: "接続切断",
      showingLastKnown: "最後に確認された警報を表示中",
      followLastInstruction: "最後の指示に従ってください。",
    },
    warningType: {
      LOW: "洪水状況",
      MEDIUM: "洪水注意",
      HIGH: "緊急洪水警報",
    },
    primaryAction: {
      LOW: "情報を確認",
      MEDIUM: "避難準備",
      HIGH: "高い場所へ移動",
    },
    happening: {
      LOW: "マリビルノン付近の河川水位は通常範囲内です。",
      MEDIUM: "マリビルノン付近の河川水位が上昇しています。洪水が発生する可能性があります。",
      HIGH: "マリビルノン川付近で洪水警報があります。水位が急上昇する可能性があります。",
    },
    actions: {
      LOW: [
        "引き続き最新情報を確認してください。",
        "家庭の洪水対応計画を確認してください。",
        "携帯電話を充電しておいてください。",
        "安全な避難経路を確認してください。",
      ],
      MEDIUM: [
        "携帯電話、鍵、薬、重要書類を準備してください。",
        "重要な物を床より高い場所へ移動してください。",
        "車とペットを高い場所へ移動してください。",
        "家族と近隣の安全を確認してください。",
      ],
      HIGH: [
        "携帯電話、鍵、薬、重要書類を持ってください。",
        "車とペットを高い場所へ移動してください。",
        "洪水の中を歩いたり運転したりしないでください。",
        "家族と近隣の安全を確認してください。",
      ],
    },
    route: {
      diagram: ["あなた", "高台", "救援センター"],
      note: "冠水した道路や川沿いの道を避けてください。",
      nearest: "最寄りの安全地点：地域の高台 / 救援センター。",
    },
    help: ["000 緊急", "SES 132 500"],
  },

  "한국어": {
    labels: {
      mainAlert: "주요 경보",
      risk: "위험:",
      happening: "현재 상황",
      doNow: "지금 해야 할 일",
      safeRoute: "안전 경로",
      help: "도움",
      source: "출처: VicEmergency / VICSES / Maribyrnong Council",
      updated: "업데이트",
      connectionLost: "연결 끊김",
      showingLastKnown: "마지막으로 확인된 경보 표시 중",
      followLastInstruction: "마지막 지시를 따르세요.",
    },
    warningType: {
      LOW: "홍수 상태",
      MEDIUM: "홍수 주의",
      HIGH: "긴급 홍수 경보",
    },
    primaryAction: {
      LOW: "계속 확인",
      MEDIUM: "대피 준비",
      HIGH: "높은 곳으로 이동",
    },
    happening: {
      LOW: "마리비르농 근처 강 수위는 정상 범위입니다.",
      MEDIUM: "마리비르농 근처 강 수위가 상승하고 있습니다. 홍수가 발생할 수 있습니다.",
      HIGH: "마리비르농 강 근처에 홍수 경보가 있습니다. 물이 빠르게 상승할 수 있습니다.",
    },
    actions: {
      LOW: [
        "계속해서 업데이트를 확인하세요.",
        "가정의 홍수 대응 계획을 확인하세요.",
        "휴대폰을 충전해 두세요.",
        "안전한 경로를 확인하세요.",
      ],
      MEDIUM: [
        "휴대폰, 열쇠, 약, 중요 문서를 준비하세요.",
        "중요한 물건을 바닥보다 높은 곳으로 옮기세요.",
        "차량과 반려동물을 높은 곳으로 이동하세요.",
        "가족과 이웃의 안전을 확인하세요.",
      ],
      HIGH: [
        "휴대폰, 열쇠, 약, 중요 문서를 챙기세요.",
        "차량과 반려동물을 높은 곳으로 이동하세요.",
        "홍수 물을 걷거나 운전해서 지나가지 마세요.",
        "가족과 이웃의 안전을 확인하세요.",
      ],
    },
    route: {
      diagram: ["당신", "고지대", "구호 센터"],
      note: "침수된 도로와 강가 길을 피하세요.",
      nearest: "가장 가까운 안전 지점: 지역 고지대 / 구호 센터.",
    },
    help: ["000 긴급", "SES 132 500"],
  },
});

// ─── Offline emergency checklists ─────────────────────────
const BASE_URL = "https://alexguo0125.github.io/flood-display";

const CHECKLISTS = [
  { key: "en", name: "English", file: "assets/1.png" },
  { key: "zh", name: "Chinese", file: "assets/2.png" },
  { key: "vi", name: "Vietnamese", file: "assets/3.png" },
  { key: "ar", name: "Arabic", file: "assets/4.png" },
  { key: "es", name: "Spanish", file: "assets/5.png" },
  { key: "ko", name: "Korean", file: "assets/6.png" },
];

let selectedChecklist = CHECKLISTS[0];

function checklistPublicUrl(checklist = selectedChecklist) {
  return `${BASE_URL.replace(/\/$/, '')}/${checklist.file.replace(/^\//, '')}`;
}



// ─── Night-mode risk colours ──────────────────────────────
const NIGHT_RISK = { LOW: "#dcdcf4", MEDIUM: "#dcdcf4", HIGH: "#dcdcf4" };

const SCENARIO_FILES = {
  current: './data/current_official_mode.json',
  historical: './data/historical_scenario_mode.json',
};

const DISPLAY_RISK = {
  READY: 'LOW',
  PREPARE: 'MEDIUM',
  ACT_NOW: 'HIGH',
  LEAVE_NOW: 'HIGH',
  OFFLINE: 'MEDIUM',
};

const DISPLAY_HEADLINES = {
  READY: 'READY / NO ACTIVE WARNING',
  PREPARE: 'PREPARE / ADVICE',
  ACT_NOW: 'ACT NOW / WATCH AND ACT',
  LEAVE_NOW: 'LEAVE NOW / EMERGENCY WARNING',
  OFFLINE: 'OFFLINE / LAST KNOWN WARNING',
};

const RULE_LABELS = {
  READY: 'No active warning -> READY',
  PREPARE: 'Advice -> PREPARE',
  ACT_NOW: 'Watch and Act -> ACT_NOW',
  LEAVE_NOW: 'Emergency Warning/Evacuate -> LEAVE_NOW',
  OFFLINE: 'stale/connection_lost -> OFFLINE',
};

const UI_CONTENT = {
  "English": {
    controls: {
      current: "Current Official Mode",
      ready: "Historical Scenario: Ready",
      prepare: "Historical Scenario: Prepare",
      actNow: "Historical Scenario: Act Now",
      leaveNow: "Historical Scenario: Leave Now",
      offline: "Historical Scenario: Connection Lost",
      historicalStatus: "Historical Scenario Mode - controlled prototype data.",
      currentLoaded: "Current Official Mode loaded from local data file.",
      currentNeedsBackend: "Current mode uses local demo data.",
      officialUnavailable: "Official endpoint unavailable; using Current Official Mode file.",
      officialNoWarning: "Official feeds checked: no Maribyrnong flood warning found.",
      officialMatched: "Official feed matched Maribyrnong event data.",
    },
    trace: {
      title: "DATA TRACEABILITY",
      mode: "Mode",
      scenario: "Scenario",
      warning: "Warning",
      source: "Source",
      updated: "Updated",
      status: "Status",
      rule: "Rule",
      real: "Real current",
      yes: "yes",
      no: "no",
      controlledNote: "Controlled prototype scenario, not a live warning.",
      currentNote: "Current official source check.",
    },
    modeLabels: {
      current: "Current Official Mode",
      historical: "Historical Scenario Mode",
      manual: "Manual Demo Control",
    },
    scenarioNames: {
      CURRENT_NORMAL: "Current normal",
      READY: "Ready",
      PREPARE: "Prepare",
      ACT_NOW: "Act now",
      LEAVE_NOW: "Leave now",
      OFFLINE: "Connection lost",
    },
    dataStatus: {
      current: "current",
      controlled_demo: "controlled prototype data",
      connection_lost: "connection lost",
      stale: "stale",
    },
    rules: RULE_LABELS,
    riskBadges: {
      READY: "LOW",
      PREPARE: "MEDIUM",
      ACT_NOW: "HIGH",
      LEAVE_NOW: "SEVERE",
      OFFLINE: "LAST KNOWN",
    },
    route: {
      label: "SAFE ROUTE",
      diagram: "YOU -> HIGH GROUND -> OFFICIAL RELIEF CENTRE IF ANNOUNCED",
      note: "Never walk, ride or drive through floodwater. Avoid river paths and flooded roads.",
    },
    help: ["000 Emergency", "SES 132 500"],
    offline: {
      noSignal: "NO SIGNAL",
      mode: "Offline mode active",
      lastUpdate: "Showing last known update",
      source: "Source",
      lastRisk: "Last known risk",
      lastAction: "Last advised action",
      demoMode: "Demo mode",
      ruleUsed: "Rule used",
      checklist: "Emergency checklist image",
      language: "Language",
      download: "Download image",
      scan: "Scan to download",
    },
    scenarios: {
      CURRENT_NORMAL: {
        actionState: "READY",
        warning: "NO ACTIVE WARNING",
        action: "Stay prepared. Check your flood plan.",
        happening: "No active flood warning for Maribyrnong.",
        actions: [
          "Keep phone charged.",
          "Know your safe route.",
          "Check official updates.",
        ],
        routeDiagram: "KNOW YOUR ROUTE",
        routeNote: "Know your route to high ground. Avoid river paths during flooding.",
      },
      READY: {
        actionState: "READY",
        warning: "NO ACTIVE WARNING",
        action: "Stay prepared. Check your flood plan.",
        happening: "No active flood warning for Maribyrnong.",
        actions: [
          "Keep phone charged.",
          "Know your safe route.",
          "Check official updates.",
        ],
        routeDiagram: "KNOW YOUR ROUTE",
        routeNote: "Know your route to high ground. Avoid river paths during flooding.",
      },
      PREPARE: {
        actionState: "PREPARE",
        warning: "ADVICE WARNING",
        action: "Prepare now. Conditions may change.",
        happening: "Rain and river levels may rise.",
        actions: [
          "Pack medicine, ID and charger.",
          "Move valuables higher.",
          "Check on neighbours.",
        ],
        routeDiagram: "PLAN YOUR ROUTE TO HIGH GROUND",
        routeNote: "Do not enter floodwater.",
      },
      ACT_NOW: {
        actionState: "ACT NOW",
        warning: "WATCH AND ACT",
        action: "Be ready to leave. Do not wait.",
        happening: "Flood risk is increasing in low areas.",
        actions: [
          "Put emergency bag by the door.",
          "Charge phone and power bank.",
          "Prepare pets, medicine and documents.",
        ],
        routeDiagram: "GO TO HIGH GROUND",
        routeNote: "Go if told to leave. Do not enter floodwater.",
      },
      LEAVE_NOW: {
        actionState: "LEAVE NOW",
        warning: "EMERGENCY WARNING",
        action: "Follow evacuation instructions now.",
        happening: "Flooding may affect homes or roads.",
        actions: [
          "Take emergency bag.",
          "Take medicine, pets and documents.",
          "Go to high ground or official relief centre.",
        ],
        routeDiagram: "LEAVE BY SAFE ROADS ONLY",
        routeNote: "Never walk, ride or drive through floodwater.",
      },
      OFFLINE: {
        actionState: "OFFLINE",
        warning: "LAST KNOWN WARNING",
        action: "Connection lost. Follow last warning.",
        happening: "The display cannot update right now.",
        actions: [
          "Follow the last shown warning.",
          "Check phone, radio or official updates.",
          "Call 000 if life is in danger.",
        ],
        routeDiagram: "USE LAST KNOWN SAFE ROUTE",
        routeNote: "Avoid floodwater.",
      },
    },
  },
  "中文": {
    controls: {
      current: "当前官方模式",
      ready: "历史情景：准备就绪",
      prepare: "历史情景：准备",
      actNow: "历史情景：立即行动",
      leaveNow: "历史情景：立即撤离",
      offline: "历史情景：连接中断",
      historicalStatus: "历史情景模式 - 受控原型数据。",
      currentLoaded: "已从本地数据文件载入当前官方模式。",
      currentNeedsBackend: "当前模式使用本地演示数据。",
      officialUnavailable: "官方端点不可用；正在使用当前官方模式文件。",
      officialNoWarning: "已检查官方信息：未发现 Maribyrnong 当前洪水警告。",
      officialMatched: "官方信息匹配到 Maribyrnong 事件数据。",
    },
    trace: {
      title: "数据可追溯性",
      mode: "模式",
      scenario: "情景",
      warning: "警告",
      source: "来源",
      updated: "更新",
      status: "状态",
      rule: "规则",
      real: "真实当前",
      yes: "是",
      no: "否",
      controlledNote: "受控原型情景，不是实时警告。",
      currentNote: "当前官方来源检查。",
    },
    modeLabels: { current: "当前官方模式", historical: "历史情景模式", manual: "手动演示控制" },
    scenarioNames: { CURRENT_NORMAL: "当前正常", READY: "准备就绪", PREPARE: "准备", ACT_NOW: "立即行动", LEAVE_NOW: "立即撤离", OFFLINE: "连接中断" },
    dataStatus: { current: "当前", controlled_demo: "受控原型数据", connection_lost: "连接中断", stale: "过期" },
    rules: {
      READY: "无当前警告 -> 准备就绪",
      PREPARE: "Advice -> 准备",
      ACT_NOW: "Watch and Act -> 立即行动",
      LEAVE_NOW: "Emergency Warning/Evacuate -> 立即撤离",
      OFFLINE: "过期/连接中断 -> 离线",
    },
    riskBadges: { READY: "低", PREPARE: "中", ACT_NOW: "高", LEAVE_NOW: "严重", OFFLINE: "最后已知" },
    route: {
      label: "安全路线",
      diagram: "你 -> 高地 -> 如公布则前往官方救援中心",
      note: "切勿步行、骑行或驾车穿越洪水。避开河边小路和被淹道路。",
    },
    help: ["000 紧急情况", "SES 132 500"],
    offline: {
      noSignal: "无信号",
      mode: "离线模式已开启",
      lastUpdate: "显示最后已知更新",
      source: "来源",
      lastRisk: "最后已知风险",
      lastAction: "最后建议行动",
      demoMode: "演示模式",
      ruleUsed: "使用规则",
      checklist: "应急清单图片",
      language: "语言",
      download: "下载图片",
      scan: "扫码下载",
    },
    scenarios: {
      CURRENT_NORMAL: {
        actionState: "准备就绪",
        warning: "无警告",
        action: "保持准备，今天检查一下你的洪水计划。",
        happening: "马里比农没有当前洪水警告。",
        actions: ["保持手机有电。", "了解安全路线。", "关注官方更新。"],
      },
      READY: {
        actionState: "准备就绪",
        warning: "无警告",
        action: "保持准备，今天检查一下你的洪水计划。",
        happening: "马里比农没有当前洪水警告。",
        actions: ["保持手机有电。", "了解安全路线。", "关注官方更新。"],
      },
      PREPARE: {
        actionState: "准备",
        warning: "Advice",
        action: "现在开始准备，情况可能改变。",
        happening: "雨量和河流水位可能上升。",
        actions: ["准备药物、证件和充电器。", "将贵重物品移高。", "查看邻居是否安全。"],
      },
      ACT_NOW: {
        actionState: "立即行动",
        warning: "Watch and Act",
        action: "做好离开的准备，不要等待。",
        happening: "低洼地区洪水风险正在增加。",
        actions: ["把应急包放在门口。", "给手机和充电宝充电。", "准备好宠物、药物和证件。"],
      },
      LEAVE_NOW: {
        actionState: "立即撤离",
        warning: "紧急警告",
        action: "立即遵循撤离指示。",
        happening: "洪水可能影响房屋或道路。",
        actions: ["带上应急包。", "带上药物、宠物和证件。", "前往高地或官方救援中心。"],
      },
      OFFLINE: {
        actionState: "离线",
        warning: "最后已知警告",
        action: "连接中断。遵循最后一个警告。",
        happening: "显示屏现在无法更新。",
        actions: ["遵循最后显示的警告。", "查看手机、收音机或官方更新。", "如生命有危险，请拨打 000。"],
      },
    },
  },
  "Tiếng Việt": {
    controls: {
      current: "Chế độ chính thức hiện tại",
      ready: "Kịch bản lịch sử: Sẵn sàng",
      prepare: "Kịch bản lịch sử: Chuẩn bị",
      actNow: "Kịch bản lịch sử: Hành động ngay",
      leaveNow: "Kịch bản lịch sử: Rời đi ngay",
      offline: "Kịch bản lịch sử: Mất kết nối",
      historicalStatus: "Chế độ kịch bản lịch sử - dữ liệu nguyên mẫu có kiểm soát.",
      currentLoaded: "Đã tải Chế độ chính thức hiện tại từ tệp dữ liệu cục bộ.",
      currentNeedsBackend: "Chế độ hiện tại dùng dữ liệu demo cục bộ.",
      officialUnavailable: "Nguồn chính thức không khả dụng; đang dùng tệp Chế độ chính thức hiện tại.",
      officialNoWarning: "Đã kiểm tra nguồn chính thức: không thấy cảnh báo lũ hiện tại cho Maribyrnong.",
      officialMatched: "Nguồn chính thức khớp dữ liệu sự kiện Maribyrnong.",
    },
    trace: {
      title: "TRUY XUẤT DỮ LIỆU",
      mode: "Chế độ",
      scenario: "Kịch bản",
      warning: "Cảnh báo",
      source: "Nguồn",
      updated: "Cập nhật",
      status: "Trạng thái",
      rule: "Quy tắc",
      real: "Hiện tại thật",
      yes: "có",
      no: "không",
      controlledNote: "Kịch bản nguyên mẫu có kiểm soát, không phải cảnh báo trực tiếp.",
      currentNote: "Kiểm tra nguồn chính thức hiện tại.",
    },
    modeLabels: { current: "Chế độ chính thức hiện tại", historical: "Chế độ kịch bản lịch sử", manual: "Điều khiển demo thủ công" },
    scenarioNames: { CURRENT_NORMAL: "Hiện tại bình thường", READY: "Sẵn sàng", PREPARE: "Chuẩn bị", ACT_NOW: "Hành động ngay", LEAVE_NOW: "Rời đi ngay", OFFLINE: "Mất kết nối" },
    dataStatus: { current: "hiện tại", controlled_demo: "dữ liệu nguyên mẫu có kiểm soát", connection_lost: "mất kết nối", stale: "cũ" },
    rules: {
      READY: "Không có cảnh báo -> SẴN SÀNG",
      PREPARE: "Advice -> CHUẨN BỊ",
      ACT_NOW: "Watch and Act -> HÀNH ĐỘNG NGAY",
      LEAVE_NOW: "Emergency Warning/Evacuate -> RỜI ĐI NGAY",
      OFFLINE: "cũ/mất kết nối -> NGOẠI TUYẾN",
    },
    riskBadges: { READY: "THẤP", PREPARE: "TRUNG BÌNH", ACT_NOW: "CAO", LEAVE_NOW: "NGHIÊM TRỌNG", OFFLINE: "CUỐI CÙNG" },
    route: {
      label: "TUYẾN AN TOÀN",
      diagram: "BẠN -> VÙNG CAO -> TRUNG TÂM CỨU TRỢ CHÍNH THỨC NẾU ĐƯỢC CÔNG BỐ",
      note: "Không đi bộ, đi xe hoặc lái xe qua nước lũ. Tránh đường ven sông và đường bị ngập.",
    },
    help: ["000 Khẩn cấp", "SES 132 500"],
    offline: {
      noSignal: "KHÔNG CÓ TÍN HIỆU",
      mode: "Chế độ ngoại tuyến đang bật",
      lastUpdate: "Hiển thị cập nhật cuối cùng",
      source: "Nguồn",
      lastRisk: "Rủi ro cuối cùng",
      lastAction: "Hành động cuối cùng",
      demoMode: "Chế độ demo",
      ruleUsed: "Quy tắc dùng",
      checklist: "Ảnh danh sách khẩn cấp",
      language: "Ngôn ngữ",
      download: "Tải ảnh",
      scan: "Quét để tải",
    },
    scenarios: {
      CURRENT_NORMAL: {
        actionState: "SẴN SÀNG",
        warning: "KHÔNG CÓ CẢNH BÁO",
        action: "Luôn chuẩn bị. Kiểm tra kế hoạch lũ hôm nay.",
        happening: "Không có cảnh báo lũ nào cho Maribyrnong.",
        actions: ["Giữ điện thoại đầy pin.", "Biết tuyến đường an toàn.", "Theo dõi cập nhật chính thức."],
      },
      READY: {
        actionState: "SẴN SÀNG",
        warning: "KHÔNG CÓ CẢNH BÁO",
        action: "Luôn chuẩn bị. Kiểm tra kế hoạch lũ hôm nay.",
        happening: "Không có cảnh báo lũ nào cho Maribyrnong.",
        actions: ["Giữ điện thoại đầy pin.", "Biết tuyến đường an toàn.", "Theo dõi cập nhật chính thức."],
      },
      PREPARE: {
        actionState: "CHUẨN BỊ",
        warning: "ADVICE",
        action: "Chuẩn bị ngay. Điều kiện có thể thay đổi.",
        happening: "Mưa và mực nước sông có thể tăng.",
        actions: ["Chuẩn bị thuốc, giấy tờ và sạc.", "Đưa đồ quý lên cao.", "Kiểm tra hàng xóm."],
      },
      ACT_NOW: {
        actionState: "HÀNH ĐỘNG NGAY",
        warning: "WATCH AND ACT",
        action: "Sẵn sàng rời đi. Đừng chờ đợi.",
        happening: "Rủi ro lũ đang tăng ở vùng thấp.",
        actions: ["Đặt túi khẩn cấp gần cửa.", "Sạc điện thoại và pin dự phòng.", "Chuẩn bị thú cưng, thuốc và giấy tờ."],
      },
      LEAVE_NOW: {
        actionState: "RỜI ĐI NGAY",
        warning: "CẢNH BÁO KHẨN CẤP",
        action: "Làm theo chỉ dẫn sơ tán ngay.",
        happening: "Lũ có thể ảnh hưởng nhà hoặc đường.",
        actions: ["Mang túi khẩn cấp.", "Mang thuốc, thú cưng và giấy tờ.", "Đến vùng cao hoặc trung tâm cứu trợ chính thức."],
      },
      OFFLINE: {
        actionState: "NGOẠI TUYẾN",
        warning: "CẢNH BÁO CUỐI CÙNG",
        action: "Mất kết nối. Làm theo cảnh báo cuối cùng.",
        happening: "Màn hình không thể cập nhật ngay bây giờ.",
        actions: ["Làm theo cảnh báo đã hiển thị cuối cùng.", "Kiểm tra điện thoại, đài hoặc cập nhật chính thức.", "Gọi 000 nếu tính mạng bị đe dọa."],
      },
    },
  },
};

Object.assign(T["Français"], {
  title: "AFFICHAGE CRUE",
  low: "Faible", medium: "Moyen", high: "Élevé",
  normal_mode: "Mode normal",
  low_battery_mode: "Batterie faible",
  connection_lost_mode: "Connexion perdue",
  low_battery_title: "BATTERIE FAIBLE",
  low_battery_msg: "Veuillez charger l'appareil.",
  night_mode_chk: "Mode nuit",
});

Object.assign(T["日本語"], {
  title: "洪水表示",
  low: "低", medium: "中", high: "高",
  normal_mode: "通常モード",
  low_battery_mode: "低バッテリー",
  connection_lost_mode: "接続切断",
  low_battery_title: "バッテリー残量低下",
  low_battery_msg: "デバイスを充電してください。",
  night_mode_chk: "ナイトモード",
});

Object.assign(T["한국어"], {
  title: "홍수 표시",
  low: "낮음", medium: "보통", high: "높음",
  normal_mode: "일반 모드",
  low_battery_mode: "배터리 부족",
  connection_lost_mode: "연결 끊김",
  low_battery_title: "배터리 부족",
  low_battery_msg: "장치를 충전하세요.",
  night_mode_chk: "야간 모드",
});

UI_CONTENT["Français"] = T["Français"];
UI_CONTENT["日本語"] = T["日本語"];
UI_CONTENT["한국어"] = T["한국어"];

// ─── App state ────────────────────────────────────────────
const state = {
  lang:  "English",
  risk:  "MEDIUM",
  mode:  "normal",   // "normal" | "low_battery" | "connection_lost"
  night: false,
  lastRisk: "MEDIUM",
  liveStatus: null,
  dataRecord: null,
  selectedDataMode: "current",
  displayState: "PREPARE",
  updatedTime: "",
  lastKnownUpdate: "",
};

// ─── DOM refs ─────────────────────────────────────────────
const $  = id => document.getElementById(id);
const els = {
  screen:     $('screen'),
  hdrTitle:   $('hdrTitle'),
  clock:      $('clock'),
  battFill:   $('battFill'),
  battSvg:    $('battSvg'),
  floodSvg:   $('floodSvg'),
  iconPoly:   $('iconPoly'),
  iconWave1:  $('iconWave1'),
  iconWave2:  $('iconWave2'),
  mainAlertLbl:$('mainAlertLbl'),
  warningType:$('warningType'),
  primaryAction:$('primaryAction'),
  riskPre:    $('riskPre'),
  riskBox:    $('riskBox'),
  riskVal:    $('riskVal'),
  hapLbl:     $('hapLbl'),
  hapTxt:     $('hapTxt'),
  actLbl:     $('actLbl'),
  actList:    $('actList'),
  routeLbl:   $('routeLbl'),
  routeDiagram:$('routeDiagram'),
  routeNote:  $('routeNote'),
  helpLbl:    $('helpLbl'),
  helpList:   $('helpList'),
  connectionBanner:$('connectionBanner'),
  connectionTitle:$('connectionTitle'),
  connectionText:$('connectionText'),
  connectionUpdated:$('connectionUpdated'),
  connectionInstruction:$('connectionInstruction'),
  sourceTxt:  $('sourceTxt'),
  updatedTxt: $('updatedTxt'),
  traceTitle: $('traceTitle'),
  traceLblMode:$('traceLblMode'),
  traceLblScenario:$('traceLblScenario'),
  traceLblWarning:$('traceLblWarning'),
  traceLblSource:$('traceLblSource'),
  traceLblUpdated:$('traceLblUpdated'),
  traceLblStatus:$('traceLblStatus'),
  traceLblRule:$('traceLblRule'),
  traceLblReal:$('traceLblReal'),
  traceMode:  $('traceMode'),
  traceScenario:$('traceScenario'),
  traceWarning:$('traceWarning'),
  traceSource:$('traceSource'),
  traceUpdated:$('traceUpdated'),
  traceStatus:$('traceStatus'),
  traceRule:  $('traceRule'),
  traceReal:  $('traceReal'),
  traceNote:  $('traceNote'),
  overlay:    $('overlay'),
  ovBody:     $('ovBody'),
  langSel:    $('langSel'),
  nightChk:   $('nightChk'),
  nightTxt:   $('nightTxt'),
  ovNightChk: $('ovNightChk'),
  ovNightTxt: $('ovNightTxt'),
  dpLang:     $('dpLang'),
  dpNightChk: $('dpNightChk'),
  dpStatus:   $('dpStatus'),
  demoPanel:  $('demoPanel'),
  mobileMenuBtn: $('mobileMenuBtn'),
  drawerBackdrop: $('drawerBackdrop'),
  drawerCloseBtn: $('drawerCloseBtn'),
  scaleWrap:  $('deviceScaleWrapper'),
};

function contentBundle() {
  return UI_CONTENT[state.lang] || UI_CONTENT.English;
}

function scenarioKey(record = state.dataRecord, displayState = state.displayState) {
  const key = record?.scenario === 'CURRENT_NORMAL' ? 'CURRENT_NORMAL' : (record?.scenario || displayState || 'READY');
  const content = contentBundle();
  if (content.scenarios[key]) return key;
  if (content.scenarios[displayState]) return displayState;
  return 'READY';
}

function scenarioContent(record = state.dataRecord, displayState = state.displayState) {
  const key = scenarioKey(record, displayState);
  return contentBundle().scenarios[key] || UI_CONTENT.English.scenarios[key] || UI_CONTENT.English.scenarios.READY;
}

// ─── Init ─────────────────────────────────────────────────
function init() {
  // Populate language selects
  Object.keys(T).forEach(lang => {
    [els.langSel, els.dpLang].forEach(sel => {
      const opt = document.createElement('option');
      opt.value = lang;
      opt.textContent = lang;
      sel.appendChild(opt);
    });
  });

  // Event listeners — risk simulation
  $('btnCurrentOfficial').onclick = () => refreshOfficialStatus();
  $('btnSimLow').onclick  = () => applyHistoricalScenario('READY');
  $('btnSimMed').onclick  = () => applyHistoricalScenario('PREPARE');
  $('btnSimHigh').onclick = () => applyHistoricalScenario('ACT_NOW');
  $('btnScenarioLeave').onclick = () => applyHistoricalScenario('LEAVE_NOW');
  $('btnScenarioOffline').onclick = () => applyHistoricalScenario('OFFLINE');

  // Event listeners — modes
  $('btnNormal').onclick   = () => setMode('normal');
  $('btnLowBatt').onclick  = () => setMode('low_battery');
  $('btnConnLost').onclick = () => setMode('connection_lost');

  // Night mode — all three checkboxes share state
  els.nightChk.onchange    = () => setNight(els.nightChk.checked);
  els.dpNightChk.onchange  = () => setNight(els.dpNightChk.checked);
  els.ovNightChk.onchange  = () => setNight(els.ovNightChk.checked);

  // Language selects
  els.langSel.onchange = () => { state.lang = els.langSel.value; els.dpLang.value = state.lang; render(); };
  els.dpLang.onchange  = () => { state.lang = els.dpLang.value;  els.langSel.value = state.lang; render(); };

  els.ovBody.addEventListener('click', handleOfflineAction);
  els.ovBody.addEventListener('change', handleOfflineSelect);

  // AI analysis panel
  $('btnFillAI').onclick    = prefillAIInputs;
  $('btnAnalyseAI').onclick = analyseWithAI;

  // Mobile/PWA controls drawer. Desktop keeps the right-side dashboard visible.
  els.mobileMenuBtn.onclick = toggleControlsDrawer;
  els.drawerCloseBtn.onclick = closeControlsDrawer;

  // Only backdrop clicks should close the drawer.
  // Stop clicks inside the control panel from bubbling to any overlay/backdrop logic.
  els.demoPanel.addEventListener('click', event => event.stopPropagation());
  els.drawerBackdrop.addEventListener('click', event => {
    if (event.target === els.drawerBackdrop) closeControlsDrawer();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeControlsDrawer();
  });

  // Scale on resize/orientation changes. visualViewport improves iOS PWA landscape sizing.
  window.addEventListener('resize', rescale);
  window.addEventListener('orientationchange', () => setTimeout(rescale, 80));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', rescale);

  render();
  updateClock();
  refreshOfficialStatus();
  setInterval(() => {
    if (state.selectedDataMode === 'current') refreshOfficialStatus();
  }, 120000);
  rescale();
}

// ─── State setters ────────────────────────────────────────
function setRisk(level) {
  state.liveStatus = null;
  state.dataRecord = localRecordForRisk(level);
  state.selectedDataMode = 'historical';
  state.displayState = deriveDisplayState(state.dataRecord);
  state.risk = level;
  state.lastRisk = level;
  state.lastKnownUpdate = state.updatedTime;
  if (state.mode !== 'low_battery') render();
}

function setMode(mode) {
  if (mode === 'connection_lost' && state.mode !== 'connection_lost') {
    state.lastKnownUpdate = state.updatedTime;
    if (!state.dataRecord || state.dataRecord.dataStatus !== 'connection_lost') {
      state.dataRecord = offlineRecordFromCurrentState();
      state.displayState = 'OFFLINE';
    }
  }
  state.mode = mode;
  render();
}

function setNight(on) {
  state.night = on;
  document.body.classList.toggle('night', on);
  els.nightChk.checked    = on;
  els.dpNightChk.checked  = on;
  els.ovNightChk.checked  = on;
  render(); // re-render to update overlay colours if visible
}

// ─── Two-mode demo data pipeline ──────────────────────────
async function loadJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function applyHistoricalScenario(scenario) {
  try {
    const records = await loadJson(SCENARIO_FILES.historical);
    const record = records.find(item => item.scenario === scenario);
    if (!record) throw new Error(`Missing scenario ${scenario}`);
    state.selectedDataMode = 'historical';
    applyDataRecord(record);
    els.dpStatus.textContent = contentBundle().controls.historicalStatus;
  } catch (error) {
    els.dpStatus.textContent = `Scenario data unavailable: ${error.message}`;
  }
}

function applyDataRecord(record) {
  const displayState = deriveDisplayState(record);
  const risk = DISPLAY_RISK[displayState] || 'MEDIUM';

  state.liveStatus = normalizedStatusFromRecord(record, displayState);
  state.dataRecord = record;
  state.displayState = displayState;
  state.risk = risk;
  state.lastRisk = risk;
  state.lastKnownUpdate = record.timestamp ? formatOfficialTime(record.timestamp) : state.updatedTime;
  state.mode = displayState === 'OFFLINE' ? 'connection_lost' : 'normal';

  render();
}

function deriveDisplayState(record) {
  const warning = String(record?.officialWarningLevel || '').toLowerCase();
  const dataStatus = String(record?.dataStatus || '').toLowerCase();

  if (dataStatus === 'stale' || dataStatus === 'connection_lost') return 'OFFLINE';
  if (warning.includes('emergency warning') || warning.includes('evacuate') || warning.includes('evacuation')) return 'LEAVE_NOW';
  if (warning.includes('watch and act')) return 'ACT_NOW';
  if (warning.includes('advice')) return 'PREPARE';
  if (warning.includes('no active warning')) return 'READY';
  return 'PREPARE';
}

function normalizedStatusFromRecord(record, displayState) {
  const copy = scenarioContent(record, displayState);
  return {
    risk: DISPLAY_RISK[displayState] || 'MEDIUM',
    headline: `${copy.actionState} / ${copy.warning}`,
    happening: copy.happening,
    primaryAction: copy.action,
    actions: copy.actions,
    updatedAt: record.timestamp || state.updatedTime,
    source: record.source || 'Official source reference',
    sourceUrl: record.sourceUrl || '',
    targetArea: record.location || 'Maribyrnong',
    matchedEvents: [],
    officialWarningLevel: record.officialWarningLevel,
    dataStatus: record.dataStatus,
    mode: record.mode,
    scenario: record.scenario,
    isRealCurrentWarning: Boolean(record.isRealCurrentWarning),
    provenanceNote: record.provenanceNote,
    ruleUsed: RULE_LABELS[displayState],
  };
}

function scenarioHappening(record) {
  if (!record) return '';
  return scenarioContent(record, deriveDisplayState(record)).happening;
}

function actionsForDisplayState(displayState) {
  return scenarioContent({ scenario: displayState }, displayState).actions;
}

function localRecordForRisk(level) {
  const now = new Date().toISOString();
  const map = {
    LOW: ['READY', 'No active warning', 'Stay prepared and review your flood plan.'],
    MEDIUM: ['PREPARE', 'Advice', 'Prepare your emergency kit and monitor official advice.'],
    HIGH: ['ACT_NOW', 'Watch and Act', 'Act now and monitor official warnings.'],
  };
  const [scenario, warning, action] = map[level] || map.MEDIUM;
  return {
    mode: 'Historical Scenario Mode',
    scenario,
    timestamp: now,
    location: 'Maribyrnong',
    officialWarningLevel: warning,
    rainfallTrend: level === 'LOW' ? 'normal' : 'increasing',
    riverTrend: level === 'LOW' ? 'stable' : 'rising',
    dataStatus: 'controlled_demo',
    source: 'Local demo control',
    sourceUrl: '',
    recommendedAction: action,
    isRealCurrentWarning: false,
    provenanceNote: 'Controlled prototype scenario, not a live warning.',
  };
}

function offlineRecordFromCurrentState() {
  const base = state.dataRecord || localRecordForRisk(state.lastRisk);
  return {
    ...base,
    scenario: 'OFFLINE',
    dataStatus: 'connection_lost',
    recommendedAction: 'Connection lost. Follow the last known warning and use offline emergency checklist links.',
    isRealCurrentWarning: false,
    provenanceNote: 'Controlled prototype scenario, not a live warning.',
  };
}

// ─── Main render ──────────────────────────────────────────
function render() {
  const t = T[state.lang];
  const ui = contentBundle();

  // Always update static text that doesn't depend on mode
  els.hdrTitle.textContent = t.title;
  els.langSel.value        = state.lang;
  els.dpLang.value         = state.lang;
  els.nightTxt.textContent    = t.night_mode_chk;
  els.ovNightTxt.textContent  = t.night_mode_chk;

  // Update demo panel button labels
  $('btnNormal').textContent   = t.normal_mode;
  $('btnLowBatt').textContent  = t.low_battery_mode;
  $('btnConnLost').textContent = t.connection_lost_mode;
  $('btnCurrentOfficial').textContent = ui.controls.current;
  $('btnSimLow').textContent   = ui.controls.ready;
  $('btnSimMed').textContent   = ui.controls.prepare;
  $('btnSimHigh').textContent  = ui.controls.actNow;
  $('btnScenarioLeave').textContent = ui.controls.leaveNow;
  $('btnScenarioOffline').textContent = ui.controls.offline;
  if (state.mode === 'normal') {
    els.overlay.hidden = true;
    els.overlay.classList.remove('offline-overlay');
    els.ovBody.classList.remove('ov-body-offline');
    renderNormal(t);
  } else {
    els.overlay.hidden = false;
    renderOverlay(t);
  }
  scheduleAdaptiveTypography();
}

function renderNormal(t) {
  const copy = emergencyCopy();
  const live = state.liveStatus;
  const data = state.dataRecord;
  const ui = contentBundle();
  const displayState = state.displayState || deriveDisplayState(data);
  const scenario = scenarioContent(data, displayState);

  els.screen.classList.remove('risk-low', 'risk-medium', 'risk-high', 'connection-lost');
  els.screen.classList.add(`risk-${state.risk.toLowerCase()}`);
  els.screen.classList.toggle('connection-lost', state.mode === 'connection_lost');

  // Flood icon
  updateFloodIcon(state.risk, state.night);

  els.mainAlertLbl.textContent = copy.labels.mainAlert;
  els.warningType.textContent = `${scenario.actionState} / ${scenario.warning}`;
  els.primaryAction.textContent = scenario.action;

  // Risk badge
  els.riskPre.textContent = copy.labels.risk;
  els.riskVal.textContent = ui.riskBadges[displayState] || ui.riskBadges.READY;
  if (state.night) {
    const col = NIGHT_RISK[state.risk];
    els.riskBox.style.borderColor = col;
    els.riskVal.style.color = col;
  } else {
    els.riskBox.style.borderColor = '';
    els.riskVal.style.color = '';
  }

  // Happening
  els.hapLbl.textContent = copy.labels.happening;
  els.hapTxt.textContent = scenario.happening;

  // Actions
  els.actLbl.textContent = copy.labels.doNow;
  els.actList.innerHTML  = '';
  const actions = scenario.actions;
  actions.forEach((act, i) => {
    const row = document.createElement('div');
    row.className = 'act-item';
    const num = document.createElement('span');
    num.className = 'act-num';
    num.textContent = `${i + 1}.`;
    const txt = document.createElement('span');
    txt.textContent = act;
    row.append(num, txt);
    els.actList.appendChild(row);
  });

  // Safe route and help — prefer scenario-specific text, fall back to language-level
  els.routeLbl.textContent = ui.route.label;
  els.routeDiagram.textContent = scenario.routeDiagram || ui.route.diagram;
  els.routeNote.textContent = scenario.routeNote || ui.route.note;

  els.helpLbl.textContent = copy.labels.help;
  els.helpList.innerHTML = '';
  ui.help.forEach(item => {
    const row = document.createElement('span');
    row.textContent = item;
    els.helpList.appendChild(row);
  });

  els.sourceTxt.textContent = live ? `${contentBundle().trace.source}: ${live.source}` : copy.labels.source;
  if (live && live.updatedAt) {
    els.updatedTxt.textContent = `${copy.labels.updated}: ${formatOfficialTime(live.updatedAt)}`;
  }
  renderConnectionBanner(copy);

  // Battery: normal = full
  setBattery(false);
  scheduleAdaptiveTypography();
}

function renderConnectionBanner(copy) {
  const lost = state.mode === 'connection_lost';
  els.connectionBanner.hidden = !lost;
  if (!lost) return;
  const ui = contentBundle();

  els.connectionTitle.textContent = copy.labels.connectionLost;
  els.connectionText.textContent = ui.scenarios.OFFLINE.action;
  els.connectionUpdated.textContent = `${copy.labels.updated}: ${state.lastKnownUpdate || state.updatedTime || '--:--'}`;
  els.connectionInstruction.textContent = copy.labels.followLastInstruction;
}

function renderOverlay(t) {
  const night = state.night;

  if (state.mode === 'low_battery') {
    els.overlay.classList.remove('offline-overlay');
    els.ovBody.classList.remove('ov-body-offline');
    const bg  = '#0e0c0a';
    const fg  = '#f0a000';
    const sub = '#b8b090';
    els.overlay.style.background = bg;
    els.ovBody.innerHTML = `
      <svg viewBox="0 0 170 80" width="170" height="80" style="margin-bottom:14px" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="16" width="134" height="48" rx="6" fill="none" stroke="${fg}" stroke-width="3"/>
        <rect x="138" y="28" width="18" height="24" rx="3" fill="${fg}"/>
        <rect x="8" y="20" width="22" height="40" rx="2" fill="${fg}"/>
      </svg>
      <div style="font-size:36px;font-weight:bold;color:${fg};font-family:Courier New,monospace">${t.low_battery_title}</div>
      <div style="font-size:15px;color:${sub};margin-top:12px;font-family:Courier New,monospace">${t.low_battery_msg}</div>`;
    els.ovNightTxt.textContent = t.night_mode_chk;
    els.ovNightChk.checked = night;
    const footer = $('ovFooter');
    footer.style.background = '#181410';
    footer.style.borderTopColor = fg;
    setBattery(true);

  } else if (state.mode === 'connection_lost') {
    renderOfflineScreen(t);
    const footer = $('ovFooter');
    footer.style.background = night ? 'var(--night-header)' : 'var(--header-bg)';
    footer.style.borderTopColor = night ? 'var(--night-ink)' : 'var(--ink)';
    setBattery(false);
  }
}

function renderOfflineScreen(t) {
  const copy = emergencyCopy();
  const ui = contentBundle();
  const scenario = scenarioContent(state.dataRecord, 'OFFLINE');
  const lastRisk = ui.riskBadges[state.displayState] || ui.riskBadges.OFFLINE;
  const lastAction = scenario.action;
  const update = state.lastKnownUpdate || state.updatedTime || '--:--';
  const trace = traceRecord();

  els.overlay.classList.add('offline-overlay');
  els.ovBody.classList.add('ov-body-offline');
  els.overlay.style.background = state.night ? 'var(--night-screen)' : 'var(--screen-bg)';
  els.ovBody.style.color = state.night ? 'var(--night-ink)' : 'var(--ink)';
  els.ovBody.innerHTML = `
    <div class="offline-screen">
      <div class="offline-head">
        <div class="offline-signal">${ui.offline.noSignal}</div>
        <div class="offline-title">${copy.labels.connectionLost}</div>
        <div class="offline-mode">${ui.offline.mode}</div>
      </div>

      <div class="offline-summary">
        <div><span>${ui.offline.lastUpdate}</span><b>${update}</b></div>
        <div><span>${ui.offline.source}</span><b>${trace.source}</b></div>
        <div><span>${ui.offline.lastRisk}</span><b>${lastRisk}</b></div>
        <div><span>${ui.offline.lastAction}</span><b>${lastAction}</b></div>
        <div><span>${ui.offline.demoMode}</span><b>${trace.mode}</b></div>
        <div><span>${ui.offline.ruleUsed}</span><b>${trace.rule}</b></div>
      </div>

      <div class="offline-checklists">
        <div class="offline-section-title">${ui.offline.checklist}</div>
        <div class="checklist-simple">
          <a class="checklist-thumb-link" href="${checklistPublicUrl(selectedChecklist)}" target="_blank" rel="noopener">
            <img class="checklist-thumb" src="${checklistPublicUrl(selectedChecklist)}" alt="${selectedChecklist.name} checklist thumbnail">
          </a>
          <div class="checklist-controls">
            <label class="checklist-select-label" for="checklistSelect">${ui.offline.language}</label>
            <select class="checklist-select" id="checklistSelect" data-checklist-select>
              ${CHECKLISTS.map(item => `
                <option value="${item.key}" ${item.key === selectedChecklist.key ? 'selected' : ''}>${item.name}</option>
              `).join('')}
            </select>
            <a class="checklist-download" href="${checklistPublicUrl(selectedChecklist)}" download>${ui.offline.download}</a>
          </div>
          <div class="checklist-qr">
            <img class="qr-img" src="${qrImageUrl(selectedChecklist)}" alt="QR code for ${selectedChecklist.name} checklist download">
            <div class="qr-title">${ui.offline.scan}</div>
          </div>
        </div>
      </div>
    </div>`;
}

function handleOfflineSelect(event) {
  const select = event.target.closest('[data-checklist-select]');
  if (!select) return;

  const next = CHECKLISTS.find(item => item.key === select.value);
  if (next) {
    selectedChecklist = next;
    renderOverlay(T[state.lang]);
  }
}

function handleOfflineAction(event) {
  const thumb = event.target.closest('.checklist-thumb-link');
  if (thumb) {
    thumb.href = checklistPublicUrl(selectedChecklist);
    return;
  }

  const download = event.target.closest('.checklist-download');
  if (download) {
    download.href = checklistPublicUrl(selectedChecklist);
  }
}

function qrImageUrl(checklist = selectedChecklist) {
  const url = checklistPublicUrl(checklist);
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=${encodeURIComponent(url)}`;
}

// ─── Flood icon SVG paths ─────────────────────────────────
function wavePath(y0) {
  const ty = 4, bly = 78, blx = 4, brx = 88, tx = 46;
  const t  = (y0 - ty) / (bly - ty);
  const xl = tx + (blx - tx) * t + 5;
  const xr = tx + (brx - tx) * t - 5;
  if (xr <= xl) return '';
  const n = 10;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = xl + (xr - xl) * i / n;
    const y = y0 + 3.5 * Math.sin(i * 2 * Math.PI / n);
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

function updateFloodIcon(risk, night) {
  const ink = night ? '#dcdcf4' : '#1c1918';
  const bg  = night ? '#0f0f1c' : '#edeae0';

  if (risk === 'HIGH') {
    els.iconPoly.setAttribute('fill', ink);
    els.iconPoly.setAttribute('stroke', ink);
    els.iconWave1.setAttribute('stroke', bg);
    els.iconWave2.setAttribute('stroke', bg);
  } else {
    els.iconPoly.setAttribute('fill', 'none');
    els.iconPoly.setAttribute('stroke', 'currentColor');
    els.iconWave1.setAttribute('stroke', 'currentColor');
    els.iconWave2.setAttribute('stroke', 'currentColor');
  }

  els.iconWave1.setAttribute('d', wavePath(50));
  els.iconWave2.setAttribute('d', wavePath(63));
}

// ─── Battery icon ─────────────────────────────────────────
function setBattery(low) {
  if (low) {
    els.battFill.setAttribute('width', '5');
    els.battFill.setAttribute('fill', '#cc3300');
  } else {
    els.battFill.setAttribute('width', '23');
    els.battFill.setAttribute('fill', 'currentColor');
  }
}

// ─── Real-time clock ──────────────────────────────────────
function updateClock() {
  const now  = new Date();
  let h      = now.getHours();
  const m    = String(now.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const time = `${h}:${m} ${ampm}`;
  state.updatedTime = time;
  els.clock.textContent = time;
  if (els.updatedTxt && !state.liveStatus) {
    els.updatedTxt.textContent = `${emergencyCopy().labels.updated}: ${time}`;
  }
  setTimeout(updateClock, 1000);
}

// ─── Official source pipeline ─────────────────────────────
async function refreshOfficialStatus() {
  state.selectedDataMode = 'current';
  const ui = contentBundle();

  // GitHub Pages is a static frontend, so Current Official Mode reads the
  // checked-in demo data file. A real deployment can add a separate official
  // feed endpoint later, but the demo should not depend on a local Python server.
  try {
    applyDataRecord(await loadJson(SCENARIO_FILES.current));
    els.dpStatus.textContent = ui.controls.currentLoaded || 'Current mode uses local demo data.';
  } catch (error) {
    state.liveStatus = null;
    els.dpStatus.textContent = `Current mode data unavailable: ${error.message}`;
  }
}

function formatOfficialTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function traceRecord() {
  const record = state.dataRecord || {};
  const displayState = state.displayState || deriveDisplayState(record);
  const ui = contentBundle();
  const key = scenarioKey(record, displayState);
  const modeKey = state.selectedDataMode === 'current' ? 'current' : 'historical';
  return {
    mode: ui.modeLabels[modeKey] || ui.modeLabels.manual,
    scenario: ui.scenarioNames[key] || record.scenario || displayState || '--',
    warning: scenarioContent(record, displayState).warning || record.officialWarningLevel || '--',
    source: record.source || (state.liveStatus && state.liveStatus.source) || '--',
    updated: record.timestamp || record.updatedAt || (state.liveStatus && state.liveStatus.updatedAt) || state.updatedTime || '--',
    status: ui.dataStatus[record.dataStatus] || record.dataStatus || '--',
    rule: ui.rules[displayState] || record.ruleUsed || RULE_LABELS[displayState] || '--',
    real: record.isRealCurrentWarning ? ui.trace.yes : ui.trace.no,
    note: record.isRealCurrentWarning
      ? ''
      : (state.selectedDataMode === 'current'
          ? (ui.trace.currentNote || 'Current official source check.')
          : ui.trace.controlledNote),
  };
}

function renderTraceability() {
  const ui = contentBundle();
  const trace = traceRecord();
  els.traceTitle.textContent = ui.trace.title;
  els.traceLblMode.textContent = ui.trace.mode;
  els.traceLblScenario.textContent = ui.trace.scenario;
  els.traceLblWarning.textContent = ui.trace.warning;
  els.traceLblSource.textContent = ui.trace.source;
  els.traceLblUpdated.textContent = ui.trace.updated;
  els.traceLblStatus.textContent = ui.trace.status;
  els.traceLblRule.textContent = ui.trace.rule;
  els.traceLblReal.textContent = ui.trace.real;
  els.traceMode.textContent = trace.mode;
  els.traceScenario.textContent = trace.scenario;
  els.traceWarning.textContent = trace.warning;
  els.traceSource.textContent = trace.source;
  els.traceUpdated.textContent = formatOfficialTime(trace.updated);
  els.traceStatus.textContent = trace.status;
  els.traceRule.textContent = trace.rule;
  els.traceReal.textContent = trace.real;
  els.traceNote.textContent = trace.note;
}


// ─── Adaptive typography ───────────────────────────────────
// Enlarges the resident-facing text when there is empty space, then shrinks it
// only if the current language/scenario would overflow. This keeps English,
// Chinese, Vietnamese, French, Japanese and Korean readable without overlap.
let fitTypographyFrame = null;

function scheduleAdaptiveTypography() {
  if (fitTypographyFrame) cancelAnimationFrame(fitTypographyFrame);
  fitTypographyFrame = requestAnimationFrame(() => {
    fitTypographyFrame = requestAnimationFrame(() => {
      fitAdaptiveTypography();
      fitTypographyFrame = null;
    });
  });
}

function setFontForSelector(root, selector, px, lineHeight = 1.18) {
  root.querySelectorAll(selector).forEach(node => {
    node.style.fontSize = `${px}px`;
    node.style.lineHeight = String(lineHeight);
  });
}

function groupFits(container) {
  if (!container || container.hidden || container.offsetParent === null) return true;
  // +1 avoids false positives caused by sub-pixel rounding.
  return container.scrollHeight <= container.clientHeight + 1 &&
         container.scrollWidth  <= container.clientWidth + 1;
}

function fitFontGroup(container, rules, minScale = 0.64) {
  if (!container || container.offsetParent === null) return;
  const steps = 24;
  for (let i = 0; i <= steps; i += 1) {
    const scale = 1 - (i / steps) * (1 - minScale);
    rules.forEach(rule => {
      const size = Math.max(rule.min, rule.max * scale);
      setFontForSelector(container, rule.selector, size, rule.lineHeight || 1.18);
    });
    if (groupFits(container)) return;
  }
}

function fitSingleElement(el, maxPx, minPx, lineHeight = 1.18) {
  if (!el || el.offsetParent === null) return;
  const steps = 20;
  for (let i = 0; i <= steps; i += 1) {
    const size = maxPx - ((maxPx - minPx) * i / steps);
    el.style.fontSize = `${size}px`;
    el.style.lineHeight = String(lineHeight);
    if (el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1) return;
  }
}

function fitAdaptiveTypography() {
  if (!els || !els.screen || els.overlay?.hidden === false) return;
  const vw = window.visualViewport?.width || window.innerWidth;
  const vh = window.visualViewport?.height || window.innerHeight;
  const compactLandscape = vw > vh && vh <= 560;
  const phonePortrait = vh >= vw && vw <= 700;

  const maxWarning = compactLandscape ? 18 : (phonePortrait ? 21 : 24);
  const maxPrimary = compactLandscape ? 22 : (phonePortrait ? 30 : 32);

  // Main alert: let short text become prominent, but protect long translations.
  fitSingleElement(els.warningType, maxWarning, compactLandscape ? 11 : 13, 1.12);
  fitSingleElement(els.primaryAction, maxPrimary, compactLandscape ? 13 : 16, 1.12);

  // Middle panels. These are grouped by section so the total block fits, not
  // just each individual line. This avoids overlap when route/action text grows.
  fitFontGroup(document.querySelector('.happening-section'), [
    { selector: '.section-lbl', max: compactLandscape ? 12 : (phonePortrait ? 14 : 15), min: compactLandscape ? 8 : 10, lineHeight: 1.0 },
    { selector: '.section-txt', max: compactLandscape ? 16 : (phonePortrait ? 19 : 22), min: compactLandscape ? 10 : 12, lineHeight: 1.18 },
  ], compactLandscape ? 0.62 : (phonePortrait ? 0.58 : 0.66));

  fitFontGroup(document.querySelector('.action-section'), [
    { selector: '.section-lbl', max: compactLandscape ? 12 : (phonePortrait ? 14 : 15), min: compactLandscape ? 8 : 10, lineHeight: 1.0 },
    { selector: '.act-item', max: compactLandscape ? 15 : (phonePortrait ? 18 : 20), min: compactLandscape ? 9 : 11, lineHeight: 1.18 },
  ], compactLandscape ? 0.60 : (phonePortrait ? 0.58 : 0.64));

  fitFontGroup(document.querySelector('.route-section'), [
    { selector: '.section-lbl', max: compactLandscape ? 12 : (phonePortrait ? 14 : 15), min: compactLandscape ? 8 : 10, lineHeight: 1.0 },
    { selector: '.route-diagram', max: compactLandscape ? 14 : (phonePortrait ? 17 : 19), min: compactLandscape ? 9 : 10, lineHeight: 1.08 },
    { selector: '.route-note', max: compactLandscape ? 13 : (phonePortrait ? 16 : 18), min: compactLandscape ? 9 : 10, lineHeight: 1.16 },
  ], compactLandscape ? 0.60 : (phonePortrait ? 0.56 : 0.62));

  fitSingleElement(els.helpList, compactLandscape ? 16 : (phonePortrait ? 20 : 22), compactLandscape ? 10 : 12, 1.05);
}

// ─── Device scaling ───────────────────────────────────────
function rescale() {
  const vw = window.visualViewport?.width || window.innerWidth;
  const vh = window.visualViewport?.height || window.innerHeight;
  const isMobile = vw <= 900 || vh <= 900;
  const isLandscape = vw > vh;
  const isPhoneLandscape = isLandscape && vh <= 560;
  const isPhonePortrait = !isLandscape && vw <= 700;

  // Phone layouts use responsive CSS dimensions rather than fixed 880×590
  // scaling. Landscape is detected by height so Pro Max devices do not fall
  // back to desktop. Portrait is detected by width so the device can use the
  // full tall screen and reflow panels vertically.
  if (isPhoneLandscape || isPhonePortrait) {
    els.scaleWrap.style.transform = 'none';
    scheduleAdaptiveTypography();
    return;
  }

  const panelW = 0; // Demo controls are always inside the hamburger drawer, so no sidebar space is reserved.
  const padH   = isMobile ? 10 : 32;
  const padV   = isMobile ? 10 : 28;

  const availW = vw - panelW - padH * 2;
  const availH = vh - padV * 2;
  const scale  = Math.max(0.25, Math.min(availW / 880, availH / 590));

  els.scaleWrap.style.transform = `scale(${scale})`;
  scheduleAdaptiveTypography();
}

// ─── Mobile/PWA controls drawer ───────────────────────────
function isControlsDrawerOpen() {
  return els.demoPanel.classList.contains('open');
}

function openControlsDrawer() {
  els.demoPanel.classList.add('open');
  els.drawerBackdrop.hidden = false;
  els.mobileMenuBtn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('drawer-open');
}

function closeControlsDrawer() {
  els.demoPanel.classList.remove('open');
  els.drawerBackdrop.hidden = true;
  els.mobileMenuBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('drawer-open');
}

function toggleControlsDrawer() {
  if (isControlsDrawerOpen()) closeControlsDrawer();
  else openControlsDrawer();
}

// ─── AI Risk Analysis ─────────────────────────────────────
// Architecture: cleaned data → POST /api/analyse-risk → OpenRouter → display
//
// SAFETY NOTE: This is a prototype/demo only.
// In a real emergency system, official data and thresholds must be validated
// by Council/SES/Melbourne Water.  AI should only support plain-language
// communication, NOT make final emergency decisions.

// Suggested demo river levels and rainfall by display state.
// These are plausible values based on the Maribyrnong flood context.
const AI_DEMO_VALUES = {
  CURRENT_NORMAL: { riverLevel: 0.9, rainfall24h: 4,  officialWarning: false },
  READY:          { riverLevel: 0.9, rainfall24h: 4,  officialWarning: false },
  PREPARE:        { riverLevel: 1.7, rainfall24h: 45, officialWarning: false },
  ACT_NOW:        { riverLevel: 2.3, rainfall24h: 65, officialWarning: false },
  LEAVE_NOW:      { riverLevel: 2.9, rainfall24h: 85, officialWarning: true  },
  OFFLINE:        { riverLevel: 2.3, rainfall24h: 65, officialWarning: false },
};

// Pre-fill the AI input fields using values that match the current scenario.
function prefillAIInputs() {
  const vals = AI_DEMO_VALUES[state.displayState] || AI_DEMO_VALUES.READY;
  $('aiRiverLevel').value = vals.riverLevel;
  $('aiRainfall').value   = vals.rainfall24h;
  $('aiOfficialWarning').checked = vals.officialWarning;
}

// Map the AI displayMode back to the internal scenario key used by applyDataRecord().
const ALLOWED_AI_RISK = ['READY', 'PREPARE', 'ACT_NOW', 'LEAVE_NOW'];
const ALLOWED_AI_MODE = ['ready', 'prepare', 'act_now', 'leave_now'];

const AI_MODE_TO_SCENARIO = {
  ready:     'READY',
  prepare:   'PREPARE',
  act_now:   'ACT_NOW',
  leave_now: 'LEAVE_NOW',
};

// Applies the AI result to the e-ink display.
// This is the last step of the pipeline:
//   AI JSON risk signal → applyDataRecord → render()
function applyAIResult(result) {
  const scenario = AI_MODE_TO_SCENARIO[result.displayMode] || 'READY';
  const warningMap = {
    READY:     'No active warning',
    PREPARE:   'Advice',
    ACT_NOW:   'Watch and Act',
    LEAVE_NOW: 'Emergency Warning - Evacuate',
  };
  const record = {
    mode:                'AI Analysis (demo)',
    scenario,
    timestamp:           new Date().toISOString(),
    location:            'Maribyrnong',
    officialWarningLevel: warningMap[scenario] || 'No active warning',
    dataStatus:          'controlled_demo',
    source:              `OpenRouter AI (${result.source}) — prototype only`,
    isRealCurrentWarning: false,
    // Store AI headline in provenanceNote so traceability panel shows it
    provenanceNote:      `AI headline: "${result.headline}" | ${result.confidenceNote}`,
  };
  state.selectedDataMode = 'historical';
  applyDataRecord(record);
}

// Escape AI/fallback strings before inserting into the sidebar HTML.
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fallbackAIResult(payload, reason = 'Backend unavailable; using local safety rules.') {
  const riverLevel = Number(payload.riverLevel) || 0;
  const rainfall24h = Number(payload.rainfall24h) || 0;
  const officialWarning = Boolean(payload.officialWarning);

  if (officialWarning || riverLevel >= 2.9) {
    return {
      riskLevel: 'LEAVE_NOW',
      displayMode: 'leave_now',
      headline: 'Emergency flood conditions possible near Maribyrnong.',
      action: 'Leave now if authorities advise evacuation.',
      shortChecklist: ['Take medicine, ID and phone.', 'Move to higher ground.', 'Avoid floodwater.'],
      confidenceNote: reason,
      source: 'frontend-fallback',
    };
  }
  if (riverLevel >= 2.3 || rainfall24h >= 60) {
    return {
      riskLevel: 'ACT_NOW',
      displayMode: 'act_now',
      headline: 'River or rainfall conditions are concerning.',
      action: 'Act now and prepare to leave.',
      shortChecklist: ['Move car and pets higher.', 'Charge phone.', 'Monitor official warnings.'],
      confidenceNote: reason,
      source: 'frontend-fallback',
    };
  }
  if (riverLevel >= 1.7 || rainfall24h >= 30) {
    return {
      riskLevel: 'PREPARE',
      displayMode: 'prepare',
      headline: 'Rain and river levels may rise.',
      action: 'Prepare now. Conditions may change.',
      shortChecklist: ['Pack medicine, ID and charger.', 'Move valuables higher.', 'Check on neighbours.'],
      confidenceNote: reason,
      source: 'frontend-fallback',
    };
  }
  return {
    riskLevel: 'READY',
    displayMode: 'ready',
    headline: 'No active flood warning for Maribyrnong.',
    action: 'Stay ready and review your flood plan.',
    shortChecklist: ['Keep phone charged.', 'Know your safe route.', 'Check official updates.'],
    confidenceNote: reason,
    source: 'frontend-fallback',
  };
}

function validateAIResult(raw, payload) {
  if (!raw || typeof raw !== 'object') throw new Error('AI response is not an object');
  let result = { ...raw };

  // Official warning is the safety override. AI must never downgrade it.
  if (payload.officialWarning) {
    result = {
      ...fallbackAIResult(payload, 'Official warning override applied.'),
      ...result,
      riskLevel: 'LEAVE_NOW',
      displayMode: 'leave_now',
    };
  }

  if (!ALLOWED_AI_RISK.includes(result.riskLevel)) throw new Error(`Invalid riskLevel: ${result.riskLevel}`);
  if (!ALLOWED_AI_MODE.includes(result.displayMode)) throw new Error(`Invalid displayMode: ${result.displayMode}`);

  result.headline = String(result.headline || fallbackAIResult(payload).headline).slice(0, 140);
  result.action = String(result.action || fallbackAIResult(payload).action).slice(0, 140);
  result.shortChecklist = Array.isArray(result.shortChecklist) ? result.shortChecklist.slice(0, 3).map(String) : fallbackAIResult(payload).shortChecklist;
  result.confidenceNote = String(result.confidenceNote || 'Prototype result; verify with official sources.').slice(0, 180);
  result.source = String(result.source || 'backend');
  return result;
}

function apiEndpoint(path) {
  const base = (API_BASE_URL || '').replace(/\/$/, '');
  return base ? `${base}${path}` : path;
}

async function postJsonWithTimeout(url, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error(`Backend HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timer);
  }
}

function renderAIResult(result, payload) {
  const resultEl = $('dpAIResult');
  const tag = result.source === 'openrouter' ? 'OpenRouter AI' : 'Rule-based fallback';
  const riskClass = String(result.riskLevel || '').toLowerCase();
  resultEl.innerHTML = `
    <div class="ai-result">
      <div class="ai-result-tag">${escapeHtml(tag)}</div>
      <div class="ai-result-risk ai-risk-${escapeHtml(riskClass)}">
        ${escapeHtml(result.riskLevel)} / ${escapeHtml(result.displayMode)}
      </div>
      <div class="ai-result-headline">${escapeHtml(result.headline)}</div>
      <div class="ai-result-action">${escapeHtml(result.action)}</div>
      <div class="ai-result-checklist">${result.shortChecklist.map(i => `• ${escapeHtml(i)}`).join('<br>')}</div>
      <div class="ai-result-note">${escapeHtml(result.confidenceNote)}</div>
      <button class="dp-btn ai-apply-btn" id="btnApplyAI">Apply to display</button>
    </div>`;
  $('btnApplyAI').onclick = () => applyAIResult(result);
}

// Main AI function — called when the user clicks "Analyse Risk with AI".
// Builds a payload from the input fields, calls the deployed backend, then
// falls back locally if the backend/OpenRouter is not available during demo.
async function analyseWithAI() {
  const btn      = $('btnAnalyseAI');
  const resultEl = $('dpAIResult');

  const payload = {
    sourceMode:      state.selectedDataMode,
    riverLevel:      parseFloat($('aiRiverLevel').value) || 0.9,
    rainfall24h:     parseFloat($('aiRainfall').value)   || 4,
    officialWarning: $('aiOfficialWarning').checked,
    location:        'Maribyrnong',
    gauge:           'Maribyrnong gauge',
    language:        state.lang === 'English' ? 'en' : state.lang,
  };

  btn.disabled    = true;
  btn.textContent = 'Analysing…';
  resultEl.innerHTML = '<div class="ai-loading">Analysing cleaned flood data…</div>';

  try {
    const endpoint = apiEndpoint('/api/analyse-risk');
    const isPlaceholder = endpoint.includes('YOUR-VERCEL-BACKEND');
    if (isPlaceholder) {
      throw new Error('Vercel backend URL placeholder not replaced');
    }
    const backendResult = await postJsonWithTimeout(endpoint, payload);
    const result = validateAIResult(backendResult, payload);
    renderAIResult(result, payload);
  } catch (err) {
    const result = fallbackAIResult(payload, `Backend unavailable (${err.message}); local fallback used.`);
    renderAIResult(result, payload);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Analyse Risk with AI ▶';
  }
}

// ─── Boot ─────────────────────────────────────────────────
init();
