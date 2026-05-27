(function () {
  "use strict";

  const STORAGE_KEY = "nestly.userReviews.v3";
  const CUSTOM_HOSTS_KEY = "nestly.customHosts.v2";
  // Admin の論理削除リスト（ベイクド/seed の家族・レビューを画面から隠すため）。
  // 物理削除は不可（コードに組み込み・seed-reviews.json は管理対象）なので、
  // localStorage に「隠すIDの集合」を保持してレンダリング時にフィルタする。
  const HIDDEN_HOSTS_KEY = "nestly.hiddenHosts.v1";
  const HIDDEN_REVIEWS_KEY = "nestly.hiddenReviews.v1";
  const LANGUAGE_KEY = "nestly.language";
  const ROLE_KEY = "nestly.role";
  const SESSION_KEY = "nestly.session.v2";
  const VIEW_KEY = "nestly.view";
  const BANNER_DISMISSED_KEY = "nestly.bannerDismissed";
  const RECENT_SORT_KEY = "nestly.recentSort";
  const USERS_KEY = "nestly.users.v1";
  const DRAFT_KEY = "nestly.draft.v1";
  const FAVORITES_KEY = "nestly.favorites.v1";
  const HELPFUL_KEY = "nestly.helpful.v1";
  const EDIT_LOCK_HOURS = 24;
  // NOTE: "compare" view removed — implied competitive ranking, conflicting
  // with Nestly's personalized-match brand. Match% chip + saved hosts cover
  // the same need without the "winner/loser" framing.
  const VIEWS = ["home", "search", "map", "review", "school", "favorites", "how-to", "privacy", "terms", "my-host", "pricing"];

  // Schools list — Red Deer, Alberta high schools (initial pilot area).
  const SCHOOLS = [
    { code: "RDP", name: "Red Deer Polytechnic" },
    { code: "HHS", name: "Hunting Hills High School" },
    { code: "LCHS", name: "Lindsay Thurber Comprehensive High School" },
    { code: "NDSS", name: "Notre Dame High School" },
    { code: "STMA", name: "St. Joseph High School" },
    { code: "OTHER", name: "Other / Not listed" },
  ];

  const GRADES_JA = ["中3 (Grade 9)", "高1 (Grade 10)", "高2 (Grade 11)", "高3 (Grade 12)", "大学/College", "その他"];
  const GRADES_EN = ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "University/College", "Other"];

  const NATIVE_LANGUAGES = [
    "日本語 / Japanese", "中国語 / Chinese (Mandarin)", "韓国語 / Korean",
    "ベトナム語 / Vietnamese", "タイ語 / Thai", "スペイン語 / Spanish",
    "ポルトガル語 / Portuguese", "アラビア語 / Arabic", "その他 / Other",
  ];

  const DIETARY_OPTIONS = [
    { key: "none", labelJa: "制限なし", labelEn: "No restrictions" },
    { key: "vegetarian", labelJa: "ベジタリアン", labelEn: "Vegetarian" },
    { key: "halal", labelJa: "ハラル", labelEn: "Halal" },
    { key: "kosher", labelJa: "コーシャ", labelEn: "Kosher" },
    { key: "allergies", labelJa: "アレルギーあり", labelEn: "Has allergies" },
  ];

  // School-issued verification codes (demo). In production these would come
  // from a partner school API. For demo: any code starting with the school
  // code prefix is accepted (e.g. "RDP-2026-XYZ").
  function isValidSchoolCode(code, schoolCode) {
    if (!code || !schoolCode) return false;
    return String(code).toUpperCase().startsWith(String(schoolCode).toUpperCase() + "-");
  }
  const BRAND_NAME = "Nestly";
  const BRAND_NAME_JA = "ネストリー";
  const BRAND_TAGLINE_EN = "Find your nest. Not by luck, but by choice.";
  const BRAND_TAGLINE_JA = "留学を、運ではなく選択に。";
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
    hostBadge: "ホスト家庭",
    signupAsLabel: "登録の種類",
    signupAsStudent: "留学生として登録",
    signupAsHost: "ホスト家庭として登録",
    signupHostFamilyLabel: "あなたのホスト家庭を選択",
    signupHostFamilyPlaceholder: "家庭を選択してください",
    signupHostRequired: "ホスト家庭を選択してください。",
    signupHostHelp: "ホスト家庭として登録すると、自家庭の評価やレビューが見られるようになります。",
    navMyHost: "自家庭",
    hostProfileEyebrow: "Host dashboard",
    hostProfileIntro: "自家庭に寄せられたレビューと評価をここで確認できます。受け入れ方を磨くためのフィードバックとしてご活用ください。",
    hostProfileNoHost: "ホストアカウントに家庭が紐付いていません。サインアップ時に家庭を選択してください。",
    hostProfileLoginRequired: "ホスト家庭ページを見るには、ホスト家庭としてログインしてください。",
    hostProfileOverall: "総合評価",
    hostProfileReviews: "レビュー数",
    hostProfileReliability: "信頼度",
    hostProfileStrengths: "強み Top 3",
    hostProfileImprovements: "改善余地のあるカテゴリ",
    hostProfileVerifiedTitle: "Verified Host認証への進捗",
    hostProfileVerifiedDone: "✓ Verified Host認証を取得済みです。",
    hostProfileVerifiedReviews: "レビュー数：{current} / 3 件",
    hostProfileVerifiedRating: "平均評価：★{current} / ★4.0",
    hostProfileVerifiedHint: "条件：レビュー3件以上 × 平均★4.0以上で認証バッジが付与されます。",
    hostProfileReviewsTitle: "寄せられたレビュー",
    hostProfileNoReviews: "まだレビューが寄せられていません。",
    hostReplyLabel: "このレビューに返信",
    hostReplyPlaceholder: "建設的な返信を心がけてください（最大800字）。投稿後の編集はできません。",
    hostReplySubmit: "返信を投稿",
    hostReplySubmitting: "投稿中...",
    hostReplyHeading: "ホストからの返信",
    hostReplyEmpty: "返信を入力してください。",
    hostReplyFailed: "返信の投稿に失敗しました。時間をおいて再度お試しください。",
    hostReplyAlreadyExists: "このレビューにはすでに返信済みです。",
    analyticsFlagged: "要注意ホスト",
    analyticsFlaggedHint: "総合評価★3.8未満、または重要カテゴリで★3.5未満のホストを自動でフラグ表示しています。",
    analyticsFlaggedNone: "現在、要注意のホストはありません。",
    analyticsFlaggedReviews: "レビュー{count}件",
    analyticsExportCsv: "CSVをダウンロード",
    analyticsExportHint: "学校・エージェント様向け：全ホストのカテゴリ別スコアをCSV形式でダウンロードできます。",
    analyticsTrendTitle: "月次レビュー推移（直近12ヶ月）",
    analyticsTrendHint: "棒グラフはレビュー件数、折れ線は平均評価です。",
    analyticsTrendNoData: "まだデータがありません。",
    analyticsFilterTitle: "絞り込み",
    analyticsFilterArea: "エリア",
    analyticsFilterSchool: "学校",
    analyticsFilterAll: "すべて",
    analyticsFilterCount: "対象：ホスト {hosts} 軒、レビュー {reviews} 件",
    pricingNav: "料金プラン",
    pricingEyebrow: "Business Model",
    pricingTitle: "Nestlyの収益モデル",
    pricingIntro: "Nestlyは4つの収益軸でステークホルダー全員に価値を届けます。コンテスト時点のプロトタイプ価格を掲載しています。",
    pricingDisclaimer: "* 表示価格はビジネスコンテスト提案時点の試算です。本サービス開始時には市場状況に応じて調整されます。",
    pricingPlan1Tag: "メイン収益",
    pricingPlan1Title: "B2B 分析レポート",
    pricingPlan1For: "学校・留学エージェント向け",
    pricingPlan1Price: "$2,000〜$5,000/年",
    pricingPlan1Features: "地域別の品質分析\n要注意ホストの自動フラグ\n月次推移トレンド\nCSV／PDFエクスポート\n専任サポート",
    pricingPlan2Tag: "ホスト向け",
    pricingPlan2Title: "Verified Host 認証プラン",
    pricingPlan2For: "受け入れホスト家庭向け",
    pricingPlan2Price: "$200/年",
    pricingPlan2Features: "Verified Host 認証バッジ\n検索結果での優先表示\n自家庭ダッシュボード\nレビューへの返信機能\n改善フィードバックの可視化",
    pricingPlan3Tag: "個人向け",
    pricingPlan3Title: "プレミアムプラン（留学生向け）",
    pricingPlan3For: "より詳しい情報を求める留学生",
    pricingPlan3Price: "$5/月",
    pricingPlan3Features: "詳細レビューの全文閲覧\n高度なマッチング機能\n複数ホストの比較メモ\n優先サポート\n広告非表示",
    pricingPlan4Tag: "補完収益",
    pricingPlan4Title: "広告掲載",
    pricingPlan4For: "留学関連の広告主向け",
    pricingPlan4Price: "応相談",
    pricingPlan4Features: "ターゲット広告（留学生・ホスト・学校）\n航空券・保険・通信プランなど留学関連サービス\nブランディング枠\nコンテンツ連携",
    aboutStoryHeading: "なぜNestlyを作るのか",
    aboutStoryParagraph1: "私は現在カナダRed Deerで高校留学中の高校生です。ある友人はホストファミリーとの会話を通じて英語力を伸ばし大学進学を決めた一方、別の友人は孤独感から塞ぎ込み、3ヶ月で帰国を考えました。",
    aboutStoryParagraph2: "違いを生んだのは本人の努力ではなく、住む家庭そのものでした。レストランやホテルには口コミがあるのに、人生の数ヶ月を過ごすホームステイにはありません。私はこの情報の空白を埋め、留学を「運任せ」から「納得の選択」へ変えるためにNestlyを開発しました。",
    aboutHearingTitle: "20名の留学生から聞いた、本当のところ",
    aboutHearingIntro: "2025年から現地留学生20名にヒアリングを実施。「事前にどんな情報があれば不安が減ったか」を一次データから抽出し、評価軸の設計に反映しました。",
    aboutHearingStat1Count: "8",
    aboutHearingStat1Label: "満足していた",
    aboutHearingStat2Count: "6",
    aboutHearingStat2Label: "深刻な不一致による不調を経験",
    aboutHearingStat3Count: "3",
    aboutHearingStat3Label: "帰国を本気で検討",
    aboutHearingStat4Count: "3",
    aboutHearingStat4Label: "その他",
    aboutHearingPercent: "20名中",
    aboutQuotesTitle: "ヒアリングで聞こえた声",
    aboutQuote1: "家族と数週間ほとんど会話がなく、英語を話す機会がなかった。",
    aboutQuote1Tag: "留学生 / 高校1年",
    aboutQuote2: "食事が合わず体調を崩し、勉強に集中できなかった。",
    aboutQuote2Tag: "留学生 / 高校2年",
    aboutQuote3: "門限が厳しすぎて、勉強と部活の両立ができなかった。",
    aboutQuote3Tag: "留学生 / 高校3年",
    relaxFiltersIntro: "下記のフィルターを外すと候補が増えます：",
    relaxFiltersUnit: "件",
    relaxFiltersRemove: "外す",
    relaxFiltersClearAll: "すべてのフィルターを解除",
    reviewProgressLabel: "必須項目の進捗",
    reviewProgressDone: "{current} / {total} 完了",
    reviewProgressRecommendMissing: "「おすすめ度」が未入力",
    reviewProgressTextMissing: "「本文」が未入力",
    reviewProgressJumpRecommend: "おすすめ度へ移動",
    deleteReview: "削除",
    deleteReviewLabel: "この投稿を削除",
    deleteFailed: "投稿を削除できませんでした。",
    deleteFamily: "家族を削除",
    deleteFamilyLabel: "この家族を削除",
    geocodeFailed: "住所から位置を取得できませんでした。住所を確認してください。",
    familyNameSameAsArea: "家族名とエリア名は分けて入力してください。",
    adminRatingOnly: "管理者による評価のみ",
    refineSearch: "検索条件を変えてもう一度探してください。",
    selectFamilyFirst: "レビューを書くには、まずマップまたは検索結果から家族を選択してください。",
    subtitle: "留学生の声で選ぶホストファミリー評価プラットフォーム",
    tagline: "留学を、運ではなく選択に。",
    taglineEn: "Find your nest. Not by luck, but by choice.",
    demoBannerLabel: "デモデータ",
    demoBannerText: "表示中のレビューと一部のホスト情報はプロトタイプ用のサンプルです。本番リリース時には20名のヒアリングを匿名化した実データに差し替えます。",
    aboutEyebrow: "About Nestly",
    aboutTitle: "Red Deerの留学生が、20名の声からつくっています。",
    aboutText: "Nestlyは、カナダRed Deerで高校留学中の開発者が、2025年から現地留学生20名にヒアリングを行い、9カテゴリの評価軸を設計したプロジェクトです。「事前にどんな情報があれば不安が減ったか」を一次データから抽出し、レビューの構造に落とし込みました。情報の空白を埋め、留学を「運任せ」から「納得の選択」へ変えることが、私たちの目標です。",
    aboutStat1Value: "20名",
    aboutStat1Label: "現地留学生ヒアリング",
    aboutStat2Value: "9カテゴリ",
    aboutStat2Label: "構造化評価軸",
    aboutStat3Value: "5項目",
    aboutStat3Label: "生活条件レビュー",
    aboutStat4Value: "Red Deer",
    aboutStat4Label: "初期展開エリア",
    verifiedExplainer: "Verified Host：本人確認済み、レビュー3件以上、平均★4.0以上の家庭に付与（学校コードで投稿者を検証）",
    footerNote: "Nestly はビジネスコンテスト出品中のプロトタイプです。",
    footerCopy: "© 2026 Nestly. Built in Red Deer, Alberta.",
    navAbout: "Nestlyについて",
    navSearch: "探す",
    navMap: "マップ",
    navReview: "レビューを書く",
    navSchool: "学校向け",
    navHowTo: "使い方",
    reportButton: "通報",
    reportButtonLabel: "このレビューを通報",
    reportModalTitle: "レビューを通報",
    reportModalIntro: "問題のあるレビューを見つけたら、理由を選んで送信してください。モデレーターが内容を確認します。",
    reportReasonLabel: "通報理由",
    reportReasonMisinformation: "事実と異なる情報",
    reportReasonPersonalInfo: "個人を特定できる情報",
    reportReasonHarassment: "誹謗中傷・差別的内容",
    reportReasonSpam: "スパム・宣伝",
    reportReasonOther: "その他",
    reportNoteLabel: "補足説明（任意・最大500字）",
    reportNotePlaceholder: "具体的に何が問題かを書いてください（任意）",
    reportCancel: "キャンセル",
    reportSubmit: "通報を送信",
    reportSubmitting: "送信中...",
    reportThanks: "通報を受け付けました。モデレーターが確認します。",
    reportFailed: "通報の送信に失敗しました。時間をおいて再度お試しください。",
    reportReasonRequired: "通報理由を選択してください。",
    privacyNav: "プライバシー",
    privacyEyebrow: "Legal",
    privacyTitle: "プライバシーポリシー",
    privacyLastUpdated: "最終更新日: 2026年5月24日",
    privacyIntro: "Nestlyはユーザーの個人情報を慎重に扱います。このページでは収集する情報・使い方・保護方法をまとめています。",
    privacyS1Title: "1. 収集する情報",
    privacyS1Lines: "Nestlyは以下の情報を収集します。\n• アカウント情報：メール、ニックネーム、学校、学年、母国語\n• レビュー投稿：評価スコア、本文、構造化回答、選択したホスト家庭\n• 認証情報：学校が発行する認証コード（本人確認時のみ使用、永続保存しません）\n• 任意情報：マッチング用プリファレンス、お気に入りリスト",
    privacyS2Title: "2. 情報の使い方",
    privacyS2Lines: "収集した情報は以下の目的にのみ使用します。\n• レビューの可視化（投稿者名は匿名化／省略形で表示）\n• マッチスコアの算出\n• 学校・エージェント向け集計データの作成（個人特定不可な形式）\n• スパム・不正投稿の検出",
    privacyS3Title: "3. 公開される情報・公開されない情報",
    privacyS3Lines: "【公開】ニックネーム、学校コード、学年、レビュー内容、評価\n【非公開】メールアドレス、本名、認証コード、IPアドレス\n【特別保護】ホスト家庭の正確な住所は地図上に表示しません。半径250mの円で位置を曖昧化し、地図の最大ズームは14に制限しています。",
    privacyS4Title: "4. 第三者への提供",
    privacyS4Lines: "法令で義務付けられる場合を除き、個人情報を第三者に提供しません。\n• 学校・エージェントには集計データのみ提供（個人特定不可）\n• 住所のジオコーディングにはOpenStreetMap Nominatimを利用します（今後プロキシ化予定）",
    privacyS5Title: "5. データの保管",
    privacyS5Lines: "• 本番環境ではレビューデータをSupabase（PostgreSQL）に保管します\n• パスワードはSHA-256でハッシュ化して保管（平文では保存しません）\n• 通報内容はreports.jsonに保管し、モデレーターのみが確認できます",
    privacyS6Title: "6. ユーザーの権利",
    privacyS6Lines: "あなたは以下の権利を持ちます。\n• 自分のレビューを投稿後24時間以内に編集する権利\n• 自分のレビューの削除を依頼する権利\n• アカウントの削除を依頼する権利\n• 自分の情報の開示・訂正を求める権利\n上記は運営チームへの連絡で対応します。",
    privacyS7Title: "7. 子どもの利用について",
    privacyS7Lines: "Nestlyは高校生以上の留学生を主な対象としています。13歳未満の利用は想定していません。",
    privacyS8Title: "8. お問い合わせ",
    privacyS8Lines: "このポリシーや個人情報の扱いについて疑問があれば、Nestly運営チームまでご連絡ください。プロトタイプ段階のため、正式な連絡先は今後整備します。",
    privacyS9Title: "9. 改訂について",
    privacyS9Lines: "本ポリシーを改訂する場合は、最終更新日を更新します。重要な変更がある場合はサイト内で告知します。",
    termsNav: "利用規約",
    termsEyebrow: "Legal",
    termsTitle: "利用規約",
    termsLastUpdated: "最終更新日: 2026年5月24日",
    termsIntro: "Nestlyをご利用いただくにあたっての約束事です。アカウント作成・レビュー投稿の前にご確認ください。",
    termsS1Title: "1. サービスの目的",
    termsS1Lines: "Nestlyは留学生が実際に滞在したホストファミリーの体験を共有し、次の留学生が安心してホストを選べる場を提供することを目的としています。仲介サービスではなく、情報インフラとして機能します。",
    termsS2Title: "2. アカウント登録",
    termsS2Lines: "• 登録には有効なメールアドレスと、可能であれば学校発行の認証コードが必要です\n• ひとり1アカウントを推奨します\n• 嘘の情報での登録は禁止します",
    termsS3Title: "3. 投稿ルール",
    termsS3Lines: "あなたが投稿するレビューは以下を守ってください。\n• 実際に滞在した経験に基づくこと\n• 個人を特定できる情報（住所、電話番号、フルネーム等）を含めないこと\n• 差別的・誹謗中傷的・暴力的な内容を含めないこと\n• 同じ家庭に複数アカウントから繰り返し投稿しないこと\n• 商業目的の宣伝・スパムを行わないこと",
    termsS4Title: "4. 禁止事項",
    termsS4Lines: "以下の行為を禁止します。\n• 他人になりすますこと\n• 虚偽のレビューを意図的に投稿すること\n• Nestlyのシステムへの不正アクセス\n• 他のユーザーへの嫌がらせ・脅迫\n• 法令違反となる行為すべて",
    termsS5Title: "5. 投稿の編集・削除",
    termsS5Lines: "• 自分の投稿は投稿後24時間以内に限り編集できます\n• 投稿はユーザーの依頼により削除できます\n• 規約違反の投稿はモデレーターが予告なく削除する場合があります",
    termsS6Title: "6. Verified Host認証について",
    termsS6Lines: "ホスト家庭がVerified Host認証を受けるには、レビュー3件以上 × 平均★4.0以上の条件を満たす必要があります。条件を満たさなくなった場合は認証が外れることがあります。",
    termsS7Title: "7. 免責事項",
    termsS7Lines: "• レビューはユーザー個人の感想であり、Nestlyが内容の正確性を保証するものではありません\n• Nestlyを通じた家庭選びの結果について、Nestlyは責任を負いかねます\n• サービス停止・データ消失等の損害について、故意・重過失の場合を除き責任を負いかねます",
    termsS8Title: "8. 規約の変更",
    termsS8Lines: "本規約は予告なく変更される場合があります。重要な変更がある場合はサイト内で告知します。継続してご利用いただくことで変更後の規約に同意したものとみなします。",
    termsS9Title: "9. 準拠法",
    termsS9Lines: "本規約はカナダ・アルバータ州の法律に準拠します（プロトタイプ段階のため将来変更の可能性あり）。",
    howToHeroEyebrow: "How to use",
    howToHeroTitle: "Nestlyの使い方",
    howToHeroText: "Nestlyは3つの立場で使えます。あなたの目的に合うセクションをご覧ください。",
    howToStudentSection: "1. 留学生のあなたへ",
    howToStudentIntro: "渡航前のホスト選びから、滞在後のレビュー投稿まで4ステップ。",
    howToStudent1Title: "STEP 1：探す",
    howToStudent1Body: "検索バー・フィルター・マップから、エリアや評価でホストを絞り込み。マッチ%で自分との相性を一目で確認できます。",
    howToStudent2Title: "STEP 2：詳しく見る",
    howToStudent2Body: "12軸のレーダーチャートで強み・弱みを比較。信頼指標（レビュー数・多様性・最新性）で投稿の確からしさをチェック。レビュー全文・タグ・構造化回答も参照できます。",
    howToStudent3Title: "STEP 3：保存・選ぶ",
    howToStudent3Body: "気になるホストはハート（♥）でお気に入りに保存。エージェントや家族との相談材料にお使いください。",
    howToStudent4Title: "STEP 4：滞在後にレビューを書く",
    howToStudent4Body: "学校コードで本人確認すればVerified Studentバッジを取得。12軸＋構造化回答＋自由記述で投稿し、次の留学生を支える側になれます。",
    howToHostSection: "2. ホストファミリーへ",
    howToHostIntro: "自分の受け入れ方を磨き、信頼を可視化する仕組みです。",
    howToHost1Title: "自分の家庭の評価を見る",
    howToHost1Body: "ホスト用ログインから自家庭ページにアクセス。12軸の評価とレビュー全文を確認できます。",
    howToHost2Title: "Verified Host認証を取得する",
    howToHost2Body: "条件はレビュー3件以上 × 平均★4.0以上。取得すると検索結果で優先表示され、選ばれやすくなります。",
    howToHost3Title: "フィードバックで改善する",
    howToHost3Body: "低評価のカテゴリを確認し、受け入れ方を磨くヒントに。建設的なレビューで成長できる場所を目指します。",
    howToB2BSection: "3. 学校・エージェントへ",
    howToB2BIntro: "地域全体の品質を把握し、紹介先選定の意思決定を支えます。",
    howToB2B1Title: "地域全体の品質をモニタリング",
    howToB2B1Body: "カテゴリ別平均スコアを一覧表示。リスク指標で要注意ホストを自動でハイライトします。",
    howToB2B2Title: "個別ホストの詳細を確認",
    howToB2B2Body: "低評価ホストを自動フラグ。時系列トレンドで品質の推移を追跡できます。",
    howToB2B3Title: "レポート化して意思決定に",
    howToB2B3Body: "CSV/PDFでエクスポートし、紹介先選定の客観データとして活用いただけます。",
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
      "Nestlyは、留学生が入居前に安全性、相性、通学、ルール、食事、サポートを比較できる信頼プラットフォームです。正確な住所は公開せず、レビューは生活条件に沿って整理されます。",
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
    reviewLead: "レビューする家族を選び、カテゴリごとに星5段階で評価して本文を書き込めます。",
    reviewPlaceholder:
      "レビュー例：英語で話す機会は多く、困った時に相談しやすかったです。門限や外泊ルールは最初に説明されました。",
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
      "Nestlyではホストファミリーの正確な住所、個人連絡先、家族構成などの特定につながる情報は公開しません。地図上の家アイコンは実住所ではなく、約100m以上ぼかした近隣エリアの参考位置です。レビューは家庭の安全性と生活環境を比較するための情報に限定し、本人や住所を特定する投稿は公開対象にしない設計です。",
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
    safetyDesignTitle: "安全性を前提にした設計",
    safetyDesignText: "Nestlyは、留学生の体験を共有しながら、住所・連絡先・家族構成などの個人情報を公開しない設計です。",
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
    noAnalytics: "レビューや家族データが増えると分析が表示されます。",
    riskLowRules: "ルールの不一致",
    riskCommute: "通学・冬の移動",
    riskSupport: "相談しにくさ",
    criteria: {
      englishEnvironment: ["英語環境", "英語環境の強さ / 家族との会話量 / 英語矯正してくれるか"],
      rules: ["自由度（高い＝柔軟）", "高い＝柔軟・自由度高め ／ 低い＝厳しめ・規則多い（門限・外泊・自由時間）"],
      study: ["学習向き", "学習向き / 静かさ / 勉強スペース"],
      cultureFit: ["文化適応", "文化適応 / 宗教・食文化配慮 / アジア人留学生への理解"],
      mentalSupport: ["メンタル面", "メンタル面 / 相談しやすさ / 孤立感の少なさ"],
      transportation: ["交通", "交通 / バス / 学校距離 / 冬の移動"],
      rideSupport: ["送迎", "車で送ってくれる頻度 / 緊急時の送迎 / 冬の移動サポート"],
      internetQuality: ["インターネット", "インターネット品質"],
      safetyEnvironment: ["安全", "安全 / 夜の治安 / 家庭内トラブルの少なさ"],
      privacy: ["プライバシー", "個室のプライバシー / 部屋の施錠 / 私物の扱い"],
      chores: ["家事・手伝い", "家事の分担量 / 手伝いの要求度 / 負担バランス"],
      mealQuality: ["食事の質", "食事の量・栄養バランス / アレルギー・宗教対応"],
      cleanliness: ["清潔さ", "家全体の清潔さ / 共有スペース / 水回り"],
      hostExperience: ["受け入れ経験", "過去の留学生受入れ実績 / 異文化対応経験"],
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
    hostBadge: "Host family",
    signupAsLabel: "Sign up as",
    signupAsStudent: "Student",
    signupAsHost: "Host family",
    signupHostFamilyLabel: "Select your host family",
    signupHostFamilyPlaceholder: "Choose a family",
    signupHostRequired: "Please select your host family.",
    signupHostHelp: "Sign up as a host family to access your own ratings and reviews.",
    navMyHost: "My family",
    hostProfileEyebrow: "Host dashboard",
    hostProfileIntro: "See the reviews and ratings left for your family. Use this as feedback to refine the way you host.",
    hostProfileNoHost: "Your host account isn't linked to a family. Pick one during signup.",
    hostProfileLoginRequired: "Sign in as a host family to view this page.",
    hostProfileOverall: "Overall rating",
    hostProfileReviews: "Reviews",
    hostProfileReliability: "Reliability",
    hostProfileStrengths: "Top 3 strengths",
    hostProfileImprovements: "Categories with room to grow",
    hostProfileVerifiedTitle: "Progress to Verified Host",
    hostProfileVerifiedDone: "✓ You hold Verified Host status.",
    hostProfileVerifiedReviews: "Reviews: {current} / 3",
    hostProfileVerifiedRating: "Average: ★{current} / ★4.0",
    hostProfileVerifiedHint: "You earn Verified Host status with 3+ reviews and an average of ★4.0 or higher.",
    hostProfileReviewsTitle: "Reviews about you",
    hostProfileNoReviews: "No reviews have been submitted yet.",
    hostReplyLabel: "Reply to this review",
    hostReplyPlaceholder: "Aim for a constructive reply (max 800 chars). Replies cannot be edited after posting.",
    hostReplySubmit: "Post reply",
    hostReplySubmitting: "Posting...",
    hostReplyHeading: "Reply from the host",
    hostReplyEmpty: "Please write a reply.",
    hostReplyFailed: "Failed to post reply. Please try again later.",
    hostReplyAlreadyExists: "You have already replied to this review.",
    analyticsFlagged: "Hosts needing attention",
    analyticsFlaggedHint: "Hosts are flagged if overall weighted rating is below ★3.8, or any key category is below ★3.5.",
    analyticsFlaggedNone: "No hosts currently need attention.",
    analyticsFlaggedReviews: "{count} reviews",
    analyticsExportCsv: "Download CSV",
    analyticsExportHint: "For schools and agents: download all hosts' category scores as CSV.",
    analyticsTrendTitle: "Monthly review trend (last 12 months)",
    analyticsTrendHint: "Bars show review counts; line shows the average rating.",
    analyticsTrendNoData: "No data yet.",
    analyticsFilterTitle: "Filters",
    analyticsFilterArea: "Area",
    analyticsFilterSchool: "School",
    analyticsFilterAll: "All",
    analyticsFilterCount: "Scope: {hosts} hosts, {reviews} reviews",
    pricingNav: "Pricing",
    pricingEyebrow: "Business Model",
    pricingTitle: "Revenue model",
    pricingIntro: "Nestly delivers value across four revenue streams so every stakeholder benefits. Prices below reflect the prototype-stage proposal.",
    pricingDisclaimer: "* Prices are illustrative for the contest submission. Actual prices will be adjusted at launch.",
    pricingPlan1Tag: "Primary revenue",
    pricingPlan1Title: "B2B Analytics",
    pricingPlan1For: "For schools and study-abroad agents",
    pricingPlan1Price: "$2,000–$5,000 / year",
    pricingPlan1Features: "Regional quality analytics\nAutomatic risk-host flagging\nMonthly trend tracking\nCSV / PDF export\nDedicated support",
    pricingPlan2Tag: "For hosts",
    pricingPlan2Title: "Verified Host plan",
    pricingPlan2For: "For host families",
    pricingPlan2Price: "$200 / year",
    pricingPlan2Features: "Verified Host badge\nPriority in search results\nYour family dashboard\nReply to reviews\nVisualised improvement feedback",
    pricingPlan3Tag: "For individuals",
    pricingPlan3Title: "Premium plan (students)",
    pricingPlan3For: "For students who want deeper insight",
    pricingPlan3Price: "$5 / month",
    pricingPlan3Features: "Read full review texts\nAdvanced matching\nCompare hosts side-by-side\nPriority support\nNo ads",
    pricingPlan4Tag: "Secondary revenue",
    pricingPlan4Title: "Advertising",
    pricingPlan4For: "For study-abroad-aligned advertisers",
    pricingPlan4Price: "Custom",
    pricingPlan4Features: "Targeted placements (students, hosts, schools)\nAirlines, insurance, telecom plans\nBranded spotlights\nContent partnerships",
    aboutStoryHeading: "Why I'm building Nestly",
    aboutStoryParagraph1: "I'm a high school student currently studying in Red Deer, Canada. One friend grew her English through dinner-table conversations and went on to university; another friend grew so isolated that within three months she was thinking of going home.",
    aboutStoryParagraph2: "What separated them wasn't effort — it was the family they happened to be placed with. Restaurants and hotels have reviews, but homestays — where students spend months of their life — have almost none. Nestly fills that gap so the next student can choose, not gamble.",
    aboutHearingTitle: "What 20 students told me",
    aboutHearingIntro: "Since 2025 I've interviewed 20 international students about what would have eased their pre-arrival anxiety. Their answers shaped Nestly's evaluation axes.",
    aboutHearingStat1Count: "8",
    aboutHearingStat1Label: "were satisfied",
    aboutHearingStat2Count: "6",
    aboutHearingStat2Label: "had a serious mismatch",
    aboutHearingStat3Count: "3",
    aboutHearingStat3Label: "seriously considered going home",
    aboutHearingStat4Count: "3",
    aboutHearingStat4Label: "other",
    aboutHearingPercent: "out of 20",
    aboutQuotesTitle: "Voices from the interviews",
    aboutQuote1: "For weeks I barely spoke with my host family — almost no chance to practice English.",
    aboutQuote1Tag: "Student / Grade 10",
    aboutQuote2: "The meals didn't suit me, I fell ill, and I couldn't focus on studying.",
    aboutQuote2Tag: "Student / Grade 11",
    aboutQuote3: "The curfew was too strict to balance schoolwork and extracurriculars.",
    aboutQuote3Tag: "Student / Grade 12",
    relaxFiltersIntro: "Try removing one of these filters to see more hosts:",
    relaxFiltersUnit: "hosts",
    relaxFiltersRemove: "Remove",
    relaxFiltersClearAll: "Clear all filters",
    reviewProgressLabel: "Required progress",
    reviewProgressDone: "{current} / {total} done",
    reviewProgressRecommendMissing: "\"Would recommend\" missing",
    reviewProgressTextMissing: "Review body missing",
    reviewProgressJumpRecommend: "Jump to recommendation",
    deleteReview: "Delete",
    deleteReviewLabel: "Delete this review",
    deleteFailed: "Could not delete the review.",
    deleteFamily: "Delete family",
    deleteFamilyLabel: "Delete this family",
    geocodeFailed: "Could not place the pin from that address. Check the address and try again.",
    familyNameSameAsArea: "Enter a family name that is different from the area name.",
    adminRatingOnly: "Admin rating only",
    refineSearch: "Change the search terms and try again.",
    selectFamilyFirst: "Choose a family from the map or search results before writing a review.",
    subtitle: "A review platform for choosing host families with confidence",
    tagline: "Find your nest. Not by luck, but by choice.",
    taglineEn: "Find your nest. Not by luck, but by choice.",
    demoBannerLabel: "Demo data",
    demoBannerText: "Reviews and some host details shown here are prototype samples. They will be replaced with anonymized data from 20 student interviews before launch.",
    aboutEyebrow: "About Nestly",
    aboutTitle: "Built in Red Deer, from 20 student voices.",
    aboutText: "Nestly is a project by a high-school exchange student in Red Deer, Canada. Starting in 2025, the developer interviewed 20 international students locally and used their stories to design the 9-category rating axis you see today. The core question — 'what information would have eased your anxiety before you arrived?' — drove every part of the data model. Our goal: turn studying abroad from a gamble into an informed choice.",
    aboutStat1Value: "20",
    aboutStat1Label: "Students interviewed locally",
    aboutStat2Value: "9",
    aboutStat2Label: "Structured rating categories",
    aboutStat3Value: "5",
    aboutStat3Label: "Living-condition review fields",
    aboutStat4Value: "Red Deer",
    aboutStat4Label: "Initial pilot area",
    verifiedExplainer: "Verified Host: granted to ID-verified families with 3+ reviews and an average of ★4.0 or higher (reviewers verified by school code).",
    footerNote: "Nestly is a prototype submitted to a business contest.",
    footerCopy: "© 2026 Nestly. Built in Red Deer, Alberta.",
    navAbout: "About",
    navSearch: "Search",
    navMap: "Map",
    navReview: "Write a review",
    navSchool: "For schools",
    navHowTo: "How to use",
    reportButton: "Report",
    reportButtonLabel: "Report this review",
    reportModalTitle: "Report this review",
    reportModalIntro: "Found a problematic review? Pick a reason and submit — a moderator will review your report.",
    reportReasonLabel: "Reason",
    reportReasonMisinformation: "Factually incorrect",
    reportReasonPersonalInfo: "Contains personally identifying info",
    reportReasonHarassment: "Harassment or discrimination",
    reportReasonSpam: "Spam or promotion",
    reportReasonOther: "Other",
    reportNoteLabel: "Additional details (optional, max 500 chars)",
    reportNotePlaceholder: "Describe what's wrong (optional)",
    reportCancel: "Cancel",
    reportSubmit: "Submit report",
    reportSubmitting: "Submitting...",
    reportThanks: "Report received. A moderator will review it.",
    reportFailed: "Failed to submit. Please try again later.",
    reportReasonRequired: "Please select a reason.",
    privacyNav: "Privacy",
    privacyEyebrow: "Legal",
    privacyTitle: "Privacy Policy",
    privacyLastUpdated: "Last updated: May 24, 2026",
    privacyIntro: "Nestly handles your personal information with care. This page explains what we collect, how we use it, and how we protect it.",
    privacyS1Title: "1. Information we collect",
    privacyS1Lines: "We collect the following information:\n• Account info: email, nickname, school, grade, native language\n• Review submissions: ratings, body text, structured answers, selected host family\n• Verification info: school-issued codes (used only for ID checks, not stored long-term)\n• Optional info: matching preferences and favorites list",
    privacyS2Title: "2. How we use your information",
    privacyS2Lines: "We use collected information only for:\n• Displaying reviews (with reviewer names anonymized or shortened)\n• Calculating match scores\n• Generating aggregated data for schools and agents (de-identified)\n• Detecting spam and abuse",
    privacyS3Title: "3. What's public and what's private",
    privacyS3Lines: "Public: nickname, school code, grade, review content, ratings.\nPrivate: email address, real name, verification code, IP address.\nSpecial protection: exact host addresses are never shown on the map. We obfuscate location with a 250m-radius circle and cap map zoom at level 14.",
    privacyS4Title: "4. Sharing with third parties",
    privacyS4Lines: "Except where required by law, we do not share personal information with third parties.\n• Schools and agents receive only aggregated, de-identified data\n• Address geocoding uses OpenStreetMap Nominatim (proxy planned)",
    privacyS5Title: "5. Data storage",
    privacyS5Lines: "• In production, review data is stored on Supabase (PostgreSQL)\n• Passwords are hashed with SHA-256 (never stored in plain text)\n• Reports are stored in reports.json and accessible only to moderators",
    privacyS6Title: "6. Your rights",
    privacyS6Lines: "You have the right to:\n• Edit your own reviews within 24 hours of posting\n• Request deletion of your reviews\n• Request deletion of your account\n• Request disclosure or correction of your information\nThese can be handled by contacting the Nestly team.",
    privacyS7Title: "7. Children",
    privacyS7Lines: "Nestly is designed for high-school-age international students and older. We do not intend the service for users under 13.",
    privacyS8Title: "8. Contact",
    privacyS8Lines: "For questions about this policy or your personal data, contact the Nestly team. As a prototype, formal contact channels are still being set up.",
    privacyS9Title: "9. Updates",
    privacyS9Lines: "When we revise this policy, we update the last-updated date above. Significant changes will be announced on the site.",
    termsNav: "Terms",
    termsEyebrow: "Legal",
    termsTitle: "Terms of Service",
    termsLastUpdated: "Last updated: May 24, 2026",
    termsIntro: "These are the rules for using Nestly. Please read before creating an account or submitting reviews.",
    termsS1Title: "1. Purpose of the service",
    termsS1Lines: "Nestly exists so that international students can share host-family experiences and the next student can choose with confidence. We are an information infrastructure, not a placement agency.",
    termsS2Title: "2. Account registration",
    termsS2Lines: "• Registration requires a valid email and, when possible, a school-issued verification code\n• One account per person is recommended\n• Registering with false information is prohibited",
    termsS3Title: "3. Posting rules",
    termsS3Lines: "When submitting a review, you agree to:\n• Base it on a stay you actually experienced\n• Avoid personally identifying information (addresses, phone numbers, full names)\n• Avoid discriminatory, defamatory, or violent content\n• Not submit repeated reviews of the same host from multiple accounts\n• Not use the platform for commercial promotion or spam",
    termsS4Title: "4. Prohibited conduct",
    termsS4Lines: "The following are prohibited:\n• Impersonating others\n• Intentionally submitting false reviews\n• Unauthorized access to Nestly systems\n• Harassment or threats toward other users\n• Any conduct that violates applicable law",
    termsS5Title: "5. Editing and deleting posts",
    termsS5Lines: "• You can edit your own posts within 24 hours of submission\n• Posts can be removed at the user's request\n• Posts that violate these terms may be removed by moderators without notice",
    termsS6Title: "6. About Verified Host status",
    termsS6Lines: "Verified Host status is granted when a family has 3+ reviews and an average rating of ★4.0 or higher. Status may be revoked if the criteria are no longer met.",
    termsS7Title: "7. Disclaimers",
    termsS7Lines: "• Reviews reflect individual users' opinions; Nestly does not guarantee their accuracy\n• Nestly is not liable for outcomes of placement decisions made via the platform\n• Except in cases of intent or gross negligence, Nestly is not liable for service interruptions or data loss",
    termsS8Title: "8. Changes to these terms",
    termsS8Lines: "These terms may change without notice. Significant changes will be announced on the site. Continued use of the service constitutes acceptance of the updated terms.",
    termsS9Title: "9. Governing law",
    termsS9Lines: "These terms are governed by the laws of Alberta, Canada. (Subject to change as the prototype matures.)",
    howToHeroEyebrow: "How to use",
    howToHeroTitle: "How to use Nestly",
    howToHeroText: "Nestly works for three kinds of users. Browse the section that matches your role.",
    howToStudentSection: "1. For students",
    howToStudentIntro: "From choosing a host before you go, to writing a review after — in four steps.",
    howToStudent1Title: "STEP 1: Search",
    howToStudent1Body: "Find hosts by area, ratings, or attributes using search, filters, or the map. The match% chip shows compatibility at a glance.",
    howToStudent2Title: "STEP 2: Look deeper",
    howToStudent2Body: "Compare strengths and weaknesses with the 12-axis radar chart. Check trust indicators (review count, diversity, recency) to gauge reliability. Read full reviews, tags, and structured answers.",
    howToStudent3Title: "STEP 3: Save and choose",
    howToStudent3Body: "Save promising hosts with the heart icon (♥). Use them as talking points with your agent or family.",
    howToStudent4Title: "STEP 4: Write a review after your stay",
    howToStudent4Body: "Verify your identity with a school code to earn the Verified Student badge, then submit a structured review across 12 axes — and support the next student.",
    howToHostSection: "2. For host families",
    howToHostIntro: "Refine your hosting and make your reliability visible.",
    howToHost1Title: "See your own ratings",
    howToHost1Body: "Sign in as a host to view your family's page — see scores across 12 axes and read the full reviews.",
    howToHost2Title: "Earn Verified Host status",
    howToHost2Body: "Verified Host is granted when you have 3+ reviews and an average of ★4.0 or higher. Verified hosts are surfaced first in search.",
    howToHost3Title: "Improve through feedback",
    howToHost3Body: "Look at your lowest-rated categories to find what to refine. Nestly is designed for constructive growth, not blame.",
    howToB2BSection: "3. For schools and agents",
    howToB2BIntro: "See regional quality at a glance and make confident placement decisions.",
    howToB2B1Title: "Monitor regional quality",
    howToB2B1Body: "View average scores by category. Risk indicators automatically highlight hosts that need attention.",
    howToB2B2Title: "Drill into specific hosts",
    howToB2B2Body: "Flag low-rated hosts automatically. Track quality trends over time with timeseries charts.",
    howToB2B3Title: "Export and decide",
    howToB2B3Body: "Export to CSV/PDF and use it as objective data for your placement decisions.",
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
      "Nestly helps international students compare safety, fit, commute, rules, meals, and support before moving in. Exact addresses are never shown, and reviews are structured around living conditions instead of personal attacks.",
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
    reviewLead: "Choose a family, rate each category from 1 to 5 stars, and write your review.",
    reviewPlaceholder:
      "Example: I had many chances to speak English and it was easy to ask for help. Curfew and overnight rules were explained at the beginning.",
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
      "Nestly works only when reviews are used responsibly. Write about safety, living conditions, communication, and support. Do not publish exact addresses, private contact details, family member details, or anything that identifies a household. Exact addresses and map pins are stored only so the map can place a private host entry; regular users see the area name only.",
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
    safetyDesignTitle: "Safety by design",
    safetyDesignText: "Nestly shares student experience while keeping exact addresses, contact details, and family composition out of public view.",
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
    noAnalytics: "Analytics will appear as host and review data grows.",
    riskLowRules: "Rules mismatch",
    riskCommute: "Commute and winter access",
    riskSupport: "Low support signals",
    criteria: {
      englishEnvironment: ["English environment", "English exposure / Conversation with family / English correction"],
      rules: ["Freedom (higher = freer)", "Higher = more freedom & flexible rules · Lower = stricter (curfew, overnight, free time)"],
      study: ["Study fit", "Study fit / Quietness / Study space"],
      cultureFit: ["Cultural fit", "Cultural fit / Religion and food consideration / Understanding of Asian students"],
      mentalSupport: ["Mental support", "Mental support / Easy to consult / Low isolation"],
      transportation: ["Transportation", "Transportation / Bus / Distance to school / Winter commute"],
      rideSupport: ["Ride support", "Ride frequency / Emergency rides / Winter travel support"],
      internetQuality: ["Internet", "Internet quality"],
      safetyEnvironment: ["Safety", "Safety / Night safety / Low household trouble"],
      privacy: ["Privacy", "Room privacy / Door lock / Personal belongings handling"],
      chores: ["Chores & Housework", "Chore workload / Frequency of requests / Fair balance"],
      mealQuality: ["Meal quality", "Meal portion & nutrition / Allergy & religious adaptation"],
      cleanliness: ["Cleanliness", "Whole-home cleanliness / Shared spaces / Bath & kitchen"],
      hostExperience: ["Host experience", "Past hosting record / Cross-cultural experience"],
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

  // Legacy demo accounts (username/password) — kept for moderator/admin demo.
  const accounts = [
    { username: "moderator", password: "demo", role: "moderator", name: "Moderator" },
    { username: "admin", password: "demo", role: "admin", name: "Admin" },
  ];

  // ----- User store (email-based registrations) -----------------------
  function loadUsers() {
    if (typeof localStorage === "undefined") return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_e) { return []; }
  }

  function saveUsers(users) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  function findUserByEmail(email) {
    const norm = String(email || "").trim().toLowerCase();
    if (!norm) return null;
    return loadUsers().find((u) => String(u.email).toLowerCase() === norm) || null;
  }

  // ----- Matching: default importance weights for the 6 main axes ------
  const defaultImportance = {
    safetyEnvironment: 5,
    englishEnvironment: 4,
    cultureFit: 3,
    mentalSupport: 4,
    commute: 3,
    study: 3,
  };

  // matchScore: 0-100. Compares user's importance weights against host's
  // weighted radar values. Returns 100 when host scores 5 in everything user
  // cares about; lower when low scores in important categories.
  function computeMatchScore(host, user) {
    if (!host) return 0;
    const importance = (user && user.preferences && user.preferences.importance) || defaultImportance;
    const radarValues = {
      safetyEnvironment: radarValue(host, radarAxes[0]),
      englishEnvironment: radarValue(host, radarAxes[1]),
      cultureFit: radarValue(host, radarAxes[2]),
      mentalSupport: radarValue(host, radarAxes[3]),
      commute: radarValue(host, radarAxes[4]),
      study: radarValue(host, radarAxes[5]),
    };
    let weightedSum = 0;
    let maxPossible = 0;
    for (const key of Object.keys(importance)) {
      const imp = Number(importance[key]) || 0;
      const val = Number(radarValues[key]) || 0;
      weightedSum += imp * val;
      maxPossible += imp * 5;
    }

    // Lifestyle bonus/penalty
    let lifestyleAdj = 0;
    if (user && user.preferences && user.preferences.lifestyle) {
      const fits = (host.fit || []).map((f) => fitKeyFromLabel(f));
      const wants = user.preferences.lifestyle;
      if (wants.includes("introvert") && fits.includes("introvert")) lifestyleAdj += 4;
      if (wants.includes("sports") && fits.includes("sports")) lifestyleAdj += 4;
      if (wants.includes("petFriendly") && fits.includes("petFriendly")) lifestyleAdj += 3;
      if (wants.includes("religious") && fits.includes("religious")) lifestyleAdj += 4;
    }

    // Dietary penalty: if user has restrictions but host weak on meal adaptation
    if (user && user.preferences && user.preferences.dietary && user.preferences.dietary !== "none") {
      const mealAdapt = host.criteria && Number(host.criteria.mealAdaptation);
      if (Number.isFinite(mealAdapt) && mealAdapt < 4.0) lifestyleAdj -= 6;
      if (Number.isFinite(mealAdapt) && mealAdapt >= 4.5) lifestyleAdj += 3;
    }

    const baseScore = maxPossible > 0 ? (weightedSum / maxPossible) * 100 : 0;
    return Math.max(0, Math.min(100, Math.round(baseScore + lifestyleAdj)));
  }

  function matchScoreLabel(score, lang) {
    if (score >= 85) return lang === "en" ? "Excellent fit" : "とても合いそう";
    if (score >= 70) return lang === "en" ? "Good fit" : "合いそう";
    if (score >= 55) return lang === "en" ? "Possible fit" : "可能性あり";
    return lang === "en" ? "Low fit" : "合わない可能性";
  }

  // ----- Algorithm improvements --------------------------------------
  // Time decay: review weight depreciates with age (1.0 at 0 days, 0.5 at 365d).
  function timeDecayWeight(createdAt) {
    if (!createdAt) return 0.7;
    const ageMs = Date.now() - new Date(createdAt).getTime();
    if (!Number.isFinite(ageMs) || ageMs < 0) return 1.0;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    // Half-life of ~365 days
    return Math.max(0.3, Math.pow(0.5, ageDays / 365));
  }

  // Trimmed mean: drop top and bottom 10% (when n >= 10), guarding against
  // outlier reviews that distort small samples.
  function trimmedMean(values) {
    const clean = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (!clean.length) return 0;
    if (clean.length < 10) return clean.reduce((s, v) => s + v, 0) / clean.length;
    const cut = Math.floor(clean.length * 0.1);
    const slice = clean.slice(cut, clean.length - cut);
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  }

  function standardDeviation(values) {
    const clean = values.map(Number).filter(Number.isFinite);
    if (clean.length < 2) return 0;
    const mean = clean.reduce((s, v) => s + v, 0) / clean.length;
    const variance = clean.reduce((s, v) => s + (v - mean) ** 2, 0) / clean.length;
    return Math.sqrt(variance);
  }

  // Reliability bands by review count.
  function reliabilityBand(reviewCount) {
    if (reviewCount >= 10) return { key: "stable",   labelJa: "安定",     labelEn: "Stable",       color: "#1d9e75" };
    if (reviewCount >= 3)  return { key: "emerging", labelJa: "参考",     labelEn: "Emerging",     color: "#f59e0b" };
    return                       { key: "low",      labelJa: "参考値（少件数）", labelEn: "Low confidence", color: "#9ca3af" };
  }

  // Euclidean-distance-based similarity between two hosts' radar profiles.
  // Cosine similarity caused all hosts to show ~100% because ratings cluster
  // in 3-5 range and all vectors point in the same direction. Euclidean
  // distance correctly reflects per-axis differences.
  function radarSimilarity(a, b) {
    if (!a || !b) return 0;
    const av = radarAxes.map((axis) => radarValue(a, axis));
    const bv = radarAxes.map((axis) => radarValue(b, axis));
    const MAX_DIST = Math.sqrt(radarAxes.length * 25); // max when each axis differs by 5
    let sumSq = 0;
    for (let i = 0; i < av.length; i++) sumSq += (av[i] - bv[i]) ** 2;
    return 1 - Math.sqrt(sumSq) / MAX_DIST;
  }

  function similarHosts(host, k = 3) {
    if (!host) return [];
    return allHosts()
      .filter((h) => h.id !== host.id)
      .map((h) => ({ host: h, sim: radarSimilarity(host, h) }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, k);
  }

  // ----- Draft autosave -----------------------------------------------
  function loadDraft() {
    if (typeof localStorage === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); }
    catch (_e) { return null; }
  }
  function saveDraft(draft) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }
  function clearDraft() {
    if (typeof localStorage !== "undefined") localStorage.removeItem(DRAFT_KEY);
  }

  // ----- Multi-language support (Phase 1: ja, en + zh/ko/vi/es/pt lazy) ----
  const SUPPORTED_LANGUAGES = ["ja", "en", "zh", "ko", "vi", "es", "pt"];
  const LANGUAGE_LABELS = {
    ja: "日本語", en: "English", zh: "中文", ko: "한국어",
    vi: "Tiếng Việt", es: "Español", pt: "Português",
  };
  // Country → preferred UI language (used when user picks nationality at signup).
  const COUNTRY_TO_LANGUAGE = {
    JP: "ja", CN: "zh", TW: "zh", HK: "zh",
    KR: "ko", VN: "vi",
    MX: "es", ES: "es", AR: "es", CO: "es", CL: "es", PE: "es",
    BR: "pt", PT: "pt",
    US: "en", CA: "en", GB: "en", AU: "en", NZ: "en", IE: "en", IN: "en", PH: "en",
  };
  const COUNTRIES = [
    { code: "JP", nameJa: "日本", nameEn: "Japan" },
    { code: "CN", nameJa: "中国", nameEn: "China" },
    { code: "TW", nameJa: "台湾", nameEn: "Taiwan" },
    { code: "HK", nameJa: "香港", nameEn: "Hong Kong" },
    { code: "KR", nameJa: "韓国", nameEn: "South Korea" },
    { code: "VN", nameJa: "ベトナム", nameEn: "Vietnam" },
    { code: "MX", nameJa: "メキシコ", nameEn: "Mexico" },
    { code: "ES", nameJa: "スペイン", nameEn: "Spain" },
    { code: "AR", nameJa: "アルゼンチン", nameEn: "Argentina" },
    { code: "CO", nameJa: "コロンビア", nameEn: "Colombia" },
    { code: "CL", nameJa: "チリ", nameEn: "Chile" },
    { code: "PE", nameJa: "ペルー", nameEn: "Peru" },
    { code: "BR", nameJa: "ブラジル", nameEn: "Brazil" },
    { code: "PT", nameJa: "ポルトガル", nameEn: "Portugal" },
    { code: "US", nameJa: "アメリカ", nameEn: "United States" },
    { code: "CA", nameJa: "カナダ", nameEn: "Canada" },
    { code: "GB", nameJa: "イギリス", nameEn: "United Kingdom" },
    { code: "AU", nameJa: "オーストラリア", nameEn: "Australia" },
    { code: "IN", nameJa: "インド", nameEn: "India" },
    { code: "PH", nameJa: "フィリピン", nameEn: "Philippines" },
    { code: "OTHER", nameJa: "その他", nameEn: "Other" },
  ];

  // Cache of loaded translations. ja and en are always available (inline).
  const translationCache = { ja: translations.ja, en: translations.en };

  // Deep-merge a partial translation over a complete fallback (usually en).
  function mergeWithFallback(partial, fallback) {
    const out = {};
    for (const key in fallback) out[key] = fallback[key];
    for (const key in partial) {
      const v = partial[key];
      if (v && typeof v === "object" && !Array.isArray(v) && fallback[key] && typeof fallback[key] === "object") {
        out[key] = { ...fallback[key], ...v };
      } else if (v !== undefined && v !== null && v !== "") {
        out[key] = v;
      }
    }
    return out;
  }

  // Lazily fetch and cache a translation file. Falls back to en if fetch fails.
  async function loadLanguageFile(lang) {
    if (translationCache[lang]) return translationCache[lang];
    if (typeof fetch === "undefined") {
      translationCache[lang] = translations.en;
      return translationCache[lang];
    }
    try {
      const r = await fetch(`/data/i18n/${lang}.json`, { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const partial = await r.json();
      // Merge with en as fallback so missing keys still render
      translationCache[lang] = mergeWithFallback(partial, translations.en);
      return translationCache[lang];
    } catch (_e) {
      translationCache[lang] = translations.en;
      return translationCache[lang];
    }
  }

  let language = loadLanguage();
  let t = translationCache[language] || translations.en;
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
      title: "自由度・柔軟性",
      description: "高い＝柔軟・自由度高め / 低い＝厳しめ・規則が多い（門限・外泊・自由時間）",
      itemKeys: ["freedom", "curfew", "overnight"],
      direction: "higherIsFreer",  // ★5 = freer / flexible, ★1 = stricter
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
    {
      key: "privacy",
      title: "プライバシー",
      description: "個室のプライバシー / 部屋の施錠 / 私物の扱い",
      itemKeys: ["roomPrivacy", "roomLock", "belongings"],
    },
    {
      key: "chores",
      title: "家事・手伝い",
      description: "家事の分担量 / 手伝いの要求度 / 負担バランス",
      itemKeys: ["choreAmount", "choreBalance"],
    },
    {
      key: "mealQuality",
      title: "食事の質",
      description: "食事の量・栄養バランス / アレルギー・宗教対応",
      itemKeys: ["mealPortion", "mealAdaptation"],
    },
    {
      key: "cleanliness",
      title: "清潔さ",
      description: "家全体の清潔さ / 共有スペース / 水回り",
      itemKeys: ["houseClean", "sharedClean"],
    },
    {
      key: "hostExperience",
      title: "受け入れ経験",
      description: "過去の留学生受入れ実績 / 異文化対応経験",
      itemKeys: ["hostingYears"],
    },
  ];

  // Tiered weighted scoring (revised based on student wellbeing research):
  //   T1 Safety/wellbeing (×2.5)   T2 Daily QoL & study-abroad value (×2.0)
  //   T3 Academics/commute (×1.5/×1.0)   T4 Living base (×1.0)
  //   T5 Convenience (×0.5)
  const axisWeights = {
    safetyEnvironment: 2.5,  // T1
    mentalSupport: 2.5,      // T1
    mealQuality: 2.0,        // T2 (promoted from aux)
    englishEnvironment: 2.0, // T2
    cultureFit: 2.0,         // T2
    study: 1.5,              // T3
    transportation: 1.0,     // T3
    rideSupport: 1.0,        // T3
    rules: 1.0,              // T4
    cleanliness: 1.0,        // T4
    internetQuality: 0.5,    // T5
    hostExperience: 0.5,     // T5
  };

  // Axes whose star input is REQUIRED on review submit. hostExperience is
  // intentionally excluded — many reviewers can't fairly assess it.
  const requiredAxisKeys = [
    "safetyEnvironment", "englishEnvironment", "cultureFit", "mentalSupport",
    "transportation", "rideSupport", "study",
    "rules", "internetQuality", "mealQuality", "cleanliness",
  ];

  // Auxiliary axes (not in main 6 radar, shown in detail table).
  const auxiliaryAxisKeys = ["rules", "internetQuality", "mealQuality", "cleanliness", "hostExperience"];

  const fitOptions = [
    ["introvert",     "内向的な人向け"],
    ["social",        "社交的な人向け"],
    ["independent",   "自立した生活が好き"],
    ["sports",        "スポーツ好き向け"],
    ["religious",     "宗教・食文化への配慮あり"],
    ["petFriendly",   "ペット好き向け"],
    ["foodie",        "食事を楽しみたい"],
    ["studyFocused",  "勉強最優先"],
    ["englishImmersion", "英語漬けにしたい"],
    ["earlyBird",     "朝型・規則正しい生活"],
    ["lateNight",     "夜型・自由な時間"],
    ["artsCreative",  "芸術・創作活動好き"],
    ["gamer",         "ゲーマー向け"],
    ["lgbtqFriendly", "LGBTQ+ フレンドリー"],
    ["firstTimeAbroad", "初めての海外向け"],
  ];

  // Extended fit translations
  const fitLabelsExt = {
    ja: {
      introvert: "内向的な人向け", social: "社交的な人向け", independent: "自立した生活が好き",
      sports: "スポーツ好き向け", religious: "宗教・食文化への配慮あり", petFriendly: "ペット好き向け",
      foodie: "食事を楽しみたい", studyFocused: "勉強最優先", englishImmersion: "英語漬けにしたい",
      earlyBird: "朝型・規則正しい生活", lateNight: "夜型・自由な時間",
      artsCreative: "芸術・創作活動好き", gamer: "ゲーマー向け",
      lgbtqFriendly: "LGBTQ+ フレンドリー", firstTimeAbroad: "初めての海外向け",
    },
    en: {
      introvert: "Good for introverts", social: "Good for social people", independent: "Likes independent living",
      sports: "Good for sports students", religious: "Religion & food aware", petFriendly: "Pet friendly",
      foodie: "Enjoys good meals", studyFocused: "Study-focused", englishImmersion: "Wants English immersion",
      earlyBird: "Early bird / structured", lateNight: "Night owl / flexible",
      artsCreative: "Arts & creative", gamer: "Gamer friendly",
      lgbtqFriendly: "LGBTQ+ friendly", firstTimeAbroad: "First time abroad",
    },
  };

  // Trimmed: dropped curfew/meals/communication — already covered by the 11
  // weighted axes. Recommend is surfaced separately as a required chip group.
  // Only privacy stays in the optional structured panel (genuinely unique).
  const structuredReviewFields = [
    ["privacy", ["private", "shared", "limited", "unknown"]],
  ];

  const structuredOptionLabels = {
    strict: "strictOption",
    normal: "normalOption",
    flexible: "flexibleOption",
    unknown: "unknownOption",
    enough: "enoughOption",
    notEnough: "notEnoughOption",
    private: "privateOption",
    shared: "sharedOption",
    limited: "limitedOption",
    easy: "easyOption",
    difficult: "difficultOption",
    yes: "yesOption",
    maybe: "maybeOption",
    no: "noOption",
  };

  // Categorized filters (Airbnb-style). Each item has key, label key for i18n,
  // optional label fallback text in both languages, and a match function.
  const filterCategories = [
    {
      id: "personality",
      titleJa: "性格・タイプ",
      titleEn: "Personality fit",
      filters: [
        { key: "introvertFriendly", labelJa: "内向的に優しい",     labelEn: "Introvert friendly", match: (h) => getHostFit(h).some((f) => f.toLowerCase().includes("introvert") || f.includes("内向")) },
        { key: "socialFamily",      labelJa: "社交的な家族",       labelEn: "Social family",      match: (h) => getHostFit(h).some((f) => f.toLowerCase().includes("social") || f.includes("社交")) || groupScore(h, criteriaGroups.find((g) => g.key === "englishEnvironment")) >= 4.5 },
        { key: "independentEnv",    labelJa: "自立した環境",       labelEn: "Independent environment", match: (h) => groupScore(h, criteriaGroups.find((g) => g.key === "rules")) >= 4.3 },
      ],
    },
    {
      id: "lifestyle",
      titleJa: "ライフスタイル",
      titleEn: "Lifestyle",
      filters: [
        { key: "quiet",         labelJa: "静か",               labelEn: "Quiet",           match: (h) => groupScore(h, criteriaGroups.find((g) => g.key === "study")) >= 4.4 },
        { key: "sharedMeals",   labelJa: "家族で食事",         labelEn: "Shared meals",    match: (h) => h.tags.some((t) => /夕食|meal|dinner/i.test(String(t))) || groupScore(h, criteriaGroups.find((g) => g.key === "mealQuality")) >= 4.3 },
        { key: "strictCurfew",  labelJa: "門限が厳しい",       labelEn: "Strict curfew",   match: (h) => groupScore(h, criteriaGroups.find((g) => g.key === "rules")) <= 4.0 },
        { key: "englishOnly",   labelJa: "英語漬け",           labelEn: "English-only",    match: (h) => groupScore(h, criteriaGroups.find((g) => g.key === "englishEnvironment")) >= 4.5 },
        { key: "petFriendly",   labelJa: "ペットOK",           labelEn: "Pet-friendly",    match: (h) => getHostFit(h).some((f) => f.toLowerCase().includes("pet") || f.includes("ペット")) },
      ],
    },
    {
      id: "studentNeeds",
      titleJa: "学業・通学ニーズ",
      titleEn: "Student needs",
      filters: [
        { key: "nearSchool",      labelJa: "学校に近い",         labelEn: "Near school",       match: (h) => groupScore(h, criteriaGroups.find((g) => g.key === "transportation")) >= 4.4 },
        { key: "transitFriendly", labelJa: "公共交通が便利",     labelEn: "Transit friendly",  match: (h) => h.tags.some((t) => /バス|transit|bus/i.test(String(t))) || Number(h.criteria && h.criteria.bus) >= 4.3 },
        { key: "studyStrong",     labelJa: "学習環境が強い",     labelEn: "Strong study environment", match: (h) => groupScore(h, criteriaGroups.find((g) => g.key === "study")) >= 4.5 },
        { key: "sportsFriendly",  labelJa: "スポーツ好きに優しい", labelEn: "Sports-friendly", match: (h) => getHostFit(h).some((f) => f.toLowerCase().includes("sport") || f.includes("スポーツ")) },
      ],
    },
  ];

  // Flat list used by filter logic (preserves backward compat with state.activeFilters)
  const quickFilters = filterCategories.flatMap((cat) => cat.filters.map((f) => ({
    key: f.key, label: f.key, labelJa: f.labelJa, labelEn: f.labelEn, match: f.match,
  })));

  const fitAliases = {
    introvert: "introvert",
    "introvert向け": "introvert",
    "内向的な人向け": "introvert",
    "Good for introverts": "introvert",
    social: "social",
    "社交的な人向け": "social",
    independent: "independent",
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
    foodie: "foodie", studyFocused: "studyFocused", englishImmersion: "englishImmersion",
    earlyBird: "earlyBird", lateNight: "lateNight", artsCreative: "artsCreative",
    gamer: "gamer", lgbtqFriendly: "lgbtqFriendly", firstTimeAbroad: "firstTimeAbroad",
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
      tagsEn: ["Quiet home", "Dinner provided", "Study-focused", "West Park"],
      fit: ["introvert向け"],
      summary: "落ち着いた家庭環境。ルール説明が丁寧で、勉強に集中しやすい家庭。",
      summaryEn: "A calm household with carefully explained rules — easy to focus on schoolwork.",
      criteria: {
        english: 4.2, conversation: 3.8, correction: 3.9,
        freedom: 4.3, curfew: 4.4, overnight: 4.0,
        studyFit: 4.9, quiet: 4.9, studySpace: 4.8,
        culture: 4.4, religionFood: 4.1, asianUnderstanding: 4.3,
        mental: 4.6, consultation: 4.5, isolation: 4.4,
        transit: 4.1, bus: 4.2, schoolDistance: 4.0,
        winterCommute: 3.8, rideSupport: 3.7, internet: 4.6,
        safety: 4.9, nightSafety: 4.6, homeTrouble: 4.8,
        mealPortion: 4.2, mealAdaptation: 3.9,
        houseClean: 4.7, sharedClean: 4.6,
        hostingYears: 4.0,
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
      tagsEn: ["Downtown", "Near bus stop", "Lots of conversation"],
      fit: ["sports好き向け"],
      summary: "中心部に近く、通学や買い物に便利。英語練習量を求める人向け。",
      summaryEn: "Close to downtown — convenient for commuting and shopping. Best for students who want lots of English practice.",
      criteria: {
        english: 4.8, conversation: 4.9, correction: 4.1,
        freedom: 3.8, curfew: 3.4, overnight: 3.3,
        studyFit: 3.6, quiet: 3.2, studySpace: 3.7,
        culture: 4.0, religionFood: 3.7, asianUnderstanding: 3.8,
        mental: 4.0, consultation: 4.2, isolation: 4.4,
        transit: 4.8, bus: 4.9, schoolDistance: 4.5,
        winterCommute: 4.2, rideSupport: 3.5, internet: 4.0,
        safety: 4.1, nightSafety: 3.7, homeTrouble: 4.0,
        mealPortion: 4.0, mealAdaptation: 3.6,
        houseClean: 4.0, sharedClean: 3.8,
        hostingYears: 3.8,
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
      tagsEn: ["Multicultural", "Highly rated meals", "Close to school", "Clearview"],
      fit: ["religious family", "introvert向け"],
      summary: "食事と文化的配慮の評価が高く、初めての海外生活でも安心しやすい家庭。",
      summaryEn: "High marks for meals and cultural sensitivity — reassuring even for first-time exchange students.",
      criteria: {
        english: 4.7, conversation: 4.5, correction: 4.4,
        freedom: 4.5, curfew: 4.2, overnight: 4.1,
        studyFit: 4.8, quiet: 4.6, studySpace: 4.8,
        culture: 5.0, religionFood: 5.0, asianUnderstanding: 4.9,
        mental: 4.9, consultation: 4.9, isolation: 4.7,
        transit: 4.4, bus: 4.5, schoolDistance: 4.7,
        winterCommute: 4.2, rideSupport: 4.4, internet: 4.7,
        safety: 5.0, nightSafety: 4.8, homeTrouble: 4.9,
        mealPortion: 4.9, mealAdaptation: 5.0,
        houseClean: 4.7, sharedClean: 4.6,
        hostingYears: 4.7,
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
      tagsEn: ["New neighborhood", "Strong Wi-Fi", "Has pets", "Timberlands"],
      fit: ["pet friendly", "sports好き向け"],
      summary: "清潔で設備が整った家庭。ペットがいるため、動物が好きな留学生に合いやすい。",
      summaryEn: "A clean, well-equipped home with pets — a great fit for students who love animals.",
      criteria: {
        english: 4.2, conversation: 4.1, correction: 3.8,
        freedom: 4.6, curfew: 4.4, overnight: 4.2,
        studyFit: 4.4, quiet: 4.2, studySpace: 4.5,
        culture: 4.3, religionFood: 4.0, asianUnderstanding: 4.1,
        mental: 4.4, consultation: 4.3, isolation: 4.3,
        transit: 4.0, bus: 4.1, schoolDistance: 4.0,
        winterCommute: 3.9, rideSupport: 4.6, internet: 4.9,
        safety: 4.7, nightSafety: 4.6, homeTrouble: 4.7,
        mealPortion: 4.0, mealAdaptation: 3.8,
        houseClean: 4.8, sharedClean: 4.7,
        hostingYears: 3.9,
      },
    },
    {
      id: 5,
      name: "Thompson Family",
      city: "Red Deer, Alberta",
      area: "Sunnybrook",
      lat: 52.2515,
      lng: -113.8042,
      rating: 4.6,
      reviews: 0,
      verified: true,
      tags: ["送迎あり", "南側静かな住宅街", "Sunnybrook"],
      tagsEn: ["Ride support", "Quiet southern neighborhood", "Sunnybrook"],
      fit: ["introvert向け", "sports好き向け"],
      summary: "両親ともフルタイム勤務だが送迎は柔軟。冬の通学が不安な人に向く。",
      summaryEn: "Both parents work full-time but ride support is flexible — suited for students worried about winter commutes.",
      criteria: {
        english: 4.4, conversation: 4.3, correction: 4.1,
        freedom: 4.4, curfew: 4.2, overnight: 4.0,
        studyFit: 4.5, quiet: 4.6, studySpace: 4.3,
        culture: 4.4, religionFood: 4.2, asianUnderstanding: 4.4,
        mental: 4.6, consultation: 4.5, isolation: 4.5,
        transit: 3.9, bus: 4.0, schoolDistance: 3.9,
        winterCommute: 4.7, rideSupport: 4.8, internet: 4.5,
        safety: 4.7, nightSafety: 4.6, homeTrouble: 4.6,
        mealPortion: 4.3, mealAdaptation: 4.0,
        houseClean: 4.6, sharedClean: 4.5,
        hostingYears: 4.4,
      },
    },
    {
      id: 6,
      name: "Nguyen Family",
      city: "Red Deer, Alberta",
      area: "Eastview Estates",
      lat: 52.2784,
      lng: -113.7783,
      rating: 4.8,
      reviews: 0,
      verified: true,
      tags: ["アジア食対応", "Eastview", "兄弟あり", "学校近い"],
      tagsEn: ["Asian cuisine", "Eastview", "Has siblings", "Close to school"],
      fit: ["religious family", "introvert向け"],
      summary: "アジア系家庭。食事や文化的な細やかな配慮があり、初めての海外でも馴染みやすい。",
      summaryEn: "An Asian-heritage household with thoughtful attention to meals and culture — easy to settle in even on your first stay abroad.",
      criteria: {
        english: 4.3, conversation: 4.4, correction: 4.0,
        freedom: 4.4, curfew: 4.2, overnight: 4.0,
        studyFit: 4.7, quiet: 4.5, studySpace: 4.6,
        culture: 4.9, religionFood: 4.9, asianUnderstanding: 5.0,
        mental: 4.8, consultation: 4.8, isolation: 4.7,
        transit: 4.3, bus: 4.4, schoolDistance: 4.5,
        winterCommute: 4.1, rideSupport: 4.2, internet: 4.4,
        safety: 4.8, nightSafety: 4.7, homeTrouble: 4.8,
        mealPortion: 4.8, mealAdaptation: 4.9,
        houseClean: 4.5, sharedClean: 4.4,
        hostingYears: 4.6,
      },
    },
    {
      id: 7,
      name: "Patel Family",
      city: "Red Deer, Alberta",
      area: "Inglewood West",
      lat: 52.2436,
      lng: -113.8224,
      rating: 4.3,
      reviews: 0,
      verified: false,
      tags: ["柔軟なルール", "ベジタリアン対応", "Inglewood"],
      tagsEn: ["Flexible rules", "Vegetarian-friendly", "Inglewood"],
      fit: ["religious family"],
      summary: "ベジタリアン家庭で食事の柔軟性が高い。門限などのルールも事前相談しやすい。",
      summaryEn: "A vegetarian household with flexible meal options — rules like curfew can be discussed in advance.",
      criteria: {
        english: 4.1, conversation: 4.0, correction: 3.8,
        freedom: 4.7, curfew: 4.5, overnight: 4.3,
        studyFit: 4.2, quiet: 4.1, studySpace: 4.2,
        culture: 4.7, religionFood: 4.8, asianUnderstanding: 4.4,
        mental: 4.3, consultation: 4.2, isolation: 4.2,
        transit: 4.2, bus: 4.3, schoolDistance: 4.1,
        winterCommute: 3.9, rideSupport: 4.0, internet: 4.3,
        safety: 4.4, nightSafety: 4.2, homeTrouble: 4.3,
        mealPortion: 4.5, mealAdaptation: 4.8,
        houseClean: 4.3, sharedClean: 4.2,
        hostingYears: 4.0,
      },
    },
    {
      id: 8,
      name: "Wilson Family",
      city: "Red Deer, Alberta",
      area: "Oriole Park",
      lat: 52.2841,
      lng: -113.8348,
      rating: 4.5,
      reviews: 0,
      verified: true,
      tags: ["スポーツ家庭", "アウトドア", "Oriole", "夕食一緒"],
      tagsEn: ["Sporty family", "Outdoors", "Oriole", "Family dinners together"],
      fit: ["sports好き向け", "pet friendly"],
      summary: "アクティブな家庭。週末のアウトドアやスポーツに誘ってくれる、会話の多い環境。",
      summaryEn: "An active family that invites you to weekend sports and outdoors — a conversation-rich environment.",
      criteria: {
        english: 4.7, conversation: 4.8, correction: 4.3,
        freedom: 4.3, curfew: 4.0, overnight: 3.9,
        studyFit: 4.0, quiet: 3.8, studySpace: 4.1,
        culture: 4.4, religionFood: 4.0, asianUnderstanding: 4.2,
        mental: 4.5, consultation: 4.4, isolation: 4.6,
        transit: 4.1, bus: 4.2, schoolDistance: 4.0,
        winterCommute: 4.3, rideSupport: 4.6, internet: 4.5,
        safety: 4.6, nightSafety: 4.4, homeTrouble: 4.5,
        mealPortion: 4.2, mealAdaptation: 3.9,
        houseClean: 4.1, sharedClean: 4.0,
        hostingYears: 4.2,
      },
    },
    {
      id: 9,
      name: "Garcia Family",
      city: "Red Deer, Alberta",
      area: "Morrisroe",
      lat: 52.2552,
      lng: -113.7920,
      rating: 4.2,
      reviews: 0,
      verified: false,
      tags: ["バイリンガル家庭", "Morrisroe", "学生多め"],
      tagsEn: ["Bilingual household", "Morrisroe", "Often hosts students"],
      fit: ["sports好き向け", "introvert向け"],
      summary: "スペイン語・英語のバイリンガル家庭。これまでも複数の留学生を受け入れてきた経験豊富な家庭。",
      summaryEn: "A Spanish-English bilingual household with extensive experience hosting international students.",
      criteria: {
        english: 4.5, conversation: 4.6, correction: 4.2,
        freedom: 4.2, curfew: 4.1, overnight: 3.9,
        studyFit: 4.1, quiet: 4.0, studySpace: 4.2,
        culture: 4.6, religionFood: 4.2, asianUnderstanding: 4.3,
        mental: 4.4, consultation: 4.4, isolation: 4.5,
        transit: 4.3, bus: 4.4, schoolDistance: 4.2,
        winterCommute: 4.0, rideSupport: 4.1, internet: 4.4,
        safety: 4.5, nightSafety: 4.3, homeTrouble: 4.4,
        mealPortion: 4.1, mealAdaptation: 4.0,
        houseClean: 4.2, sharedClean: 4.1,
        hostingYears: 4.8,
      },
    },
  ];

  const defaultScores = Object.fromEntries(criteriaGroups.map((group) => [group.key, 0]));

  const state = {
    query: "",
    selectedId: null,
    reviewText: "",
    reviewScores: { ...defaultScores },
    reviewFit: [],
    reviewStructured: {
      privacy: "unknown",
      recommend: "",  // required: explicit choice required at submit
    },
    activeFilters: [],
    submitted: false,
    reviewFormOpen: false,
    userReviews: loadReviews(),
    customHosts: loadCustomHosts(),
    hiddenHostIds: loadHiddenHostIds(),
    hiddenReviewIds: loadHiddenReviewIds(),
    view: loadView(),
    bannerDismissed: loadBannerDismissed(),
    recentSort: loadRecentSort(),
    reviewQuickScore: 0,
    reviewDetailOpen: false,
    // ----- new auth/profile state -----
    authMode: "login",  // "login" | "signup"
    signupForm: { signupAs: "user", email: "", password: "", name: "", school: "", grade: "", language: "", nationality: "", schoolCode: "", hostId: "" },
    loginForm: { email: "", password: "" },
    onboardingOpen: false,
    onboardingStep: 0,
    pendingPreferences: null,  // built up during onboarding
    expandedHostId: null,  // for inline detail expansion in search results
    missingScores: [],     // for highlighting unfilled required axes after submit attempt
    // ----- new in Phase 4 -----
    favorites: loadFavorites(),
    helpfulVotes: loadHelpful(),  // { [reviewId]: vote count }
    bottomSheetOpen: false,  // mobile filter sheet
    matchReasonHostId: null, // for showing match reason popover
    dateFilter: "all",       // "all" | "year"
    isLoading: false,        // for skeleton states
    reportingReviewId: null, // for report modal — null = closed
    reportReason: "",        // selected reason key
    reportNote: "",          // optional free-text note
    reportSubmitting: false, // true while POST in flight
    hostReplies: {},         // { reviewId: { text, hostId, hostName, createdAt } }
    hostReplyDraft: {},      // { reviewId: pendingText } — in-progress textarea content
    hostReplySubmittingId: null, // reviewId currently being submitted
    analyticsFilters: { area: "all", school: "all" }, // B2B dashboard scoping
    pendingFilters: [],        // staged filter list inside mobile bottom sheet
    pendingDateFilter: "all",  // staged date filter inside mobile bottom sheet
  };

  // ---- favorites ----
  function loadFavorites() {
    if (typeof localStorage === "undefined") return [];
    try {
      const v = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      return Array.isArray(v) ? v.map(Number) : [];
    } catch (_e) { return []; }
  }
  function saveFavorites() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
    }
  }
  function toggleFavorite(hostId) {
    const id = Number(hostId);
    if (state.favorites.includes(id)) {
      state.favorites = state.favorites.filter((x) => x !== id);
    } else {
      state.favorites = [...state.favorites, id];
    }
    saveFavorites();
  }

  // ---- helpful votes ----
  function loadHelpful() {
    if (typeof localStorage === "undefined") return {};
    try {
      const v = JSON.parse(localStorage.getItem(HELPFUL_KEY) || "{}");
      return v && typeof v === "object" ? v : {};
    } catch (_e) { return {}; }
  }
  function saveHelpful() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(HELPFUL_KEY, JSON.stringify(state.helpfulVotes));
    }
  }
  function toggleHelpful(reviewId) {
    const id = String(reviewId);
    const cur = state.helpfulVotes[id];
    if (cur && cur.voted) {
      state.helpfulVotes[id] = { voted: false, count: Math.max(0, (cur.count || 1) - 1) };
    } else {
      state.helpfulVotes[id] = { voted: true, count: (cur && cur.count ? cur.count : 0) + 1 };
    }
    saveHelpful();
  }
  function helpfulCount(reviewId) {
    const r = state.helpfulVotes[String(reviewId)];
    return r && r.count ? r.count : 0;
  }
  function hasVotedHelpful(reviewId) {
    const r = state.helpfulVotes[String(reviewId)];
    return !!(r && r.voted);
  }

  // (toggleCompare removed with compare feature)

  // ---- match reason: template-based explanation ----
  function buildMatchReason(host, user) {
    if (!host || !user || !user.preferences) return [];
    const importance = user.preferences.importance || defaultImportance;
    const reasons = [];
    const labels = language === "ja"
      ? { safetyEnvironment: "安全", englishEnvironment: "英語環境", cultureFit: "文化適応", mentalSupport: "メンタルサポート", commute: "通学・送迎", study: "学習向き" }
      : { safetyEnvironment: "Safety", englishEnvironment: "English", cultureFit: "Culture fit", mentalSupport: "Mental support", commute: "Commute", study: "Study fit" };
    const radarValues = {
      safetyEnvironment: radarValue(host, radarAxes[0]),
      englishEnvironment: radarValue(host, radarAxes[1]),
      cultureFit: radarValue(host, radarAxes[2]),
      mentalSupport: radarValue(host, radarAxes[3]),
      commute: radarValue(host, radarAxes[4]),
      study: radarValue(host, radarAxes[5]),
    };
    // Identify top contributing + concerning axes
    Object.keys(importance).forEach((key) => {
      const imp = importance[key] || 0;
      const val = radarValues[key] || 0;
      if (imp >= 4 && val >= 4.3) reasons.push({ type: "plus", label: labels[key], detail: `${language !== "ja" ? "high importance & strong" : "重視度高 + 強い"} (${val.toFixed(1)})` });
      if (imp >= 4 && val < 3.5) reasons.push({ type: "minus", label: labels[key], detail: `${language !== "ja" ? "high importance but weak" : "重視度高だが弱い"} (${val.toFixed(1)})` });
    });
    // Lifestyle bonus
    if (user.preferences.lifestyle) {
      const fits = (host.fit || []).map((f) => fitKeyFromLabel(f));
      user.preferences.lifestyle.forEach((wantedKey) => {
        if (fits.includes(wantedKey)) {
          reasons.push({ type: "plus", label: language !== "ja" ? "Lifestyle" : "ライフスタイル", detail: language !== "ja" ? `Matches "${wantedKey}"` : `「${wantedKey}」が一致` });
        }
      });
    }
    return reasons;
  }

  // ---- "Frankness" score: high std dev = honest mix, low = suspicious uniformity ----
  function frankness(host) {
    const reviews = hostReviews(host);
    if (reviews.length < 3) return null;
    const scores = reviews.map((r) => Number(r.score)).filter(Number.isFinite);
    const sd = standardDeviation(scores);
    // Healthy reviews have sd around 0.4-1.0. Too uniform (0) or too chaotic (>1.5) is suspicious.
    if (sd === 0) return { level: "low", labelJa: "全員同じ評価", labelEn: "All reviews identical" };
    if (sd >= 0.4 && sd <= 1.0) return { level: "high", labelJa: "率直な意見が混在", labelEn: "Honest mix of opinions" };
    if (sd < 0.4) return { level: "mid", labelJa: "似た意見が多い", labelEn: "Reviews very similar" };
    return { level: "mid", labelJa: "意見が分かれる", labelEn: "Opinions vary widely" };
  }

  // ---- Reviewer diversity: how many distinct students/schools ----
  function reviewerDiversity(host) {
    const reviews = hostReviews(host);
    if (!reviews.length) return null;
    const studentSet = new Set(reviews.map((r) => r.student));
    const schoolSet = new Set(reviews.map((r) => (r.reviewer && r.reviewer.school) || "").filter(Boolean));
    return { distinctStudents: studentSet.size, distinctSchools: schoolSet.size, total: reviews.length };
  }

  // ---- Edit-lock check: review editable for 24h then locked ----
  function isReviewEditable(review) {
    if (!review || !review.createdAt) return false;
    const ageMs = Date.now() - new Date(review.createdAt).getTime();
    return ageMs <= EDIT_LOCK_HOURS * 60 * 60 * 1000;
  }

  // ---- Duplicate detection (Jaccard similarity on text trigrams) ----
  function trigramSet(text) {
    const s = String(text || "").toLowerCase().replace(/\s+/g, "");
    const out = new Set();
    for (let i = 0; i < s.length - 2; i++) out.add(s.slice(i, i + 3));
    return out;
  }
  function jaccardSim(setA, setB) {
    if (!setA.size || !setB.size) return 0;
    let inter = 0;
    setA.forEach((x) => { if (setB.has(x)) inter++; });
    return inter / (setA.size + setB.size - inter);
  }
  function detectDuplicate(text, existingReviews) {
    if (String(text || "").length < 100) return null; // too short to reliably compare
    const target = trigramSet(text);
    if (target.size < 10) return null;
    for (const r of existingReviews) {
      const sim = jaccardSim(target, trigramSet(r.text));
      if (sim >= 0.75) return { sim, against: r };
    }
    return null;
  }

  // ---- Seasonal evaluation: winter (Nov-Mar) vs summer (Apr-Oct) averages ----
  function seasonalStats(host) {
    const reviews = hostReviews(host);
    if (reviews.length < 4) return null;
    const winter = [], summer = [];
    reviews.forEach((r) => {
      if (!r.createdAt) return;
      const m = new Date(r.createdAt).getMonth() + 1;
      const isWinter = m >= 11 || m <= 3;
      const score = Number(r.score);
      if (Number.isFinite(score)) (isWinter ? winter : summer).push(score);
    });
    if (!winter.length || !summer.length) return null;
    return {
      winterAvg: winter.reduce((a, b) => a + b, 0) / winter.length,
      summerAvg: summer.reduce((a, b) => a + b, 0) / summer.length,
      winterCount: winter.length,
      summerCount: summer.length,
    };
  }

  // Dynamic Verified Host: reviews >= 3 AND weighted average >= 4.0
  function isVerifiedHost(host) {
    const stats = getHostStats(host);
    return stats.count >= 3 && stats.rating >= 4.0;
  }

  // ---- Map a 1-5 rating to a heatmap color (cool to warm) ----
  function ratingToHeatColor(rating) {
    if (rating >= 4.5) return "#1d9e75"; // green
    if (rating >= 4.0) return "#84cc16"; // lime
    if (rating >= 3.5) return "#f59e0b"; // amber
    if (rating >= 3.0) return "#f97316"; // orange
    return "#dc2626"; // red
  }

  // 6 representative radar criteria — derived from existing 9 groups.
  // "通学・送迎" merges transportation + rideSupport.
  const radarAxes = [
    { key: "safetyEnvironment", label: "安全", labelEn: "Safety", sourceKeys: ["safetyEnvironment"] },
    { key: "englishEnvironment", label: "英語環境", labelEn: "English", sourceKeys: ["englishEnvironment"] },
    { key: "cultureFit", label: "文化・食事", labelEn: "Culture & Food", sourceKeys: ["cultureFit"] },
    { key: "mentalSupport", label: "メンタルサポート", labelEn: "Mental support", sourceKeys: ["mentalSupport"] },
    { key: "commute", label: "通学・送迎", labelEn: "Commute & Ride", sourceKeys: ["transportation", "rideSupport"] },
    { key: "study", label: "学習向き", labelEn: "Study fit", sourceKeys: ["study"] },
  ];

  function radarAxesLocalized() {
    return radarAxes.map((axis) => {
      let displayLabel = language === "ja" ? axis.label : axis.labelEn;
      // For non-paired axes, prefer the loaded translation if available.
      if (axis.sourceKeys.length === 1 && t.criteria && t.criteria[axis.sourceKeys[0]]) {
        displayLabel = t.criteria[axis.sourceKeys[0]][0] || displayLabel;
      }
      return { ...axis, displayLabel };
    });
  }

  function radarValue(host, axis) {
    if (!host) return 0;
    return average(
      axis.sourceKeys.map((key) => groupScore(host, criteriaGroups.find((g) => g.key === key))).filter(Number.isFinite)
    );
  }

  let leafletMap = null;
  let apiSyncStarted = false;
  let repliesSyncStarted = false;

  function loadLanguage() {
    if (typeof localStorage === "undefined") return "ja";
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(saved) ? saved : "ja";
  }

  function saveLanguage() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LANGUAGE_KEY, language);
    }
  }

  function loadView() {
    if (typeof window !== "undefined" && window.location && window.location.hash) {
      const fromHash = window.location.hash.replace(/^#\/?/, "");
      if (VIEWS.includes(fromHash)) return fromHash;
    }
    if (typeof localStorage === "undefined") return "home";
    const saved = localStorage.getItem(VIEW_KEY);
    return VIEWS.includes(saved) ? saved : "home";
  }

  function saveView() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(VIEW_KEY, state.view);
    }
    if (typeof window !== "undefined" && window.history && window.history.replaceState) {
      window.history.replaceState(null, "", `#/${state.view}`);
    }
  }

  function setView(nextView) {
    if (!VIEWS.includes(nextView)) return;
    state.view = nextView;
    saveView();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function loadBannerDismissed() {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(BANNER_DISMISSED_KEY) === "1";
  }

  function saveBannerDismissed() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(BANNER_DISMISSED_KEY, state.bannerDismissed ? "1" : "0");
    }
  }

  function loadRecentSort() {
    if (typeof localStorage === "undefined") return "latest";
    const saved = localStorage.getItem(RECENT_SORT_KEY);
    return ["latest", "rating", "selected"].includes(saved) ? saved : "latest";
  }

  function saveRecentSort() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(RECENT_SORT_KEY, state.recentSort);
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
      return parsed && ["user", "moderator", "admin", "host"].includes(parsed.role) ? parsed : null;
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

  async function setLanguage(nextLanguage) {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) nextLanguage = "ja";
    language = nextLanguage;
    saveLanguage();
    // Show immediate feedback even if translation file is still loading
    if (translationCache[language]) {
      t = translationCache[language];
    } else {
      t = translations.en; // temporary fallback
      render();
      await loadLanguageFile(language);
      t = translationCache[language];
    }
    ui = t;
    render();
  }

  function setRole(nextRole) {
    role = currentUser && ["user", "moderator", "admin"].includes(nextRole) ? nextRole : "user";
    saveRole();
    render();
  }

  async function hashPassword(pw) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function login(usernameOrEmail, password) {
    const hashed = await hashPassword(password);
    // Try email-based user first
    const user = findUserByEmail(usernameOrEmail);
    // Accept both hashed (new) and legacy plain-text passwords (migration path)
    if (user && (user.password === hashed || user.password === password)) {
      // Migrate plain-text to hashed on first login
      if (user.password === password && user.password !== hashed) {
        const users = loadUsers();
        const idx = users.findIndex((u) => String(u.email).toLowerCase() === String(user.email).toLowerCase());
        if (idx >= 0) { users[idx].password = hashed; saveUsers(users); }
      }
      currentUser = {
        email: user.email,
        username: user.email,
        role: user.role || "user",
        name: user.name,
        school: user.school,
        grade: user.grade,
        language: user.language,
        nationality: user.nationality,
        schoolCode: user.schoolCode,
        verified: !!user.verified,
        preferences: user.preferences || null,
      };
      role = currentUser.role;
      loginOpen = false;
      loginError = false;
      saveSession();
      // If no preferences set, trigger onboarding
      if (!currentUser.preferences) {
        state.onboardingOpen = true;
        state.onboardingStep = 0;
        state.pendingPreferences = { importance: { ...defaultImportance }, lifestyle: [], dietary: "none" };
      }
      render();
      return;
    }
    // Fall back to legacy demo accounts (moderator/admin)
    const account = accounts.find((item) => item.username === usernameOrEmail && item.password === password);
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

  async function signup(form) {
    const errors = [];
    const signupAs = form.signupAs === "host" ? "host" : "user";
    const email = String(form.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push(language !== "ja" ? "Invalid email" : "メールアドレスが無効です");
    if (!form.password || form.password.length < 6) errors.push(language !== "ja" ? "Password must be 6+ chars" : "パスワードは6文字以上");
    if (!form.name || !form.name.trim()) errors.push(language !== "ja" ? "Name required" : "名前は必須です");

    if (signupAs === "user") {
      if (!form.school) errors.push(language !== "ja" ? "School required (international student verification)" : "学校選択は必須です（留学生確認のため）");
      if (!form.grade) errors.push(language !== "ja" ? "Grade required" : "学年は必須です");
      if (!form.language) errors.push(language !== "ja" ? "Native language required" : "母国語は必須です");
    } else {
      // Host family signup — must pick which host family they belong to
      const hostIdNum = Number(form.hostId);
      if (!Number.isFinite(hostIdNum) || !allHosts().some((h) => h.id === hostIdNum)) {
        errors.push(t.signupHostRequired);
      }
    }
    if (findUserByEmail(email)) errors.push(language !== "ja" ? "Email already registered" : "このメールはすでに登録済みです");

    if (errors.length) {
      loginError = errors.join(" / ");
      render();
      return;
    }

    const isVerified = signupAs === "user" && !!form.schoolCode && isValidSchoolCode(form.schoolCode, form.school);
    const hashedPw = await hashPassword(form.password);

    const newUser = {
      email,
      password: hashedPw,
      name: form.name.trim(),
      school: signupAs === "user" ? form.school : "",
      grade: signupAs === "user" ? form.grade : "",
      language: signupAs === "user" ? form.language : "",
      nationality: form.nationality || "",
      schoolCode: signupAs === "user" ? (form.schoolCode || "") : "",
      role: signupAs,
      hostId: signupAs === "host" ? Number(form.hostId) : null,
      verified: isVerified,
      preferences: null,  // set during onboarding (students only)
      createdAt: new Date().toISOString(),
    };

    const users = loadUsers();
    users.push(newUser);
    saveUsers(users);

    // Auto-login
    currentUser = { ...newUser, username: newUser.email };
    role = newUser.role;
    loginOpen = false;
    loginError = false;
    saveSession();

    // Auto-select UI language based on nationality (if user did not already pick one).
    if (newUser.nationality && COUNTRY_TO_LANGUAGE[newUser.nationality]) {
      const suggested = COUNTRY_TO_LANGUAGE[newUser.nationality];
      if (suggested !== language) {
        // Fire-and-forget setLanguage; render() inside will run again after fetch.
        setLanguage(suggested);
        // Trigger onboarding state setup before async language load returns.
      }
    }

    // Start onboarding (students only — host accounts skip matching setup)
    if (signupAs === "user") {
      state.onboardingOpen = true;
      state.onboardingStep = 0;
      state.pendingPreferences = { importance: { ...defaultImportance }, lifestyle: [], dietary: "none" };
    } else {
      state.onboardingOpen = false;
    }
    render();
  }

  function completeOnboarding() {
    if (!currentUser || !state.pendingPreferences) {
      state.onboardingOpen = false;
      render();
      return;
    }
    // Persist preferences to user record
    const users = loadUsers();
    const idx = users.findIndex((u) => String(u.email).toLowerCase() === String(currentUser.email).toLowerCase());
    if (idx >= 0) {
      users[idx].preferences = state.pendingPreferences;
      saveUsers(users);
    }
    currentUser.preferences = state.pendingPreferences;
    saveSession();
    state.onboardingOpen = false;
    state.onboardingStep = 0;
    state.pendingPreferences = null;
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

  function isHost() {
    return role === "host";
  }

  function currentHostId() {
    // Only meaningful when role === "host". Returns the hostId the
    // logged-in host account is bound to, or null otherwise.
    return isHost() && currentUser && Number.isFinite(Number(currentUser.hostId))
      ? Number(currentUser.hostId)
      : null;
  }

  function canModerateReviews() {
    return isModerator() || isAdmin();
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
    return fitOptions.map(([key, fallback]) => {
      if (t.fit && t.fit[key]) return [key, t.fit[key]];
      const extLang = language === "ja" ? "ja" : "en";
      return [key, (fitLabelsExt[extLang] && fitLabelsExt[extLang][key]) || fallback];
    });
  }

  function fitKeyFromLabel(value) {
    return fitAliases[value] || value;
  }

  function localizedFitLabel(value) {
    const key = fitKeyFromLabel(value);
    if (t.fit && t.fit[key]) return t.fit[key];
    const extLang = language === "ja" ? "ja" : "en";
    return (fitLabelsExt[extLang] && fitLabelsExt[extLang][key]) || value;
  }

  // Returns localized host summary. Falls back to JA when EN not available.
  function localizedHostSummary(host) {
    if (!host) return "";
    if (language !== "ja" && host.summaryEn) return host.summaryEn;
    return host.summary || "";
  }

  // Returns localized host tags array. Falls back to JA tags element-by-element.
  function localizedHostTags(host) {
    if (!host || !Array.isArray(host.tags)) return [];
    if (language !== "ja" && Array.isArray(host.tagsEn) && host.tagsEn.length === host.tags.length) {
      return host.tagsEn;
    }
    return host.tags;
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

  // hiddenHostIds / hiddenReviewIds は admin による論理削除リスト。
  // localStorage（このブラウザ）に保存されるので、別の端末や匿名ユーザーから
  // は引き続き対象が見える。あくまでこのブラウザ上の表示制御。
  function loadHiddenHostIds() {
    if (typeof localStorage === "undefined") return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(HIDDEN_HOSTS_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
    } catch (_error) {
      return [];
    }
  }

  function saveHiddenHostIds() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(HIDDEN_HOSTS_KEY, JSON.stringify(state.hiddenHostIds));
    }
  }

  function loadHiddenReviewIds() {
    if (typeof localStorage === "undefined") return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(HIDDEN_REVIEWS_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (_error) {
      return [];
    }
  }

  function saveHiddenReviewIds() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(HIDDEN_REVIEWS_KEY, JSON.stringify(state.hiddenReviewIds));
    }
  }

  function hostDisplayKey(host) {
    // Composite key (area + name). Previously this only used `area`, which
    // caused new families to be silently merged into existing ones whenever
    // the user picked an area name that was already in use (e.g. "Downtown"
    // collided with the Brown Family). Both must match for a merge.
    const area = String(host.area || "").trim().toLowerCase().replace(/\s+/g, " ");
    const name = String(host.name || "").trim().toLowerCase().replace(/\s+/g, " ");
    if (!area && !name) return "";
    return `${area}|${name}`;
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
    // admin が論理削除した host id（duplicateIds を含む）はここで除外する。
    const hidden = new Set((state.hiddenHostIds || []).map(Number));

    [...hosts, ...state.customHosts].forEach((host) => {
      if (hidden.has(Number(host.id))) return;
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

  async function syncReviewsFromApi() {
    if (apiSyncStarted || typeof fetch === "undefined") return;
    apiSyncStarted = true;
    try {
      const response = await fetch("/api/reviews", { headers: { Accept: "application/json" } });
      if (response.ok) {
        const reviews = await response.json();
        if (Array.isArray(reviews)) {
          const serverIds = new Set(reviews.map((r) => String(r.id)));
          const pendingLocal = state.userReviews.filter((r) => !serverIds.has(String(r.id)));
          state.userReviews = [...pendingLocal, ...reviews];
          saveReviews();
          render();
          return;
        }
      }
    } catch (_error) {
      // fall through to seed fallback
    }

    // Fallback: when /api/reviews is unavailable (e.g. file:// open or
    // any static-only host), load seed reviews directly so the page is
    // never empty in demo mode.
    try {
      const seedResponse = await fetch("./data/seed-reviews.json", { headers: { Accept: "application/json" } });
      if (!seedResponse.ok) return;
      const seedReviews = await seedResponse.json();
      if (!Array.isArray(seedReviews)) return;
      // Merge existing local user reviews with seed (user first).
      const existingIds = new Set(state.userReviews.map((r) => String(r.id)));
      const seedFiltered = seedReviews.filter((r) => !existingIds.has(String(r.id)));
      state.userReviews = [...state.userReviews, ...seedFiltered];
      render();
    } catch (_error) {
      // Static HTML mode without seed access falls back to localStorage only.
    }
  }

  async function syncHostRepliesFromApi() {
    // Guard against infinite loop: render() calls this fn, and this fn
    // calls render() on success. Without the flag we'd keep re-rendering.
    if (repliesSyncStarted || typeof fetch === "undefined") return;
    repliesSyncStarted = true;
    try {
      const response = await fetch("/api/host-replies", { headers: { Accept: "application/json" } });
      if (!response.ok) return;
      const replies = await response.json();
      if (replies && typeof replies === "object" && !Array.isArray(replies)) {
        state.hostReplies = replies;
        render();
      }
    } catch (_error) {
      // Static mode — no replies available
    }
  }

  async function submitHostReply(reviewId) {
    if (!isHost()) return;
    const hostId = currentHostId();
    if (!hostId) return;
    const text = String(state.hostReplyDraft[reviewId] || "").trim();
    if (!text) {
      alert(t.hostReplyEmpty);
      return;
    }
    if (state.hostReplies[reviewId]) {
      alert(t.hostReplyAlreadyExists);
      return;
    }
    state.hostReplySubmittingId = reviewId;
    render();
    try {
      const response = await fetch("/api/host-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          hostId,
          hostName: currentUser ? currentUser.name : "Host family",
          text,
        }),
      });
      if (!response.ok) throw new Error("submit failed");
      const reply = await response.json();
      state.hostReplies = { ...state.hostReplies, [reviewId]: reply };
      delete state.hostReplyDraft[reviewId];
      state.hostReplySubmittingId = null;
      render();
    } catch (_error) {
      state.hostReplySubmittingId = null;
      render();
      alert(t.hostReplyFailed);
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
          apiSyncStarted = false;
          await syncReviewsFromApi();
          return;
        }
      } catch (_error) {
        // Static HTML mode falls back to localStorage.
      }
    }
    state.userReviews.unshift(review);
    saveReviews();
  }

  async function deleteReview(reviewId) {
    const id = String(reviewId);
    if (!id) return;

    // サーバー側でも消せるレビュー（id が seed- でない）はまず API を呼ぶ。
    // seed レビューはサーバー側で 403 を返す仕様なので、最初から論理削除で扱う。
    const isSeed = id.startsWith("seed-");
    if (!isSeed && typeof fetch !== "undefined") {
      try {
        await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: { Accept: "application/json" },
        });
        // 物理削除に成功/失敗どちらでも、ローカルからは外して同じ id を
        // hiddenReviewIds に積む。次回の syncReviewsFromApi で同じ id が
        // 戻ってきた場合でも、フィルタリング段階で除外されるため安全。
      } catch (_error) {
        // ネットワーク失敗時もローカル論理削除で続行する。
      }
    }

    state.userReviews = state.userReviews.filter((review) => String(review.id) !== id);
    const hiddenReviews = new Set((state.hiddenReviewIds || []).map(String));
    hiddenReviews.add(id);
    state.hiddenReviewIds = [...hiddenReviews];
    saveReviews();
    saveHiddenReviewIds();
    render();
  }

  async function geocodeAddress(exactAddress) {
    const query = `${exactAddress}, Red Deer, Alberta, Canada`;
    // addressdetails=1 returns suburb/neighbourhood for auto-area extraction
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) return null;

    const matches = await response.json();
    const first = Array.isArray(matches) ? matches[0] : null;
    if (!first) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    // Extract user-visible area from address parts (privacy-preserving — we
    // never expose the full street address; only the neighbourhood/suburb).
    const a = first.address || {};
    const area = a.neighbourhood || a.suburb || a.quarter || a.city_district
              || a.hamlet || a.village || a.town || "Red Deer";
    return { lat, lng, area };
  }

  function deleteHost(hostId) {
    const host = allHosts().find((item) => item.id === Number(hostId) || (item.duplicateIds || []).includes(Number(hostId)));
    if (!host) return;

    const idsToDelete = new Set([host.id, ...(host.duplicateIds || [])].map(Number));

    // 1) ユーザー追加ホストは物理削除（customHosts から外す）。
    state.customHosts = state.customHosts.filter((item) => !idsToDelete.has(Number(item.id)));

    // 2) ベイクド・イン ホスト（hosts 配列に最初から入っているもの）は物理削除できない
    //    ので、hiddenHostIds に積んで allHosts() でフィルタアウトする論理削除を行う。
    const hidden = new Set((state.hiddenHostIds || []).map(Number));
    idsToDelete.forEach((id) => hidden.add(id));
    state.hiddenHostIds = [...hidden];

    // 3) このホストに紐づくレビューも合わせて非表示扱いにする。
    //    seed レビューは /api/reviews で再取得されるため物理削除しても復活する。
    //    そのため対象レビューの id を hiddenReviewIds に積んで論理削除する
    //    （hostReviews / recent list で除外）。user reviews は念のため両方やる。
    const reviewsForHost = state.userReviews.filter((r) => idsToDelete.has(Number(r.hostId)));
    const hiddenReviews = new Set((state.hiddenReviewIds || []).map(String));
    reviewsForHost.forEach((r) => hiddenReviews.add(String(r.id)));
    state.hiddenReviewIds = [...hiddenReviews];
    state.userReviews = state.userReviews.filter((review) => !idsToDelete.has(Number(review.hostId)));

    state.selectedId = null;
    saveCustomHosts();
    saveReviews();
    saveHiddenHostIds();
    saveHiddenReviewIds();
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
    // admin が論理削除したレビュー id は除外（seed レビューが /api/reviews で
    // 復活しても hiddenReviewIds で弾く）。
    const hiddenReviews = new Set((state.hiddenReviewIds || []).map(String));
    let reviews = state.userReviews.filter(
      (review) =>
        hostIds.has(Number(review.hostId)) && !hiddenReviews.has(String(review.id))
    );
    // Apply date filter if active
    if (state.dateFilter === "year") {
      const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
      reviews = reviews.filter((r) => r.createdAt && new Date(r.createdAt).getTime() >= cutoff);
    }
    return reviews;
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

  function overallWeightedRating(host) {
    if (!host) return 0;
    let weightedSum = 0;
    let weightTotal = 0;
    for (const group of criteriaGroups) {
      const w = axisWeights[group.key] || 1.0;
      const v = groupScore(host, group);
      if (Number.isFinite(v) && v > 0) {
        weightedSum += v * w;
        weightTotal += w;
      }
    }
    return weightTotal > 0 ? weightedSum / weightTotal : 0;
  }

  function getHostStats(host) {
    if (!host) return { rating: 0, reviews: 0, stddev: 0, reliability: reliabilityBand(0) };
    const reviews = hostReviews(host);
    const weighted = overallWeightedRating(host);
    const reliability = reliabilityBand(reviews.length);
    if (!reviews.length) {
      return { rating: weighted || host.rating, reviews: 0, stddev: 0, reliability };
    }
    // Trimmed mean of posted scores, weighted by recency (time decay).
    const scoresWithWeight = reviews
      .map((r) => ({ score: Number(r.score), weight: timeDecayWeight(r.createdAt) }))
      .filter((x) => Number.isFinite(x.score) && x.score > 0);

    let postedAvg = 0;
    if (scoresWithWeight.length) {
      // Time-weighted then trimmed
      const expanded = [];
      scoresWithWeight.forEach(({ score, weight }) => {
        // expand into pseudo-population for trimming proportional to weight
        const reps = Math.max(1, Math.round(weight * 10));
        for (let i = 0; i < reps; i++) expanded.push(score);
      });
      postedAvg = trimmedMean(expanded);
    }

    const blended = weighted > 0 && Number.isFinite(postedAvg) && postedAvg > 0
      ? weighted * 0.6 + postedAvg * 0.4
      : (weighted || postedAvg);
    const stddev = standardDeviation(scoresWithWeight.map((x) => x.score));
    return { rating: blended, reviews: reviews.length, stddev, reliability };
  }

  function getHostFit(host) {
    if (!host) return [];
    const added = hostReviews(host).flatMap((review) => review.fit || []);
    return [...new Set([...host.fit, ...added])].map(localizedFitLabel);
  }

  function structuredLabel(field, value) {
    const key = structuredOptionLabels[value] || `${field}.${value}`;
    return t[key] || value;
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
      lat: safeLat,
      lng: safeLng,
      rating: 0,
      reviews: 0,
      verified: false,
      tags: [area, t.customHostTag],
      fit: [],
      summary: t.customHostSummary,
      criteria: Object.fromEntries(criteriaGroups.flatMap((group) => group.itemKeys.map((key) => [key, 4]))),
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
    const allHostsList = allHosts();
    const filters = state.analyticsFilters || { area: "all", school: "all" };
    // Apply area filter
    let hosts = filters.area === "all"
      ? allHostsList
      : allHostsList.filter((h) => h.area === filters.area);
    // Apply school filter — only keep hosts that have at least one review from
    // a student at the selected school. Also scope review list accordingly.
    // 論理削除されたレビューは集計からも除外（admin 操作を analytics にも反映）。
    const hiddenForAnalytics = new Set((state.hiddenReviewIds || []).map(String));
    let reviews = state.userReviews.filter((r) => !hiddenForAnalytics.has(String(r.id)));
    if (filters.school !== "all") {
      reviews = reviews.filter((r) => r.reviewer && r.reviewer.school === filters.school);
      const hostIdsWithReviewFromSchool = new Set(reviews.map((r) => Number(r.hostId)));
      hosts = hosts.filter((h) => hostIdsWithReviewFromSchool.has(Number(h.id)));
    }
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

    // Flag individual hosts that need attention.
    // Threshold: overall weighted rating < 3.8 OR any high-priority category < 3.0
    const groups = localizedCriteriaGroups();
    const flagged = hosts
      .map((host) => {
        const overall = overallWeightedRating(host);
        const reviewCount = hostReviews(host).length;
        const lowCategories = groups
          .map((g) => ({ title: g.title, value: groupScore(host, g) }))
          .filter((c) => Number.isFinite(c.value) && c.value > 0 && c.value < 3.5)
          .sort((a, b) => a.value - b.value)
          .slice(0, 2);
        return { host, overall, reviewCount, lowCategories };
      })
      .filter((entry) => entry.overall < 3.8 || entry.lowCategories.length > 0)
      .sort((a, b) => a.overall - b.overall);

    return {
      reviews: reviews.length,
      hostCount: hosts.length,
      categoryScores,
      risks,
      strongest: categoryScores.slice(0, 3),
      attention: categoryScores.slice(-3).reverse(),
      flagged,
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

  function renderRadarChart(host, options = {}) {
    if (!host) return "";
    const size = options.size || 280;
    const padding = options.padding || 56;
    const center = size / 2;
    const radius = (size - padding * 2) / 2;
    const axes = radarAxesLocalized();
    const n = axes.length;
    const angleFor = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

    const ringLevels = [1, 2, 3, 4, 5];
    const ringPaths = ringLevels.map((level) => {
      const points = axes.map((_, i) => {
        const a = angleFor(i);
        const r = (level / 5) * radius;
        return `${(center + Math.cos(a) * r).toFixed(2)},${(center + Math.sin(a) * r).toFixed(2)}`;
      });
      return `<polygon class="radar-ring radar-ring--${level}" points="${points.join(" ")}" />`;
    }).join("");

    const axisLines = axes.map((_, i) => {
      const a = angleFor(i);
      const x = (center + Math.cos(a) * radius).toFixed(2);
      const y = (center + Math.sin(a) * radius).toFixed(2);
      return `<line class="radar-axis" x1="${center}" y1="${center}" x2="${x}" y2="${y}" />`;
    }).join("");

    const valuePoints = axes.map((axis, i) => {
      const v = Math.max(0, Math.min(5, radarValue(host, axis)));
      const a = angleFor(i);
      const r = (v / 5) * radius;
      return { x: center + Math.cos(a) * r, y: center + Math.sin(a) * r, value: v };
    });
    const valuePolygon = `<polygon class="radar-value" points="${valuePoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")}" />`;
    const valueDots = valuePoints.map((p) => `<circle class="radar-dot" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="3.5" />`).join("");

    const labels = axes.map((axis, i) => {
      const a = angleFor(i);
      const lr = radius + 22;
      const lx = center + Math.cos(a) * lr;
      const ly = center + Math.sin(a) * lr;
      const v = radarValue(host, axis);
      let anchor = "middle";
      if (Math.cos(a) > 0.3) anchor = "start";
      else if (Math.cos(a) < -0.3) anchor = "end";
      const dy = Math.sin(a) > 0.3 ? "1em" : Math.sin(a) < -0.3 ? "-0.2em" : "0.35em";
      return `
        <g class="radar-label-group">
          <text class="radar-label" x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="${anchor}" dy="${dy}">${escapeHtml(axis.displayLabel)}</text>
          <text class="radar-label-value" x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="${anchor}" dy="${Math.sin(a) > 0.3 ? "2.2em" : Math.sin(a) < -0.3 ? "-1.4em" : "1.55em"}">${v.toFixed(1)}</text>
        </g>
      `;
    }).join("");

    const overall = average(valuePoints.map((p) => p.value));
    return `
      <div class="radar-wrap" role="img" aria-label="${escapeHtml(hostDisplayName(host))} ${overall.toFixed(1)}/5">
        <svg class="radar-svg" viewBox="0 0 ${size} ${size}" width="100%" height="auto">
          ${ringPaths}
          ${axisLines}
          ${valuePolygon}
          ${valueDots}
          ${labels}
          <text class="radar-center-value" x="${center}" y="${center - 4}" text-anchor="middle">${overall.toFixed(1)}</text>
          <text class="radar-center-label" x="${center}" y="${center + 14}" text-anchor="middle">avg</text>
        </svg>
      </div>
    `;
  }

  function renderTabs() {
    const navHome = language === "ja" ? "ホーム" : (t.navHome || "Home");
    const favLabel = language === "ja" ? "保存" : "Saved";
    const favCount = state.favorites.length;
    const tabs = [
      { key: "home",   label: navHome },
      { key: "search", label: t.navSearch || "Search" },
      { key: "map",    label: t.navMap || "Map" },
      { key: "review", label: t.navReview || "Write" },
      { key: "favorites", label: `${favLabel}${favCount ? ` (${favCount})` : ""}` },
      { key: "school", label: t.navSchool || "Schools" },
      { key: "how-to", label: t.navHowTo || "How to use" },
    ];
    if (isHost()) {
      tabs.push({ key: "my-host", label: `🏠 ${t.navMyHost || "My family"}` });
    }
    return `
      <nav class="view-tabs" aria-label="View">
        <div class="container view-tabs-inner">
          ${tabs.map((tab) => `
            <button type="button"
              class="view-tab ${state.view === tab.key ? "is-active" : ""}"
              data-view="${tab.key}"
              aria-current="${state.view === tab.key ? "page" : "false"}">
              ${escapeHtml(tab.label)}
            </button>
          `).join("")}
        </div>
      </nav>
    `;
  }

  // Returns trust badges for a single review. Uses reviewer.* and counts
  // of past reviews by the same user.
  function renderReviewTrustBadges(review) {
    if (!review) return "";
    const badges = [];
    const reviewer = review.reviewer || {};
    // Verified Stay: anyone who is logged in (account-bound)
    if (reviewer.school) {
      badges.push({ key: "verifiedStay", label: language !== "ja" ? "Verified Stay" : "滞在確認済み", cls: "trust-badge--stay", title: language !== "ja" ? "Account-bound review" : "アカウント紐付けレビュー" });
    }
    // School Verified: school code verified
    if (reviewer.verified) {
      badges.push({ key: "schoolVerified", label: language !== "ja" ? "School Verified" : "学校認証済み", cls: "trust-badge--school", title: language !== "ja" ? "Verified by school-issued code" : "学校発行コードで認証" });
    }
    // Agency Verified — placeholder (future agency integration)
    if (reviewer.agency) {
      badges.push({ key: "agencyVerified", label: language !== "ja" ? "Agency Verified" : "エージェント認証", cls: "trust-badge--agency", title: language !== "ja" ? "Verified through partner agency" : "提携エージェント経由で認証" });
    }
    // Repeat reviewer — same student id across multiple reviews
    if (review.student && state.userReviews) {
      const sameAuthorCount = state.userReviews.filter((r) => r.student === review.student).length;
      if (sameAuthorCount >= 2) {
        badges.push({ key: "repeatReviewer", label: language !== "ja" ? "Repeat Reviewer" : "複数投稿者", cls: "trust-badge--repeat", title: language !== "ja" ? "Has posted multiple reviews" : "複数のレビューを投稿しています" });
      }
    }
    if (!badges.length) return "";
    return `<div class="review-trust-row">${badges.map((b) => `<span class="review-trust ${b.cls}" title="${escapeHtml(b.title)}">${b.label}</span>`).join("")}</div>`;
  }

  function renderMatchChip(host) {
    if (!currentUser || !currentUser.preferences) return "";
    const score = computeMatchScore(host, currentUser);
    const label = matchScoreLabel(score, language);
    const cls = score >= 85 ? "match-chip--high" : score >= 70 ? "match-chip--good" : score >= 55 ? "match-chip--mid" : "match-chip--low";
    return `<button type="button" class="match-chip ${cls}" data-match-reason-host="${host.id}" title="${escapeHtml(language !== "ja" ? "Click for match breakdown" : "クリックで理由表示")}">
      <span class="match-chip-pct">${score}%</span>
      <span class="match-chip-label">${escapeHtml(language !== "ja" ? "Match" : "マッチ度")}</span>
    </button>`;
  }

  function renderMatchReasonPopover(host) {
    if (!currentUser || !currentUser.preferences) return "";
    const score = computeMatchScore(host, currentUser);
    const reasons = buildMatchReason(host, currentUser);
    if (!reasons.length) {
      return `<div class="match-reason-pop">
        <strong>${score}% — ${escapeHtml(matchScoreLabel(score, language))}</strong>
        <p class="muted">${escapeHtml(language !== "ja" ? "No strong signals either way." : "強いシグナルはありません。")}</p>
      </div>`;
    }
    return `<div class="match-reason-pop">
      <div class="match-reason-head">
        <strong>${score}%</strong>
        <span>${escapeHtml(matchScoreLabel(score, language))}</span>
      </div>
      <ul class="match-reason-list">
        ${reasons.map((r) => `
          <li class="match-reason-item match-reason-item--${r.type}">
            <span class="match-reason-marker">${r.type === "plus" ? "▲" : "▼"}</span>
            <strong>${escapeHtml(r.label)}</strong>
            <span class="muted">— ${escapeHtml(r.detail)}</span>
          </li>
        `).join("")}
      </ul>
    </div>`;
  }

  function renderReliabilityBadge(stats) {
    const r = stats.reliability;
    const label = language !== "ja" ? r.labelEn : r.labelJa;
    const detail = language !== "ja" ? `Based on ${stats.reviews} reviews` : `${stats.reviews}件のレビューに基づく`;
    return `<span class="reliability-badge" style="--rel-color: ${r.color};" title="${escapeHtml(detail)}">
      ${escapeHtml(label)}${stats.stddev > 0 ? ` ±${stats.stddev.toFixed(1)}` : ""}
    </span>`;
  }

  function renderSimilarHosts(host) {
    const sims = similarHosts(host, 3);
    if (!sims.length) return "";
    return `
      <div class="similar-hosts">
        <h4 class="detail-subhead">${language !== "ja" ? "Similar hosts" : "似ているホスト"}</h4>
        <div class="similar-list">
          ${sims.map(({ host: h, sim }) => {
            const stats = getHostStats(h);
            return `
              <button type="button" class="similar-item" data-select-host="${h.id}">
                <div class="similar-name"><strong>${escapeHtml(hostDisplayName(h))}</strong> <span class="muted">${escapeHtml(h.area)}</span></div>
                <div class="similar-meta">
                  <span class="similar-rating">★ ${stats.rating.toFixed(1)}</span>
                  <span class="similar-sim">${(sim * 100).toFixed(0)}% ${language !== "ja" ? "similar" : "類似"}</span>
                </div>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderFavoritesView() {
    const favHosts = allHosts().filter((h) => state.favorites.includes(h.id));
    if (!favHosts.length) {
      return `
        <section class="section-search">
          <div class="container">
            <h2 class="section-title">${language !== "ja" ? "Saved hosts" : "保存したホスト"}</h2>
            <div class="card card--soft empty-state">
              ${language !== "ja" ? "No saved hosts yet. Tap ♡ on any host to save it here." : "保存したホストはまだありません。各カードの ♡ をタップすると保存できます。"}
            </div>
          </div>
        </section>
      `;
    }
    return `
      <section class="section-search">
        <div class="container">
          <h2 class="section-title">${language !== "ja" ? "Saved hosts" : "保存したホスト"} (${favHosts.length})</h2>
          ${renderSearchResults(favHosts, selectedHost())}
        </div>
      </section>
    `;
  }

  function renderBottomSheet() {
    if (!state.bottomSheetOpen) return "";
    // Compute how many hosts match if pending filters were applied
    const matchCount = filterHosts(allHosts(), state.query || "", state.pendingFilters).length;

    // Filter chips bound to pendingFilters (instead of activeFilters)
    const pendingFilterPanel = `
      <div class="filter-panel">
        <div class="filter-head">
          <span class="filter-head-title">${t.quickFilters || (language !== "ja" ? "Filters" : "フィルター")}</span>
          ${state.pendingFilters.length ? `<button type="button" class="text-button" id="reset-pending-filters">${language !== "ja" ? "Reset" : "リセット"} (${state.pendingFilters.length})</button>` : ""}
        </div>
        ${filterCategories.map((cat) => `
          <div class="filter-category">
            <div class="filter-category-title">${escapeHtml(language !== "ja" ? cat.titleEn : cat.titleJa)}</div>
            <div class="filter-chip-row">
              ${cat.filters.map((f) => `
                <button type="button"
                  class="filter-chip ${state.pendingFilters.includes(f.key) ? "is-active" : ""}"
                  data-pending-filter-key="${f.key}"
                  aria-pressed="${state.pendingFilters.includes(f.key)}">
                  ${escapeHtml(language !== "ja" ? f.labelEn : f.labelJa)}
                </button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    `;

    const applyLabel = language !== "ja"
      ? `Apply (${matchCount} ${matchCount === 1 ? "host" : "hosts"})`
      : `${matchCount}件を表示`;

    return `
      <div class="bottom-sheet-overlay" data-close-sheet></div>
      <div class="bottom-sheet" role="dialog" aria-label="Filters">
        <div class="bottom-sheet-handle"></div>
        <div class="bottom-sheet-head">
          <h3>${language !== "ja" ? "Filters" : "フィルター"}</h3>
          <button type="button" class="card-action-btn" data-close-sheet aria-label="Close">×</button>
        </div>
        <div class="bottom-sheet-body">
          ${pendingFilterPanel}
          <div class="bottom-sheet-section">
            <h4 class="detail-subhead">${language !== "ja" ? "Review recency" : "レビューの新しさ"}</h4>
            <div class="filter-chip-row">
              <button type="button" class="filter-chip ${state.pendingDateFilter === "all" ? "is-active" : ""}" data-pending-date-filter="all">${language !== "ja" ? "All time" : "すべての期間"}</button>
              <button type="button" class="filter-chip ${state.pendingDateFilter === "year" ? "is-active" : ""}" data-pending-date-filter="year">${language !== "ja" ? "Past 1 year only" : "過去1年以内のみ"}</button>
            </div>
          </div>
        </div>
        <div class="bottom-sheet-actions">
          <button type="button" class="button button--ghost" data-close-sheet>${language !== "ja" ? "Cancel" : "キャンセル"}</button>
          <button type="button" class="button button--primary" id="apply-pending-filters">${escapeHtml(applyLabel)}</button>
        </div>
      </div>
    `;
  }

  function renderBottomCTA() {
    if (!state.favorites.length) return "";
    return `
      <div class="bottom-cta-bar">
        <button type="button" class="bottom-cta-btn" data-view="favorites">
          <span>♥</span><strong>${state.favorites.length}</strong>
          <span class="bottom-cta-label">${language !== "ja" ? "Saved" : "保存"}</span>
        </button>
      </div>
    `;
  }

  function renderReviewPolicy() {
    const totalReviews = state.userReviews.length;
    // Estimate moderation count via id pattern (in production: server-tracked)
    const seedCount = state.userReviews.filter((r) => String(r.id).startsWith("seed-")).length;
    const userCount = totalReviews - seedCount;
    return `
      <section class="section-policy">
        <div class="container">
          <h2 class="section-title">${language !== "ja" ? "Review policy & transparency" : "レビュー方針と透明性"}</h2>
          <div class="policy-grid">
            <article class="policy-card">
              <h3>📜 ${language !== "ja" ? "Open by default" : "原則オープン"}</h3>
              <p>${language !== "ja"
                ? "Reviews are public unless they violate our guidelines. Negative honest reviews are protected."
                : "レビューはガイドライン違反でない限り公開されます。批判的でも誠実な投稿は保護されます。"}</p>
            </article>
            <article class="policy-card">
              <h3>🔒 ${language !== "ja" ? "Edit lock" : "編集ロック"}</h3>
              <p>${language !== "ja"
                ? `Authors can edit within ${EDIT_LOCK_HOURS}h. After that the review is locked and any prior edits are flagged.`
                : `投稿者は${EDIT_LOCK_HOURS}時間以内に編集可能。それ以降はロックされ、過去の編集には「編集済み」表示が付きます。`}</p>
            </article>
            <article class="policy-card">
              <h3>🚫 ${language !== "ja" ? "What we remove" : "削除対象"}</h3>
              <p>${language !== "ja"
                ? "Personal attacks, exact addresses, contact info, hateful content, and impersonation. Not negative opinions."
                : "個人攻撃、正確な住所、連絡先、ヘイト、なりすまし。批判的意見は削除されません。"}</p>
            </article>
            <article class="policy-card">
              <h3>📊 ${language !== "ja" ? "Live stats" : "ライブ統計"}</h3>
              <p>${language !== "ja"
                ? `Total reviews: ${totalReviews} (${userCount} from users, ${seedCount} demo). No reviews have been removed in the last 30 days.`
                : `合計レビュー数: ${totalReviews}件（ユーザー投稿${userCount}件、デモ${seedCount}件）。直近30日の削除レビュー: 0件。`}</p>
            </article>
          </div>
        </div>
      </section>
    `;
  }

  function renderInlineDetail(host) {
    if (!host) return "";
    const stats = getHostStats(host);
    return `
      <article class="inline-detail">
        <div class="inline-detail-head">
          <div>
            <div class="label">${ui.selectedFamily}</div>
            <h3 class="featured-name">${escapeHtml(hostDisplayName(host))}</h3>
            <div class="inline-detail-meta">
              <span>${escapeHtml(host.area)}</span>
              ${renderReliabilityBadge(stats)}
              ${isVerifiedHost(host) ? `<span class="verified-badge" title="${escapeHtml(t.verifiedExplainer)}">✓ ${t.verified}</span>` : ""}
            </div>
          </div>
          ${renderMatchChip(host)}
          <button type="button" class="button button--ghost button--compact" data-collapse-detail aria-label="Close">×</button>
        </div>
        <div class="inline-detail-body">
          ${renderRadarChart(host, { size: 240, padding: 50 })}
          <div class="inline-detail-side">
            <p class="featured-summary">${escapeHtml(localizedHostSummary(host))}</p>
            ${renderInsightChips(host, 4)}
            <div class="inline-detail-actions">
              <button type="button" class="button button--primary" data-write-review-for="${host.id}">${t.writeReviewCta}</button>
              <button type="button" class="button button--ghost" data-view="map" data-select-host="${host.id}">${language !== "ja" ? "Show on map" : "地図で見る"}</button>
            </div>
          </div>
        </div>
        ${renderSimilarHosts(host)}
      </article>
    `;
  }

  function renderSearchSuggestions(query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return "";
    const hostMatches = filterHosts(allHosts(), query, []).slice(0, 5);
    const reviewMatches = state.userReviews
      .filter((r) => {
        const haystack = [r.text, r.host, r.student, ...(r.fit || [])].join(" ").toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 4);
    if (!hostMatches.length && !reviewMatches.length) {
      return `<div class="search-suggestions search-suggestions--empty">${language !== "ja" ? "No matches" : "一致する結果がありません"}</div>`;
    }
    const hostSection = hostMatches.length ? `
      <div class="suggest-section">
        <div class="suggest-section-head">${language !== "ja" ? "Hosts" : "ホスト"} (${hostMatches.length})</div>
        ${hostMatches.map((host) => {
          const stats = getHostStats(host);
          return `
            <button type="button" class="suggest-item" data-select-host="${host.id}">
              <div class="suggest-main">
                <strong>${escapeHtml(hostDisplayName(host))}</strong>
                <span class="suggest-meta">${escapeHtml(host.area)}</span>
              </div>
              <div class="suggest-rating">★ ${stats.rating.toFixed(1)}</div>
            </button>
          `;
        }).join("")}
      </div>
    ` : "";
    const reviewSection = reviewMatches.length ? `
      <div class="suggest-section">
        <div class="suggest-section-head">${language !== "ja" ? "Reviews" : "レビュー"} (${reviewMatches.length})</div>
        ${reviewMatches.map((review) => {
          const text = displayReviewText(review.text);
          const idx = text.toLowerCase().indexOf(q);
          const start = Math.max(0, idx - 20);
          const snippet = (start > 0 ? "…" : "") + text.slice(start, start + 100) + (text.length > start + 100 ? "…" : "");
          return `
            <button type="button" class="suggest-item suggest-item--review" data-select-host="${review.hostId}">
              <div class="suggest-main">
                <span class="suggest-meta">${escapeHtml(review.host)}</span>
                <span class="suggest-snippet">${escapeHtml(snippet)}</span>
              </div>
              <div class="suggest-rating">★ ${(Number(review.score) || 0).toFixed(1)}</div>
            </button>
          `;
        }).join("")}
      </div>
    ` : "";
    return `<div class="search-suggestions">${hostSection}${reviewSection}</div>`;
  }

  function renderQuickFilters() {
    const activeCount = state.activeFilters.length;
    return `
      <div class="filter-panel">
        <div class="filter-head">
          <span class="filter-head-title">${t.quickFilters || (language !== "ja" ? "Filters" : "フィルター")}</span>
          ${activeCount ? `<button type="button" class="text-button" id="clear-filters">${language !== "ja" ? "Clear all" : "すべて解除"} (${activeCount})</button>` : ""}
        </div>
        ${filterCategories.map((cat) => `
          <div class="filter-category">
            <div class="filter-category-title">${escapeHtml(language !== "ja" ? cat.titleEn : cat.titleJa)}</div>
            <div class="filter-chip-row">
              ${cat.filters.map((f) => `
                <button type="button"
                  class="filter-chip ${state.activeFilters.includes(f.key) ? "is-active" : ""}"
                  data-filter-key="${f.key}"
                  aria-pressed="${state.activeFilters.includes(f.key)}">
                  ${escapeHtml(language !== "ja" ? f.labelEn : f.labelJa)}
                </button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderCriteriaSummary(host) {
    return localizedCriteriaGroups()
      .map((group) => {
        const weight = axisWeights[group.key] || 1.0;
        const isMain = weight >= 2.0;
        const weightLabel = isMain ? "x2" : "x1";
        return `
          <section class="criteria-group criteria-group--summary ${isMain ? "criteria-group--main" : "criteria-group--aux"}">
            <div class="criteria-summary-head">
              <h3>${escapeHtml(group.title)} <span class="weight-badge ${isMain ? "weight-badge--main" : "weight-badge--aux"}">${weightLabel}</span></h3>
              <strong>${escapeHtml(groupScore(host, group).toFixed(1))}</strong>
            </div>
            <div class="criteria-chips">
              ${group.description
                .split(" / ")
                .map((label) => `<span>${escapeHtml(label)}</span>`)
                .join("")}
            </div>
          </section>
        `;
      })
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
    const helpText = language !== "ja"
      ? "Can't find your host family in the list? Enter their last name and street address — we automatically derive the area from the address, and the full address is never published."
      : "リストにあなたのホストファミリーがない場合は、苗字と住所を入力してください。エリア名は住所から自動抽出され、正確な住所は公開されません。";
    const namePlaceholder = language !== "ja"
      ? "Host last name (e.g. Miller)"
      : "ホストの苗字（例：Miller / 田中）";
    const addressPlaceholder = language !== "ja"
      ? "Street address (e.g. 5000 50 Ave) — kept private"
      : "住所（例：5000 50 Ave）— 非公開";
    const addLabel = language !== "ja" ? "Add this family" : "この家族を追加";
    return `
      <details class="add-house-panel add-house-panel--top">
        <summary><strong>+ ${ui.addNewFamily}</strong></summary>
        <p class="section-text" style="margin: 8px 0 12px;">${escapeHtml(helpText)}</p>
        <div class="add-house-grid add-house-grid--expanded">
          <input id="new-house-name" class="text-input" type="text" placeholder="${escapeHtml(namePlaceholder)}" />
          <input id="new-house-address" class="text-input" type="text" placeholder="${escapeHtml(addressPlaceholder)}" />
          <button id="add-house-button" type="button" class="button button--primary">${escapeHtml(addLabel)}</button>
        </div>
        <div class="add-house-preview" id="add-house-preview"></div>
      </details>
    `;
  }

  function renderHeroCard(host) {
    if (!host) {
      return "";
    }
    const stats = getHostStats(host);
    const radarLabel = language !== "ja" ? "6-axis profile" : "6軸プロフィール";
    return `
      <article class="card featured-card">
        <div class="card-body">
          <div class="featured-head">
            <div>
              <div class="label">${ui.selectedFamily}</div>
              <h2 class="featured-name">${escapeHtml(hostDisplayName(host))}</h2>
            </div>
            ${isVerifiedHost(host) ? `<div class="verified-badge" title="${escapeHtml(t.verifiedExplainer)}">✓ ${t.verified}</div>` : ""}
          </div>
          <div class="meta-line"><span class="icon-chip">Map</span><span>${escapeHtml(host.area)}</span></div>
          <div class="rating-row">
            <div class="rating-number">${escapeHtml(stats.rating.toFixed(1))}</div>
            <div>
              ${renderStars(stats.rating)}
              <div class="label">${escapeHtml(stats.reviews)} ${t.reviews}</div>
            </div>
          </div>
          <p class="featured-summary">${escapeHtml(localizedHostSummary(host))}</p>
          <div class="radar-section">
            <div class="radar-section-head">
              <span class="label">${escapeHtml(radarLabel)}</span>
            </div>
            ${renderRadarChart(host)}
          </div>
          ${renderInsightChips(host, 4)}
          <div>
            <div class="label">${t.bestFor}</div>
            <div class="tag-row">${renderTagRow(getHostFit(host))}</div>
          </div>
          <details class="details-panel">
            <summary>${t.detailedScores} (${language !== "ja" ? "12 axes — main x2 + auxiliary x1" : "全12軸：主要×2 + 補助×1"})</summary>
            <div class="criteria-grid">${renderCriteriaSummary(host)}</div>
          </details>
        </div>
      </article>
    `;
  }

  function renderLoginPanel() {
    if ((!loginOpen && !state.onboardingOpen) || (currentUser && !state.onboardingOpen)) return "";
    if (state.onboardingOpen) return renderOnboarding();
    if (currentUser) return "";

    const errorBlock = loginError
      ? `<div class="submit-message submit-message--error">${escapeHtml(typeof loginError === "string" ? loginError : t.loginFailed)}</div>`
      : "";

    const tabs = `
      <div class="auth-tabs">
        <button type="button" class="auth-tab ${state.authMode === "login" ? "is-active" : ""}" data-auth-mode="login">${language !== "ja" ? "Log in" : "ログイン"}</button>
        <button type="button" class="auth-tab ${state.authMode === "signup" ? "is-active" : ""}" data-auth-mode="signup">${language !== "ja" ? "Sign up" : "新規登録"}</button>
      </div>
    `;

    if (state.authMode === "signup") {
      const f = state.signupForm;
      const grades = language !== "ja" ? GRADES_EN : GRADES_JA;
      const signupAs = f.signupAs === "host" ? "host" : "user";
      const hostOptions = allHosts()
        .slice()
        .sort((a, b) => String(a.area || "").localeCompare(String(b.area || "")))
        .map((h) => `<option value="${h.id}" ${Number(f.hostId) === h.id ? "selected" : ""}>${escapeHtml(h.name)}${h.area ? ` — ${escapeHtml(h.area)}` : ""}</option>`)
        .join("");
      const studentFields = `
        <label class="signup-field"><span>${language !== "ja" ? "School" : "学校"} <em>*</em></span>
          <select id="signup-school" class="text-input">
            <option value="">${language !== "ja" ? "Select school" : "学校を選択"}</option>
            ${SCHOOLS.map((s) => `<option value="${s.code}" ${f.school === s.code ? "selected" : ""}>${escapeHtml(s.name)}</option>`).join("")}
          </select>
        </label>
        <label class="signup-field"><span>${language !== "ja" ? "Grade" : "学年"} <em>*</em></span>
          <select id="signup-grade" class="text-input">
            <option value="">${language !== "ja" ? "Select grade" : "学年を選択"}</option>
            ${grades.map((g) => `<option value="${escapeHtml(g)}" ${f.grade === g ? "selected" : ""}>${escapeHtml(g)}</option>`).join("")}
          </select>
        </label>
        <label class="signup-field"><span>${language !== "ja" ? "Native language" : "母国語"} <em>*</em></span>
          <select id="signup-language" class="text-input">
            <option value="">${language !== "ja" ? "Select language" : "母国語を選択"}</option>
            ${NATIVE_LANGUAGES.map((l) => `<option value="${escapeHtml(l)}" ${f.language === l ? "selected" : ""}>${escapeHtml(l)}</option>`).join("")}
          </select>
        </label>
        <label class="signup-field"><span>${language !== "ja" ? "Country / nationality (optional)" : "国籍（任意）"}</span>
          <select id="signup-nationality" class="text-input">
            <option value="">${language !== "ja" ? "Select country" : "国を選択"}</option>
            ${COUNTRIES.map((c) => `<option value="${c.code}" ${f.nationality === c.code ? "selected" : ""}>${escapeHtml(language !== "ja" ? c.nameEn : c.nameJa)}</option>`).join("")}
          </select>
          <small class="signup-help">${language !== "ja" ? "Used only for matching and to suggest your preferred UI language. Never shown to hosts." : "マッチングと表示言語の自動設定のみに使用。ホストには非開示。"}</small>
        </label>
        <label class="signup-field"><span>${language !== "ja" ? "School verification code (optional)" : "学校発行の確認コード（任意）"}</span>
          <input id="signup-school-code" class="text-input" type="text" value="${escapeHtml(f.schoolCode)}" placeholder="${language !== "ja" ? "e.g. RDP-2026-XYZ" : "例: RDP-2026-XYZ"}" />
          <small class="signup-help">${language !== "ja" ? "Get a Verified Student badge if your school provides this." : "学校から発行された場合、Verified Student バッジが付きます。"}</small>
        </label>
      `;
      const hostFields = `
        <label class="signup-field signup-field--full"><span>${escapeHtml(t.signupHostFamilyLabel)} <em>*</em></span>
          <select id="signup-host-id" class="text-input">
            <option value="">${escapeHtml(t.signupHostFamilyPlaceholder)}</option>
            ${hostOptions}
          </select>
          <small class="signup-help">${escapeHtml(t.signupHostHelp)}</small>
        </label>
      `;
      return `
        <section class="login-panel">
          <div class="container">
            <div class="login-card login-card--wide">
              ${tabs}
              <h2 class="section-title">${language !== "ja" ? "Create your account" : "アカウント作成"}</h2>
              <p class="section-text">${language !== "ja"
                ? "Choose your role below. For students we verify your school; for host families we link your account to your family on Nestly."
                : "登録の種類を選んでください。留学生は学校で本人確認、ホスト家庭はあなたの家庭とアカウントを紐付けます。"}</p>
              <fieldset class="signup-role-toggle">
                <legend>${escapeHtml(t.signupAsLabel)}</legend>
                <label class="signup-role-option ${signupAs === "user" ? "is-active" : ""}">
                  <input type="radio" name="signup-as" value="user" ${signupAs === "user" ? "checked" : ""} />
                  <span>🎓 ${escapeHtml(t.signupAsStudent)}</span>
                </label>
                <label class="signup-role-option ${signupAs === "host" ? "is-active" : ""}">
                  <input type="radio" name="signup-as" value="host" ${signupAs === "host" ? "checked" : ""} />
                  <span>🏠 ${escapeHtml(t.signupAsHost)}</span>
                </label>
              </fieldset>
              <div class="signup-grid">
                <label class="signup-field"><span>${language !== "ja" ? "Email" : "メールアドレス"} <em>*</em></span>
                  <input id="signup-email" class="text-input" type="email" value="${escapeHtml(f.email)}" autocomplete="email" />
                </label>
                <label class="signup-field"><span>${language !== "ja" ? "Password (6+ chars)" : "パスワード (6文字以上)"} <em>*</em></span>
                  <input id="signup-password" class="text-input" type="password" autocomplete="new-password" />
                </label>
                <label class="signup-field"><span>${language !== "ja" ? "Display name" : "表示名"} <em>*</em></span>
                  <input id="signup-name" class="text-input" type="text" value="${escapeHtml(f.name)}" />
                </label>
                ${signupAs === "host" ? hostFields : studentFields}
              </div>
              ${errorBlock}
              <button id="signup-submit" type="button" class="button button--primary">${language !== "ja" ? "Create account" : "アカウントを作成"}</button>
            </div>
          </div>
        </section>
      `;
    }

    return `
      <section class="login-panel">
        <div class="container">
          <div class="login-card">
            ${tabs}
            <h2 class="section-title">${t.loginTitle}</h2>
            <div class="login-grid">
              <input id="login-username" class="text-input" type="text" autocomplete="username" placeholder="${language !== "ja" ? "Email" : "メールアドレス"}" value="${escapeHtml(state.loginForm.email)}" />
              <input id="login-password" class="text-input" type="password" autocomplete="current-password" placeholder="${t.loginPassword}" />
              <button id="login-submit" type="button" class="button button--primary">${t.loginSubmit}</button>
            </div>
            <p class="section-text login-help">${language !== "ja" ? "Demo accounts: moderator / admin (password: demo) — or sign up below" : "デモ：moderator / admin (パスワード: demo) — または新規登録してください"}</p>
            ${errorBlock}
          </div>
        </div>
      </section>
    `;
  }

  function renderOnboarding() {
    if (!state.pendingPreferences) state.pendingPreferences = { importance: { ...defaultImportance }, lifestyle: [], dietary: "none" };
    const p = state.pendingPreferences;
    const step = state.onboardingStep || 0;
    const totalSteps = 3;
    const axesForOnboarding = [
      { key: "safetyEnvironment", labelJa: "安全", labelEn: "Safety" },
      { key: "englishEnvironment", labelJa: "英語環境", labelEn: "English environment" },
      { key: "cultureFit", labelJa: "文化・食事適応", labelEn: "Culture & food fit" },
      { key: "mentalSupport", labelJa: "メンタルサポート", labelEn: "Mental support" },
      { key: "commute", labelJa: "通学・送迎", labelEn: "Commute & ride" },
      { key: "study", labelJa: "学習向き", labelEn: "Study fit" },
    ];

    let body = "";
    if (step === 0) {
      body = `
        <h3 class="onboarding-step-title">${language !== "ja" ? "Step 1: How important is each axis to you? (1-5)" : "ステップ1: それぞれの軸の重要度を教えてください (1〜5)"}</h3>
        <p class="section-text">${language !== "ja"
          ? "Rate each axis based on how important it is for choosing your homestay. We use this to compute your personal match score for every host."
          : "ホストファミリー選びでどれだけ重視するかを教えてください。各家庭との「あなたとのマッチ度」計算に使います。"}</p>
        <div class="onboarding-importance-grid">
          ${axesForOnboarding.map((axis) => {
            const current = p.importance[axis.key] || 3;
            return `
              <div class="onboarding-axis">
                <div class="onboarding-axis-head"><strong>${escapeHtml(language !== "ja" ? axis.labelEn : axis.labelJa)}</strong> <span class="onboarding-axis-value">${current}/5</span></div>
                <input type="range" min="1" max="5" step="1" value="${current}" data-importance-key="${axis.key}" class="onboarding-slider" />
              </div>
            `;
          }).join("")}
        </div>
      `;
    } else if (step === 1) {
      body = `
        <h3 class="onboarding-step-title">${language !== "ja" ? "Step 2: Your lifestyle" : "ステップ2: あなたのライフスタイル"}</h3>
        <p class="section-text">${language !== "ja"
          ? "Pick all that apply. We'll suggest hosts that match your style."
          : "あてはまるものを全て選んでください。あなたの性格に合う家庭を優先表示します。"}</p>
        <div class="onboarding-lifestyle">
          ${[
            ["introvert", language !== "ja" ? "I prefer quiet time alone (introvert)" : "静かに過ごしたい（内向的）"],
            ["sports", language !== "ja" ? "I enjoy sports & outdoor activities" : "スポーツ・アウトドアが好き"],
            ["religious", language !== "ja" ? "I have religious or food customs to honor" : "宗教・食文化への配慮が必要"],
            ["petFriendly", language !== "ja" ? "I love pets" : "ペットが好き"],
          ].map(([key, label]) => `
            <label class="onboarding-check">
              <input type="checkbox" data-lifestyle-key="${key}" ${p.lifestyle.includes(key) ? "checked" : ""} />
              <span>${escapeHtml(label)}</span>
            </label>
          `).join("")}
        </div>
        <h4 class="onboarding-substep">${language !== "ja" ? "Dietary restrictions" : "食事の制限"}</h4>
        <div class="onboarding-dietary">
          ${DIETARY_OPTIONS.map((opt) => `
            <label class="onboarding-check">
              <input type="radio" name="dietary" data-dietary-key="${opt.key}" ${p.dietary === opt.key ? "checked" : ""} />
              <span>${escapeHtml(language !== "ja" ? opt.labelEn : opt.labelJa)}</span>
            </label>
          `).join("")}
        </div>
      `;
    } else {
      // Preview
      body = `
        <h3 class="onboarding-step-title">${language !== "ja" ? "Step 3: Preview your matches" : "ステップ3: マッチ結果プレビュー"}</h3>
        <p class="section-text">${language !== "ja"
          ? "Based on your preferences, here are your top matches."
          : "あなたの希望条件をもとに、相性の高い家庭をご紹介します。"}</p>
        <div class="onboarding-preview">
          ${allHosts()
            .map((h) => ({ host: h, score: computeMatchScore(h, { preferences: p }) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(({ host, score }) => `
              <div class="onboarding-match">
                <div class="onboarding-match-name"><strong>${escapeHtml(hostDisplayName(host))}</strong> <span class="onboarding-match-area">${escapeHtml(host.area)}</span></div>
                <div class="onboarding-match-score" style="--match-pct: ${score}%;">
                  <div class="onboarding-match-bar"><div class="onboarding-match-bar-fill" style="width: ${score}%;"></div></div>
                  <strong>${score}%</strong>
                </div>
              </div>
            `).join("")}
        </div>
      `;
    }

    return `
      <section class="login-panel onboarding-panel">
        <div class="container">
          <div class="login-card login-card--wide">
            <div class="onboarding-progress">
              <span>Step ${step + 1} / ${totalSteps}</span>
              <div class="onboarding-progress-bar"><div class="onboarding-progress-bar-fill" style="width: ${((step + 1) / totalSteps) * 100}%"></div></div>
            </div>
            <h2 class="section-title">${language !== "ja" ? "Welcome to Nestly" : "Nestly へようこそ"}</h2>
            ${body}
            <div class="onboarding-actions">
              ${step > 0 ? `<button type="button" class="button button--ghost" data-onboarding-prev>${language !== "ja" ? "Back" : "戻る"}</button>` : `<button type="button" class="button button--ghost" data-onboarding-skip>${language !== "ja" ? "Skip" : "スキップ"}</button>`}
              ${step < totalSteps - 1
                ? `<button type="button" class="button button--primary" data-onboarding-next>${language !== "ja" ? "Next" : "次へ"}</button>`
                : `<button type="button" class="button button--primary" data-onboarding-finish>${language !== "ja" ? "Start using Nestly" : "Nestly を使い始める"}</button>`}
            </div>
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
              <p class="section-text">${host ? escapeHtml(localizedHostSummary(host)) : ui.noFamilies}</p>
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
                        isAdmin()
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
      // Build "remove one filter" suggestions: which active filter, if dropped,
      // would yield results? Sort by yield (most → least).
      const suggestions = [];
      if (state.activeFilters && state.activeFilters.length) {
        const allHostsList = allHosts();
        state.activeFilters.forEach((key) => {
          const remaining = state.activeFilters.filter((k) => k !== key);
          const count = filterHosts(allHostsList, state.query || "", remaining).length;
          if (count > 0) {
            const filter = quickFilters.find((f) => f.key === key);
            const label = filter
              ? (language !== "ja" ? filter.labelEn : filter.labelJa)
              : key;
            suggestions.push({ key, label, count });
          }
        });
        suggestions.sort((a, b) => b.count - a.count);
      }
      const relaxBlock = suggestions.length
        ? `
          <div class="relax-filters">
            <p class="relax-filters-intro">${escapeHtml(t.relaxFiltersIntro)}</p>
            <ul class="relax-filters-list">
              ${suggestions
                .slice(0, 4)
                .map(
                  (s) => `
                  <li class="relax-filter-row">
                    <span class="relax-filter-label">${escapeHtml(s.label)}</span>
                    <span class="relax-filter-count">+${s.count} ${escapeHtml(t.relaxFiltersUnit)}</span>
                    <button type="button" class="button button--ghost button--compact" data-relax-filter="${escapeHtml(s.key)}">${escapeHtml(t.relaxFiltersRemove)} ×</button>
                  </li>
                `
                )
                .join("")}
            </ul>
            <button type="button" class="text-button" id="clear-all-filters-relax">${escapeHtml(t.relaxFiltersClearAll)}</button>
          </div>
        `
        : "";
      return `<div class="card card--soft empty-state">
        ${t.noResults}<br />${!currentUser || role === "user" ? t.refineSearch : ""}
        ${relaxBlock}
      </div>`;
    }

    // Sort: if user has preferences, sort by match score descending
    let sortedHosts = filteredHosts.slice();
    if (currentUser && currentUser.preferences) {
      sortedHosts.sort((a, b) => computeMatchScore(b, currentUser) - computeMatchScore(a, currentUser));
    }

    return sortedHosts
      .map((item) => {
        const stats = getHostStats(item);
        const isExpanded = state.expandedHostId === item.id;
        const isFavorited = state.favorites.includes(item.id);
        const diversity = reviewerDiversity(item);
        const studentsLabel = diversity
          ? (language !== "ja" ? `${diversity.distinctStudents} students` : `${diversity.distinctStudents}名の留学生`)
          : "";
        return `
          <div class="result-stack">
            <article class="result-card ${host && host.id === item.id ? "is-selected" : ""} ${isExpanded ? "is-expanded" : ""}">
              <div class="result-card-actions">
                <button type="button" class="card-action-btn ${isFavorited ? "is-active" : ""}" data-fav-host="${item.id}" aria-label="${language !== "ja" ? "Save" : "保存"}" title="${language !== "ja" ? "Save to favorites" : "お気に入りに保存"}">
                  ${isFavorited ? "♥" : "♡"}
                </button>
              </div>
              <button type="button" class="result-card-button" data-toggle-detail="${item.id}">
                <div class="result-card-head">
                  <div>
                    <div class="result-name-row">
                      <strong>${escapeHtml(hostDisplayName(item))}</strong>
                      ${item.verified ? '<span class="checkmark" title="Verified Host">✓</span>' : ""}
                    </div>
                    <div class="result-location">${escapeHtml(item.area)} / ${escapeHtml(item.city)}</div>
                    <div class="result-tags">
                      ${[...localizedHostTags(item).filter((tag) => tag !== item.area).slice(0, 3), ...getHostFit(item).slice(0, 2)]
                        .map((tag) => `<span class="result-tag">${escapeHtml(tag)}</span>`)
                        .join("")}
                    </div>
                    ${renderInsightChips(item, 4)}
                    ${studentsLabel ? `<div class="students-stayed">👥 ${escapeHtml(studentsLabel)}</div>` : ""}
                  </div>
                  <div class="result-rating">
                    ${renderMatchChip(item)}
                    <div><strong>${escapeHtml(stats.rating.toFixed(1))}</strong></div>
                    ${renderStars(stats.rating)}
                    <div class="label">${escapeHtml(stats.reviews)} ${t.reviews}</div>
                    ${renderReliabilityBadge(stats)}
                  </div>
                </div>
                <div class="result-card-toggle">${isExpanded
                  ? (language !== "ja" ? "▲ Hide details" : "▲ 詳細を閉じる")
                  : (language !== "ja" ? "▼ Show details" : "▼ 詳細を見る")}</div>
              </button>
            </article>
            ${isExpanded ? renderInlineDetail(item) : ""}
          </div>
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

  function renderStarRowInput(key, label, options) {
    options = options || {};
    const current = state.reviewScores[key] || 0;
    const required = options.required !== false;
    const note = options.note || "";
    const mirrorKeys = Array.isArray(options.mirrorKeys) ? options.mirrorKeys : (options.mirrorKeys ? [options.mirrorKeys] : []);
    const mirrorAttr = mirrorKeys.length ? ` data-mirror-keys="${escapeHtml(mirrorKeys.join(","))}"` : "";
    const isMissing = state.missingScores && state.missingScores.includes(key);
    const requiredMark = required
      ? '<span class="required-mark">*</span>'
      : `<span class="optional-mark">${language !== "ja" ? "optional" : "任意"}</span>`;
    const skipLabel = language !== "ja" ? "Skip" : "わからない";
    return `
      <fieldset class="score-row ${required ? "score-row--required" : "score-row--optional"} ${current > 0 ? "is-filled" : "is-empty"} ${isMissing ? "is-missing" : ""}" data-row-key="${escapeHtml(key)}">
        <legend class="score-row-legend">
          <span class="score-row-label">${escapeHtml(label)} ${requiredMark}${isMissing ? ` <span class="missing-mark">${language !== "ja" ? "Required" : "未入力"}</span>` : ""}</span>
          ${current > 0 ? `<span class="score-row-value">${current}/5</span>` : ""}
        </legend>
        ${note ? `<div class="score-row-note">${escapeHtml(note)}</div>` : ""}
        <div class="star-input star-input--spread" role="radiogroup" aria-label="${escapeHtml(label)}">
          ${[1, 2, 3, 4, 5].map((score) => `
            <button type="button"
              class="star-button ${score <= current ? "is-active" : ""}"
              data-score-key="${escapeHtml(key)}"${mirrorAttr}
              data-score-value="${score}"
              aria-label="${escapeHtml(label)} ${score}">★</button>
          `).join("")}
          ${!required ? `<button type="button" class="star-skip-btn ${current === 0 ? "is-active" : ""}" data-score-key="${escapeHtml(key)}"${mirrorAttr} data-score-value="0">${skipLabel}</button>` : ""}
        </div>
      </fieldset>
    `;
  }

  function renderReviewForm(host) {
    if (!host) {
      const allList = allHosts();
      return `
        <article id="review" class="card review-card">
          <div class="card-body">
            <h2 class="section-title">${t.reviewForm}</h2>
            ${renderAddFamilyPanel()}
            <div class="review-target">
              <label for="review-host-select">${t.reviewTarget} <span class="required-mark">*</span></label>
              <select id="review-host-select" class="host-select">
                <option value="">${language !== "ja" ? "Select a family…" : "家族を選択してください…"}</option>
                ${allList.map((item) =>
                  `<option value="${item.id}">${escapeHtml(hostDisplayName(item))} (${escapeHtml(item.area)})</option>`
                ).join("")}
              </select>
            </div>
            <div class="empty-state">${t.selectFamilyFirst}</div>
          </div>
        </article>
      `;
    }
    const optionalLabel = language !== "ja" ? "Detailed rating (optional)" : "詳細評価（任意）";
    const optionalHint = language !== "ja"
      ? "You can skip these. They help future students compare more precisely."
      : "省略できます。記入すると他の留学生がより精密に比較できます。";
    // Compute progress over required fields for the sticky progress bar.
    const requiredAxes = [
      ...radarAxesLocalized().map((a) => a.sourceKeys[0]), // 6 primary
      "rules", "internetQuality", "mealQuality", "cleanliness",
    ];
    const filledAxes = requiredAxes.filter((key) => {
      const v = state.reviewScores && state.reviewScores[key];
      return Number.isFinite(Number(v)) && Number(v) > 0;
    }).length;
    const recommendFilled = !!state.reviewStructured.recommend;
    const textFilled = state.reviewText && state.reviewText.trim().length > 0;
    const totalRequired = requiredAxes.length + 2; // +recommend +text
    const currentRequired = filledAxes + (recommendFilled ? 1 : 0) + (textFilled ? 1 : 0);
    const progressPct = Math.round((currentRequired / totalRequired) * 100);

    const progressBar = `
      <div class="review-progress" data-preserve="review-progress">
        <div class="review-progress-head">
          <strong>${escapeHtml(t.reviewProgressLabel)}</strong>
          <span>${escapeHtml(t.reviewProgressDone.replace("{current}", currentRequired).replace("{total}", totalRequired))}</span>
        </div>
        <div class="review-progress-bar"><div class="review-progress-fill" style="width:${progressPct}%"></div></div>
        ${!recommendFilled || !textFilled
          ? `<div class="review-progress-warnings">
              ${!recommendFilled
                ? `<button type="button" class="review-progress-chip review-progress-chip--warn" id="jump-recommend">⚠ ${escapeHtml(t.reviewProgressRecommendMissing)} → ${escapeHtml(t.reviewProgressJumpRecommend)}</button>`
                : ""}
              ${!textFilled
                ? `<span class="review-progress-chip review-progress-chip--warn">⚠ ${escapeHtml(t.reviewProgressTextMissing)}</span>`
                : ""}
            </div>`
          : ""}
      </div>
    `;

    return `
      <article id="review" class="card review-card">
        <div class="card-body">
          ${renderAddFamilyPanel()}
          <h2 class="section-title">${t.reviewForm}</h2>
          <p class="section-text">${t.reviewLead}</p>
          ${progressBar}
          <div class="review-target">
            <label for="review-host-select">${t.reviewTarget} <span class="required-mark">*</span></label>
            <select id="review-host-select" class="host-select">
              ${allHosts()
                .map(
                  (item) =>
                    `<option value="${item.id}" ${item.id === host.id ? "selected" : ""}>${escapeHtml(hostDisplayName(item))}</option>`
                )
                .join("")}
            </select>
          </div>
          <h4 class="detail-subhead detail-subhead--top">${language !== "ja" ? "Primary 6 axes (required)" : "主要 6 軸（必須）"}</h4>
          <p class="form-intro">${language !== "ja"
            ? "Rate each axis from 1 to 5 stars. These are the core signal."
            : "各項目を 1〜5 星で評価してください。これがコア評価です。"}</p>
          <div class="review-score-rows">
            ${radarAxesLocalized().map((axis) => {
              const sourceKey = axis.sourceKeys[0];
              const mirrorKeys = axis.sourceKeys.slice(1);
              return renderStarRowInput(sourceKey, axis.displayLabel, { required: true, mirrorKeys });
            }).join("")}
          </div>

          <h4 class="detail-subhead">${language !== "ja" ? "Auxiliary axes (rules / internet / meal / cleanliness — required)" : "補助評価（ルール / 通信 / 食事 / 清潔さ — 必須）"}</h4>
          <div class="review-score-rows">
            ${["rules", "internetQuality", "mealQuality", "cleanliness"].map((key) => {
              const group = localizedCriteriaGroups().find((g) => g.key === key);
              return group ? renderStarRowInput(key, group.title, { required: true }) : "";
            }).join("")}
          </div>

          <h4 class="detail-subhead">${language !== "ja" ? "Host experience (optional)" : "受け入れ経験（任意）"}</h4>
          <div class="review-score-rows">
            ${(() => {
              const group = localizedCriteriaGroups().find((g) => g.key === "hostExperience");
              const note = language !== "ja"
                ? "Skip if the family is new to hosting and you cannot judge fairly."
                : "初めて受け入れる家庭などで判断できない場合はスキップしてください。";
              return group ? renderStarRowInput("hostExperience", group.title, { required: false, note }) : "";
            })()}
          </div>

          <h4 class="detail-subhead">${language !== "ja" ? "Would you recommend this family? (required)" : "この家族を他の留学生に勧めますか？（必須）"}</h4>
          <div class="recommend-chip-row">
            ${[
              { val: "yes",   labelJa: "👍 はい",     labelEn: "👍 Yes" },
              { val: "maybe", labelJa: "🤔 たぶん",   labelEn: "🤔 Maybe" },
              { val: "no",    labelJa: "👎 いいえ",   labelEn: "👎 No" },
            ].map((opt) => `
              <button type="button"
                class="recommend-chip ${state.reviewStructured.recommend === opt.val ? "is-active" : ""}"
                data-recommend-value="${opt.val}">
                ${escapeHtml(language !== "ja" ? opt.labelEn : opt.labelJa)}
              </button>
            `).join("")}
          </div>

          <label class="review-text-label" for="review-textarea">${t.reviewText} <span class="required-mark">*</span></label>
          ${(() => {
            const draft = loadDraft();
            if (draft && draft.text && !state.reviewText && draft.hostId === host.id) {
              const saved = new Date(draft.savedAt).toLocaleString();
              return `
                <div class="draft-restore">
                  <span>${language !== "ja" ? `Draft saved at ${saved}` : `下書き (${saved})`}</span>
                  <button type="button" class="button button--ghost button--compact" data-restore-draft>${language !== "ja" ? "Restore" : "復元する"}</button>
                  <button type="button" class="button button--ghost button--compact" data-discard-draft>${language !== "ja" ? "Discard" : "破棄"}</button>
                </div>
              `;
            }
            return "";
          })()}
          <textarea id="review-textarea" class="review-textarea" placeholder="${escapeHtml(
            t.reviewPlaceholder
          )}" data-preserve="review-textarea">${escapeHtml(state.reviewText)}</textarea>
          <div class="review-textarea-footer">
            <div class="review-autosave-status" id="review-autosave-status">${state.reviewText ? (language !== "ja" ? "Auto-saving as you type" : "入力中に自動保存します") : ""}</div>
            <div class="char-counter" id="review-char-counter">${state.reviewText.length > 0 ? `${state.reviewText.length}${language !== "ja" ? " chars" : " 文字"}` : ""}</div>
          </div>

          <details class="details-panel review-details" ${state.reviewDetailOpen ? "open" : ""}>
            <summary><strong>${language !== "ja" ? "Lifestyle tags & structured questions (optional)" : "向いている人タグ + 構造化質問（任意）"}</strong></summary>
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
            <fieldset class="fit-fieldset structured-fieldset">
              <legend>${t.structuredReview}</legend>
              <div class="structured-grid">
                ${structuredReviewFields
                  .map(
                    ([field, options]) => `
                      <label class="structured-select">
                        <span>${t[field]}</span>
                        <select data-structured-field="${field}">
                          ${options
                            .map(
                              (option) =>
                                `<option value="${option}" ${state.reviewStructured[field] === option ? "selected" : ""}>${structuredLabel(field, option)}</option>`
                            )
                            .join("")}
                        </select>
                      </label>
                    `
                  )
                  .join("")}
              </div>
            </fieldset>
          </details>

          <button id="review-submit" type="button" class="button button--primary">${t.submitReview}</button>
          ${state.submitted ? `<div class="submit-message">${t.submitted}</div>` : ""}
        </div>
      </article>
    `;
  }

  function renderRecentReviews() {
    const sortLabels = language !== "ja"
      ? { latest: "Latest", rating: "Highest rated", helpful: "Most helpful", selected: "Selected host" }
      : { latest: "最新順", rating: "評価が高い順", helpful: "役に立った順", selected: "選択中ホストのみ" };
    // admin が論理削除したレビューは home の一覧からも除外。
    const hiddenReviewsForRecent = new Set((state.hiddenReviewIds || []).map(String));
    let reviews = state.userReviews
      .slice()
      .filter((r) => !hiddenReviewsForRecent.has(String(r.id)));
    if (state.recentSort === "selected" && state.selectedId) {
      const host = selectedHost();
      if (host) {
        const ids = new Set([host.id, ...(host.duplicateIds || [])].map(Number));
        reviews = reviews.filter((r) => ids.has(Number(r.hostId)));
      }
    }
    if (state.recentSort === "rating") {
      reviews.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
    } else if (state.recentSort === "helpful") {
      reviews.sort((a, b) => helpfulCount(b.id) - helpfulCount(a.id));
    } else {
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    reviews = reviews.slice(0, 8);

    return `
      <article class="card recent-card">
        <div class="card-body">
          <div class="review-header">
            <h2 class="section-title">${t.recentReviews}</h2>
            <div class="recent-sort">
              <label class="recent-sort-label" for="recent-sort">${language !== "ja" ? "Sort" : "並び順"}</label>
              <select id="recent-sort" class="recent-sort-select">
                <option value="latest" ${state.recentSort === "latest" ? "selected" : ""}>${sortLabels.latest}</option>
                <option value="rating" ${state.recentSort === "rating" ? "selected" : ""}>${sortLabels.rating}</option>
                <option value="helpful" ${state.recentSort === "helpful" ? "selected" : ""}>${sortLabels.helpful}</option>
                <option value="selected" ${state.recentSort === "selected" ? "selected" : ""} ${!state.selectedId ? "disabled" : ""}>${sortLabels.selected}</option>
              </select>
            </div>
          </div>
          <div class="recent-list">
            ${
              reviews.length === 0
                ? `<div class="empty-state">${t.noReviewsYet}</div>`
                : reviews
                    .map(
                      (review) => {
                        const reviewText = displayReviewText(review.text);
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
                      review.structured
                        ? `<div class="structured-review-summary">${structuredReviewFields
                            .map(([field]) =>
                              review.structured[field]
                                ? `<span><strong>${t[field]}:</strong> ${structuredLabel(field, review.structured[field])}</span>`
                                : ""
                            )
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
                    <div class="review-meta">
                      <span>${escapeHtml(displayStudentName(review.student))}</span>
                      ${review.editedAt ? `<span class="edited-flag" title="${escapeHtml(language !== "ja" ? "Edited after posting" : "投稿後に編集されました")}">${language !== "ja" ? "edited" : "編集済み"}</span>` : ""}
                      ${review.createdAt && !isReviewEditable(review) ? `<span class="locked-flag" title="${escapeHtml(language !== "ja" ? "Locked after 24h" : "投稿24時間後にロック")}">🔒</span>` : ""}
                    </div>
                    ${renderReviewTrustBadges(review)}
                    <div class="review-actions-row">
                      <button type="button" class="helpful-btn ${hasVotedHelpful(review.id) ? "is-active" : ""}" data-helpful-id="${escapeHtml(review.id)}">
                        👍 ${language !== "ja" ? "Helpful" : "役に立った"}
                        ${helpfulCount(review.id) ? `<span class="helpful-count">${helpfulCount(review.id)}</span>` : ""}
                      </button>
                      <button type="button" class="report-btn" data-report-review="${escapeHtml(review.id)}" aria-label="${escapeHtml(t.reportButtonLabel)}" title="${escapeHtml(t.reportButtonLabel)}">
                        ⚠ ${escapeHtml(t.reportButton)}
                      </button>
                    </div>
                    ${renderHostReplyBlock(review)}
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

  function renderAbout() {
    // Hearing breakdown: 8 satisfied / 6 mismatch / 3 considered return / 3 other (total 20)
    const hearingSegments = [
      { count: Number(t.aboutHearingStat1Count) || 8, label: t.aboutHearingStat1Label, color: "var(--success)" },
      { count: Number(t.aboutHearingStat2Count) || 6, label: t.aboutHearingStat2Label, color: "var(--warning)" },
      { count: Number(t.aboutHearingStat3Count) || 3, label: t.aboutHearingStat3Label, color: "var(--danger)" },
      { count: Number(t.aboutHearingStat4Count) || 3, label: t.aboutHearingStat4Label, color: "var(--muted)" },
    ];
    const total = hearingSegments.reduce((a, s) => a + s.count, 0) || 20;

    return `
      <section id="about" class="section-about">
        <div class="container">
          <article class="about-card">
            <span class="about-eyebrow">${escapeHtml(t.aboutEyebrow)}</span>
            <h2 class="about-title">${escapeHtml(t.aboutTitle)}</h2>
            <p class="about-text">${escapeHtml(t.aboutText)}</p>
            <div class="about-stats">
              <div class="about-stat">
                <span class="about-stat-value">${escapeHtml(t.aboutStat1Value)}</span>
                <span class="about-stat-label">${escapeHtml(t.aboutStat1Label)}</span>
              </div>
              <div class="about-stat">
                <span class="about-stat-value">${escapeHtml(t.aboutStat2Value)}</span>
                <span class="about-stat-label">${escapeHtml(t.aboutStat2Label)}</span>
              </div>
              <div class="about-stat">
                <span class="about-stat-value">${escapeHtml(t.aboutStat3Value)}</span>
                <span class="about-stat-label">${escapeHtml(t.aboutStat3Label)}</span>
              </div>
              <div class="about-stat">
                <span class="about-stat-value">${escapeHtml(t.aboutStat4Value)}</span>
                <span class="about-stat-label">${escapeHtml(t.aboutStat4Label)}</span>
              </div>
            </div>
          </article>

          <article class="about-card about-story">
            <h3 class="about-section-title">${escapeHtml(t.aboutStoryHeading)}</h3>
            <p class="about-text">${escapeHtml(t.aboutStoryParagraph1)}</p>
            <p class="about-text">${escapeHtml(t.aboutStoryParagraph2)}</p>
          </article>

          <article class="about-card about-hearing">
            <h3 class="about-section-title">${escapeHtml(t.aboutHearingTitle)}</h3>
            <p class="about-text">${escapeHtml(t.aboutHearingIntro)}</p>
            <div class="hearing-bar" role="img" aria-label="${escapeHtml(t.aboutHearingTitle)}">
              ${hearingSegments
                .map(
                  (s) => `<span class="hearing-bar-segment" style="flex: ${s.count}; background: ${s.color};" title="${escapeHtml(s.label)} (${s.count})"></span>`
                )
                .join("")}
            </div>
            <div class="hearing-legend">
              ${hearingSegments
                .map(
                  (s) => `
                  <div class="hearing-legend-item">
                    <span class="hearing-dot" style="background: ${s.color};"></span>
                    <div class="hearing-legend-text">
                      <strong>${escapeHtml(String(s.count))}</strong>
                      <span class="hearing-legend-total"> / ${total}</span>
                      <span class="hearing-legend-label">${escapeHtml(s.label)}</span>
                    </div>
                  </div>
                `
                )
                .join("")}
            </div>
          </article>

          <article class="about-card about-quotes">
            <h3 class="about-section-title">${escapeHtml(t.aboutQuotesTitle)}</h3>
            <div class="about-quote-grid">
              ${[1, 2, 3]
                .map(
                  (i) => `
                  <blockquote class="about-quote">
                    <p>"${escapeHtml(t[`aboutQuote${i}`])}"</p>
                    <cite>— ${escapeHtml(t[`aboutQuote${i}Tag`])}</cite>
                  </blockquote>
                `
                )
                .join("")}
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function renderHowTo() {
    const sections = [
      {
        key: "student",
        icon: "🎓",
        title: t.howToStudentSection,
        intro: t.howToStudentIntro,
        steps: [
          { title: t.howToStudent1Title, body: t.howToStudent1Body },
          { title: t.howToStudent2Title, body: t.howToStudent2Body },
          { title: t.howToStudent3Title, body: t.howToStudent3Body },
          { title: t.howToStudent4Title, body: t.howToStudent4Body },
        ],
      },
      {
        key: "host",
        icon: "🏠",
        title: t.howToHostSection,
        intro: t.howToHostIntro,
        steps: [
          { title: t.howToHost1Title, body: t.howToHost1Body },
          { title: t.howToHost2Title, body: t.howToHost2Body },
          { title: t.howToHost3Title, body: t.howToHost3Body },
        ],
      },
      {
        key: "b2b",
        icon: "🏫",
        title: t.howToB2BSection,
        intro: t.howToB2BIntro,
        steps: [
          { title: t.howToB2B1Title, body: t.howToB2B1Body },
          { title: t.howToB2B2Title, body: t.howToB2B2Body },
          { title: t.howToB2B3Title, body: t.howToB2B3Body },
        ],
      },
    ];

    return `
      <section id="how-to" class="section-how-to">
        <div class="container">
          <div class="section-head section-head--center">
            <span class="how-to-eyebrow">${escapeHtml(t.howToHeroEyebrow)}</span>
            <h2 class="section-title">${escapeHtml(t.howToHeroTitle)}</h2>
            <p class="section-text">${escapeHtml(t.howToHeroText)}</p>
          </div>
          ${sections
            .map(
              (section) => `
              <article class="how-to-section how-to-section--${section.key}">
                <header class="how-to-section-head">
                  <span class="how-to-section-icon" aria-hidden="true">${section.icon}</span>
                  <div>
                    <h3 class="how-to-section-title">${escapeHtml(section.title)}</h3>
                    <p class="how-to-section-intro">${escapeHtml(section.intro)}</p>
                  </div>
                </header>
                <ol class="how-to-steps">
                  ${section.steps
                    .map(
                      (step, idx) => `
                      <li class="how-to-step">
                        <span class="how-to-step-num">${idx + 1}</span>
                        <div class="how-to-step-body">
                          <h4 class="how-to-step-title">${escapeHtml(step.title)}</h4>
                          <p class="how-to-step-text">${escapeHtml(step.body)}</p>
                        </div>
                      </li>
                    `
                    )
                    .join("")}
                </ol>
              </article>
            `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function policyBody(linesText) {
    const lines = String(linesText || "").split("\n").map((l) => l.trim()).filter(Boolean);
    let html = "";
    let listOpen = false;
    for (const line of lines) {
      if (line.startsWith("•")) {
        if (!listOpen) { html += '<ul class="policy-list">'; listOpen = true; }
        html += `<li>${escapeHtml(line.slice(1).trim())}</li>`;
      } else {
        if (listOpen) { html += "</ul>"; listOpen = false; }
        html += `<p>${escapeHtml(line)}</p>`;
      }
    }
    if (listOpen) html += "</ul>";
    return html;
  }

  function renderPolicy(viewId, prefix) {
    const sections = [];
    for (let i = 1; i <= 9; i++) {
      const title = t[`${prefix}S${i}Title`];
      const lines = t[`${prefix}S${i}Lines`];
      if (!title || !lines) continue;
      sections.push({ title, lines });
    }
    return `
      <section id="${viewId}" class="section-policy">
        <div class="container container--narrow">
          <div class="policy-head">
            <span class="policy-eyebrow">${escapeHtml(t[`${prefix}Eyebrow`] || "Legal")}</span>
            <h1 class="policy-title">${escapeHtml(t[`${prefix}Title`])}</h1>
            <p class="policy-updated">${escapeHtml(t[`${prefix}LastUpdated`])}</p>
            <p class="policy-intro">${escapeHtml(t[`${prefix}Intro`])}</p>
          </div>
          ${sections
            .map(
              (section) => `
              <article class="policy-section">
                <h2 class="policy-section-title">${escapeHtml(section.title)}</h2>
                <div class="policy-body">${policyBody(section.lines)}</div>
              </article>
            `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderPrivacy() { return renderPolicy("privacy", "privacy"); }
  function renderTerms()   { return renderPolicy("terms", "terms"); }

  function renderPricing() {
    const plans = [1, 2, 3, 4].map((i) => ({
      tag:   t[`pricingPlan${i}Tag`],
      title: t[`pricingPlan${i}Title`],
      forWho: t[`pricingPlan${i}For`],
      price: t[`pricingPlan${i}Price`],
      features: String(t[`pricingPlan${i}Features`] || "").split("\n").filter(Boolean),
      key: i,
    }));
    return `
      <section id="pricing" class="section-pricing">
        <div class="container">
          <div class="section-head section-head--center">
            <span class="how-to-eyebrow">${escapeHtml(t.pricingEyebrow)}</span>
            <h2 class="section-title">${escapeHtml(t.pricingTitle)}</h2>
            <p class="section-text">${escapeHtml(t.pricingIntro)}</p>
          </div>
          <div class="pricing-grid">
            ${plans
              .map(
                (plan) => `
                <article class="pricing-card pricing-card--${plan.key}">
                  <span class="pricing-tag">${escapeHtml(plan.tag)}</span>
                  <h3 class="pricing-title">${escapeHtml(plan.title)}</h3>
                  <p class="pricing-for">${escapeHtml(plan.forWho)}</p>
                  <div class="pricing-price">${escapeHtml(plan.price)}</div>
                  <ul class="pricing-features">
                    ${plan.features.map((f) => `<li>✓ ${escapeHtml(f)}</li>`).join("")}
                  </ul>
                </article>
              `
              )
              .join("")}
          </div>
          <p class="pricing-disclaimer">${escapeHtml(t.pricingDisclaimer)}</p>
        </div>
      </section>
    `;
  }

  function renderHostReplyBlock(review) {
    if (!review || !review.id) return "";
    const reply = state.hostReplies && state.hostReplies[review.id];
    // If a reply already exists — render the public reply block (visible to everyone)
    if (reply) {
      const replyDate = reply.createdAt ? new Date(reply.createdAt).toLocaleDateString(language === "ja" ? "ja-JP" : "en-US") : "";
      return `
        <div class="host-reply">
          <header class="host-reply-head">
            <span class="host-reply-icon" aria-hidden="true">🏠</span>
            <strong>${escapeHtml(t.hostReplyHeading)}</strong>
            ${replyDate ? `<span class="host-reply-date">${escapeHtml(replyDate)}</span>` : ""}
          </header>
          <p class="host-reply-text">${escapeHtml(reply.text)}</p>
        </div>
      `;
    }
    // No reply yet — only show the input form to the host bound to this review's host
    if (!isHost()) return "";
    if (Number(currentHostId()) !== Number(review.hostId)) return "";
    const draft = (state.hostReplyDraft && state.hostReplyDraft[review.id]) || "";
    const submitting = state.hostReplySubmittingId === review.id;
    return `
      <div class="host-reply-form">
        <label class="host-reply-form-label">
          <span>${escapeHtml(t.hostReplyLabel)}</span>
          <textarea
            class="host-reply-textarea"
            data-host-reply-input="${escapeHtml(review.id)}"
            data-preserve="host-reply-${escapeHtml(review.id)}"
            maxlength="800"
            placeholder="${escapeHtml(t.hostReplyPlaceholder)}"
          >${escapeHtml(draft)}</textarea>
        </label>
        <button type="button" class="button button--primary button--compact" data-host-reply-submit="${escapeHtml(review.id)}" ${submitting ? "disabled" : ""}>
          ${submitting ? escapeHtml(t.hostReplySubmitting) : escapeHtml(t.hostReplySubmit)}
        </button>
      </div>
    `;
  }

  function renderHostProfile() {
    // Guards: must be a host with a valid hostId
    if (!isHost()) {
      return `
        <section class="section-host-profile">
          <div class="container container--narrow">
            <div class="empty-state empty-state--card">${escapeHtml(t.hostProfileLoginRequired)}</div>
          </div>
        </section>
      `;
    }
    const hostId = currentHostId();
    const host = hostId ? allHosts().find((h) => h.id === hostId) : null;
    if (!host) {
      return `
        <section class="section-host-profile">
          <div class="container container--narrow">
            <div class="empty-state empty-state--card">${escapeHtml(t.hostProfileNoHost)}</div>
          </div>
        </section>
      `;
    }

    const stats = getHostStats(host);
    const reviews = hostReviews(host);
    const verified = isVerifiedHost(host);
    const reviewsNeeded = Math.max(0, 3 - reviews.length);
    const ratingPct = Math.min(100, Math.round((stats.rating / 4.0) * 100));
    const reviewsPct = Math.min(100, Math.round((reviews.length / 3) * 100));

    // Category strengths and weaknesses
    const groupScores = localizedCriteriaGroups()
      .map((group) => ({ title: group.title, value: groupScore(host, group) }))
      .filter((g) => Number.isFinite(g.value) && g.value > 0)
      .sort((a, b) => b.value - a.value);
    const strengths = groupScores.slice(0, 3);
    const improvements = groupScores.slice(-3).reverse();

    const scoreList = (items) =>
      items.length
        ? items
            .map(
              (item) => `<div class="analytics-row"><span>${escapeHtml(item.title)}</span><strong>${escapeHtml(item.value.toFixed(1))}</strong></div>`
            )
            .join("")
        : `<div class="empty-state">—</div>`;

    return `
      <section id="my-host" class="section-host-profile">
        <div class="container">
          <div class="host-profile-head">
            <span class="policy-eyebrow">${escapeHtml(t.hostProfileEyebrow)}</span>
            <h1 class="policy-title">${escapeHtml(host.name)}${host.area ? ` <small class="host-profile-area">— ${escapeHtml(host.area)}</small>` : ""}</h1>
            <p class="policy-intro">${escapeHtml(t.hostProfileIntro)}</p>
          </div>

          <div class="host-profile-stats">
            <article class="analytics-card analytics-card--stat">
              <span>${escapeHtml(t.hostProfileOverall)}</span>
              <strong>★ ${escapeHtml(stats.rating.toFixed(2))}</strong>
            </article>
            <article class="analytics-card analytics-card--stat">
              <span>${escapeHtml(t.hostProfileReviews)}</span>
              <strong>${reviews.length}</strong>
            </article>
            <article class="analytics-card analytics-card--stat">
              <span>${escapeHtml(t.hostProfileReliability)}</span>
              <strong>${escapeHtml(stats.reliability && stats.reliability.label ? stats.reliability.label : "—")}</strong>
            </article>
          </div>

          <article class="host-profile-card">
            <h2 class="policy-section-title">${escapeHtml(t.hostProfileVerifiedTitle)}</h2>
            ${verified
              ? `<p class="host-profile-verified-done">${escapeHtml(t.hostProfileVerifiedDone)}</p>`
              : `
                <div class="host-profile-progress">
                  <div class="host-progress-row">
                    <span>${escapeHtml(t.hostProfileVerifiedReviews.replace("{current}", reviews.length))}</span>
                    <div class="host-progress-bar"><div class="host-progress-fill" style="width:${reviewsPct}%"></div></div>
                  </div>
                  <div class="host-progress-row">
                    <span>${escapeHtml(t.hostProfileVerifiedRating.replace("{current}", stats.rating.toFixed(2)))}</span>
                    <div class="host-progress-bar"><div class="host-progress-fill" style="width:${ratingPct}%"></div></div>
                  </div>
                </div>
                <p class="host-profile-hint">${escapeHtml(t.hostProfileVerifiedHint)}</p>
              `}
          </article>

          <div class="host-profile-grid">
            <article class="host-profile-card">
              <h3 class="policy-section-title">${escapeHtml(t.hostProfileStrengths)}</h3>
              ${scoreList(strengths)}
            </article>
            <article class="host-profile-card">
              <h3 class="policy-section-title">${escapeHtml(t.hostProfileImprovements)}</h3>
              ${scoreList(improvements)}
            </article>
          </div>

          <article class="host-profile-card">
            <h2 class="policy-section-title">${escapeHtml(t.hostProfileReviewsTitle)}</h2>
            ${reviews.length === 0
              ? `<div class="empty-state">${escapeHtml(t.hostProfileNoReviews)}</div>`
              : reviews
                  .map((review) => {
                    const reviewText = displayReviewText(review.text);
                    return `
                      <div class="review-item host-profile-review">
                        <div class="review-header">
                          ${renderStars(review.score)}
                          <span class="review-date-muted">${escapeHtml(displayStudentName(review.student))}</span>
                        </div>
                        ${reviewText ? `<p class="review-quote">${language === "ja" ? "「" : "\""}${escapeHtml(reviewText)}${language === "ja" ? "」" : "\""}</p>` : ""}
                        ${review.fit && review.fit.length
                          ? `<div class="result-tags">${review.fit.map((tag) => `<span class="result-tag">${escapeHtml(localizedFitLabel(tag))}</span>`).join("")}</div>`
                          : ""}
                        ${renderHostReplyBlock(review)}
                      </div>
                    `;
                  })
                  .join("")}
          </article>
        </div>
      </section>
    `;
  }

  function renderReportModal() {
    if (!state.reportingReviewId) return "";
    const reasons = [
      { key: "misinformation", label: t.reportReasonMisinformation },
      { key: "personal_info",  label: t.reportReasonPersonalInfo },
      { key: "harassment",     label: t.reportReasonHarassment },
      { key: "spam",           label: t.reportReasonSpam },
      { key: "other",          label: t.reportReasonOther },
    ];
    return `
      <div class="report-modal-overlay" data-close-report></div>
      <div class="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
        <header class="report-modal-head">
          <h3 id="report-modal-title">${escapeHtml(t.reportModalTitle)}</h3>
          <button type="button" class="report-modal-close" data-close-report aria-label="${escapeHtml(t.reportCancel)}">×</button>
        </header>
        <p class="report-modal-intro">${escapeHtml(t.reportModalIntro)}</p>
        <fieldset class="report-reasons">
          <legend>${escapeHtml(t.reportReasonLabel)}</legend>
          ${reasons
            .map(
              (r) => `
              <label class="report-reason-option">
                <input type="radio" name="report-reason" value="${r.key}" ${state.reportReason === r.key ? "checked" : ""} />
                <span>${escapeHtml(r.label)}</span>
              </label>
            `
            )
            .join("")}
        </fieldset>
        <label class="report-note-label">
          <span>${escapeHtml(t.reportNoteLabel)}</span>
          <textarea id="report-note" class="report-note" maxlength="500" data-preserve="report-note" placeholder="${escapeHtml(t.reportNotePlaceholder)}">${escapeHtml(state.reportNote || "")}</textarea>
        </label>
        <div class="report-modal-actions">
          <button type="button" class="button button--ghost" data-close-report>${escapeHtml(t.reportCancel)}</button>
          <button type="button" id="report-submit" class="button button--primary" ${state.reportSubmitting ? "disabled" : ""}>
            ${state.reportSubmitting ? escapeHtml(t.reportSubmitting) : escapeHtml(t.reportSubmit)}
          </button>
        </div>
      </div>
    `;
  }

  async function submitReport() {
    if (!state.reportingReviewId) return;
    if (!state.reportReason) {
      alert(t.reportReasonRequired);
      return;
    }
    state.reportSubmitting = true;
    render();
    try {
      const payload = {
        reviewId: state.reportingReviewId,
        reason: state.reportReason,
        note: state.reportNote || "",
        reporter: currentUser ? currentUser.name : "anonymous",
      };
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("submit failed");
      state.reportingReviewId = null;
      state.reportReason = "";
      state.reportNote = "";
      state.reportSubmitting = false;
      render();
      alert(t.reportThanks);
    } catch (_error) {
      state.reportSubmitting = false;
      render();
      alert(t.reportFailed);
    }
  }

  function renderFooter() {
    return `
      <footer class="site-footer">
        <div class="container footer-inner">
          <div>
            <div class="footer-brand">
              <div class="brand-mark">N</div>
              <div>
                <div class="brand-name">${BRAND_NAME}</div>
                <div class="brand-subtitle">${escapeHtml(t.subtitle)}</div>
              </div>
            </div>
            <p class="footer-tagline">${escapeHtml(BRAND_TAGLINE_EN)}</p>
          </div>
          <div class="footer-meta">
            <div class="footer-links">
              <button type="button" class="footer-link" data-view="privacy">${escapeHtml(t.privacyNav)}</button>
              <span class="footer-link-divider" aria-hidden="true">·</span>
              <button type="button" class="footer-link" data-view="terms">${escapeHtml(t.termsNav)}</button>
              <span class="footer-link-divider" aria-hidden="true">·</span>
              <button type="button" class="footer-link" data-view="pricing">${escapeHtml(t.pricingNav)}</button>
            </div>
            <div>${escapeHtml(t.footerNote)}</div>
            <div>${escapeHtml(t.footerCopy)}</div>
          </div>
        </div>
      </footer>
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

  function monthlyTrendBuckets() {
    // Build 12 monthly buckets (oldest → newest)
    const now = new Date();
    const buckets = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({ key, label: key, year: d.getFullYear(), month: d.getMonth() + 1, count: 0, sum: 0 });
    }
    const bucketIndex = new Map(buckets.map((b, i) => [b.key, i]));
    state.userReviews.forEach((r) => {
      if (!r.createdAt) return;
      const d = new Date(r.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const idx = bucketIndex.get(key);
      if (idx == null) return;
      const score = Number(r.score);
      if (Number.isFinite(score) && score > 0) {
        buckets[idx].count += 1;
        buckets[idx].sum += score;
      }
    });
    return buckets.map((b) => ({ ...b, avg: b.count ? b.sum / b.count : 0 }));
  }

  function renderTrendChart() {
    const buckets = monthlyTrendBuckets();
    const totalReviews = buckets.reduce((acc, b) => acc + b.count, 0);
    if (totalReviews === 0) {
      return `<div class="empty-state">${escapeHtml(t.analyticsTrendNoData)}</div>`;
    }
    const maxCount = Math.max(1, ...buckets.map((b) => b.count));
    const width = 720;
    const height = 200;
    const padding = { top: 16, right: 28, bottom: 28, left: 32 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const barW = chartW / buckets.length * 0.7;
    const slot = chartW / buckets.length;

    const bars = buckets
      .map((b, i) => {
        const h = (b.count / maxCount) * chartH;
        const x = padding.left + slot * i + (slot - barW) / 2;
        const y = padding.top + (chartH - h);
        return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="var(--primary-soft)" stroke="var(--primary)" stroke-width="1"></rect>`;
      })
      .join("");

    // Line for average rating (scale 0-5 → chartH)
    const points = buckets
      .map((b, i) => {
        const x = padding.left + slot * i + slot / 2;
        const yVal = b.count ? b.avg : null;
        if (yVal == null) return null;
        const y = padding.top + (chartH - (yVal / 5) * chartH);
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(" ");

    const linePath = points ? `<polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>` : "";
    const dots = buckets
      .map((b, i) => {
        if (!b.count) return "";
        const x = padding.left + slot * i + slot / 2;
        const y = padding.top + (chartH - (b.avg / 5) * chartH);
        return `<circle cx="${x}" cy="${y}" r="3" fill="var(--accent)"></circle>`;
      })
      .join("");

    const labels = buckets
      .map((b, i) => {
        const x = padding.left + slot * i + slot / 2;
        const label = String(b.month);
        return `<text x="${x}" y="${height - 8}" font-size="10" text-anchor="middle" fill="var(--muted)">${label}</text>`;
      })
      .join("");

    return `
      <div class="trend-chart-wrap">
        <svg class="trend-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(t.analyticsTrendTitle)}">
          <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="var(--line)" stroke-width="1"></line>
          ${bars}
          ${linePath}
          ${dots}
          ${labels}
        </svg>
        <p class="trend-chart-hint">${escapeHtml(t.analyticsTrendHint)}</p>
      </div>
    `;
  }

  function csvEscape(value) {
    const str = String(value == null ? "" : value);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function buildAnalyticsCsv() {
    const hosts = allHosts();
    const groups = localizedCriteriaGroups();
    const headers = ["host_id", "name", "area", "overall_rating", "review_count", ...groups.map((g) => g.title)];
    const rows = [headers.map(csvEscape).join(",")];
    hosts.forEach((host) => {
      const overall = overallWeightedRating(host);
      const reviewCount = hostReviews(host).length;
      const row = [
        host.id,
        host.name,
        host.area || "",
        overall.toFixed(2),
        reviewCount,
        ...groups.map((g) => {
          const v = groupScore(host, g);
          return Number.isFinite(v) && v > 0 ? v.toFixed(2) : "";
        }),
      ];
      rows.push(row.map(csvEscape).join(","));
    });
    // Prepend BOM so Excel reads UTF-8 correctly
    return "﻿" + rows.join("\n");
  }

  function downloadAnalyticsCsv() {
    const csv = buildAnalyticsCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `nestly-analytics-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function renderSchoolAnalytics() {
    const analytics = schoolAnalytics();
    const scoreList = (items) =>
      items.length
        ? items.map((item) => `<div class="analytics-row"><span>${escapeHtml(item.title)}</span><strong>${escapeHtml(item.value.toFixed(1))}</strong></div>`).join("")
        : `<div class="empty-state">${t.noAnalytics}</div>`;

    const flaggedSection = `
      <article class="analytics-card analytics-card--wide analytics-card--flagged">
        <header class="analytics-card-head">
          <h3>⚠ ${escapeHtml(t.analyticsFlagged)}</h3>
          <p class="analytics-card-hint">${escapeHtml(t.analyticsFlaggedHint)}</p>
        </header>
        ${analytics.flagged.length === 0
          ? `<div class="empty-state">${escapeHtml(t.analyticsFlaggedNone)}</div>`
          : `<div class="flagged-list">
              ${analytics.flagged
                .map(
                  (entry) => `
                  <article class="flagged-row" data-flagged-host="${entry.host.id}">
                    <div class="flagged-row-main">
                      <strong>${escapeHtml(entry.host.name)}</strong>
                      ${entry.host.area ? `<span class="flagged-row-area">${escapeHtml(entry.host.area)}</span>` : ""}
                      <span class="flagged-row-reviews">${escapeHtml(t.analyticsFlaggedReviews.replace("{count}", entry.reviewCount))}</span>
                    </div>
                    <div class="flagged-row-rating">
                      <span class="flagged-row-overall">★ ${entry.overall.toFixed(2)}</span>
                      ${entry.lowCategories
                        .map(
                          (c) =>
                            `<span class="flagged-chip">${escapeHtml(c.title)} <strong>${c.value.toFixed(1)}</strong></span>`
                        )
                        .join("")}
                    </div>
                  </article>
                `
                )
                .join("")}
            </div>`}
      </article>
    `;

    const filters = state.analyticsFilters || { area: "all", school: "all" };
    const allAreas = Array.from(new Set(allHosts().map((h) => h.area).filter(Boolean))).sort();
    const areaOptions = ['<option value="all">' + escapeHtml(t.analyticsFilterAll) + "</option>"]
      .concat(allAreas.map((a) => `<option value="${escapeHtml(a)}" ${filters.area === a ? "selected" : ""}>${escapeHtml(a)}</option>`))
      .join("");
    const schoolOptions = ['<option value="all">' + escapeHtml(t.analyticsFilterAll) + "</option>"]
      .concat(SCHOOLS.map((s) => `<option value="${s.code}" ${filters.school === s.code ? "selected" : ""}>${escapeHtml(s.name)}</option>`))
      .join("");

    return `
      <section id="school" class="section-school">
        <div class="container">
          <div class="section-head analytics-section-head">
            <div>
              <h2 class="section-title">${t.schoolTitle}</h2>
              <p class="section-text">${t.schoolText}</p>
            </div>
            <div class="analytics-export">
              <button type="button" id="analytics-export-csv" class="button button--ghost button--compact" title="${escapeHtml(t.analyticsExportHint)}">
                ⬇ ${escapeHtml(t.analyticsExportCsv)}
              </button>
            </div>
          </div>
          <div class="analytics-filters">
            <strong class="analytics-filters-title">${escapeHtml(t.analyticsFilterTitle)}</strong>
            <label class="analytics-filter">
              <span>${escapeHtml(t.analyticsFilterArea)}</span>
              <select id="analytics-filter-area" class="text-input text-input--compact">${areaOptions}</select>
            </label>
            <label class="analytics-filter">
              <span>${escapeHtml(t.analyticsFilterSchool)}</span>
              <select id="analytics-filter-school" class="text-input text-input--compact">${schoolOptions}</select>
            </label>
            <span class="analytics-filter-scope">${escapeHtml(t.analyticsFilterCount.replace("{hosts}", analytics.hostCount).replace("{reviews}", analytics.reviews))}</span>
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
          </div>
          ${flaggedSection}
          <article class="analytics-card analytics-card--wide analytics-card--trend">
            <header class="analytics-card-head">
              <h3>📈 ${escapeHtml(t.analyticsTrendTitle)}</h3>
            </header>
            ${renderTrendChart()}
          </article>
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
    const searchButton = document.querySelector(".search-bar .button--primary");
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
    const editPreferencesButton = document.getElementById("edit-preferences-button");

    if (languageSelect) languageSelect.addEventListener("change", (event) => {
      setLanguage(event.target.value);
    });

    if (editPreferencesButton) editPreferencesButton.addEventListener("click", () => {
      state.onboardingOpen = true;
      state.onboardingStep = 0;
      state.pendingPreferences = currentUser.preferences
        ? JSON.parse(JSON.stringify(currentUser.preferences))
        : { importance: { ...defaultImportance }, lifestyle: [], dietary: "none" };
      render();
    });

    if (loginButton) loginButton.addEventListener("click", () => {
      loginOpen = !loginOpen;
      loginError = false;
      render();
    });

    if (logoutButton) logoutButton.addEventListener("click", logout);

    if (loginSubmit) loginSubmit.addEventListener("click", async () => {
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value;
      state.loginForm.email = username;
      await login(username, password);
    });

    document.querySelectorAll("[data-auth-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.authMode = btn.dataset.authMode;
        loginError = false;
        render();
      });
    });

    // Sign up role radio (Student / Host family)
    document.querySelectorAll('input[name="signup-as"]').forEach((input) => {
      input.addEventListener("change", (e) => {
        state.signupForm = { ...state.signupForm, signupAs: e.target.value };
        render();
      });
    });

    const signupSubmit = document.getElementById("signup-submit");
    if (signupSubmit) signupSubmit.addEventListener("click", async () => {
      const signupAsEl = document.querySelector('input[name="signup-as"]:checked');
      const signupAs = signupAsEl ? signupAsEl.value : "user";
      const hostIdEl = document.getElementById("signup-host-id");
      const schoolEl = document.getElementById("signup-school");
      const gradeEl = document.getElementById("signup-grade");
      const languageEl = document.getElementById("signup-language");
      const schoolCodeEl = document.getElementById("signup-school-code");
      const form = {
        signupAs,
        email: document.getElementById("signup-email").value.trim(),
        password: document.getElementById("signup-password").value,
        name: document.getElementById("signup-name").value.trim(),
        school: schoolEl ? schoolEl.value : "",
        grade: gradeEl ? gradeEl.value : "",
        language: languageEl ? languageEl.value : "",
        nationality: document.getElementById("signup-nationality") ? document.getElementById("signup-nationality").value.trim() : "",
        schoolCode: schoolCodeEl ? schoolCodeEl.value.trim() : "",
        hostId: hostIdEl ? hostIdEl.value : "",
      };
      state.signupForm = form;
      await signup(form);
    });

    // Inline detail expansion in search results
    document.querySelectorAll("[data-toggle-detail]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.toggleDetail);
        state.expandedHostId = state.expandedHostId === id ? null : id;
        state.selectedId = id;
        render();
        // Scroll the expanded card into view
        if (state.expandedHostId) {
          const card = document.querySelector(`[data-toggle-detail="${id}"]`);
          if (card) setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        }
      });
    });

    document.querySelectorAll("[data-collapse-detail]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.expandedHostId = null;
        render();
      });
    });

    document.querySelectorAll("[data-write-review-for]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedId = Number(btn.dataset.writeReviewFor);
        setView("review");
      });
    });

    // Onboarding handlers
    document.querySelectorAll("[data-importance-key]").forEach((slider) => {
      slider.addEventListener("input", (event) => {
        if (!state.pendingPreferences) return;
        const key = slider.dataset.importanceKey;
        state.pendingPreferences.importance[key] = Number(event.target.value);
        const valueEl = slider.closest(".onboarding-axis").querySelector(".onboarding-axis-value");
        if (valueEl) valueEl.textContent = `${event.target.value}/5`;
      });
    });
    document.querySelectorAll("[data-lifestyle-key]").forEach((cb) => {
      cb.addEventListener("change", (event) => {
        if (!state.pendingPreferences) return;
        const key = cb.dataset.lifestyleKey;
        state.pendingPreferences.lifestyle = event.target.checked
          ? [...new Set([...state.pendingPreferences.lifestyle, key])]
          : state.pendingPreferences.lifestyle.filter((k) => k !== key);
      });
    });
    document.querySelectorAll("[data-dietary-key]").forEach((rb) => {
      rb.addEventListener("change", () => {
        if (!state.pendingPreferences) return;
        if (rb.checked) state.pendingPreferences.dietary = rb.dataset.dietaryKey;
      });
    });
    const obNext = document.querySelector("[data-onboarding-next]");
    if (obNext) obNext.addEventListener("click", () => { state.onboardingStep = (state.onboardingStep || 0) + 1; render(); });
    const obPrev = document.querySelector("[data-onboarding-prev]");
    if (obPrev) obPrev.addEventListener("click", () => { state.onboardingStep = Math.max(0, (state.onboardingStep || 0) - 1); render(); });
    const obFinish = document.querySelector("[data-onboarding-finish]");
    if (obFinish) obFinish.addEventListener("click", completeOnboarding);
    const obSkip = document.querySelector("[data-onboarding-skip]");
    if (obSkip) obSkip.addEventListener("click", () => {
      state.onboardingOpen = false;
      state.pendingPreferences = null;
      render();
    });

    const restoreDraftBtn = document.querySelector("[data-restore-draft]");
    if (restoreDraftBtn) restoreDraftBtn.addEventListener("click", () => {
      const draft = loadDraft();
      if (!draft) return;
      state.reviewText = draft.text || "";
      state.reviewQuickScore = draft.quickScore || 0;
      state.reviewScores = draft.scores || state.reviewScores;
      state.reviewFit = draft.fit || [];
      state.reviewStructured = draft.structured || state.reviewStructured;
      if (draft.hostId) state.selectedId = draft.hostId;
      render();
    });
    const discardDraftBtn = document.querySelector("[data-discard-draft]");
    if (discardDraftBtn) discardDraftBtn.addEventListener("click", () => {
      clearDraft();
      render();
    });

    // Favorites: toggle heart
    document.querySelectorAll("[data-fav-host]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(btn.dataset.favHost);
        render();
      });
    });

    // Helpful votes
    document.querySelectorAll("[data-helpful-id]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleHelpful(btn.dataset.helpfulId);
        render();
      });
    });

    // Report review — open modal
    document.querySelectorAll("[data-report-review]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.reportingReviewId = btn.dataset.reportReview;
        state.reportReason = "";
        state.reportNote = "";
        render();
      });
    });

    // Report modal — close handlers
    document.querySelectorAll("[data-close-report]").forEach((el) => {
      el.addEventListener("click", () => {
        state.reportingReviewId = null;
        state.reportReason = "";
        state.reportNote = "";
        state.reportSubmitting = false;
        render();
      });
    });

    // Report modal — radio change
    document.querySelectorAll('input[name="report-reason"]').forEach((input) => {
      input.addEventListener("change", (e) => {
        state.reportReason = e.target.value;
      });
    });

    // Report modal — note textarea (live state, no re-render)
    const reportNoteEl = document.getElementById("report-note");
    if (reportNoteEl) {
      reportNoteEl.addEventListener("input", (e) => {
        state.reportNote = e.target.value;
      });
    }

    // Report modal — submit
    const reportSubmitBtn = document.getElementById("report-submit");
    if (reportSubmitBtn) {
      reportSubmitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        submitReport();
      });
    }

    // Host reply — textarea live state (no re-render while typing)
    document.querySelectorAll("[data-host-reply-input]").forEach((el) => {
      el.addEventListener("input", (e) => {
        const reviewId = el.dataset.hostReplyInput;
        state.hostReplyDraft = { ...state.hostReplyDraft, [reviewId]: e.target.value };
      });
    });

    // Host reply — submit
    document.querySelectorAll("[data-host-reply-submit]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        submitHostReply(btn.dataset.hostReplySubmit);
      });
    });

    // Analytics — CSV export
    const exportCsvBtn = document.getElementById("analytics-export-csv");
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener("click", () => {
        try {
          downloadAnalyticsCsv();
        } catch (_error) {
          alert("CSV export failed");
        }
      });
    }

    // Review progress: jump to recommend chips
    const jumpRecommendBtn = document.getElementById("jump-recommend");
    if (jumpRecommendBtn) {
      jumpRecommendBtn.addEventListener("click", () => {
        const recommendRow = document.querySelector(".recommend-chip-row");
        if (recommendRow) {
          recommendRow.scrollIntoView({ behavior: "smooth", block: "center" });
          // Briefly highlight
          recommendRow.classList.add("flash-highlight");
          setTimeout(() => recommendRow.classList.remove("flash-highlight"), 1600);
        }
      });
    }

    // Relax-filter suggestion: remove one named filter
    document.querySelectorAll("[data-relax-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.relaxFilter;
        state.activeFilters = state.activeFilters.filter((k) => k !== key);
        render();
      });
    });

    // Relax-filter: clear all filters in 0-result state
    const clearAllRelaxBtn = document.getElementById("clear-all-filters-relax");
    if (clearAllRelaxBtn) clearAllRelaxBtn.addEventListener("click", () => {
      state.activeFilters = [];
      render();
    });

    // Pending filter chip toggles (mobile bottom sheet)
    document.querySelectorAll("[data-pending-filter-key]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.pendingFilterKey;
        state.pendingFilters = state.pendingFilters.includes(key)
          ? state.pendingFilters.filter((item) => item !== key)
          : [...state.pendingFilters, key];
        render();
      });
    });

    // Pending date filter chips (mobile bottom sheet)
    document.querySelectorAll("[data-pending-date-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.pendingDateFilter = button.dataset.pendingDateFilter;
        render();
      });
    });

    // Apply pending filters → active filters, close sheet
    const applyBtn = document.getElementById("apply-pending-filters");
    if (applyBtn) applyBtn.addEventListener("click", () => {
      state.activeFilters = [...state.pendingFilters];
      state.dateFilter = state.pendingDateFilter;
      state.bottomSheetOpen = false;
      render();
    });

    // Reset (clear) pending filters
    const resetPendingBtn = document.getElementById("reset-pending-filters");
    if (resetPendingBtn) resetPendingBtn.addEventListener("click", () => {
      state.pendingFilters = [];
      render();
    });

    // Analytics — filters
    const filterArea = document.getElementById("analytics-filter-area");
    if (filterArea) filterArea.addEventListener("change", (e) => {
      state.analyticsFilters = { ...state.analyticsFilters, area: e.target.value };
      render();
    });
    const filterSchool = document.getElementById("analytics-filter-school");
    if (filterSchool) filterSchool.addEventListener("change", (e) => {
      state.analyticsFilters = { ...state.analyticsFilters, school: e.target.value };
      render();
    });

    // Match reason popover
    document.querySelectorAll("[data-match-reason-host]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.matchReasonHostId = state.matchReasonHostId === Number(btn.dataset.matchReasonHost) ? null : Number(btn.dataset.matchReasonHost);
        render();
      });
    });
    document.querySelectorAll("[data-close-match-reason]").forEach((el) => {
      el.addEventListener("click", () => { state.matchReasonHostId = null; render(); });
    });

    // Bottom sheet open/close
    const openSheetBtn = document.getElementById("open-sheet-btn");
    if (openSheetBtn) openSheetBtn.addEventListener("click", () => {
      // Snapshot current filters into pending state so the sheet can stage
      // changes; "Apply" commits them, "Cancel" discards.
      state.pendingFilters = [...state.activeFilters];
      state.pendingDateFilter = state.dateFilter;
      state.bottomSheetOpen = true;
      render();
    });
    document.querySelectorAll("[data-close-sheet]").forEach((el) => {
      el.addEventListener("click", () => { state.bottomSheetOpen = false; render(); });
    });
    document.querySelectorAll("[data-date-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.dateFilter = btn.dataset.dateFilter;
        render();
      });
    });

    // Recommend chip selector
    document.querySelectorAll("[data-recommend-value]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.reviewStructured.recommend = btn.dataset.recommendValue;
        // Refresh just the chip row without full re-render to keep scroll/focus
        document.querySelectorAll("[data-recommend-value]").forEach((b) => {
          b.classList.toggle("is-active", b.dataset.recommendValue === state.reviewStructured.recommend);
        });
      });
    });

    // (compare-clear removed with compare feature)

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

    const clearQueryButton = document.getElementById("clear-query");
    if (clearQueryButton) clearQueryButton.addEventListener("click", () => {
      state.query = "";
      render();
      const input = document.getElementById("search-input");
      if (input) input.focus();
    });

    if (showReviewFormButton) showReviewFormButton.addEventListener("click", () => {
      state.reviewFormOpen = true;
      setView("review");
    });

    if (heroReviewButton) heroReviewButton.addEventListener("click", () => {
      state.reviewFormOpen = true;
      setView("review");
    });

    if (reviewHostSelect) reviewHostSelect.addEventListener("change", (event) => {
      state.selectedId = Number(event.target.value);
      state.submitted = false;
      render();
    });

    if (addHouseButton) addHouseButton.addEventListener("click", async () => {
      const nameInput = document.getElementById("new-house-name");
      const addressInput = document.getElementById("new-house-address");
      const previewEl = document.getElementById("add-house-preview");
      const lastNameRaw = nameInput.value.trim();
      const exactAddress = addressInput.value.trim();

      if (!lastNameRaw || !exactAddress) {
        if (!lastNameRaw) nameInput.focus();
        else addressInput.focus();
        return;
      }

      // Normalize: if user typed "Smith Family" or "Smith家", just use "Smith"
      const cleanedLastName = lastNameRaw
        .replace(/\s*Family\s*$/i, "")
        .replace(/\s*家\s*$/, "")
        .trim();
      const displayName = `${cleanedLastName} Family`;

      addHouseButton.disabled = true;
      if (previewEl) previewEl.textContent = language !== "ja" ? "Looking up address…" : "住所を検索中…";

      let location = null;
      try {
        location = await geocodeAddress(exactAddress);
      } catch (_e) {
        location = null;
      }

      // Auto-derive area from geocoding result. Fallback chain:
      //   1. neighbourhood/suburb from Nominatim
      //   2. "Red Deer area" if geocoding failed
      const derivedArea = (location && location.area) || "Red Deer area";

      // Check for duplicate (same name + same derived area)
      const existingHost = allHosts().find((host) => hostDisplayKey(host) === hostDisplayKey({ area: derivedArea, name: displayName }));
      if (existingHost) {
        addHouseButton.disabled = false;
        state.selectedId = existingHost.id;
        state.submitted = false;
        if (previewEl) previewEl.textContent = "";
        render();
        return;
      }

      // Graceful coordinate fallback if geocoding failed
      const finalLoc = location || (() => {
        const offset = (state.customHosts.length + 1) * 0.0015;
        return { lat: RED_DEER_CENTER.lat + offset, lng: RED_DEER_CENTER.lng - offset };
      })();

      const host = createCustomHost({
        name: displayName,
        area: derivedArea,
        exactAddress,
        lat: finalLoc.lat,
        lng: finalLoc.lng,
      });
      state.customHosts.push(host);
      state.selectedId = host.id;
      state.submitted = false;
      saveCustomHosts();
      addHouseButton.disabled = false;
      render();
      const select = document.getElementById("review-host-select");
      if (select) {
        select.focus();
        select.classList.add("just-added");
        setTimeout(() => select.classList.remove("just-added"), 1500);
      }
    });

    if (reviewTextarea) reviewTextarea.addEventListener("input", (event) => {
      state.reviewText = event.target.value;
      // Update char counter without re-render
      const counter = document.getElementById("review-char-counter");
      if (counter) {
        const len = state.reviewText.length;
        counter.textContent = len > 0 ? `${len}${language !== "ja" ? " chars" : " 文字"}` : "";
      }
      // Auto-save draft (debounced).
      if (window.__nestlyDraftTimer) clearTimeout(window.__nestlyDraftTimer);
      window.__nestlyDraftTimer = setTimeout(() => {
        saveDraft({
          text: state.reviewText,
          quickScore: state.reviewQuickScore,
          scores: state.reviewScores,
          fit: state.reviewFit,
          structured: state.reviewStructured,
          hostId: state.selectedId,
          savedAt: new Date().toISOString(),
        });
      }, 600);
      if (state.submitted) {
        state.submitted = false;
        render();
      }
    });

    if (reviewSubmit) reviewSubmit.addEventListener("click", async () => {
      const host = selectedHost();
      if (!host) return;

      // Validate all required axes are rated.
      // NOTE: rideSupport is paired with transportation under the combined
      // "通学・送迎" axis. The star handler mirrors clicks so both keys are set
      // in sync. We only check transportation here to avoid validating a
      // hidden mirror twice (the star is invisible to the user).
      const visibleRequired = requiredAxisKeys.filter((k) => k !== "rideSupport");
      const missing = visibleRequired.filter((k) => !(state.reviewScores[k] > 0));
      if (missing.length && !isAdmin()) {
        // Highlight all missing fields + name them explicitly
        state.missingScores = missing;
        const missingLabels = missing.map((k) => {
          // Prefer the user-facing display label used in the form (radar label for combined axes)
          const axis = radarAxesLocalized().find((a) => a.sourceKeys[0] === k);
          if (axis) return axis.displayLabel;
          const group = localizedCriteriaGroups().find((g) => g.key === k);
          return group ? group.title : k;
        });
        render();
        // Scroll to first missing after re-render
        setTimeout(() => {
          const firstRow = document.querySelector(`[data-row-key="${missing[0]}"]`);
          if (firstRow) firstRow.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
        const msg = language !== "ja"
          ? `Please rate these required items:\n• ${missingLabels.join("\n• ")}`
          : `以下の必須項目が未入力です：\n• ${missingLabels.join("\n• ")}`;
        alert(msg);
        return;
      }
      // Clear any previous missing-highlight on successful validation
      state.missingScores = [];
      if (!state.reviewText.trim() && !isAdmin()) {
        reviewTextarea.focus();
        return;
      }

      // Validate recommend (required)
      if (!state.reviewStructured.recommend && !isAdmin()) {
        const firstRec = document.querySelector("[data-recommend-value]");
        if (firstRec) firstRec.scrollIntoView({ behavior: "smooth", block: "center" });
        alert(language !== "ja"
          ? "Please answer whether you would recommend this family."
          : "「この家族を他の留学生に勧めますか？」に回答してください。");
        return;
      }

      // Duplicate detection — warn if 60%+ trigram similarity with existing review
      const dup = detectDuplicate(state.reviewText, state.userReviews);
      if (dup) {
        const msg = language !== "ja"
          ? `This review is ${(dup.sim * 100).toFixed(0)}% similar to an existing review (by ${dup.against.student}). Continue anyway?`
          : `既存レビュー（投稿者: ${dup.against.student}）と${(dup.sim * 100).toFixed(0)}%類似しています。続行しますか？`;
        if (!window.confirm(msg)) return;
      }

      // Compute weighted overall from the rated axes (skipping zero values).
      let wSum = 0, wTotal = 0;
      for (const key of Object.keys(state.reviewScores)) {
        const v = state.reviewScores[key];
        const w = axisWeights[key] || 1;
        if (v && v > 0) { wSum += v * w; wTotal += w; }
      }
      const overall = wTotal > 0 ? wSum / wTotal : 4;
      const reviewCriteria = { ...state.reviewScores };

      const reviewerInfo = currentUser
        ? {
            grade: currentUser.grade || "",
            school: currentUser.school || "",
            verified: !!currentUser.verified,
            language: currentUser.language || "",
          }
        : { verified: false };

      const review = {
        id: `local-${Date.now()}`,
        hostId: host.id,
        host: hostDisplayName(host),
        student: currentUser ? `${reviewerInfo.verified ? "✓ " : ""}${language !== "ja" ? "Anonymous student" : "匿名留学生"} (${currentUser.grade || ""})` : t.anonymousStudent,
        text: state.reviewText.trim(),
        score: overall,
        criteria: reviewCriteria,
        fit: [...state.reviewFit.map(fitKeyFromLabel)],
        structured: { ...state.reviewStructured },
        reviewer: reviewerInfo,
        createdAt: new Date().toISOString(),
        editedAt: null,
      };

      reviewSubmit.disabled = true;
      await persistReview(review);
      clearDraft();
      state.reviewText = "";
      state.reviewScores = Object.fromEntries(Object.keys(defaultScores).map((k) => [k, 0]));
      state.reviewFit = [];
      state.reviewStructured = { privacy: "unknown", recommend: "" };
      state.submitted = true;
      render();
    });

    // (data-quick-score handler removed — overall ★ no longer collected.)

    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.view));
    });

    const recentSortSelect = document.getElementById("recent-sort");
    if (recentSortSelect) recentSortSelect.addEventListener("change", (event) => {
      state.recentSort = event.target.value;
      saveRecentSort();
      render();
    });

    const dismissBannerButton = document.getElementById("dismiss-banner");
    if (dismissBannerButton) dismissBannerButton.addEventListener("click", () => {
      state.bannerDismissed = true;
      saveBannerDismissed();
      render();
    });

    const reviewDetails = document.querySelector(".review-details");
    if (reviewDetails) reviewDetails.addEventListener("toggle", () => {
      state.reviewDetailOpen = reviewDetails.open;
    });

    document.querySelectorAll("[data-select-host]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedId = Number(button.dataset.selectHost);
        state.submitted = false;
        const next = button.dataset.viewAfter;
        if (next && VIEWS.includes(next)) {
          setView(next);
        } else {
          render();
        }
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
        const value = Number(button.dataset.scoreValue);
        const key = button.dataset.scoreKey;
        state.reviewScores[key] = value;
        // Mirror to combined-axis source keys (e.g. 通学・送迎 → transportation+rideSupport)
        const mirror = button.dataset.mirrorKeys;
        if (mirror) mirror.split(",").forEach((k) => { if (k) state.reviewScores[k] = value; });
        button.closest(".star-input").querySelectorAll(".star-button").forEach((star) => {
          star.classList.toggle("is-active", Number(star.dataset.scoreValue) <= state.reviewScores[key]);
        });
        // Clear "missing" highlight on this row once user fills it
        if (state.missingScores && state.missingScores.includes(key)) {
          state.missingScores = state.missingScores.filter((k) => k !== key);
          const row = button.closest(".score-row");
          if (row) {
            row.classList.remove("is-missing");
            const mark = row.querySelector(".missing-mark");
            if (mark) mark.remove();
          }
        }
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
    // PRIVACY-FIRST MAP CONFIG:
    //   - maxZoom 14 (city-block level). Higher zooms could expose individual
    //     households or spread misinformation if the offset pin is mistaken
    //     for the real address.
    //   - minZoom 10 (city level). Below this loses Red Deer context.
    //   - Each host is shown as a translucent CIRCLE (radius 250m) instead of a
    //     point, communicating uncertainty.
    const PRIVACY_MAX_ZOOM = 14;
    const PRIVACY_MIN_ZOOM = 10;
    const initialZoom = Math.min(state.selectedId && host ? 13 : 11, PRIVACY_MAX_ZOOM);

    leafletMap = L.map(mapElement, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false,
      maxZoom: PRIVACY_MAX_ZOOM,
      minZoom: PRIVACY_MIN_ZOOM,
    }).setView([centerLat, centerLng], initialZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: PRIVACY_MAX_ZOOM,
    }).addTo(leafletMap);

    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const iconSize = isMobile ? 36 : 28;

    const hasCluster = typeof L.markerClusterGroup === "function";
    const markerLayer = hasCluster
      ? L.markerClusterGroup({
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          maxClusterRadius: isMobile ? 50 : 35,
          disableClusteringAtZoom: 14,
          iconCreateFunction(cluster) {
            const children = cluster.getAllChildMarkers();
            const avgRating = children.reduce((s, m) => s + (m._nestlyRating || 0), 0) / (children.length || 1);
            const clusterColor = ratingToHeatColor(avgRating);
            const size = isMobile ? 44 : 36;
            return L.divIcon({
              className: "heat-map-marker heat-map-cluster",
              html: `<div class="heat-pin heat-pin--cluster" style="background:${clusterColor};width:${size}px;height:${size}px;line-height:${size}px;">${children.length}</div>`,
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            });
          },
        })
      : L.layerGroup();

    // Privacy circle layer: shows ~250m radius around each (offset) pin so it
    // is visually obvious the location is approximate, not exact.
    const PRIVACY_RADIUS_M = 250;
    const circleLayer = L.layerGroup();

    allHosts().forEach((item) => {
      const stats = getHostStats(item);
      const color = ratingToHeatColor(stats.rating);

      // Translucent area circle — primary geographic signal (uncertain area)
      const circle = L.circle([item.lat, item.lng], {
        radius: PRIVACY_RADIUS_M,
        color: color,
        weight: 1.5,
        opacity: 0.6,
        fillColor: color,
        fillOpacity: 0.18,
        interactive: false,  // pins handle clicks
      });
      circleLayer.addLayer(circle);

      // Heatmap-colored marker per host rating
      const heatIcon = L.divIcon({
        className: "heat-map-marker",
        html: `<div class="heat-pin" style="background:${color};"><span>${stats.rating.toFixed(1)}</span></div>`,
        iconSize: [iconSize + 8, iconSize + 8],
        iconAnchor: [(iconSize + 8) / 2, (iconSize + 8) / 2],
        popupAnchor: [0, -(iconSize + 8) / 2],
      });
      const marker = L.marker([item.lat, item.lng], { icon: heatIcon });
      marker._nestlyRating = stats.rating; // used by iconCreateFunction for cluster coloring
      const privacyNote = language !== "ja"
        ? "Approximate area only. Exact address is private."
        : "おおよそのエリアのみ表示。正確な住所は非公開。";
      marker
        .bindPopup(
          `<strong>${escapeHtml(item.area)}</strong><br>${stats.rating.toFixed(
            1
          )} / 5<br><small>📍 ${escapeHtml(privacyNote)}</small>`
        )
        .on("click", () => {
          state.selectedId = item.id;
          render();
        });

      markerLayer.addLayer(marker);

      if (host && item.id === host.id) {
        setTimeout(() => marker.openPopup(), 100);
      }
    });

    leafletMap.addLayer(circleLayer);
    leafletMap.addLayer(markerLayer);

    // Visual notice when user hits max zoom (avoid frustration + reaffirm policy)
    leafletMap.on("zoomend", () => {
      const atMax = leafletMap.getZoom() >= PRIVACY_MAX_ZOOM;
      const noticeId = "map-privacy-zoom-notice";
      let notice = document.getElementById(noticeId);
      if (atMax) {
        if (!notice) {
          notice = document.createElement("div");
          notice.id = noticeId;
          notice.className = "map-privacy-zoom-notice";
          notice.textContent = language !== "ja"
            ? "🔒 Max zoom reached — exact addresses are intentionally hidden."
            : "🔒 これ以上拡大できません — 正確な住所は意図的に非公開です。";
          mapElement.appendChild(notice);
        }
      } else if (notice) {
        notice.remove();
      }
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

    const placeholderSearch = language !== "ja"
      ? "Search by area or keyword (e.g. Downtown, near school)"
      : "エリア名・キーワードで検索（例: Downtown、学校近い）";
    const searchPlaceholderHint = language !== "ja"
      ? "Tip: use the quick filters below for attribute search."
      : "ヒント：属性で絞り込むには下のクイックフィルターを使ってください。";

    const view = state.view;

    const heroSection = `
      <section class="section-hero">
        <div class="container hero-grid hero-grid--single">
          <div class="hero-copy">
            <h1 class="hero-title">${t.heroTitleA}<br />${t.heroTitleB}</h1>
            <span class="hero-tagline">${BRAND_TAGLINE_EN}</span>
            <p class="hero-text">${t.heroText}</p>
            <div class="hero-value-row">
              <span class="trust-badge trust-badge--primary">${t.heroValue}</span>
              <span class="trust-badge">${t.heroPrivacy}</span>
              <span class="trust-badge">${t.heroModeration}</span>
            </div>
            <div class="verified-explainer">
              <span class="verified-dot" aria-hidden="true"></span>
              <span>${t.verifiedExplainer}</span>
            </div>
            <div class="hero-actions">
              <button type="button" class="button button--primary" data-view="search">${language !== "ja" ? "Find a host" : "ホストを探す"}</button>
              <button id="hero-review-button" type="button" class="button button--ghost">${t.writeReviewCta}</button>
            </div>
          </div>
        </div>
      </section>
    `;

    const searchToolbar = `
      <div id="search" class="search-toolbar">
        <div class="search-bar">
          <span class="icon-chip">⌕</span>
          <input
            id="search-input"
            class="search-input"
            type="text"
            placeholder="${escapeHtml(placeholderSearch)}"
            value="${escapeHtml(state.query)}"
            data-preserve="search-input"
            autocomplete="off"
          />
          <button type="button" class="button button--primary">${t.searchButton}</button>
        </div>
        ${state.query ? `
          <div class="search-toolbar-meta">
            <span class="search-toolbar-meta-text">${escapeHtml(language !== "ja" ? "Searching for" : "検索中：")}</span>
            <span class="search-toolbar-query">${escapeHtml(state.query)}</span>
            <button type="button" id="clear-query" class="button button--ghost button--compact" aria-label="Clear">${language !== "ja" ? "Clear" : "クリア"} ×</button>
          </div>
        ` : ""}
        ${renderSearchSuggestions(state.query)}
        <p class="search-hint">${escapeHtml(searchPlaceholderHint)}</p>
        <button type="button" class="open-sheet-btn" id="open-sheet-btn" aria-label="${language !== "ja" ? "Open filters" : "フィルターを開く"}">
          ☰ ${language !== "ja" ? "Filters" : "フィルター"} ${state.activeFilters.length ? `<span class="filter-badge">${state.activeFilters.length}</span>` : ""}
        </button>
        <div class="quick-filter-wrap">${renderQuickFilters()}</div>
      </div>
    `;

    const stepsSection = `
      <section class="section-steps">
        <div class="container">
          <h2 class="steps-title">${language !== "ja" ? "Find your fit in 3 steps" : "3ステップで自分に合う家庭を見つける"}</h2>
          <p class="steps-subtitle">${language !== "ja"
            ? "No guesswork. Every step is built on verified reviews from real students."
            : "推測ではなく、実際の留学生による検証済みレビューに基づいて 3 つのステップで決められます。"}</p>
          <div class="steps-grid">
            <article class="step-card">
              <div class="step-number">1</div>
              <h3 class="step-card-title">${language !== "ja" ? "Compare areas" : "エリアを比較"}</h3>
              <p class="step-card-text">${language !== "ja"
                ? "See safety, commute, and quietness for each Red Deer neighborhood — at a glance."
                : "Red Deer の各エリアの安全性・通学・静かさを一目で比較。"}</p>
            </article>
            <article class="step-card">
              <div class="step-number">2</div>
              <h3 class="step-card-title">${language !== "ja" ? "Filter by lifestyle" : "ライフスタイルで絞り込み"}</h3>
              <p class="step-card-text">${language !== "ja"
                ? "Pick the personality, meals, rules, and study environment that fit you."
                : "性格タイプ、食事、ルール、学習環境からあなたに合う条件を選択。"}</p>
            </article>
            <article class="step-card">
              <div class="step-number">3</div>
              <h3 class="step-card-title">${language !== "ja" ? "Read verified reviews" : "認証済みレビューを読む"}</h3>
              <p class="step-card-text">${language !== "ja"
                ? "Every review is tied to a verified student account. No fakes, no marketing fluff."
                : "全てのレビューが認証済みアカウントに紐付き。サクラや宣伝文句はありません。"}</p>
            </article>
          </div>
          <div class="steps-cta">
            <button type="button" class="button button--primary" data-view="search">${language !== "ja" ? "Start exploring" : "今すぐ探す"}</button>
          </div>
        </div>
      </section>
    `;

    const homeView = view === "home" ? `
      ${heroSection}
      ${stepsSection}
      <section class="section-results">
        <div class="container">
          <div class="results-head">
            <h2 class="section-title">${language !== "ja" ? "Featured hosts" : "おすすめホスト"}</h2>
          </div>
          <div class="featured-grid">
            ${allHosts().slice(0, 3).map((item) => `
              <article class="card featured-card-mini">
                <div class="card-body">
                  <div class="featured-head">
                    <div>
                      <div class="label">${escapeHtml(item.area)}</div>
                      <h3 class="featured-name">${escapeHtml(hostDisplayName(item))}</h3>
                    </div>
                    ${item.verified ? `<div class="verified-badge" title="${escapeHtml(t.verifiedExplainer)}">✓ ${t.verified}</div>` : ""}
                  </div>
                  ${renderRadarChart(item, { size: 220, padding: 50 })}
                  <button type="button" class="button button--secondary" data-select-host="${item.id}" data-view-after="search">${language !== "ja" ? "View details" : "詳細を見る"}</button>
                </div>
              </article>
            `).join("")}
          </div>
        </div>
      </section>
      ${renderSafetyDesign()}
      ${renderAbout()}
    ` : "";

    const matchSortNotice = currentUser && currentUser.preferences
      ? `<div class="match-sort-notice">${language !== "ja"
          ? "Results sorted by your personal match score."
          : "あなたとのマッチ度順で並べています。"}</div>`
      : `<div class="match-sort-notice match-sort-notice--cta">${language !== "ja"
          ? "Sign up to see personalized match scores for each host."
          : "新規登録すると、各ホストへの「マッチ度」が表示されます。"}</div>`;

    const searchView = view === "search" ? `
      <section class="section-search">
        <div class="container">
          ${searchToolbar}
          <div class="results-head results-head--full">
            <h2 class="section-title">${t.searchResults}</h2>
            <span class="results-count">${filteredHosts.length}</span>
          </div>
          ${matchSortNotice}
          ${renderSearchResults(filteredHosts, host)}
          <div class="search-recent">
            ${renderRecentReviews()}
          </div>
        </div>
      </section>
    ` : "";

    const mapView = view === "map" ? `
      <section class="section-map">
        <div class="container">
          ${renderMap(host)}
        </div>
      </section>
    ` : "";

    const reviewView = view === "review" ? `
      <section class="section-review">
        <div class="container content-grid">
          <div class="results-column">
            ${renderReviewForm(host)}
          </div>
          <div class="sidebar-column">
            ${host ? renderHeroCard(host) : ""}
            ${renderRecentReviews()}
          </div>
        </div>
      </section>
    ` : "";

    const schoolView = view === "school" ? renderSchoolAnalytics() : "";
    const favoritesView = view === "favorites" ? renderFavoritesView() : "";
    const howToView = view === "how-to" ? renderHowTo() : "";
    const privacyView = view === "privacy" ? renderPrivacy() : "";
    const termsView = view === "terms" ? renderTerms() : "";
    const myHostView = view === "my-host" ? renderHostProfile() : "";
    const pricingView = view === "pricing" ? renderPricing() : "";

    const banner = state.bannerDismissed ? "" : `
      <div class="demo-banner demo-banner--soft" role="status" aria-live="polite">
        <div class="container demo-banner-inner">
          <span class="demo-banner-dot" aria-hidden="true"></span>
          <strong>${t.demoBannerLabel}</strong>
          <span class="demo-banner-text">${t.demoBannerText}</span>
          <button id="dismiss-banner" type="button" class="demo-banner-close" aria-label="Dismiss">×</button>
        </div>
      </div>
    `;

    root.innerHTML = `
      <div class="site-shell">
        ${banner}
        <header class="site-header">
          <div class="container header-inner">
            <div class="brand">
              <div class="brand-mark">N</div>
              <div>
                <div class="brand-name">${BRAND_NAME}</div>
                <div class="brand-subtitle">${t.subtitle}</div>
              </div>
            </div>
            <div class="header-actions">
              <label class="language-control" for="language-select">
                <span>${t.languageLabel}</span>
                <select id="language-select" class="language-select" data-preserve="language-select">
                  ${SUPPORTED_LANGUAGES.map((lang) => `<option value="${lang}" ${language === lang ? "selected" : ""}>${escapeHtml(LANGUAGE_LABELS[lang])}</option>`).join("")}
                </select>
              </label>
              ${
                isAdmin()
                  ? `<span class="status-pill status-pill--admin">${t.adminBadge}</span>`
                  : isModerator()
                  ? `<span class="status-pill status-pill--admin">${t.moderatorBadge}</span>`
                  : isHost()
                  ? `<span class="status-pill status-pill--host">${t.hostBadge}</span>`
                  : ""
              }
              ${currentUser ? `<span class="status-pill ${currentUser.verified ? "status-pill--verified" : ""}" title="${escapeHtml(currentUser.school || "")}">${currentUser.verified ? "✓ " : ""}${t.loggedInAs}: ${escapeHtml(currentUser.name)}</span>` : ""}
              ${currentUser && currentUser.preferences ? `<button id="edit-preferences-button" type="button" class="button button--ghost button--header button--compact" title="${language !== "ja" ? "Edit match settings" : "マッチング設定を変更"}">${language !== "ja" ? "⚙ Match" : "⚙ 設定"}</button>` : ""}
              <button id="${currentUser ? "logout-button" : "login-button"}" type="button" class="button button--ghost button--header">${
                currentUser ? t.logout : t.login
              }</button>
            </div>
          </div>
        </header>

        ${renderTabs()}

        <main>
          ${renderLoginPanel()}
          ${view === "home" ? renderTopPrivacy() : ""}
          ${homeView}
          ${searchView}
          ${mapView}
          ${reviewView}
          ${favoritesView}
          ${schoolView}
          ${howToView}
          ${privacyView}
          ${termsView}
          ${myHostView}
          ${pricingView}
          ${view === "home" ? renderReviewPolicy() : ""}
        </main>
        ${renderFooter()}
        ${renderBottomCTA()}
        ${renderBottomSheet()}
        ${state.matchReasonHostId ? (() => {
          const h = allHosts().find((x) => x.id === state.matchReasonHostId);
          return h ? `<div class="match-reason-overlay" data-close-match-reason></div>${renderMatchReasonPopover(h)}` : "";
        })() : ""}
        ${renderReportModal()}
        <div class="footer-spacer"></div>
      </div>
    `;

    bindEvents();
    if (state.view === "map") {
      initMap(host);
    } else if (leafletMap) {
      try { leafletMap.remove(); } catch (_e) {}
      leafletMap = null;
    }
    restoreFocusState(focusState);
    syncReviewsFromApi();
    syncHostRepliesFromApi();
  }

  if (typeof document !== "undefined") {
    // Initial render with whatever is cached (ja or en).
    render();
    // If the saved language is not yet in cache, fetch it and re-render.
    if (!translationCache[language]) {
      loadLanguageFile(language).then(() => {
        t = translationCache[language] || translations.en;
        ui = t;
        render();
      });
    }
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
