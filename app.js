(function () {
  "use strict";

  const STORAGE_KEY = "hostreview.userReviews.v3";
  const CUSTOM_HOSTS_KEY = "hostreview.customHosts.v2";
  const LANGUAGE_KEY = "homelog.language";
  const ROLE_KEY = "homelog.role";
  const SESSION_KEY = "homelog.session";
  const BRAND_NAME = "ホームログ";
  const RED_DEER_CENTER = { lat: 52.2681, lng: -113.8112 };

  const translations = {
    ja: {
    htmlLang: "ja",
    languageLabel: "言語",
    languageJapanese: "日本語",
    languageEnglish: "English",
    roleLabel: "表示モード",
    roleUser: "利用者",
    roleModerator: "モデレーター",
    roleAdmin: "管理者",
    moderatorBadge: "モデレーター",
    adminBadge: "管理者",
    deleteReview: "削除",
    deleteReviewLabel: "この投稿を削除",
    deleteFailed: "投稿を削除できませんでした。",
    deleteFamily: "家族を削除",
    deleteFamilyLabel: "この家族を削除",
    geocodeFailed: "住所から位置を取得できませんでした。住所を確認してください。",
    geocodeFallback: "住所の自動取得に失敗したため、Red Deer内の参考位置として追加しました。",
    familyNameSameAsArea: "家族名とエリア名は分けて入力してください。",
    adminRatingOnly: "管理者による評価のみ",
    refineSearch: "検索条件を変えてもう一度探してください。",
    selectFamilyFirst: "レビューを書くには、まずマップまたは検索結果から家族を選択してください。",
    subtitle: "留学生のための安全なホームステイ比較プラットフォーム",
    navSearch: "探す",
    navMap: "マップ",
    navReview: "レビューを書く",
    navSchool: "学校向け",
    login: "ログイン",
    logout: "ログアウト",
    loginTitle: "ログイン",
    loginUser: "ユーザー名",
    loginPassword: "パスワード",
    loginSubmit: "ログインする",
    loginFailed: "ユーザー名またはパスワードが違います。",
    loggedInAs: "ログイン中",
    demoAccounts: "デモ: student / moderator / admin、パスワードは demo",
    badge: "本人確認済みレビューでホームステイの不安を減らす",
    heroTitleA: "ホームステイを、",
    heroTitleB: "運ではなく情報で選ぶ。",
    heroText:
      "HomeLogは、留学生が入居前に安全性、相性、通学、ルール、食事、サポートを比較できる信頼プラットフォームです。正確な住所は公開せず、レビューは生活条件に沿って整理されます。",
    heroValue: "Safety / Fit / Commute / Rules / Meals / Support",
    heroPrivacy: "Private addresses are never shown",
    heroModeration: "Reviews are structured to prevent personal attacks",
    compareAreas: "ホストエリアを比較",
    writeReviewCta: "レビューを書く",
    searchPlaceholder: "Red Deer内で検索 例：Downtown、学校近い、静かな家庭、内向的",
    searchButton: "検索",
    statItems: "評価カテゴリ",
    statPrivacy: "投稿レビュー",
    statMap: "実マップ対応",
    featured: "選択中のホスト",
    reviews: "件のレビュー",
    mapTitle: "Red Deer ホストマップ",
    mapHelp:
      "正確な住所と非公開ピンは地図配置のためだけに使います。公開画面にはエリア名だけを表示します。",
    area: "エリア",
    mapPrivacy: "住所は非公開。表示位置は近隣エリアの参考地点です。",
    searchResults: "検索結果",
    noResults: "条件に一致するホストファミリーが見つかりません。",
    reviewForm: "レビュー投稿フォーム",
    reviewLead: "生活環境、ルール、英語環境、相性を比較できる形で記録します。自由記述は補足として使います。",
    reviewPlaceholder:
      "生活環境、日課、サポートについて書いてください。\n個人攻撃や個人を特定できる情報は避けてください。",
    submitReview: "匿名レビューを投稿する",
    submitted: "レビューを保存しました。検索結果と最近のレビューに反映されています。",
    recentReviews: "最近のレビュー",
    noReviewsYet: "まだ投稿レビューはありません。最初のレビューを書き込めます。",
    schoolTitle: "学校・エージェント向け分析機能",
    schoolText:
      "英語環境、生活ルール、学習環境、文化適応、メンタル面、交通、安全の傾向を可視化し、問題の早期発見とホームステイ品質の改善につなげます。",
    document: "資料を見る",
    tests: "プロトタイプ動作確認",
    testsText: "検索・レビュー保存・カテゴリ評価・地図座標の簡易テストを実行済みです。",
    verified: "認証済み",
    allTestsPassed: "すべて確認済み",
    someTestsFailed: "確認が必要です",
    pass: "合格",
    fail: "要確認",
    bestFor: "向いている人",
    detailedScores: "評価カテゴリ",
    savedLocally: "保存済み",
    reviewTarget: "投稿先",
    reviewText: "レビュー本文",
    anonymousStudent: "匿名留学生",
    privacyTitle: "プライバシー保護について",
    privacyStatement:
      "ホームログではホストファミリーの正確な住所、個人連絡先、家族構成などの特定につながる情報は公開しません。地図上の家アイコンは実住所ではなく、約100m以上ぼかした近隣エリアの参考位置です。レビューは家庭の安全性と生活環境を比較するための情報に限定し、本人や住所を特定する投稿は公開対象にしない設計です。",
    addNewHouse: "新しい家族を追加",
    newHouseName: "家族名",
    newHouseArea: "エリア",
    addHouse: "追加",
    mapUnavailable: "地図ライブラリを読み込めませんでした。ネットワーク接続後に再読み込みしてください。",
    addNewFamily: "新しい家族を追加",
    familyName: "表示用の家族名",
    familyArea: "利用者に表示するエリア名",
    exactAddress: "正確な住所（非公開）",
    pinLat: "地図ピンの緯度",
    pinLng: "地図ピンの経度",
    addFamily: "家族を追加",
    noFamilies: "まだ家族が追加されていません。上のフォームから追加すると地図に表示されます。",
    addReview: "レビューを追加",
    selectedFamily: "選択中の家族",
    localReviews: "ローカルレビュー",
    mapPlacementNote: "正確な住所は非公開です。ピンは近隣エリアの参考位置として表示し、通学・地域・冬の移動を比較するために使います。",
    exactAddressHidden: "正確な住所は非公開",
    approximatePins: "ピンはエリア単位の参考位置",
    mapUse: "通学、近隣環境、冬のアクセスを比較",
    mapZoomLimited: "ホストのプライバシー保護のため、地図の拡大には制限があります。",
    quickFilters: "クイックフィルター",
    clearFilters: "解除",
    nearSchool: "学校に近い",
    quietHome: "静かな家庭",
    flexibleRules: "柔軟なルール",
    strongEnglish: "英語環境が強い",
    goodIntroverts: "内向的な人向け",
    sportsFriendly: "スポーツ向け",
    winterSupport: "冬の通学サポート",
    highSafety: "安全性が高い",
    mealSupport: "食事サポート",
    quiet: "静か",
    lively: "会話多め",
    strict: "厳しめ",
    flexible: "柔軟",
    mealGood: "食事サポートあり",
    mealNormal: "食事は標準",
    commuteGood: "通学しやすい",
    commuteNormal: "通学は標準",
    winterFriendly: "冬の移動に強い",
    safetyStrong: "安全性が高い",
    verifiedStatus: "確認状況",
    commuteSummary: "通学・安全・サポート要約",
    structuredReview: "生活条件レビュー",
    homeEnvironment: "HOME ENVIRONMENT",
    rulesStructure: "RULES & STRUCTURE",
    languageEnvironmentTitle: "LANGUAGE ENVIRONMENT",
    socialAtmosphereTitle: "SOCIAL ATMOSPHERE",
    studentMatching: "STUDENT MATCHING",
    recommendationTitle: "RECOMMENDATION",
    additionalNotes: "ADDITIONAL NOTES",
    noiseLevel: "生活音",
    noiseLevelQuestion: "家の環境はどのような雰囲気でしたか？",
    privacyLevel: "個人スペース",
    privacyLevelQuestion: "自分の空間はどれくらいありましたか？",
    bathroomSituation: "バスルーム",
    bathroomQuestion: "バスルームの利用状況は？",
    rulesFlexibility: "門限・ハウスルール",
    rulesQuestion: "家のルールはどう感じましたか？",
    householdInteraction: "家庭内の関わり",
    interactionQuestion: "一緒に食事や時間を過ごす頻度は？",
    englishEnvironment: "英語環境",
    englishEnvironmentQuestion: "日常の会話は主に何語でしたか？",
    socialAtmosphere: "家庭の雰囲気",
    socialAtmosphereQuestion: "家の雰囲気はどう感じましたか？",
    goodMatchFor: "相性がよい学生",
    goodMatchQuestion: "この家庭はどんな学生に合うと思いますか？",
    recommendation: "おすすめ度",
    recommendationQuestion: "このホームステイをおすすめしますか？",
    privacyGuidelinesTitle: "Privacy & Review Guidelines",
    privacyGuidelineAddress: "正確な住所を書かない",
    privacyGuidelineNames: "家族メンバーの名前を書かない",
    privacyGuidelineContact: "電話番号や連絡先を書かない",
    privacyGuidelineConditions: "生活条件とサポートに集中する",
    privacyGuidelineAttacks: "個人攻撃は禁止",
    curfew: "門限",
    meals: "食事",
    privacy: "プライバシー",
    communication: "コミュニケーション",
    recommend: "おすすめ度",
    strictOption: "厳しい",
    normalOption: "普通",
    flexibleOption: "柔軟",
    unknownOption: "不明",
    enoughOption: "十分",
    notEnoughOption: "不足",
    privateOption: "個室感あり",
    sharedOption: "共有多め",
    limitedOption: "限られる",
    easyOption: "相談しやすい",
    difficultOption: "難しい",
    yesOption: "はい",
    maybeOption: "たぶん",
    noOption: "いいえ",
    veryQuietOption: "とても静か",
    mostlyQuietOption: "だいたい静か",
    balancedOption: "バランス型",
    oftenNoisyOption: "にぎやかなことが多い",
    veryNoisyOption: "とてもにぎやか",
    veryPrivateOption: "かなり個人空間がある",
    mostlyPrivateOption: "だいたい個人空間がある",
    sharedOccasionallyOption: "時々共有",
    limitedPrivacyOption: "個人空間は限られる",
    bathroomPrivateOption: "専用",
    sharedOneTwoOption: "1〜2人と共有",
    sharedSeveralOption: "複数人と共有",
    inconvenientOption: "不便",
    veryFlexibleOption: "とても柔軟",
    mostlyFlexibleOption: "だいたい柔軟",
    veryStrictOption: "とても厳しい",
    veryOftenOption: "とても多い",
    sometimesOption: "時々",
    rarelyOption: "少ない",
    almostNeverOption: "ほとんどない",
    englishOnlyOption: "英語のみ",
    mostlyEnglishOption: "ほぼ英語",
    mixedLanguagesOption: "複数言語",
    mostlyNonEnglishOption: "英語以外が多い",
    veryWelcomingOption: "とても歓迎的",
    friendlyOption: "親しみやすい",
    neutralOption: "中立的",
    distantOption: "距離がある",
    uncomfortableOption: "居心地が悪い",
    quietStudentsOption: "静かな環境が好きな学生",
    independentStudentsOption: "自立した学生",
    socialStudentsOption: "交流したい学生",
    beginnerEnglishLearnersOption: "英語初級者",
    strongEnglishImmersionOption: "英語漬けを求める学生",
    studentAthletesOption: "学生アスリート",
    studentsWithoutCarsOption: "車がない学生",
    preferStructureOption: "決まったルールが好きな学生",
    preferFreedomOption: "自由度を重視する学生",
    safetyDesignTitle: "安全性を前提にした設計",
    safetyDesignText: "HomeLogは、留学生の体験を共有しながら、住所・連絡先・家族構成などの個人情報を公開しない設計です。",
    safetyPointAddress: "正確な住所は公開しません",
    safetyPointConditions: "レビューは人への攻撃ではなく生活条件に集中",
    safetyPointCorrection: "将来版ではホスト側の訂正依頼・返信を想定",
    safetyPointModeration: "通報とモデレーションキューを計画",
    safetyPointSchool: "学校・管理者は公開せずに傾向を確認可能",
    analyticsReviews: "レビュー数",
    analyticsAverage: "カテゴリ平均",
    analyticsRisks: "注意シグナル",
    analyticsStrongest: "強いカテゴリ",
    analyticsAttention: "改善が必要な領域",
    analyticsCommonStrengths: "よくある強み",
    analyticsCommonConcerns: "よくある懸念",
    analyticsAtmosphere: "家庭の雰囲気",
    analyticsRuleStrictness: "ルールの厳しさ",
    noAnalytics: "レビューや家族データが増えると分析が表示されます。",
    riskLowRules: "ルールの不一致",
    riskCommute: "通学・冬の移動",
    riskSupport: "相談しにくさ",
    criteria: {
      englishEnvironment: ["英語環境", "英語環境の強さ / 家族との会話量 / 英語矯正してくれるか"],
      rules: ["自由度・ルール", "自由度 / 門限 / 外泊ルール"],
      study: ["学習向き", "学習向き / 静かさ / 勉強スペース"],
      cultureFit: ["文化適応", "文化適応 / 宗教・食文化配慮 / アジア人留学生への理解"],
      mentalSupport: ["メンタル面", "メンタル面 / 相談しやすさ / 孤立感の少なさ"],
      transportation: ["交通", "交通 / バス / 学校距離 / 冬の移動"],
      rideSupport: ["送迎", "車で送ってくれる頻度 / 緊急時の送迎 / 冬の移動サポート"],
      internetQuality: ["インターネット", "インターネット品質"],
      safetyEnvironment: ["安全", "安全 / 夜の治安 / 家庭内トラブルの少なさ"],
    },
    fit: {
      introvert: "内向的な人向け",
      sports: "スポーツ好き向け",
      religious: "宗教・食文化への配慮あり",
      petFriendly: "ペット好き向け",
    },
    customHostTag: "新規追加",
    customHostSummary: "ユーザーが追加したホストファミリー。レビュー投稿後に評価が反映されます。",
    testEmptyQuery: "空の検索で追加済みホストがすべて表示される",
    testAreaSearch: "エリア名で追加済みホストを検索できる",
    testCriteriaSearch: "評価カテゴリで検索できる",
    testReviewsStart: "レビュー数を読み込める",
    testCoordinates: "すべてのホストに地図座標がある",
    popupPrivacy: "位置は約100m以上ぼかした参考地点です",
  },
  en: {
    htmlLang: "en",
    languageLabel: "Language",
    languageJapanese: "日本語",
    languageEnglish: "English",
    roleLabel: "View mode",
    roleUser: "User",
    roleModerator: "Moderator",
    roleAdmin: "Admin",
    moderatorBadge: "Moderator",
    adminBadge: "Admin",
    deleteReview: "Delete",
    deleteReviewLabel: "Delete this review",
    deleteFailed: "Could not delete the review.",
    deleteFamily: "Delete family",
    deleteFamilyLabel: "Delete this family",
    geocodeFailed: "Could not place the pin from that address. Check the address and try again.",
    geocodeFallback: "Address lookup failed, so the family was added at an approximate Red Deer placement.",
    familyNameSameAsArea: "Enter a family name that is different from the area name.",
    adminRatingOnly: "Admin rating only",
    refineSearch: "Change the search terms and try again.",
    selectFamilyFirst: "Choose a family from the map or search results before writing a review.",
    subtitle: "Safer homestay comparison platform for international students",
    navSearch: "Search",
    navMap: "Map",
    navReview: "Write a review",
    navSchool: "For schools",
    login: "Log in",
    logout: "Log out",
    loginTitle: "Log in",
    loginUser: "Username",
    loginPassword: "Password",
    loginSubmit: "Log in",
    loginFailed: "Username or password is incorrect.",
    loggedInAs: "Signed in",
    demoAccounts: "Demo: student / moderator / admin, password: demo",
    badge: "Reduce homestay uncertainty with verified student reviews",
    heroTitleA: "Find a safer,",
    heroTitleB: "better-fit homestay before you move in.",
    heroText:
      "HomeLog helps international students compare safety, fit, commute, rules, meals, and support before moving in. Exact addresses are never shown, and reviews are structured around living conditions instead of personal attacks.",
    heroValue: "Safety / Fit / Commute / Rules / Meals / Support",
    heroPrivacy: "Private addresses are never shown",
    heroModeration: "Reviews are structured to prevent personal attacks",
    compareAreas: "Compare host areas",
    writeReviewCta: "Write a review",
    searchPlaceholder: "Search in Red Deer: Downtown, near school, quiet home, introvert",
    searchButton: "Search",
    statItems: "Rating categories",
    statPrivacy: "Posted reviews",
    statMap: "Real map support",
    featured: "Selected host",
    reviews: "reviews",
    mapTitle: "Red Deer host map",
    mapHelp: "Exact addresses and private pins are used only for placement. Public pages show the area name only.",
    area: "Area",
    mapPrivacy: "Addresses are private. Pins show approximate nearby areas.",
    searchResults: "Search results",
    noResults: "No host families match those conditions.",
    reviewForm: "Review form",
    reviewLead: "Record living conditions, rules, language environment, and fit in a comparable format. Notes are used as supporting context.",
    reviewPlaceholder:
      "Describe the living environment, routines, and support.\nAvoid personal attacks or identifying information.",
    submitReview: "Post anonymous review",
    submitted: "Review saved. It now appears in search results and recent reviews.",
    recentReviews: "Recent reviews",
    noReviewsYet: "No reviews have been posted yet. You can write the first one.",
    schoolTitle: "Analytics for schools and agencies",
    schoolText:
      "Visualize trends in English environment, house rules, study conditions, cultural fit, mental support, transportation, and safety to detect issues early and improve homestay quality.",
    document: "View document",
    tests: "Prototype checks",
    testsText: "Basic checks for search, review saving, category ratings, and map coordinates have been run.",
    verified: "Verified",
    allTestsPassed: "All tests passed",
    someTestsFailed: "Some tests failed",
    pass: "PASS",
    fail: "FAIL",
    bestFor: "Best for",
    detailedScores: "Rating categories",
    savedLocally: "Saved",
    reviewTarget: "Review target",
    reviewText: "Review text",
    anonymousStudent: "Anonymous student",
    privacyTitle: "Responsible use and privacy",
    privacyStatement:
      "ホームログ works only when reviews are used responsibly. Write about safety, living conditions, communication, and support. Do not publish exact addresses, private contact details, family member details, or anything that identifies a household. Exact addresses and map pins are stored only so the map can place a private host entry; regular users see the area name only.",
    addNewHouse: "Add a new family",
    newHouseName: "Family name",
    newHouseArea: "Area",
    addHouse: "Add",
    mapUnavailable: "The map library could not be loaded. Reconnect to the network and reload.",
    addNewFamily: "Add a new family",
    familyName: "Family display name",
    familyArea: "Area name shown to users",
    exactAddress: "Exact address (private)",
    pinLat: "Map pin latitude",
    pinLng: "Map pin longitude",
    addFamily: "Add family",
    noFamilies: "No families have been added yet. Add one above to place it on the map.",
    addReview: "Add a review",
    selectedFamily: "Selected family",
    localReviews: "local reviews",
    mapPlacementNote: "Exact addresses are hidden. Pins show area-level approximate locations so students can compare commute, neighborhood, and winter access.",
    exactAddressHidden: "Exact address hidden",
    approximatePins: "Area-level approximate pins",
    mapUse: "Compare commute, neighborhood, and winter access",
    mapZoomLimited: "Zoom is limited to protect host privacy.",
    quickFilters: "Quick filters",
    clearFilters: "Clear",
    nearSchool: "Near school",
    quietHome: "Quiet home",
    flexibleRules: "Flexible rules",
    strongEnglish: "Strong English environment",
    goodIntroverts: "Good for introverts",
    sportsFriendly: "Sports-friendly",
    winterSupport: "Winter commute support",
    highSafety: "High safety",
    mealSupport: "Meal support",
    quiet: "Quiet",
    lively: "Lively",
    strict: "Strict",
    flexible: "Flexible",
    mealGood: "Meal support",
    mealNormal: "Normal meals",
    commuteGood: "Convenient commute",
    commuteNormal: "Standard commute",
    winterFriendly: "Winter commute friendly",
    safetyStrong: "High safety",
    verifiedStatus: "Verification",
    commuteSummary: "Commute, safety, and support summary",
    structuredReview: "Structured living review",
    homeEnvironment: "HOME ENVIRONMENT",
    rulesStructure: "RULES & STRUCTURE",
    languageEnvironmentTitle: "LANGUAGE ENVIRONMENT",
    socialAtmosphereTitle: "SOCIAL ATMOSPHERE",
    studentMatching: "STUDENT MATCHING",
    recommendationTitle: "RECOMMENDATION",
    additionalNotes: "ADDITIONAL NOTES",
    noiseLevel: "Noise Level",
    noiseLevelQuestion: "How would you describe the home environment?",
    privacyLevel: "Privacy Level",
    privacyLevelQuestion: "How much personal space did you have?",
    bathroomSituation: "Bathroom Situation",
    bathroomQuestion: "Bathroom access was:",
    rulesFlexibility: "Curfew / House Rules",
    rulesQuestion: "House rules felt:",
    householdInteraction: "Household Interaction",
    interactionQuestion: "How often did you eat or spend time together?",
    englishEnvironment: "English Environment",
    englishEnvironmentQuestion: "Daily communication was mostly:",
    socialAtmosphere: "Social Atmosphere",
    socialAtmosphereQuestion: "The home atmosphere felt:",
    goodMatchFor: "Good Match For",
    goodMatchQuestion: "Who do you think this home fits best?",
    recommendation: "Would You Recommend This Homestay?",
    recommendationQuestion: "Would you recommend this homestay?",
    privacyGuidelinesTitle: "Privacy & Review Guidelines",
    privacyGuidelineAddress: "Do not post exact addresses",
    privacyGuidelineNames: "Do not post family member names",
    privacyGuidelineContact: "Do not post phone numbers or contact details",
    privacyGuidelineConditions: "Focus on living conditions and support",
    privacyGuidelineAttacks: "Personal attacks are prohibited",
    curfew: "Curfew",
    meals: "Meals",
    privacy: "Privacy",
    communication: "Communication",
    recommend: "Would recommend",
    strictOption: "Strict",
    normalOption: "Normal",
    flexibleOption: "Flexible",
    unknownOption: "Unknown",
    enoughOption: "Enough",
    notEnoughOption: "Not enough",
    privateOption: "Private",
    sharedOption: "Shared",
    limitedOption: "Limited",
    easyOption: "Easy",
    difficultOption: "Difficult",
    yesOption: "Yes",
    maybeOption: "Maybe",
    noOption: "No",
    veryQuietOption: "Very quiet",
    mostlyQuietOption: "Mostly quiet",
    balancedOption: "Balanced",
    oftenNoisyOption: "Often noisy",
    veryNoisyOption: "Very noisy",
    veryPrivateOption: "Very private",
    mostlyPrivateOption: "Mostly private",
    sharedOccasionallyOption: "Shared occasionally",
    limitedPrivacyOption: "Limited privacy",
    bathroomPrivateOption: "Private",
    sharedOneTwoOption: "Shared with 1-2 people",
    sharedSeveralOption: "Shared with several people",
    inconvenientOption: "Inconvenient",
    veryFlexibleOption: "Very flexible",
    mostlyFlexibleOption: "Mostly flexible",
    veryStrictOption: "Very strict",
    veryOftenOption: "Very often",
    sometimesOption: "Sometimes",
    rarelyOption: "Rarely",
    almostNeverOption: "Almost never",
    englishOnlyOption: "English only",
    mostlyEnglishOption: "Mostly English",
    mixedLanguagesOption: "Mixed languages",
    mostlyNonEnglishOption: "Mostly non-English",
    veryWelcomingOption: "Very welcoming",
    friendlyOption: "Friendly",
    neutralOption: "Neutral",
    distantOption: "Distant",
    uncomfortableOption: "Uncomfortable",
    quietStudentsOption: "Quiet students",
    independentStudentsOption: "Independent students",
    socialStudentsOption: "Social students",
    beginnerEnglishLearnersOption: "Beginner English learners",
    strongEnglishImmersionOption: "Strong English immersion",
    studentAthletesOption: "Student athletes",
    studentsWithoutCarsOption: "Students without cars",
    preferStructureOption: "Students who prefer structure",
    preferFreedomOption: "Students who prefer freedom",
    safetyDesignTitle: "Safety by design",
    safetyDesignText: "HomeLog shares student experience while keeping exact addresses, contact details, and family composition out of public view.",
    safetyPointAddress: "Exact addresses are hidden",
    safetyPointConditions: "Reviews focus on living conditions, not personal attacks",
    safetyPointCorrection: "Host correction requests and responses are planned for a future version",
    safetyPointModeration: "Reports and a moderation queue are planned",
    safetyPointSchool: "School/admin views can identify patterns without exposing students publicly",
    analyticsReviews: "Reviews",
    analyticsAverage: "Average by category",
    analyticsRisks: "Common risk signals",
    analyticsStrongest: "Strongest categories",
    analyticsAttention: "Areas needing attention",
    analyticsCommonStrengths: "Most common strengths",
    analyticsCommonConcerns: "Most common concerns",
    analyticsAtmosphere: "Average atmosphere",
    analyticsRuleStrictness: "Average rule strictness",
    noAnalytics: "Analytics will appear as host and review data grows.",
    riskLowRules: "Rules mismatch",
    riskCommute: "Commute and winter access",
    riskSupport: "Low support signals",
    criteria: {
      englishEnvironment: ["English environment", "English exposure / Conversation with family / English correction"],
      rules: ["Freedom and rules", "Freedom / Curfew / Overnight rules"],
      study: ["Study fit", "Study fit / Quietness / Study space"],
      cultureFit: ["Cultural fit", "Cultural fit / Religion and food consideration / Understanding of Asian students"],
      mentalSupport: ["Mental support", "Mental support / Easy to consult / Low isolation"],
      transportation: ["Transportation", "Transportation / Bus / Distance to school / Winter commute"],
      rideSupport: ["Ride support", "Ride frequency / Emergency rides / Winter travel support"],
      internetQuality: ["Internet", "Internet quality"],
      safetyEnvironment: ["Safety", "Safety / Night safety / Low household trouble"],
    },
    fit: {
      introvert: "Good for introverts",
      sports: "Good for sports students",
      religious: "Religion and food aware",
      petFriendly: "Pet friendly",
    },
    customHostTag: "New entry",
    customHostSummary: "A host family added by the user. Ratings update after reviews are posted.",
    testEmptyQuery: "Empty search returns all added hosts",
    testAreaSearch: "Area search can find an added host",
    testCriteriaSearch: "Category search works",
    testReviewsStart: "Reviews can be loaded",
    testCoordinates: "All hosts have map coordinates",
    popupPrivacy: "Location is an approximate point blurred by at least 100m",
  },
  };

  const accounts = [
    { username: "student", password: "demo", role: "user", name: "Student" },
    { username: "moderator", password: "demo", role: "moderator", name: "Moderator" },
    { username: "admin", password: "demo", role: "admin", name: "Admin" },
  ];

  let language = loadLanguage();
  let t = translations[language];
  let ui = t;
  let currentUser = loadSession();
  let role = currentUser ? currentUser.role : "user";
  let loginOpen = false;
  let loginError = false;

  const criteriaGroups = [
    {
      key: "englishEnvironment",
      title: "英語環境",
      description: "英語環境の強さ / 家族との会話量 / 英語矯正してくれるか",
      itemKeys: ["english", "conversation", "correction"],
    },
    {
      key: "rules",
      title: "自由度・ルール",
      description: "自由度 / 門限 / 外泊ルール",
      itemKeys: ["freedom", "curfew", "overnight"],
    },
    {
      key: "study",
      title: "学習向き",
      description: "学習向き / 静かさ / 勉強スペース",
      itemKeys: ["studyFit", "quiet", "studySpace"],
    },
    {
      key: "cultureFit",
      title: "文化適応",
      description: "文化適応 / 宗教・食文化配慮 / アジア人留学生への理解",
      itemKeys: ["culture", "religionFood", "asianUnderstanding"],
    },
    {
      key: "mentalSupport",
      title: "メンタル面",
      description: "メンタル面 / 相談しやすさ / 孤立感の少なさ",
      itemKeys: ["mental", "consultation", "isolation"],
    },
    {
      key: "transportation",
      title: "交通",
      description: "交通 / バス / 学校距離 / 冬の移動",
      itemKeys: ["transit", "bus", "schoolDistance", "winterCommute"],
    },
    {
      key: "rideSupport",
      title: "送迎",
      description: "車で送ってくれる頻度 / 緊急時の送迎 / 冬の移動サポート",
      itemKeys: ["rideSupport"],
    },
    {
      key: "internetQuality",
      title: "インターネット",
      description: "インターネット品質",
      itemKeys: ["internet"],
    },
    {
      key: "safetyEnvironment",
      title: "安全",
      description: "安全 / 夜の治安 / 家庭内トラブルの少なさ",
      itemKeys: ["safety", "nightSafety", "homeTrouble"],
    },
  ];

  const fitOptions = [
    ["introvert", "内向的な人向け"],
    ["sports", "スポーツ好き向け"],
    ["religious", "宗教・食文化への配慮あり"],
    ["petFriendly", "ペット好き向け"],
  ];

  const structuredReviewSections = [
    {
      title: "homeEnvironment",
      fields: [
        { key: "noiseLevel", question: "noiseLevelQuestion", options: ["veryQuiet", "mostlyQuiet", "balanced", "oftenNoisy", "veryNoisy"] },
        { key: "privacyLevel", question: "privacyLevelQuestion", options: ["veryPrivate", "mostlyPrivate", "sharedOccasionally", "limitedPrivacy"] },
        { key: "bathroomSituation", question: "bathroomQuestion", options: ["private", "sharedOneTwo", "sharedSeveral", "inconvenient"] },
      ],
    },
    {
      title: "rulesStructure",
      fields: [
        { key: "rulesFlexibility", question: "rulesQuestion", options: ["veryFlexible", "mostlyFlexible", "balanced", "strict", "veryStrict"] },
        { key: "householdInteraction", question: "interactionQuestion", options: ["veryOften", "sometimes", "rarely", "almostNever"] },
      ],
    },
    {
      title: "languageEnvironmentTitle",
      fields: [{ key: "englishEnvironment", question: "englishEnvironmentQuestion", options: ["englishOnly", "mostlyEnglish", "mixedLanguages", "mostlyNonEnglish"] }],
    },
    {
      title: "socialAtmosphereTitle",
      fields: [{ key: "socialAtmosphere", question: "socialAtmosphereQuestion", options: ["veryWelcoming", "friendly", "neutral", "distant", "uncomfortable"] }],
    },
    {
      title: "studentMatching",
      fields: [
        {
          key: "goodMatchFor",
          question: "goodMatchQuestion",
          type: "checkbox",
          options: ["quietStudents", "independentStudents", "socialStudents", "beginnerEnglishLearners", "strongEnglishImmersion", "studentAthletes", "studentsWithoutCars", "preferStructure", "preferFreedom"],
        },
      ],
    },
    {
      title: "recommendationTitle",
      fields: [{ key: "recommendation", question: "recommendationQuestion", options: ["yes", "maybe", "no"] }],
    },
  ];

  const legacyStructuredReviewFields = [
    ["curfew", ["strict", "normal", "flexible", "unknown"]],
    ["meals", ["enough", "normal", "notEnough", "unknown"]],
    ["privacy", ["private", "shared", "limited", "unknown"]],
    ["communication", ["easy", "normal", "difficult", "unknown"]],
    ["recommend", ["yes", "maybe", "no"]],
  ];

  const structuredOptionLabels = {
    veryQuiet: "veryQuietOption",
    mostlyQuiet: "mostlyQuietOption",
    balanced: "balancedOption",
    oftenNoisy: "oftenNoisyOption",
    veryNoisy: "veryNoisyOption",
    veryPrivate: "veryPrivateOption",
    mostlyPrivate: "mostlyPrivateOption",
    sharedOccasionally: "sharedOccasionallyOption",
    limitedPrivacy: "limitedPrivacyOption",
    "bathroomSituation.private": "bathroomPrivateOption",
    private: "privateOption",
    sharedOneTwo: "sharedOneTwoOption",
    sharedSeveral: "sharedSeveralOption",
    inconvenient: "inconvenientOption",
    veryFlexible: "veryFlexibleOption",
    mostlyFlexible: "mostlyFlexibleOption",
    strict: "strictOption",
    veryStrict: "veryStrictOption",
    veryOften: "veryOftenOption",
    sometimes: "sometimesOption",
    rarely: "rarelyOption",
    almostNever: "almostNeverOption",
    englishOnly: "englishOnlyOption",
    mostlyEnglish: "mostlyEnglishOption",
    mixedLanguages: "mixedLanguagesOption",
    mostlyNonEnglish: "mostlyNonEnglishOption",
    veryWelcoming: "veryWelcomingOption",
    friendly: "friendlyOption",
    neutral: "neutralOption",
    distant: "distantOption",
    uncomfortable: "uncomfortableOption",
    quietStudents: "quietStudentsOption",
    independentStudents: "independentStudentsOption",
    socialStudents: "socialStudentsOption",
    beginnerEnglishLearners: "beginnerEnglishLearnersOption",
    strongEnglishImmersion: "strongEnglishImmersionOption",
    studentAthletes: "studentAthletesOption",
    studentsWithoutCars: "studentsWithoutCarsOption",
    preferStructure: "preferStructureOption",
    preferFreedom: "preferFreedomOption",
    normal: "normalOption",
    flexible: "flexibleOption",
    unknown: "unknownOption",
    enough: "enoughOption",
    notEnough: "notEnoughOption",
    shared: "sharedOption",
    limited: "limitedOption",
    easy: "easyOption",
    difficult: "difficultOption",
    yes: "yesOption",
    maybe: "maybeOption",
    no: "noOption",
  };

  const quickFilters = [
    { key: "nearSchool", label: "nearSchool", match: (host) => groupScore(host, criteriaGroups.find((group) => group.key === "transportation")) >= 4.4 },
    { key: "quietHome", label: "quietHome", match: (host) => groupScore(host, criteriaGroups.find((group) => group.key === "study")) >= 4.5 || hostReviews(host).some((review) => ["veryQuiet", "mostlyQuiet"].includes(review.structured && review.structured.noiseLevel)) },
    { key: "flexibleRules", label: "flexibleRules", match: (host) => groupScore(host, criteriaGroups.find((group) => group.key === "rules")) >= 4.2 || hostReviews(host).some((review) => ["veryFlexible", "mostlyFlexible"].includes(review.structured && review.structured.rulesFlexibility)) },
    { key: "strongEnglish", label: "strongEnglish", match: (host) => groupScore(host, criteriaGroups.find((group) => group.key === "englishEnvironment")) >= 4.5 || hostReviews(host).some((review) => ["englishOnly", "mostlyEnglish"].includes(review.structured && review.structured.englishEnvironment)) },
    { key: "goodIntroverts", label: "goodIntroverts", match: (host) => getHostFit(host).some((fit) => fit.toLowerCase().includes("introvert") || fit.includes("内向")) },
    { key: "sportsFriendly", label: "sportsFriendly", match: (host) => getHostFit(host).some((fit) => fit.toLowerCase().includes("sports") || fit.includes("スポーツ")) || hostReviews(host).some((review) => Array.isArray(review.structured && review.structured.goodMatchFor) && review.structured.goodMatchFor.includes("studentAthletes")) },
    { key: "winterSupport", label: "winterSupport", match: (host) => groupScore(host, criteriaGroups.find((group) => group.key === "rideSupport")) >= 4.2 || Number(host.criteria.winterCommute) >= 4.2 },
    { key: "highSafety", label: "highSafety", match: (host) => groupScore(host, criteriaGroups.find((group) => group.key === "safetyEnvironment")) >= 4.6 },
    { key: "mealSupport", label: "mealSupport", match: (host) => host.tags.some((tag) => String(tag).includes("食") || String(tag).toLowerCase().includes("meal")) },
  ];

  const fitAliases = {
    introvert: "introvert",
    "introvert向け": "introvert",
    "内向的な人向け": "introvert",
    "Good for introverts": "introvert",
    sports: "sports",
    "sports好き向け": "sports",
    "スポーツ好き向け": "sports",
    "Good for sports students": "sports",
    religious: "religious",
    "religious family": "religious",
    "宗教・食文化への配慮あり": "religious",
    "Religion and food aware": "religious",
    petFriendly: "petFriendly",
    "pet friendly": "petFriendly",
    "Pet friendly": "petFriendly",
    "ペット好き向け": "petFriendly",
  };

  const hosts = [
    {
      id: 1,
      name: "Miller Family",
      city: "Red Deer, Alberta",
      area: "West Park",
      lat: 52.2594,
      lng: -113.8356,
      rating: 4.7,
      reviews: 0,
      verified: true,
      tags: ["静かな家庭", "夕食あり", "勉強向き", "West Park"],
      fit: ["introvert向け"],
      summary: "落ち着いた家庭環境。ルール説明が丁寧で、勉強に集中しやすい家庭。",
      criteria: {
        english: 4.2,
        conversation: 3.8,
        correction: 3.9,
        freedom: 4.3,
        curfew: 4.4,
        overnight: 4.0,
        studyFit: 4.9,
        quiet: 4.9,
        studySpace: 4.8,
        culture: 4.4,
        religionFood: 4.1,
        asianUnderstanding: 4.3,
        mental: 4.6,
        consultation: 4.5,
        isolation: 4.4,
        transit: 4.1,
        bus: 4.2,
        schoolDistance: 4.0,
        winterCommute: 3.8,
        rideSupport: 3.7,
        internet: 4.6,
        safety: 4.9,
        nightSafety: 4.6,
        homeTrouble: 4.8,
      },
    },
    {
      id: 2,
      name: "Brown Family",
      city: "Red Deer, Alberta",
      area: "Downtown",
      lat: 52.2693,
      lng: -113.8112,
      rating: 4.1,
      reviews: 0,
      verified: false,
      tags: ["Downtown", "バス停近い", "会話が多い"],
      fit: ["sports好き向け"],
      summary: "中心部に近く、通学や買い物に便利。英語練習量を求める人向け。",
      criteria: {
        english: 4.8,
        conversation: 4.9,
        correction: 4.1,
        freedom: 3.8,
        curfew: 3.4,
        overnight: 3.3,
        studyFit: 3.6,
        quiet: 3.2,
        studySpace: 3.7,
        culture: 4.0,
        religionFood: 3.7,
        asianUnderstanding: 3.8,
        mental: 4.0,
        consultation: 4.2,
        isolation: 4.4,
        transit: 4.8,
        bus: 4.9,
        schoolDistance: 4.5,
        winterCommute: 4.2,
        rideSupport: 3.5,
        internet: 4.0,
        safety: 4.1,
        nightSafety: 3.7,
        homeTrouble: 4.0,
      },
    },
    {
      id: 3,
      name: "Singh Family",
      city: "Red Deer, Alberta",
      area: "Clearview Ridge",
      lat: 52.2873,
      lng: -113.7661,
      rating: 4.9,
      reviews: 0,
      verified: true,
      tags: ["多文化対応", "食事評価高い", "学校近い", "Clearview"],
      fit: ["religious family", "introvert向け"],
      summary: "食事と文化的配慮の評価が高く、初めての海外生活でも安心しやすい家庭。",
      criteria: {
        english: 4.7,
        conversation: 4.5,
        correction: 4.4,
        freedom: 4.5,
        curfew: 4.2,
        overnight: 4.1,
        studyFit: 4.8,
        quiet: 4.6,
        studySpace: 4.8,
        culture: 5.0,
        religionFood: 5.0,
        asianUnderstanding: 4.9,
        mental: 4.9,
        consultation: 4.9,
        isolation: 4.7,
        transit: 4.4,
        bus: 4.5,
        schoolDistance: 4.7,
        winterCommute: 4.2,
        rideSupport: 4.4,
        internet: 4.7,
        safety: 5.0,
        nightSafety: 4.8,
        homeTrouble: 4.9,
      },
    },
    {
      id: 4,
      name: "Anderson Family",
      city: "Red Deer, Alberta",
      area: "Timberlands",
      lat: 52.2932,
      lng: -113.7537,
      rating: 4.4,
      reviews: 0,
      verified: true,
      tags: ["新しい住宅街", "Wi-Fi良い", "ペットあり", "Timberlands"],
      fit: ["pet friendly", "sports好き向け"],
      summary: "清潔で設備が整った家庭。ペットがいるため、動物が好きな留学生に合いやすい。",
      criteria: {
        english: 4.2,
        conversation: 4.1,
        correction: 3.8,
        freedom: 4.6,
        curfew: 4.4,
        overnight: 4.2,
        studyFit: 4.4,
        quiet: 4.2,
        studySpace: 4.5,
        culture: 4.3,
        religionFood: 4.0,
        asianUnderstanding: 4.1,
        mental: 4.4,
        consultation: 4.3,
        isolation: 4.3,
        transit: 4.0,
        bus: 4.1,
        schoolDistance: 4.0,
        winterCommute: 3.9,
        rideSupport: 4.6,
        internet: 4.9,
        safety: 4.7,
        nightSafety: 4.6,
        homeTrouble: 4.7,
      },
    },
  ];

  const defaultScores = Object.fromEntries(criteriaGroups.map((group) => [group.key, 4]));

  const state = {
    query: "",
    selectedId: null,
    reviewText: "",
    reviewScores: { ...defaultScores },
    reviewFit: [],
    reviewStructured: {
      noiseLevel: "balanced",
      privacyLevel: "mostlyPrivate",
      bathroomSituation: "sharedOneTwo",
      rulesFlexibility: "balanced",
      householdInteraction: "sometimes",
      englishEnvironment: "mostlyEnglish",
      socialAtmosphere: "friendly",
      goodMatchFor: [],
      recommendation: "maybe",
    },
    activeFilters: [],
    submitted: false,
    reviewFormOpen: false,
    userReviews: loadReviews(),
    customHosts: loadCustomHosts(),
  };

  let leafletMap = null;
  let apiSyncStarted = false;
  let hostSyncStarted = false;

  function loadLanguage() {
    if (typeof localStorage === "undefined") return "ja";
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return saved === "en" ? "en" : "ja";
  }

  function saveLanguage() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LANGUAGE_KEY, language);
    }
  }

  function loadRole() {
    return currentUser ? currentUser.role : "user";
  }

  function saveRole() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(ROLE_KEY, role);
    }
  }

  function loadSession() {
    if (typeof localStorage === "undefined") return null;
    try {
      const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      return parsed && ["user", "moderator", "admin"].includes(parsed.role) ? parsed : null;
    } catch (_error) {
      return null;
    }
  }

  function saveSession() {
    if (typeof localStorage === "undefined") return;
    if (currentUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage === "en" ? "en" : "ja";
    t = translations[language];
    ui = t;
    saveLanguage();
    render();
  }

  function setRole(nextRole) {
    role = currentUser && ["user", "moderator", "admin"].includes(nextRole) ? nextRole : "user";
    saveRole();
    render();
  }

  function login(username, password) {
    const account = accounts.find((item) => item.username === username && item.password === password);
    if (!account) {
      loginError = true;
      render();
      return;
    }

    currentUser = { username: account.username, role: account.role, name: account.name };
    role = account.role;
    loginOpen = false;
    loginError = false;
    saveSession();
    render();
  }

  function logout() {
    currentUser = null;
    role = "user";
    loginOpen = false;
    loginError = false;
    saveSession();
    render();
  }

  function isAdmin() {
    return role === "admin";
  }

  function isModerator() {
    return role === "moderator";
  }

  function canModerateReviews() {
    return isModerator() || isAdmin();
  }

  function canAddFamily() {
    return Boolean(currentUser);
  }

  function localizedCriteria(group) {
    const translated = t.criteria[group.key];
    if (!translated) return group;
    return {
      ...group,
      title: translated[0],
      description: translated[1],
    };
  }

  function localizedCriteriaGroups() {
    return criteriaGroups.map(localizedCriteria);
  }

  function localizedFitOptions() {
    return fitOptions.map(([key]) => [key, t.fit[key] || key]);
  }

  function fitKeyFromLabel(value) {
    return fitAliases[value] || value;
  }

  function localizedFitLabel(value) {
    const key = fitKeyFromLabel(value);
    return t.fit[key] || value;
  }

  function displayStudentName(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized || normalized === "anonymous" || normalized === "anonymous student" || normalized === "匿名留学生") {
      return t.anonymousStudent;
    }
    return value;
  }

  function displayReviewText(value) {
    const cleaned = String(value || "")
      .replace(/(?:\r?\n)+\s*(匿名留学生|Anonymous student)\s*$/i, "")
      .trim();
    return cleaned.startsWith("「") && cleaned.endsWith("」") ? cleaned.slice(1, -1).trim() : cleaned;
  }

  function loadReviews() {
    if (typeof localStorage === "undefined") return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  function saveReviews() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.userReviews));
    }
  }

  function loadCustomHosts() {
    if (typeof localStorage === "undefined") return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(CUSTOM_HOSTS_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  function hostDisplayKey(host) {
    return String(host.area || host.name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function hostDisplayName(host) {
    return host && (host.name || host.area) ? String(host.name || host.area) : "";
  }

  function saveCustomHosts() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CUSTOM_HOSTS_KEY, JSON.stringify(state.customHosts));
    }
  }

  function allHosts() {
    const grouped = new Map();

    [...hosts, ...state.customHosts].forEach((host) => {
      const key = hostDisplayKey(host);
      if (!key) return;

      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, { ...host, duplicateIds: [host.id] });
        return;
      }

      existing.duplicateIds.push(host.id);
      existing.verified = existing.verified || host.verified;
      existing.tags = [...new Set([...(existing.tags || []), ...(host.tags || [])])];
      existing.fit = [...new Set([...(existing.fit || []), ...(host.fit || [])])];

      if (!existing.exactAddress && host.exactAddress) existing.exactAddress = host.exactAddress;
      if (!Number.isFinite(existing.lat) && Number.isFinite(host.lat)) existing.lat = host.lat;
      if (!Number.isFinite(existing.lng) && Number.isFinite(host.lng)) existing.lng = host.lng;
      if ((!existing.summary || existing.summary === t.customHostSummary) && host.summary) existing.summary = host.summary;
    });

    return [...grouped.values()];
  }

  function knownHostIds() {
    return new Set(allHosts().flatMap((host) => [host.id, ...(host.duplicateIds || [])]).map(Number));
  }

  function visibleReviews() {
    const ids = knownHostIds();
    return state.userReviews.filter((review) => ids.has(Number(review.hostId)));
  }

  async function syncHostsFromApi() {
    if (hostSyncStarted || typeof fetch === "undefined") return;
    hostSyncStarted = true;
    try {
      const response = await fetch("/api/hosts", { headers: { Accept: "application/json" } });
      if (!response.ok) return;
      const serverHosts = await response.json();
      if (!Array.isArray(serverHosts)) return;
      state.customHosts = serverHosts;
      saveCustomHosts();
      render();
    } catch (_error) {
      // Static HTML mode falls back to localStorage.
    }
  }

  async function syncReviewsFromApi() {
    if (apiSyncStarted || typeof fetch === "undefined") return;
    apiSyncStarted = true;
    try {
      const response = await fetch("/api/reviews", { headers: { Accept: "application/json" } });
      if (!response.ok) return;
      const reviews = await response.json();
      if (!Array.isArray(reviews)) return;
      state.userReviews = reviews;
      saveReviews();
      render();
    } catch (_error) {
      // Static HTML mode falls back to localStorage.
    }
  }

  async function persistReview(review) {
    if (typeof fetch !== "undefined") {
      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(review),
        });
        if (response.ok) {
          const savedReview = await response.json();
          state.userReviews.unshift(savedReview);
          saveReviews();
          return;
        }
      } catch (_error) {
        // Static HTML mode falls back to localStorage.
      }
    }
    state.userReviews.unshift(review);
    saveReviews();
  }

  async function persistHost(host) {
    if (typeof fetch !== "undefined") {
      try {
        const response = await fetch("/api/hosts", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(host),
        });
        if (response.ok) {
          const savedHost = await response.json();
          state.customHosts.unshift(savedHost);
          saveCustomHosts();
          return savedHost;
        }
      } catch (_error) {
        // Static HTML mode falls back to localStorage.
      }
    }

    state.customHosts.unshift(host);
    saveCustomHosts();
    return host;
  }

  async function deleteReview(reviewId) {
    const id = String(reviewId);
    if (!id) return;

    if (typeof fetch !== "undefined") {
      try {
        const response = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          state.userReviews = state.userReviews.filter((review) => String(review.id) !== id);
          saveReviews();
          render();
          return;
        }
      } catch (_error) {
        // Static HTML mode falls back to localStorage.
      }
    }

    state.userReviews = state.userReviews.filter((review) => String(review.id) !== id);
    saveReviews();
    render();
  }

  async function geocodeAddress(exactAddress) {
    const query = `${exactAddress}, Red Deer, Alberta, Canada`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 4500) : null;
    let response;
    try {
      response = await fetch(url, { headers: { Accept: "application/json" }, signal: controller?.signal });
    } finally {
      if (timeout) clearTimeout(timeout);
    }
    if (!response || !response.ok) return null;

    const matches = await response.json();
    const first = Array.isArray(matches) ? matches[0] : null;
    if (!first) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  }

  function approximateLocationFromAddress(exactAddress) {
    const text = String(exactAddress || "");
    const hash = [...text].reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 10000, 7);
    const latOffset = ((hash % 80) - 40) / 10000;
    const lngOffset = (((Math.floor(hash / 80) % 80) - 40) / 10000);
    return {
      lat: RED_DEER_CENTER.lat + latOffset,
      lng: RED_DEER_CENTER.lng + lngOffset,
    };
  }

  function deleteHost(hostId) {
    const host = allHosts().find((item) => item.id === Number(hostId) || (item.duplicateIds || []).includes(Number(hostId)));
    if (!host) return;

    const idsToDelete = new Set([host.id, ...(host.duplicateIds || [])].map(Number));
    if (typeof fetch !== "undefined" && host.isCustom) {
      fetch(`/api/hosts/${encodeURIComponent(host.id)}`, { method: "DELETE", headers: { Accept: "application/json" } }).catch(() => {});
    }
    state.customHosts = state.customHosts.filter((item) => !idsToDelete.has(Number(item.id)));
    state.userReviews = state.userReviews.filter((review) => !idsToDelete.has(Number(review.hostId)));
    state.selectedId = null;
    saveCustomHosts();
    saveReviews();
    render();
  }

  function average(values) {
    const clean = values.map(Number).filter(Number.isFinite);
    return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
  }

  function selectedHost() {
    if (!state.selectedId) return null;
    return allHosts().find((host) => host.id === state.selectedId || (host.duplicateIds || []).includes(state.selectedId)) || null;
  }

  function hostReviews(host) {
    if (!host) return [];
    const hostIds = new Set([host.id, ...(host.duplicateIds || [])].map(Number));
    return state.userReviews.filter((review) => hostIds.has(Number(review.hostId)));
  }

  function groupBaseScore(host, group) {
    if (!host) return 0;
    return average(group.itemKeys.map((key) => host.criteria[key]));
  }

  function groupScore(host, group) {
    const postedScores = hostReviews(host)
      .map((review) => review.criteria && Number(review.criteria[group.key]))
      .filter(Number.isFinite);
    return average([groupBaseScore(host, group), ...postedScores]);
  }

  function scoreFromCriteria(criteria) {
    return average(Object.values(criteria));
  }

  function getHostStats(host) {
    if (!host) return { rating: 0, reviews: 0 };
    const reviews = hostReviews(host);
    if (!reviews.length) {
      return { rating: host.rating, reviews: 0 };
    }
    return { rating: average(reviews.map((review) => review.score)), reviews: reviews.length };
  }

  function getHostFit(host) {
    if (!host) return [];
    const added = hostReviews(host).flatMap((review) => review.fit || []);
    return [...new Set([...host.fit, ...added])].map(localizedFitLabel);
  }

  function structuredLabel(field, value) {
    const key = structuredOptionLabels[`${field}.${value}`] || structuredOptionLabels[value] || `${field}.${value}`;
    return t[key] || value;
  }

  function structuredFieldsFlat() {
    return structuredReviewSections.flatMap((section) => section.fields);
  }

  function structuredReviewTags(review) {
    if (!review || !review.structured) return [];
    const structured = review.structured;
    const tags = [];

    structuredFieldsFlat().forEach((field) => {
      const value = structured[field.key];
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach((item) => tags.push(structuredLabel(field.key, item)));
        return;
      }
      if (value !== "unknown") tags.push(structuredLabel(field.key, value));
    });

    legacyStructuredReviewFields.forEach(([field]) => {
      const value = structured[field];
      if (value && value !== "unknown") tags.push(structuredLabel(field, value));
    });

    return [...new Set(tags)].slice(0, 10);
  }

  function hostInsights(host) {
    if (!host) return [];
    const study = groupScore(host, criteriaGroups.find((group) => group.key === "study"));
    const rules = groupScore(host, criteriaGroups.find((group) => group.key === "rules"));
    const transportation = groupScore(host, criteriaGroups.find((group) => group.key === "transportation"));
    const ride = groupScore(host, criteriaGroups.find((group) => group.key === "rideSupport"));
    const safety = groupScore(host, criteriaGroups.find((group) => group.key === "safetyEnvironment"));
    const english = groupScore(host, criteriaGroups.find((group) => group.key === "englishEnvironment"));
    const mealReviewSignals = hostReviews(host).filter((review) => review.structured && review.structured.meals === "enough").length;
    const mealTagSignal = host.tags.some((tag) => String(tag).includes("食") || String(tag).toLowerCase().includes("meal"));

    return [
      study >= 4.4 ? t.quiet : t.lively,
      rules >= 4.2 ? t.flexible : t.strict,
      mealReviewSignals || mealTagSignal ? t.mealGood : t.mealNormal,
      transportation >= 4.3 ? t.commuteGood : t.commuteNormal,
      ride >= 4.2 || Number(host.criteria.winterCommute) >= 4.2 ? t.winterFriendly : null,
      safety >= 4.6 ? t.safetyStrong : null,
      english >= 4.5 ? t.strongEnglish : null,
    ].filter(Boolean);
  }

  function hostSummaryLine(host) {
    const insights = hostInsights(host).slice(0, 4);
    return insights.length ? insights.join(" / ") : t.mapPrivacy;
  }

  function createCustomHost({ name, area, exactAddress, lat, lng }) {
    const offset = (state.customHosts.length + 1) * 0.0009;
    const safeLat = Number.isFinite(lat) ? lat : RED_DEER_CENTER.lat + offset;
    const safeLng = Number.isFinite(lng) ? lng : RED_DEER_CENTER.lng - offset;

    return {
      id: Date.now(),
      name,
      city: "Red Deer, Alberta",
      area,
      exactAddress,
      _privacyNote: "demo-only private placement data; never display exactAddress in public UI",
      lat: safeLat,
      lng: safeLng,
      rating: 0,
      reviews: 0,
      verified: false,
      tags: [area, t.customHostTag],
      fit: [],
      summary: t.customHostSummary,
      criteria: Object.fromEntries(criteriaGroups.flatMap((group) => group.itemKeys.map((key) => [key, 4]))),
      isCustom: true,
    };
  }

  function filterHosts(hostList, query, activeFilters = state.activeFilters) {
    const q = query.trim().toLowerCase();
    return hostList.filter((host) => {
      const textMatch =
        !q ||
        [
        host.name,
        host.city,
        host.area,
        host.summary,
        ...host.tags,
        ...getHostFit(host),
        ...localizedCriteriaGroups().flatMap((group) => [group.title, group.description]),
      ]
        .join(" ")
        .toLowerCase()
          .includes(q);
      const filterMatch = activeFilters.every((filterKey) => {
        const filter = quickFilters.find((item) => item.key === filterKey);
        return filter ? filter.match(host) : true;
      });
      return textMatch && filterMatch;
    });
  }

  function runPrototypeTests() {
    const results = [];
    results.push({
      name: t.testEmptyQuery,
      pass: filterHosts(allHosts(), "").length === allHosts().length && allHosts().every((host) => host.city.includes("Red Deer")),
    });
    results.push({
      name: t.testAreaSearch,
      pass: allHosts().length === 0 || filterHosts(allHosts(), allHosts()[0].area).some((host) => host.id === allHosts()[0].id),
    });
    results.push({
      name: t.testCriteriaSearch,
      pass: filterHosts(allHosts(), localizedCriteriaGroups()[0].title).length === allHosts().length,
    });
    results.push({
      name: t.testReviewsStart,
      pass: state.userReviews.length >= 0,
    });
    results.push({
      name: t.testCoordinates,
      pass: allHosts().every((host) => Number.isFinite(host.lat) && Number.isFinite(host.lng)),
    });
    return results;
  }

  function schoolAnalytics() {
    const hosts = allHosts();
    const reviews = visibleReviews();
    const structuredReviews = reviews.filter((review) => review.structured);
    const categoryScores = localizedCriteriaGroups()
      .map((group) => ({
        title: group.title,
        value: average(hosts.map((host) => groupScore(host, group))),
      }))
      .filter((item) => Number.isFinite(item.value) && item.value > 0)
      .sort((a, b) => b.value - a.value);
    const risks = [
      { label: t.riskLowRules, count: hosts.filter((host) => groupScore(host, criteriaGroups.find((group) => group.key === "rules")) < 3.8).length },
      { label: t.riskCommute, count: hosts.filter((host) => groupScore(host, criteriaGroups.find((group) => group.key === "transportation")) < 4 || groupScore(host, criteriaGroups.find((group) => group.key === "rideSupport")) < 4).length },
      { label: t.riskSupport, count: hosts.filter((host) => groupScore(host, criteriaGroups.find((group) => group.key === "mentalSupport")) < 4).length },
    ];
    const valuesFor = (field) =>
      structuredReviews.flatMap((review) => {
        const value = review.structured?.[field];
        if (!value || value === "unknown") return [];
        return Array.isArray(value) ? value : [value];
      });
    const topValues = (field, limit = 3) => {
      const counts = valuesFor(field).reduce((items, value) => {
        items[value] = (items[value] || 0) + 1;
        return items;
      }, {});
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([value, count]) => ({ title: structuredLabel(field, value), value: count }));
    };
    const atmosphereScores = { veryWelcoming: 5, friendly: 4, neutral: 3, distant: 2, uncomfortable: 1 };
    const ruleScores = { veryFlexible: 1, mostlyFlexible: 2, balanced: 3, strict: 4, veryStrict: 5 };
    const atmosphereAverage = average(valuesFor("socialAtmosphere").map((value) => atmosphereScores[value]).filter(Boolean));
    const ruleStrictnessAverage = average(valuesFor("rulesFlexibility").map((value) => ruleScores[value]).filter(Boolean));
    const commonStrengths = [
      ...topValues("goodMatchFor", 4),
      ...["noiseLevel", "privacyLevel", "englishEnvironment", "rulesFlexibility", "socialAtmosphere"]
        .flatMap((field) => topValues(field, 1))
        .filter((item) => item.value > 0),
    ].slice(0, 5);
    const concernDefinitions = [
      { title: structuredLabel("noiseLevel", "oftenNoisy"), value: valuesFor("noiseLevel").filter((value) => ["oftenNoisy", "veryNoisy"].includes(value)).length },
      { title: structuredLabel("privacyLevel", "limitedPrivacy"), value: valuesFor("privacyLevel").filter((value) => value === "limitedPrivacy").length },
      { title: structuredLabel("rulesFlexibility", "strict"), value: valuesFor("rulesFlexibility").filter((value) => ["strict", "veryStrict"].includes(value)).length },
      { title: structuredLabel("socialAtmosphere", "uncomfortable"), value: valuesFor("socialAtmosphere").filter((value) => ["distant", "uncomfortable"].includes(value)).length },
    ];
    const commonConcerns = concernDefinitions.filter((item) => item.value > 0).sort((a, b) => b.value - a.value);

    return {
      reviews: reviews.length,
      categoryScores,
      risks,
      strongest: categoryScores.slice(0, 3),
      attention: categoryScores.slice(-3).reverse(),
      commonStrengths,
      commonConcerns,
      atmosphereAverage,
      ruleStrictnessAverage,
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderStars(value) {
    return `<div class="stars" aria-label="${escapeHtml(value.toFixed(1))} out of 5 stars">${[1, 2, 3, 4, 5]
      .map((score) => `<span>${score <= Math.round(value) ? "★" : "☆"}</span>`)
      .join("")}</div>`;
  }

  function renderTagRow(tags) {
    return tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  }

  function renderInsightChips(host, limit = 6) {
    return `<div class="insight-grid">${hostInsights(host)
      .slice(0, limit)
      .map((item) => `<span class="insight-chip">${escapeHtml(item)}</span>`)
      .join("")}</div>`;
  }

  function renderQuickFilters() {
    return `
      <div class="quick-filter-panel">
        <div class="quick-filter-head">
          <span>${t.quickFilters}</span>
          ${
            state.activeFilters.length
              ? `<button type="button" class="text-button" id="clear-filters">${t.clearFilters}</button>`
              : ""
          }
        </div>
        <div class="quick-filter-row">
          ${quickFilters
            .map(
              (filter) => `
                <button type="button" class="quick-filter ${state.activeFilters.includes(filter.key) ? "is-active" : ""}" data-filter-key="${filter.key}">
                  ${t[filter.label]}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderCriteriaSummary(host) {
    return localizedCriteriaGroups()
      .map(
        (group) => `
          <section class="criteria-group criteria-group--summary">
            <div class="criteria-summary-head">
              <h3>${escapeHtml(group.title)}</h3>
              <strong>${escapeHtml(groupScore(host, group).toFixed(1))}</strong>
            </div>
            <div class="criteria-chips">
              ${group.description
                .split(" / ")
                .map((label) => `<span>${escapeHtml(label)}</span>`)
                .join("")}
            </div>
          </section>
        `
      )
      .join("");
  }

  function renderTopPrivacy() {
    return `
      <section class="top-privacy">
        <div class="container">
          <details class="privacy-note privacy-note--top">
            <summary>${ui.privacyTitle}</summary>
            <p>${ui.privacyStatement}</p>
          </details>
        </div>
      </section>
    `;
  }

  function renderAddFamilyPanel() {
    if (!canAddFamily()) return "";

    return `
      <details class="add-house-panel add-house-panel--top">
        <summary>${ui.addNewFamily}</summary>
        <div class="add-house-grid add-house-grid--expanded">
          <input id="new-house-name" class="text-input" type="text" placeholder="${ui.familyName}" />
          <input id="new-house-area" class="text-input" type="text" placeholder="${ui.familyArea}" />
          <input id="new-house-address" class="text-input" type="text" placeholder="${ui.exactAddress}" />
          <button id="add-house-button" type="button" class="button button--primary">${ui.addFamily}</button>
        </div>
      </details>
    `;
  }

  function renderHeroCard(host) {
    if (!host) {
      return "";
    }
    const stats = getHostStats(host);
    return `
      <article class="card featured-card">
        <div class="card-body">
          <div class="featured-head">
            <div>
              <div class="label">${ui.selectedFamily}</div>
              <h2 class="featured-name">${escapeHtml(hostDisplayName(host))}</h2>
            </div>
            ${host.verified ? `<div class="verified-badge">${t.verified}</div>` : ""}
          </div>
          <div class="meta-line"><span class="icon-chip">Map</span><span>${escapeHtml(host.area)}</span></div>
          <div class="rating-row">
            <div class="rating-number">${escapeHtml(stats.rating.toFixed(1))}</div>
            <div>
              ${renderStars(stats.rating)}
              <div class="label">${escapeHtml(stats.reviews)} ${t.reviews}</div>
            </div>
          </div>
          <p class="featured-summary">${escapeHtml(host.summary)}</p>
          ${renderInsightChips(host)}
          <div>
            <div class="label">${t.bestFor}</div>
            <div class="tag-row">${renderTagRow(getHostFit(host))}</div>
          </div>
          <details class="details-panel" open>
            <summary>${t.detailedScores}</summary>
            <div class="criteria-grid">${renderCriteriaSummary(host)}</div>
          </details>
        </div>
      </article>
    `;
  }

  function renderLoginPanel() {
    if (!loginOpen || currentUser) return "";

    return `
      <section class="login-panel">
        <div class="container">
          <div class="login-card">
            <h2 class="section-title">${t.loginTitle}</h2>
            <div class="login-grid">
              <input id="login-username" class="text-input" type="text" autocomplete="username" placeholder="${t.loginUser}" />
              <input id="login-password" class="text-input" type="password" autocomplete="current-password" placeholder="${t.loginPassword}" />
              <button id="login-submit" type="button" class="button button--primary">${t.loginSubmit}</button>
            </div>
            <p class="section-text login-help">${t.demoAccounts}</p>
            ${loginError ? `<div class="submit-message submit-message--error">${t.loginFailed}</div>` : ""}
          </div>
        </div>
      </section>
    `;
  }

  function renderMap(host) {
    const stats = getHostStats(host);
    return `
      <section id="map" class="map-section">
        <div class="map-grid">
          <div class="map-canvas" id="real-map" role="application" aria-label="${escapeHtml(t.mapTitle)}">
            <div class="map-fallback">${t.mapUnavailable}</div>
          </div>
          <div class="map-panel">
            <div>
              <h2 class="section-title">${t.mapTitle}</h2>
              <p class="section-text">${t.mapPlacementNote}</p>
              <div class="trust-badge-row">
                <span class="trust-badge">${t.exactAddressHidden}</span>
                <span class="trust-badge">${t.approximatePins}</span>
                <span class="trust-badge">${t.mapUse}</span>
                <span class="trust-badge">${t.mapZoomLimited}</span>
              </div>
            </div>
            ${
              host
                ? `<div class="map-summary">
              <div class="label">${t.area}</div>
              <div class="featured-name">${escapeHtml(hostDisplayName(host))}</div>
              <div class="rating-row">
                <div class="rating-number">${escapeHtml(stats.rating.toFixed(1))}</div>
                <div>
                  ${renderStars(stats.rating)}
                  <div class="label">${escapeHtml(stats.reviews)} ${t.reviews}</div>
                </div>
              </div>
              <p class="section-text">${host ? escapeHtml(host.summary) : ui.noFamilies}</p>
              <div class="support-summary">
                <strong>${t.commuteSummary}</strong>
                <span>${escapeHtml(hostSummaryLine(host))}</span>
              </div>
              <div class="tag-row">${renderTagRow(getHostFit(host))}</div>
            </div>`
                : ""
            }
            <div class="map-list">
              ${allHosts()
                .map((item) => {
                  const itemStats = getHostStats(item);
                  return `
                    <div class="map-list-item ${host && host.id === item.id ? "is-selected" : ""}">
                      <button type="button" class="map-list-button" data-select-host="${item.id}">
                        <div class="map-list-head">
                          <strong>${escapeHtml(hostDisplayName(item))}</strong>
                          <strong>${escapeHtml(itemStats.rating.toFixed(1))}</strong>
                        </div>
                        <div class="map-list-sub">${escapeHtml(item.area)} / ${escapeHtml(item.city)}</div>
                      </button>
                      ${
                        isAdmin() && item.isCustom
                          ? `<button type="button" class="button button--danger button--compact" data-delete-host="${escapeHtml(
                              item.id
                            )}" aria-label="${escapeHtml(t.deleteFamilyLabel)}">${t.deleteFamily}</button>`
                          : ""
                      }
                    </div>
                  `;
                })
                .join("")}
            </div>
            <button id="show-review-form" type="button" class="button button--primary">${ui.addReview}</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderSearchResults(filteredHosts, host) {
    if (filteredHosts.length === 0) {
      return `<div class="card card--soft empty-state">${t.noResults}<br />${!currentUser || role === "user" ? t.refineSearch : ""}</div>`;
    }

    return filteredHosts
      .map((item) => {
        const stats = getHostStats(item);
        return `
          <article class="result-card ${host && host.id === item.id ? "is-selected" : ""}">
            <button type="button" class="result-card-button" data-select-host="${item.id}">
              <div class="result-card-head">
                <div>
                  <div class="result-name-row">
                    <strong>${escapeHtml(hostDisplayName(item))}</strong>
                    ${item.verified ? '<span class="checkmark">✓</span>' : ""}
                  </div>
                  <div class="result-location">${escapeHtml(item.area)} / ${escapeHtml(item.city)}</div>
                  <div class="result-tags">
                    ${[...item.tags.filter((tag) => tag !== item.area).slice(0, 3), ...getHostFit(item).slice(0, 2)]
                      .map((tag) => `<span class="result-tag">${escapeHtml(tag)}</span>`)
                      .join("")}
                  </div>
                  ${renderInsightChips(item, 5)}
                </div>
                <div class="result-rating">
                  <div><strong>${escapeHtml(stats.rating.toFixed(1))}</strong></div>
                  ${renderStars(stats.rating)}
                  <div class="label">${escapeHtml(stats.reviews)} ${t.reviews}</div>
                  <div class="verification-line">${item.verified ? t.verified : t.savedLocally}</div>
                </div>
              </div>
            </button>
          </article>
        `;
      })
      .join("");
  }

  function renderStarInput(group) {
    return `
      <div class="star-input" role="radiogroup" aria-label="${escapeHtml(group.title)}">
        ${[1, 2, 3, 4, 5]
          .map(
            (score) => `
              <button
                type="button"
                class="star-button ${score <= state.reviewScores[group.key] ? "is-active" : ""}"
                data-score-key="${escapeHtml(group.key)}"
                data-score-value="${score}"
                aria-label="${escapeHtml(group.title)} ${score}"
              >★</button>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderReviewForm(host) {
    if (!host) {
      return `<article id="review" class="card review-card"><div class="card-body"><h2 class="section-title">${t.reviewForm}</h2><div class="empty-state">${t.selectFamilyFirst}</div></div></article>`;
    }
    return `
      <article id="review" class="card review-card">
        <div class="card-body">
          <h2 class="section-title">${t.reviewForm}</h2>
          <p class="section-text">${t.reviewLead}</p>
          <div class="review-target">
            <label for="review-host-select">${t.reviewTarget}</label>
            <select id="review-host-select" class="host-select">
              ${allHosts()
                .map(
                  (item) =>
                    `<option value="${item.id}" ${item.id === host.id ? "selected" : ""}>${escapeHtml(hostDisplayName(item))}</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="review-score-grid">
            ${localizedCriteriaGroups()
              .map(
                (group) => `
                  <fieldset class="score-fieldset">
                    <legend>${escapeHtml(group.title)}</legend>
                    <div class="score-fieldset-detail">${escapeHtml(group.description)}</div>
                    ${renderStarInput(group)}
                  </fieldset>
                `
              )
              .join("")}
          </div>
          <fieldset class="fit-fieldset">
            <legend>${t.bestFor}</legend>
            <div class="fit-options">
              ${localizedFitOptions()
                .map(
                  ([key, label]) => `
                    <label class="fit-option">
                      <input type="checkbox" value="${escapeHtml(label)}" data-fit-key="${escapeHtml(key)}" ${
                    state.reviewFit.map(fitKeyFromLabel).includes(key) ? "checked" : ""
                  } />
                      <span>${escapeHtml(label)}</span>
                    </label>
                  `
                )
                .join("")}
            </div>
          </fieldset>
          <aside class="review-guidelines">
            <h3>${t.privacyGuidelinesTitle}</h3>
            <ul>
              ${[
                t.privacyGuidelineAddress,
                t.privacyGuidelineNames,
                t.privacyGuidelineContact,
                t.privacyGuidelineConditions,
                t.privacyGuidelineAttacks,
              ]
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ul>
          </aside>
          <fieldset class="fit-fieldset structured-fieldset">
            <legend>${t.structuredReview}</legend>
            <div class="structured-sections">
              ${structuredReviewSections
                .map(
                  (section) => `
                    <section class="structured-section">
                      <h3>${escapeHtml(t[section.title])}</h3>
                      <div class="structured-grid">
                        ${section.fields
                          .map((field) =>
                            field.type === "checkbox"
                              ? `
                                <div class="structured-checkbox-group">
                                  <div>
                                    <strong>${escapeHtml(t[field.key])}</strong>
                                    <p>${escapeHtml(t[field.question])}</p>
                                  </div>
                                  <div class="fit-options structured-checkboxes">
                                    ${field.options
                                      .map(
                                        (option) => `
                                          <label class="fit-option">
                                            <input type="checkbox" value="${escapeHtml(option)}" data-structured-match="${escapeHtml(option)}" ${
                                          Array.isArray(state.reviewStructured[field.key]) &&
                                          state.reviewStructured[field.key].includes(option)
                                            ? "checked"
                                            : ""
                                        } />
                                            <span>${escapeHtml(structuredLabel(field.key, option))}</span>
                                          </label>
                                        `
                                      )
                                      .join("")}
                                  </div>
                                </div>
                              `
                              : `
                                <label class="structured-select">
                                  <span>${escapeHtml(t[field.key])}</span>
                                  <small>${escapeHtml(t[field.question])}</small>
                                  <select data-structured-field="${escapeHtml(field.key)}">
                                    ${field.options
                                      .map(
                                        (option) =>
                                          `<option value="${escapeHtml(option)}" ${
                                            state.reviewStructured[field.key] === option ? "selected" : ""
                                          }>${escapeHtml(structuredLabel(field.key, option))}</option>`
                                      )
                                      .join("")}
                                  </select>
                                </label>
                              `
                          )
                          .join("")}
                      </div>
                    </section>
                  `
                )
                .join("")}
            </div>
          </fieldset>
          <h3 class="review-subtitle">${t.additionalNotes}</h3>
          <label class="review-text-label" for="review-textarea">${t.reviewText}</label>
          <textarea id="review-textarea" class="review-textarea" placeholder="${escapeHtml(
            t.reviewPlaceholder
          )}" data-preserve="review-textarea">${escapeHtml(state.reviewText)}</textarea>
          <button id="review-submit" type="button" class="button button--primary">${t.submitReview}</button>
          ${state.submitted ? `<div class="submit-message">${t.submitted}</div>` : ""}
        </div>
      </article>
    `;
  }

  function renderRecentReviews() {
    const reviews = visibleReviews()
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    return `
      <article class="card recent-card">
        <div class="card-body">
          <div class="review-header">
            <h2 class="section-title">${t.recentReviews}</h2>
            <span class="status-pill is-pass">${t.savedLocally}</span>
          </div>
          <div class="recent-list">
            ${
              reviews.length === 0
                ? `<div class="empty-state">${t.noReviewsYet}</div>`
                : reviews
                    .map(
                      (review) => {
                        const reviewText = displayReviewText(review.text);
                        const structuredTags = structuredReviewTags(review);
                        return `
                  <article class="review-item">
                    <div class="review-header">
                      <strong>${escapeHtml(review.host)}</strong>
                      <div class="review-actions">
                        ${renderStars(review.score)}
                        ${
                          canModerateReviews()
                            ? `<button type="button" class="button button--danger button--compact" data-delete-review="${escapeHtml(
                                review.id
                              )}" aria-label="${escapeHtml(t.deleteReviewLabel)}">${t.deleteReview}</button>`
                            : ""
                        }
                      </div>
                    </div>
                    ${
                      review.fit && review.fit.length
                        ? `<div class="result-tags review-fit-first">${review.fit
                            .map((tag) => `<span class="result-tag">${escapeHtml(localizedFitLabel(tag))}</span>`)
                            .join("")}</div>`
                        : ""
                    }
                    ${
                      structuredTags.length
                        ? `<div class="structured-review-summary">${structuredTags
                            .map((tag) => `<span>${escapeHtml(tag)}</span>`)
                            .join("")}</div>`
                        : ""
                    }
                    ${
                      reviewText
                        ? `<p class="review-quote">${language === "ja" ? "「" : "\""}${escapeHtml(reviewText)}${
                            language === "ja" ? "」" : "\""
                          }</p>`
                        : `<p class="review-quote review-quote--empty">${t.adminRatingOnly}</p>`
                    }
                    <div class="review-meta">${escapeHtml(displayStudentName(review.student))}</div>
                  </article>
                `;
                      }
                    )
                    .join("")
            }
          </div>
        </div>
      </article>
    `;
  }

  function renderSafetyDesign() {
    return `
      <section class="section-safety">
        <div class="container">
          <div class="section-head">
            <h2 class="section-title">${t.safetyDesignTitle}</h2>
            <p class="section-text">${t.safetyDesignText}</p>
          </div>
          <div class="safety-grid">
            ${[
              t.safetyPointAddress,
              t.safetyPointConditions,
              t.safetyPointCorrection,
              t.safetyPointModeration,
              t.safetyPointSchool,
            ]
              .map((item) => `<article class="safety-card"><span class="icon-chip">✓</span><p>${item}</p></article>`)
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderSchoolAnalytics() {
    const analytics = schoolAnalytics();
    const scoreList = (items) =>
      items.length
        ? items.map((item) => `<div class="analytics-row"><span>${escapeHtml(item.title)}</span><strong>${escapeHtml(item.value.toFixed(1))}</strong></div>`).join("")
        : `<div class="empty-state">${t.noAnalytics}</div>`;
    const countList = (items) =>
      items.length
        ? items.map((item) => `<div class="analytics-row"><span>${escapeHtml(item.title)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join("")
        : `<div class="empty-state">${t.noAnalytics}</div>`;

    return `
      <section id="school" class="section-school">
        <div class="container">
          <div class="section-head">
            <h2 class="section-title">${t.schoolTitle}</h2>
            <p class="section-text">${t.schoolText}</p>
          </div>
          <div class="analytics-grid">
            <article class="analytics-card analytics-card--stat">
              <span>${t.analyticsReviews}</span>
              <strong>${analytics.reviews}</strong>
            </article>
            <article class="analytics-card">
              <h3>${t.analyticsAverage}</h3>
              ${scoreList(analytics.categoryScores)}
            </article>
            <article class="analytics-card">
              <h3>${t.analyticsRisks}</h3>
              ${analytics.risks.map((risk) => `<div class="analytics-row"><span>${risk.label}</span><strong>${risk.count}</strong></div>`).join("")}
            </article>
            <article class="analytics-card">
              <h3>${t.analyticsStrongest}</h3>
              ${scoreList(analytics.strongest)}
            </article>
            <article class="analytics-card">
              <h3>${t.analyticsAttention}</h3>
              ${scoreList(analytics.attention)}
            </article>
            <article class="analytics-card">
              <h3>${t.analyticsCommonStrengths}</h3>
              ${countList(analytics.commonStrengths)}
            </article>
            <article class="analytics-card">
              <h3>${t.analyticsCommonConcerns}</h3>
              ${countList(analytics.commonConcerns)}
            </article>
            <article class="analytics-card">
              <h3>${t.analyticsAtmosphere}</h3>
              ${
                Number.isFinite(analytics.atmosphereAverage)
                  ? `<div class="analytics-row"><span>${t.analyticsAtmosphere}</span><strong>${analytics.atmosphereAverage.toFixed(1)}</strong></div>`
                  : `<div class="empty-state">${t.noAnalytics}</div>`
              }
              <h3>${t.analyticsRuleStrictness}</h3>
              ${
                Number.isFinite(analytics.ruleStrictnessAverage)
                  ? `<div class="analytics-row"><span>${t.analyticsRuleStrictness}</span><strong>${analytics.ruleStrictnessAverage.toFixed(1)}</strong></div>`
                  : `<div class="empty-state">${t.noAnalytics}</div>`
              }
            </article>
          </div>
        </div>
      </section>
    `;
  }

  function renderTests() {
    const testResults = runPrototypeTests();
    const allTestsPassed = testResults.every((test) => test.pass);
    return `
      <article class="card tests-card">
        <div class="card-body">
          <div class="test-summary">
            <div>
              <h2 class="section-title">${t.tests}</h2>
              <p class="section-text">${t.testsText}</p>
            </div>
            <div class="status-pill ${allTestsPassed ? "is-pass" : "is-fail"}">
              ${allTestsPassed ? t.allTestsPassed : t.someTestsFailed}
            </div>
          </div>
          <div class="tests-list">
            ${testResults
              .map(
                (test) => `
                  <div class="test-item">
                    <span class="test-label">${escapeHtml(test.name)}</span>
                    <span class="test-status ${test.pass ? "is-pass" : "is-fail"}">${test.pass ? t.pass : t.fail}</span>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </article>
    `;
  }

  function captureFocusState() {
    const activeElement = document.activeElement;
    if (!activeElement || !activeElement.dataset || !activeElement.dataset.preserve) return null;
    return {
      key: activeElement.dataset.preserve,
      selectionStart: typeof activeElement.selectionStart === "number" ? activeElement.selectionStart : null,
      selectionEnd: typeof activeElement.selectionEnd === "number" ? activeElement.selectionEnd : null,
      scrollY: window.scrollY,
    };
  }

  function restoreFocusState(snapshot) {
    if (!snapshot) return;
    const element = document.querySelector(`[data-preserve="${snapshot.key}"]`);
    if (!element) return;
    element.focus({ preventScroll: true });
    if (snapshot.selectionStart !== null && typeof element.setSelectionRange === "function") {
      element.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd);
    }
    window.scrollTo(0, snapshot.scrollY);
  }

  function bindEvents() {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.querySelector(".search-bar .button");
    const reviewHostSelect = document.getElementById("review-host-select");
    const reviewTextarea = document.getElementById("review-textarea");
    const reviewSubmit = document.getElementById("review-submit");
    const addHouseButton = document.getElementById("add-house-button");
    const showReviewFormButton = document.getElementById("show-review-form");
    const heroReviewButton = document.getElementById("hero-review-button");
    const languageSelect = document.getElementById("language-select");
    const loginButton = document.getElementById("login-button");
    const logoutButton = document.getElementById("logout-button");
    const loginSubmit = document.getElementById("login-submit");

    if (languageSelect) languageSelect.addEventListener("change", (event) => {
      setLanguage(event.target.value);
    });

    if (loginButton) loginButton.addEventListener("click", () => {
      loginOpen = !loginOpen;
      loginError = false;
      render();
    });

    if (logoutButton) logoutButton.addEventListener("click", logout);

    if (loginSubmit) loginSubmit.addEventListener("click", () => {
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value;
      login(username, password);
    });

    if (searchInput) searchInput.addEventListener("input", (event) => {
      state.query = event.target.value;
      render();
    });

    if (searchButton) searchButton.addEventListener("click", () => {
      if (searchInput) state.query = searchInput.value;
      render();
    });

    document.querySelectorAll("[data-filter-key]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.filterKey;
        state.activeFilters = state.activeFilters.includes(key)
          ? state.activeFilters.filter((item) => item !== key)
          : [...state.activeFilters, key];
        render();
      });
    });

    const clearFiltersButton = document.getElementById("clear-filters");
    if (clearFiltersButton) clearFiltersButton.addEventListener("click", () => {
      state.activeFilters = [];
      render();
    });

    if (showReviewFormButton) showReviewFormButton.addEventListener("click", () => {
      state.reviewFormOpen = true;
      render();
      const reviewCard = document.getElementById("review");
      if (reviewCard) reviewCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    if (heroReviewButton) heroReviewButton.addEventListener("click", () => {
      state.reviewFormOpen = true;
      render();
      const reviewCard = document.getElementById("review");
      if (reviewCard) reviewCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    if (reviewHostSelect) reviewHostSelect.addEventListener("change", (event) => {
      state.selectedId = Number(event.target.value);
      state.submitted = false;
      render();
    });

    if (addHouseButton) addHouseButton.addEventListener("click", async () => {
      const nameInput = document.getElementById("new-house-name");
      const areaInput = document.getElementById("new-house-area");
      const addressInput = document.getElementById("new-house-address");
      const name = nameInput.value.trim();
      const area = areaInput.value.trim();
      const exactAddress = addressInput.value.trim();

      if (!name || !area || !exactAddress) {
        if (!name) nameInput.focus();
        else if (!area) areaInput.focus();
        else addressInput.focus();
        return;
      }

      if (name.toLowerCase() === area.toLowerCase()) {
        nameInput.focus();
        alert(t.familyNameSameAsArea);
        return;
      }

      const existingHost = allHosts().find((host) => hostDisplayKey(host) === hostDisplayKey({ area, name }));
      if (existingHost) {
        state.selectedId = existingHost.id;
        state.submitted = false;
        render();
        return;
      }

      addHouseButton.disabled = true;
      let location = null;
      let usedApproximateLocation = false;
      try {
        location = await geocodeAddress(exactAddress);
      } catch (_error) {
        location = null;
      }
      addHouseButton.disabled = false;

      if (!location) {
        location = approximateLocationFromAddress(exactAddress);
        usedApproximateLocation = true;
      }

      const host = await persistHost(createCustomHost({ name, area, exactAddress, lat: location.lat, lng: location.lng }));
      state.selectedId = host.id;
      state.submitted = false;
      render();
      if (usedApproximateLocation) alert(t.geocodeFallback);
    });

    if (reviewTextarea) reviewTextarea.addEventListener("input", (event) => {
      state.reviewText = event.target.value;
      if (state.submitted) {
        state.submitted = false;
        render();
      }
    });

    if (reviewSubmit) reviewSubmit.addEventListener("click", async () => {
      const host = selectedHost();
      if (!host) return;
      if (!state.reviewText.trim() && !isAdmin()) {
        reviewTextarea.focus();
        return;
      }

      const review = {
        id: `local-${Date.now()}`,
        hostId: host.id,
        host: hostDisplayName(host),
        student: t.anonymousStudent,
        text: state.reviewText.trim(),
        score: scoreFromCriteria(state.reviewScores),
        criteria: { ...state.reviewScores },
        fit: [...state.reviewFit.map(fitKeyFromLabel)],
        structured: { ...state.reviewStructured },
        createdAt: new Date().toISOString(),
      };

      reviewSubmit.disabled = true;
      await persistReview(review);
      state.reviewText = "";
      state.reviewScores = { ...defaultScores };
      state.reviewFit = [];
      state.reviewStructured = {
        noiseLevel: "balanced",
        privacyLevel: "mostlyPrivate",
        bathroomSituation: "sharedOneTwo",
        rulesFlexibility: "balanced",
        householdInteraction: "sometimes",
        englishEnvironment: "mostlyEnglish",
        socialAtmosphere: "friendly",
        goodMatchFor: [],
        recommendation: "maybe",
      };
      state.submitted = true;
      render();
    });

    document.querySelectorAll("[data-select-host]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedId = Number(button.dataset.selectHost);
        state.submitted = false;
        render();
      });
    });

    document.querySelectorAll("[data-delete-review]").forEach((button) => {
      button.addEventListener("click", async () => {
        button.disabled = true;
        await deleteReview(button.dataset.deleteReview);
      });
    });

    document.querySelectorAll("[data-delete-host]").forEach((button) => {
      button.addEventListener("click", () => {
        deleteHost(button.dataset.deleteHost);
      });
    });

    document.querySelectorAll("[data-score-key]").forEach((button) => {
      button.addEventListener("click", () => {
        state.reviewScores[button.dataset.scoreKey] = Number(button.dataset.scoreValue);
        button
          .closest(".star-input")
          .querySelectorAll(".star-button")
          .forEach((star) => {
            star.classList.toggle("is-active", Number(star.dataset.scoreValue) <= state.reviewScores[button.dataset.scoreKey]);
          });
      });
    });

    document.querySelectorAll("[data-fit-key]").forEach((input) => {
      input.addEventListener("change", () => {
        const label = input.dataset.fitKey;
        state.reviewFit = input.checked
          ? [...new Set([...state.reviewFit, label])]
          : state.reviewFit.filter((item) => item !== label);
      });
    });

    document.querySelectorAll("[data-structured-field]").forEach((select) => {
      select.addEventListener("change", () => {
        state.reviewStructured[select.dataset.structuredField] = select.value;
      });
    });

    document.querySelectorAll("[data-structured-match]").forEach((input) => {
      input.addEventListener("change", () => {
        const value = input.dataset.structuredMatch;
        const current = Array.isArray(state.reviewStructured.goodMatchFor) ? state.reviewStructured.goodMatchFor : [];
        state.reviewStructured.goodMatchFor = input.checked ? [...new Set([...current, value])] : current.filter((item) => item !== value);
      });
    });
  }

  function initMap(host) {
    const mapElement = document.getElementById("real-map");
    if (!mapElement || !window.L) return;

    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
    }

    const centerLat = state.selectedId && host ? host.lat : RED_DEER_CENTER.lat;
    const centerLng = state.selectedId && host ? host.lng : RED_DEER_CENTER.lng;
    leafletMap = L.map(mapElement, { zoomControl: true, scrollWheelZoom: false, attributionControl: false, maxZoom: 13 }).setView(
      [centerLat, centerLng],
      state.selectedId && host ? 12 : 11
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 13,
    }).addTo(leafletMap);

    const houseIcon = L.divIcon({
      className: "house-map-marker",
      html: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });

    allHosts().forEach((item) => {
      const stats = getHostStats(item);
      const marker = L.marker([item.lat, item.lng], { icon: houseIcon }).addTo(leafletMap);
      const markerElement = marker.getElement();

      if (markerElement && host && item.id === host.id) {
        markerElement.classList.add("is-selected");
      }

      marker
        .bindPopup(
          `<strong>${escapeHtml(item.area)}</strong><br>${stats.rating.toFixed(
            1
          )} / 5<br><small>${escapeHtml(t.approximatePins)}</small>`
        )
        .on("click", () => {
          state.selectedId = item.id;
          render();
        });

      if (host && item.id === host.id) marker.openPopup();
    });

    setTimeout(() => leafletMap.invalidateSize(), 50);
  }

  function render() {
    const root = document.getElementById("app");
    if (!root) return;

    const host = selectedHost();
    const filteredHosts = filterHosts(allHosts(), state.query);
    const focusState = captureFocusState();

    document.title = `${BRAND_NAME} | ${t.subtitle}`;
    document.documentElement.lang = t.htmlLang;

    root.innerHTML = `
      <div class="site-shell">
        <header class="site-header">
          <div class="container header-inner">
            <div class="brand">
              <div class="brand-mark">ホ</div>
              <div>
                <div class="brand-name">${BRAND_NAME}</div>
                <div class="brand-subtitle">${t.subtitle}</div>
              </div>
            </div>
            <nav class="site-nav" aria-label="Primary">
              <a href="#search">${t.navSearch}</a>
              <a href="#map">${t.navMap}</a>
              <a href="#review">${t.navReview}</a>
              <a href="#school">${t.navSchool}</a>
            </nav>
            <div class="header-actions">
              <label class="language-control" for="language-select">
                <span>${t.languageLabel}</span>
                <select id="language-select" class="language-select" data-preserve="language-select">
                  <option value="ja" ${language === "ja" ? "selected" : ""}>${t.languageJapanese}</option>
                  <option value="en" ${language === "en" ? "selected" : ""}>${t.languageEnglish}</option>
                </select>
              </label>
              ${
                isAdmin()
                  ? `<span class="status-pill status-pill--admin">${t.adminBadge}</span>`
                  : isModerator()
                  ? `<span class="status-pill status-pill--admin">${t.moderatorBadge}</span>`
                  : ""
              }
              ${currentUser ? `<span class="status-pill">${t.loggedInAs}: ${escapeHtml(currentUser.name)}</span>` : ""}
              <button id="${currentUser ? "logout-button" : "login-button"}" type="button" class="button button--primary button--header">${
                currentUser ? t.logout : t.login
              }</button>
            </div>
          </div>
        </header>

        <main>
          ${renderLoginPanel()}
          ${renderTopPrivacy()}
          <section class="section-hero">
            <div class="container hero-grid hero-grid--single">
              <div class="hero-copy">
                <h1 class="hero-title">${t.heroTitleA}<br />${t.heroTitleB}</h1>
                <p class="hero-text">${t.heroText}</p>
                <div class="hero-value-row">
                  <span class="trust-badge">${t.heroValue}</span>
                  <span class="trust-badge">${t.heroPrivacy}</span>
                  <span class="trust-badge">${t.heroModeration}</span>
                </div>
                <div id="search" class="search-bar">
                  <span class="icon-chip">⌕</span>
                  <input
                    id="search-input"
                    class="search-input"
                    type="text"
                    placeholder="${escapeHtml(t.searchPlaceholder)}"
                    value="${escapeHtml(state.query)}"
                    data-preserve="search-input"
                  />
                  <button type="button" class="button button--primary">${t.searchButton}</button>
                </div>
                ${renderQuickFilters()}
                ${renderAddFamilyPanel()}
                <div class="hero-actions">
                  <a class="button button--primary" href="#map">${t.compareAreas}</a>
                  <button id="hero-review-button" type="button" class="button button--secondary">${t.writeReviewCta}</button>
                </div>
                ${
                  isAdmin()
                    ? `<div class="stat-grid">
                  <article class="card card--soft">
                    <div class="card-body">
                      <div class="stat-value">${visibleReviews().length}</div>
                      <div class="stat-label">${t.statPrivacy}</div>
                    </div>
                  </article>
                </div>`
                    : ""
                }
              </div>
            </div>
          </section>

          <section class="section-map">
            <div class="container">
              ${renderMap(host)}
            </div>
          </section>

          <section class="section-results">
            <div class="container content-grid">
              <div class="results-column">
                <div class="results-head">
                  <h2 class="section-title">${t.searchResults}</h2>
                  <span class="results-count">${filteredHosts.length}</span>
                </div>
                ${renderSearchResults(filteredHosts, host)}
              </div>

              <div class="sidebar-column">
                ${renderHeroCard(host)}
                ${state.reviewFormOpen ? renderReviewForm(host) : ""}
                ${renderRecentReviews()}
              </div>
            </div>
          </section>

          ${renderSafetyDesign()}
          ${renderSchoolAnalytics()}

        </main>
        <div class="footer-spacer"></div>
      </div>
    `;

    bindEvents();
    initMap(host);
    restoreFocusState(focusState);
    syncHostsFromApi();
    syncReviewsFromApi();
  }

  if (typeof document !== "undefined") {
    render();
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      filterHosts,
      runPrototypeTests,
      hosts,
      criteriaGroups,
      scoreFromCriteria,
    };
  }
})();
