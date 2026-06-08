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
  const VIEWS = ["home", "search", "map", "review", "school", "favorites", "how-to", "privacy", "terms", "my-host", "pricing", "admin-restore", "host-reviews"];

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
    pricingIntro: "Nestlyは3つの収益軸でステークホルダー全員に価値を届けます。コンテスト時点のプロトタイプ価格を掲載しています。",
    pricingDisclaimer: "* 表示価格はビジネスコンテスト提案時点の試算です。本サービス開始時には市場状況に応じて調整されます。",
    pricingPlan1Tag: "主力プロダクト",
    pricingPlan1Title: "渡航準備パス（留学生向け）",
    pricingPlan1For: "渡航準備をする留学生向け",
    pricingPlan1Price: "CA$4.99／1ヶ月 ・ CA$9.99／3ヶ月 ・ CA$14.99／6ヶ月",
    pricingPlan1Features: "詳細レビューの全文閲覧\n条件別の絞り込み・比較\n過去レビューとの一致度分析\n広告非表示\n優先サポート",
    pricingPlan2Tag: "B2B",
    pricingPlan2Title: "エージェント向けデータプラン",
    pricingPlan2For: "留学エージェント向け",
    pricingPlan2Price: "CA$2,500／年",
    pricingPlan2Features: "地域別の満足度傾向\nホスト品質の分析\n月次推移トレンド\nCSV／PDFエクスポート\n専任サポート",
    pricingPlan3Tag: "B2B",
    pricingPlan3Title: "ホームステイ運営団体向け分析",
    pricingPlan3For: "ホームステイ運営団体・学校向け",
    pricingPlan3Price: "CA$1,500／年",
    pricingPlan3Features: "匿名化された満足度分析\nマッチング傾向データ\n地域別レポート\n個人を特定しない集計形式",
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
    confirmDeleteReview: "このレビューを削除しますか？この操作は取り消せません。",
    confirmDeleteHost: "このホスト家族を削除しますか？この操作は取り消せません。",
    adminRestoreTitle: "非表示にしたデータの管理",
    adminRestoreHostsSection: "非表示のホスト家族",
    adminRestoreReviewsSection: "非表示のレビュー",
    adminRestoreEmpty: "非表示にしたデータはありません。",
    adminRestoreButton: "復元",
    adminRestoreAllHosts: "すべて復元",
    adminRestoreAllReviews: "すべて復元",
    adminRestoreLink: "🗂 非表示データ管理",
    deleteFamily: "家族を削除",
    deleteFamilyLabel: "この家族を削除",
    geocodeFailed: "住所から位置を取得できませんでした。住所を確認してください。",
    familyNameSameAsArea: "家族名とエリア名は分けて入力してください。",
    adminRatingOnly: "管理者による評価のみ",
    translatedNote: "機械翻訳",
    translatingNote: "翻訳中…",
    translateFailed: "翻訳できませんでした（原文を表示中）",
    showOriginal: "原文を表示",
    showTranslation: "翻訳を表示",
    refineSearch: "検索条件を変えてもう一度探してください。",
    noResultsHint: "別のキーワードやフィルターで試してみましょう。",
    clearFiltersButton: "フィルターをリセット",
    selectFamilyFirst: "レビューを書くには、まずマップまたは検索結果から家族を選択してください。",
    subtitle: "留学生の声で選ぶホームステイ情報プラットフォーム",
    metaDescription: "Nestlyは、Red Deerの留学生がホストファミリーを口コミ・評価で選べるプラットフォームです。運ではなく、データで選ぼう。",
    tagline: "留学を、運ではなく選択に。",
    taglineEn: "Find your nest. Not by luck, but by choice.",
    demoBannerLabel: "デモデータ",
    demoBannerText: "表示中のレビューと一部のホスト情報はプロトタイプ用のサンプルです。本番リリース時には20名のヒアリングを匿名化した実データに差し替えます。",
    aboutEyebrow: "About Nestly",
    aboutTitle: "Red Deerの留学生が、20名の声からつくっています。",
    aboutText: "Nestlyは、カナダRed Deerで高校留学中の開発者が、2025年から現地留学生20名にヒアリングを行い、11カテゴリの評価軸を設計したプロジェクトです。「事前にどんな情報があれば不安が減ったか」を一次データから抽出し、レビューの構造に落とし込みました。情報の空白を埋め、留学を「運任せ」から「納得の選択」へ変えることが、私たちの目標です。",
    aboutStat1Value: "20名",
    aboutStat1Label: "現地留学生ヒアリング",
    aboutStat2Value: "11カテゴリ",
    aboutStat2Label: "構造化評価軸",
    aboutStat3Value: "5項目",
    aboutStat3Label: "生活条件レビュー",
    aboutStat4Value: "Red Deer",
    aboutStat4Label: "初期展開エリア",
    verifiedExplainer: "Verified Host：本人確認済み、レビュー3件以上、平均★4.0以上の家庭に付与（学校コードで投稿者を検証）",
    footerNote: "Nestly はビジネスコンテスト出品中のプロトタイプです。",
    footerCopy: "© 2026 Nestly. Built in Red Deer, Alberta.",
    navAbout: "Nestlyについて",
    navSearch: "レビューを探す・書く",
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
    privacyS1Lines: "Nestlyは以下の情報を収集します。\n• アカウント情報：メール、学校、学年（表示名・母国語・国籍は収集しません）\n• レビュー投稿：評価スコア、本文、選択したホスト家庭\n• 認証情報：学校が発行する認証コード（本人確認時のみ使用、永続保存しません）\n• 任意情報：マッチング用プリファレンス、お気に入りリスト",
    privacyS2Title: "2. 情報の使い方",
    privacyS2Lines: "収集した情報は以下の目的にのみ使用します。\n• レビューの可視化（投稿者名は匿名化／省略形で表示）\n• マッチスコアの算出\n• 学校・エージェント向け集計データの作成（個人特定不可な形式）\n• スパム・不正投稿の検出",
    privacyS3Title: "3. 公開される情報・公開されない情報",
    privacyS3Lines: "【公開】学年、レビュー内容、評価（レビューはすべて匿名で表示されます）\n【非公開】メールアドレス、本名、学校コード、認証コード、IPアドレス\n　※学校コードは「非公開」です。レビューは匿名のため、学校コードを公開すると学校側が投稿者を特定（匿名化の解除）できてしまう恐れがあります。投稿者を守るため、学校コードは集計・本人確認の内部処理だけに使い、公開や第三者への共有は行いません。\n【特別保護】ホスト家庭の正確な住所は地図上に表示しません。半径250mの円で位置を曖昧化し、地図の最大ズームは14に制限しています。",
    privacyS4Title: "4. 第三者への提供",
    privacyS4Lines: "法令で義務付けられる場合を除き、個人情報を第三者に提供しません。\n• 学校・エージェントには集計データのみ提供（個人特定不可）\n• ジオコーディング（住所の文字列を地図上の緯度・経度に変換する処理）には OpenStreetMap の Nominatim という外部サービスを利用します。ホスト家庭のおおよそのエリア名のみを送信し、正確な番地は送りません（将来は自社サーバー経由に切り替え、外部送信をさらに減らす予定です）",
    privacyS5Title: "5. データの保管",
    privacyS5Lines: "• 本番環境ではレビューデータをSupabase（PostgreSQL）に保管します\n• パスワードはSHA-256でハッシュ化して保管（平文では保存しません）\n• 通報内容はreports.jsonに保管し、モデレーターのみが確認できます",
    privacyS6Title: "6. ユーザーの権利",
    privacyS6Lines: "あなたは以下の権利を持ちます。\n• 自分のレビューをいつでも編集する権利（編集後は「編集済み」と表示されます）\n• 自分のレビューの削除を依頼する権利\n• アカウントの削除を依頼する権利\n• 自分の情報の開示・訂正を求める権利\n上記は運営チームへの連絡で対応します。",
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
    termsS5Lines: "• 自分の投稿はいつでも編集できます（編集後は「編集済み」と表示されます）\n• 投稿はユーザーの依頼により削除できます\n• 規約違反の投稿はモデレーターが予告なく削除する場合があります",
    termsS6Title: "6. 免責事項",
    termsS6Lines: "• レビューはユーザー個人の感想であり、Nestlyが内容の正確性を保証するものではありません\n• Nestlyを通じた家庭選びの結果について、Nestlyは責任を負いかねます\n• サービス停止・データ消失等の損害について、故意・重過失の場合を除き責任を負いかねます",
    termsS7Title: "7. 規約の変更",
    termsS7Lines: "本規約は予告なく変更される場合があります。重要な変更がある場合はサイト内で告知します。継続してご利用いただくことで変更後の規約に同意したものとみなします。",
    termsS8Title: "8. 準拠法",
    termsS8Lines: "本規約はカナダ・アルバータ州の法律に準拠します（プロトタイプ段階のため将来変更の可能性あり）。",
    howToHeroEyebrow: "How to use",
    howToHeroTitle: "Nestlyの使い方",
    howToHeroText: "Nestlyは3つの立場で使えます。あなたの目的に合うセクションをご覧ください。",
    howToStudentSection: "1. 留学生のあなたへ",
    howToStudentIntro: "渡航前のホスト選びから、滞在後のレビュー投稿まで4ステップ。",
    howToStudent1Title: "STEP 1：探す",
    howToStudent1Body: "検索バー・フィルター・マップから、エリアや評価でホストを絞り込み。マッチ%で自分との相性を一目で確認できます。",
    howToStudent2Title: "STEP 2：詳しく見る",
    howToStudent2Body: "主要6軸のレーダーチャートで強み・弱みを比較（補助評価軸も詳細で確認可）。信頼指標（レビュー数・多様性・最新性）で投稿の確からしさをチェック。レビュー全文・タグも参照できます。レビューがまだない家庭は「レビュー待ち」と表示されます。",
    howToStudent3Title: "STEP 3：保存・選ぶ",
    howToStudent3Body: "気になるホストはハート（♥）でお気に入りに保存。エージェントや家族との相談材料にお使いください。",
    howToStudent4Title: "STEP 4：滞在後にレビューを書く",
    howToStudent4Body: "家族を選んで11軸を星で評価し、向いている人タグ・おすすめ度・本文を記入して投稿。あなたの声が次の留学生を支えます。",
    howToHostSection: "2. ホストファミリーへ",
    howToHostIntro: "自分の受け入れ方を磨き、信頼を可視化する仕組みです。",
    howToHost1Title: "自分の家庭の評価を見る",
    howToHost1Body: "ホスト用ログインから自家庭ページにアクセス。各評価軸のスコアとレビュー全文を確認できます。",
    howToHost2Title: "強み・弱みを把握する",
    howToHost2Body: "自家庭ページでは評価の高いカテゴリ・低いカテゴリが一覧で見えます。何が留学生に喜ばれているかを把握できます。",
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
    demoAccounts: "メールアドレスで新規登録してご利用ください。",
    badge: "本人確認済みレビューでホームステイの不安を減らす",
    heroTagline: "運ではなく、情報で選ぶ。",
    findHostCta: "ホストを探す",
    matchLabel: "マッチ度",
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
    mapTitle: "ホストマップ",
    mapHelp:
      "正確な住所と非公開ピンは地図配置のためだけに使います。公開画面にはエリア名だけを表示します。",
    area: "エリア",
    mapPrivacy: "住所は非公開。表示位置は近隣エリアの参考地点です。",
    searchResults: "検索結果",
    pendingReview: "レビュー待ち",
    pendingReviewHint: "まだレビューがありません。最初のレビューを書いて評価を始めましょう。",
    hostModerationNote: "このホストに投稿された1件のレビューを、コミュニティガイドライン違反（個人攻撃・差別的表現）のため削除しました。これはレビューの表現に対する措置であり、ホスト家庭への評価ではありません。",
    trustSafetyTitle: "信頼と安全（モデレーション透明性）",
    trustSafetyBody: "モデレーション実績：これまでに{count}件を、個人攻撃・差別的表現のガイドライン違反により削除しました。Nestlyは正直な低評価は保護し、攻撃的・差別的な投稿のみを除去します。",
    noResults: "条件に一致するホストファミリーが見つかりません。",
    reviewForm: "レビュー投稿フォーム",
    reviewLead: "レビューする家族を選び、カテゴリごとに星5段階で評価して本文を書き込めます。",
    verificationPilotNote: "現在はプロトタイプのため、本人確認なしで匿名投稿できます。滞在証明・学校発行コードによる本人確認は、Red Deer での実証運用で順次導入予定です。",
    reviewPlaceholder:
      "例）ホストは50代のご夫婦で、初日に家のルール（門限は平日22時、週末は事前に伝えればOK）を丁寧に説明してくれて安心できました。英語を話す機会は夕食のときを中心に多く、わからない単語はゆっくり言い換えてくれます。食事は野菜が多くバランスがよく、アレルギーにも対応してくれました。学校までは車で15分ほどで、雨の日は送ってくれることもありました。部屋は個室でWi-Fiも安定しています。困ったときにすぐ相談できる雰囲気だったので、初めての留学で不安な人にもおすすめです。\n\n※上のような文章はあくまで例です。家庭の雰囲気・英語環境・食事や部屋・通学やサポート・どんな人に向くか、を自分の言葉で書いてみてください。",
    submitReview: "匿名レビューを投稿する",
    submitted: "レビューを保存しました。検索結果と最近のレビューに反映されています。",
    recentReviews: "最近のレビュー",
    noReviewsYet: "まだ投稿レビューはありません。最初のレビューを書き込めます。",
    schoolTitle: "学校・エージェント向け分析機能",
    schoolText:
      "英語環境、自由度、学習環境、食事、メンタル面、交通・送迎、安全の傾向を可視化し、問題の早期発見とホームステイ品質の改善につなげます。",
    schoolPilotNotice:
      "※ 現在表示中のスコアはプロトタイプ用のサンプルです。実際の地域別傾向データは、Red Deer での実証運用を通じて蓄積予定です。",
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
    stayPeriodLabel: "滞在期間",
    stayPeriodHint: "この家庭にどのくらい滞在しましたか？（現在も滞在中の場合は、これまでの期間を選んでください）",
    stayPeriodSelectDefault: "選択してください",
    stayPeriodOptions: [
      ["under1m", "1ヶ月未満"],
      ["1to3m", "1〜3ヶ月"],
      ["3to6m", "3〜6ヶ月"],
      ["6to12m", "6〜12ヶ月"],
      ["over1y", "1年以上"],
    ],
    stayPeriodMissing: "「滞在期間」を選択してください。",
    stayPeriodPrefix: "滞在期間：",
    reviewText: "レビュー本文",
    anonymousStudent: "匿名留学生",
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
    riskLowRules: "自由度の低さ",
    riskCommute: "通学・冬の移動",
    riskSupport: "相談しにくさ",
    criteria: {
      englishEnvironment: ["英語環境", "英語環境の強さ / 家族との会話量 / 英語矯正してくれるか"],
      rules: ["自由度", "高い＝柔軟・自由度高め ／ 低い＝厳しめ・規則多い（門限・外泊・自由時間）"],
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
    pricingIntro: "Nestly delivers value across three revenue streams so every stakeholder benefits. Prices below reflect the prototype-stage proposal.",
    pricingDisclaimer: "* Prices are illustrative for the contest submission. Actual prices will be adjusted at launch.",
    pricingPlan1Tag: "Core product",
    pricingPlan1Title: "Trip Prep Pass",
    pricingPlan1For: "For students preparing to study abroad",
    pricingPlan1Price: "CA$4.99 / 1 mo · CA$9.99 / 3 mo · CA$14.99 / 6 mo",
    pricingPlan1Features: "Read full review texts\nFilter and compare by your conditions\nMatch-rate analysis against past reviews\nNo ads\nPriority support",
    pricingPlan2Tag: "B2B",
    pricingPlan2Title: "Agent data plan",
    pricingPlan2For: "For study-abroad agents",
    pricingPlan2Price: "CA$2,500 / year",
    pricingPlan2Features: "Regional satisfaction trends\nHost quality analysis\nMonthly trend tracking\nCSV / PDF export\nDedicated support",
    pricingPlan3Tag: "B2B",
    pricingPlan3Title: "Homestay-org analytics",
    pricingPlan3For: "For homestay organizations & schools",
    pricingPlan3Price: "CA$1,500 / year",
    pricingPlan3Features: "De-identified satisfaction analytics\nMatching-trend data\nRegional reports\nAnonymity-preserving aggregation",
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
    confirmDeleteReview: "Delete this review? This action cannot be undone.",
    confirmDeleteHost: "Delete this host family? This action cannot be undone.",
    adminRestoreTitle: "Manage Hidden Data",
    adminRestoreHostsSection: "Hidden Host Families",
    adminRestoreReviewsSection: "Hidden Reviews",
    adminRestoreEmpty: "No hidden data.",
    adminRestoreButton: "Restore",
    adminRestoreAllHosts: "Restore All",
    adminRestoreAllReviews: "Restore All",
    adminRestoreLink: "🗂 Hidden Data",
    deleteFamily: "Delete family",
    deleteFamilyLabel: "Delete this family",
    geocodeFailed: "Could not place the pin from that address. Check the address and try again.",
    familyNameSameAsArea: "Enter a family name that is different from the area name.",
    adminRatingOnly: "Admin rating only",
    translatedNote: "Machine-translated",
    translatingNote: "Translating…",
    translateFailed: "Translation unavailable (showing original)",
    showOriginal: "Show original",
    showTranslation: "Show translation",
    refineSearch: "Change the search terms and try again.",
    noResultsHint: "Try a different keyword or adjust the filters.",
    clearFiltersButton: "Reset filters",
    selectFamilyFirst: "Choose a family from the map or search results before writing a review.",
    subtitle: "A review platform for choosing host families with confidence",
    metaDescription: "Nestly helps international students in Red Deer choose host families through structured ratings and real reviews — not luck.",
    tagline: "Find your nest. Not by luck, but by choice.",
    taglineEn: "Find your nest. Not by luck, but by choice.",
    demoBannerLabel: "Demo data",
    demoBannerText: "Reviews and some host details shown here are prototype samples. They will be replaced with anonymized data from 20 student interviews before launch.",
    aboutEyebrow: "About Nestly",
    aboutTitle: "Built in Red Deer, from 20 student voices.",
    aboutText: "Nestly is a project by a high-school exchange student in Red Deer, Canada. Starting in 2025, the developer interviewed 20 international students locally and used their stories to design the 11-category rating system you see today. The core question — 'what information would have eased your anxiety before you arrived?' — drove every part of the data model. Our goal: turn studying abroad from a gamble into an informed choice.",
    aboutStat1Value: "20",
    aboutStat1Label: "Students interviewed locally",
    aboutStat2Value: "11",
    aboutStat2Label: "Structured rating categories",
    aboutStat3Value: "5",
    aboutStat3Label: "Living-condition review fields",
    aboutStat4Value: "Red Deer",
    aboutStat4Label: "Initial pilot area",
    verifiedExplainer: "Verified Host: granted to ID-verified families with 3+ reviews and an average of ★4.0 or higher (reviewers verified by school code).",
    footerNote: "Nestly is a prototype submitted to a business contest.",
    footerCopy: "© 2026 Nestly. Built in Red Deer, Alberta.",
    navAbout: "About",
    navSearch: "Find & write reviews",
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
    privacyS1Lines: "We collect the following information:\n• Account info: email, school, grade (we do not collect display name, native language, or nationality)\n• Review submissions: ratings, body text, selected host family\n• Verification info: school-issued codes (used only for ID checks, not stored long-term)\n• Optional info: matching preferences and favorites list",
    privacyS2Title: "2. How we use your information",
    privacyS2Lines: "We use collected information only for:\n• Displaying reviews (with reviewer names anonymized or shortened)\n• Calculating match scores\n• Generating aggregated data for schools and agents (de-identified)\n• Detecting spam and abuse",
    privacyS3Title: "3. What's public and what's private",
    privacyS3Lines: "Public: grade, review content, ratings (all reviews are shown anonymously).\nPrivate: email address, real name, school code, verification code, IP address.\n  Note: the school code is kept private. Because reviews are anonymous, publishing the school code could let a school re-identify (de-anonymize) the author. To protect reviewers, the school code is used only for internal aggregation and ID checks — it is never published or shared with third parties.\nSpecial protection: exact host addresses are never shown on the map. We obfuscate location with a 250m-radius circle and cap map zoom at level 14.",
    privacyS4Title: "4. Sharing with third parties",
    privacyS4Lines: "Except where required by law, we do not share personal information with third parties.\n• Schools and agents receive only aggregated, de-identified data\n• Geocoding (converting an address into map latitude/longitude) uses an external service, OpenStreetMap Nominatim. We send only the host's approximate area name, never the exact street address (we plan to route this through our own server later to further reduce external requests)",
    privacyS5Title: "5. Data storage",
    privacyS5Lines: "• In production, review data is stored on Supabase (PostgreSQL)\n• Passwords are hashed with SHA-256 (never stored in plain text)\n• Reports are stored in reports.json and accessible only to moderators",
    privacyS6Title: "6. Your rights",
    privacyS6Lines: "You have the right to:\n• Edit your own reviews at any time (edited reviews are marked as \"edited\")\n• Request deletion of your reviews\n• Request deletion of your account\n• Request disclosure or correction of your information\nThese can be handled by contacting the Nestly team.",
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
    termsS5Lines: "• You can edit your own posts at any time (edited posts are marked as \"edited\")\n• Posts can be removed at the user's request\n• Posts that violate these terms may be removed by moderators without notice",
    termsS6Title: "6. Disclaimers",
    termsS6Lines: "• Reviews reflect individual users' opinions; Nestly does not guarantee their accuracy\n• Nestly is not liable for outcomes of placement decisions made via the platform\n• Except in cases of intent or gross negligence, Nestly is not liable for service interruptions or data loss",
    termsS7Title: "7. Changes to these terms",
    termsS7Lines: "These terms may change without notice. Significant changes will be announced on the site. Continued use of the service constitutes acceptance of the updated terms.",
    termsS8Title: "8. Governing law",
    termsS8Lines: "These terms are governed by the laws of Alberta, Canada. (Subject to change as the prototype matures.)",
    howToHeroEyebrow: "How to use",
    howToHeroTitle: "How to use Nestly",
    howToHeroText: "Nestly works for three kinds of users. Browse the section that matches your role.",
    howToStudentSection: "1. For students",
    howToStudentIntro: "From choosing a host before you go, to writing a review after — in four steps.",
    howToStudent1Title: "STEP 1: Search",
    howToStudent1Body: "Find hosts by area, ratings, or attributes using search, filters, or the map. The match% chip shows compatibility at a glance.",
    howToStudent2Title: "STEP 2: Look deeper",
    howToStudent2Body: "Compare strengths and weaknesses with the 6-axis radar chart (auxiliary axes are shown in the details). Check trust indicators (review count, diversity, recency) to gauge reliability. Read full reviews and tags. Families with no reviews yet are marked “Awaiting review.”",
    howToStudent3Title: "STEP 3: Save and choose",
    howToStudent3Body: "Save promising hosts with the heart icon (♥). Use them as talking points with your agent or family.",
    howToStudent4Title: "STEP 4: Write a review after your stay",
    howToStudent4Body: "Pick a family, rate all 11 axes, choose “best for” tags and a recommendation, and write your review — to support the next student.",
    howToHostSection: "2. For host families",
    howToHostIntro: "Refine your hosting and make your reliability visible.",
    howToHost1Title: "See your own ratings",
    howToHost1Body: "Sign in as a host to view your family's page — see your scores per axis and read the full reviews.",
    howToHost2Title: "Understand your strengths",
    howToHost2Body: "Your family page lists your highest- and lowest-rated categories, so you can see what students appreciate most.",
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
    demoAccounts: "Sign up with your email to get started.",
    badge: "Reduce homestay uncertainty with verified student reviews",
    heroTagline: "Find your nest. Not by luck, but by choice.",
    findHostCta: "Find a host",
    matchLabel: "Match",
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
    mapTitle: "Host map",
    mapHelp: "Exact addresses and private pins are used only for placement. Public pages show the area name only.",
    area: "Area",
    mapPrivacy: "Addresses are private. Pins show approximate nearby areas.",
    searchResults: "Search results",
    pendingReview: "Awaiting review",
    pendingReviewHint: "No reviews yet. Be the first to write one and start the rating.",
    hostModerationNote: "1 review for this host was removed for violating our community guidelines (personal attacks / discriminatory language). This reflects the review's content, not a judgment of the host.",
    trustSafetyTitle: "Trust & Safety",
    trustSafetyBody: "Moderation to date: {count} reviews removed for violating our guidelines (personal attacks / discriminatory language). Nestly protects honest negative reviews and removes only abusive or discriminatory content.",
    noResults: "No host families match those conditions.",
    reviewForm: "Review form",
    reviewLead: "Choose a family, rate each category from 1 to 5 stars, and write your review.",
    verificationPilotNote: "This is a prototype, so reviews can be posted anonymously without identity checks. Identity verification via proof of stay and school-issued codes will be rolled out during the Red Deer pilot.",
    reviewPlaceholder:
      "Example: My hosts were a couple in their 50s who explained the house rules on day one (weekday curfew at 10pm, weekends OK with advance notice), which put me at ease. I had plenty of chances to speak English, especially at dinner, and they patiently rephrased words I didn't know. Meals were balanced with lots of vegetables, and they accommodated my allergies. School was about a 15-minute drive, and they sometimes gave me a ride on rainy days. I had a private room with stable Wi-Fi. It was easy to ask for help whenever I needed it, so I'd recommend them especially to first-time students who feel anxious.\n\nNote: the text above is just an example. In your own words, try to cover the atmosphere, the English environment, meals and your room, the commute and support, and who this family would suit.",
    submitReview: "Post anonymous review",
    submitted: "Review saved. It now appears in search results and recent reviews.",
    recentReviews: "Recent reviews",
    noReviewsYet: "No reviews have been posted yet. You can write the first one.",
    schoolTitle: "Analytics for schools and agencies",
    schoolText:
      "Visualize trends in English environment, freedom, study conditions, meals, mental support, transportation and rides, and safety to detect issues early and improve homestay quality.",
    schoolPilotNotice:
      "Note: the scores shown are prototype samples. Real regional trend data will be accumulated through our pilot operation in Red Deer.",
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
    stayPeriodLabel: "Length of stay",
    stayPeriodHint: "How long did you stay with this family? (If you're still staying, choose how long it has been so far.)",
    stayPeriodSelectDefault: "Select...",
    stayPeriodOptions: [
      ["under1m", "Under 1 month"],
      ["1to3m", "1–3 months"],
      ["3to6m", "3–6 months"],
      ["6to12m", "6–12 months"],
      ["over1y", "Over 1 year"],
    ],
    stayPeriodMissing: "Please select your length of stay.",
    stayPeriodPrefix: "Stay: ",
    reviewText: "Review text",
    anonymousStudent: "Anonymous student",
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
    riskLowRules: "Low freedom",
    riskCommute: "Commute and winter access",
    riskSupport: "Low support signals",
    criteria: {
      englishEnvironment: ["English environment", "English exposure / Conversation with family / English correction"],
      rules: ["Freedom", "Higher = more freedom & flexible rules · Lower = stricter (curfew, overnight, free time)"],
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

  // セキュリティ上の理由で、公開ビルドには admin / moderator のデモアカウントを
  // 一切含めない（クライアント JS は誰でも閲覧できるため、ここに認証情報を書くと
  // 第三者がそのままログインして削除・モデレーションなどの破壊的操作を実行できてしまう）。
  // モデレーションはオーナーが管理スクリプト経由で行う運用。将来的に管理 UI を公開で
  // 使う場合は、Supabase 側の認証 + RLS（行レベルセキュリティ = 行ごとのアクセス権限制御）で
  // サーバー側からも破壊的操作を保護すること。ローカルでだけ管理 UI を試したい時は
  // この配列に一時的にアカウントを足す（コミット・デプロイしない）。
  const accounts = [];

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
    mealQuality: 3,
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
      mealQuality: radarValue(host, radarAxes[2]),
      mentalSupport: radarValue(host, radarAxes[3]),
      commute: radarValue(host, radarAxes[4]),
      study: radarValue(host, radarAxes[5]),
    };
    let weightedSum = 0;
    let maxPossible = 0;
    for (const key of Object.keys(importance)) {
      if (!(key in radarValues)) continue; // 旧 cultureFit など廃止軸の保存値はスキップ
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
  // 初回ロード時に <html lang> を保存済み言語に同期（スクリーンリーダー対応）
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
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
      title: "自由度",
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

  // レビューフォームから外した評価軸。集計・分析の表示からは除外する
  // （ベイクド・イン ホストの基礎データには値が残っているため明示的に弾く）。
  const DEPRECATED_GROUP_KEYS = ["cultureFit", "privacy", "chores"];

  // 補助評価軸（レーダーの主要6軸に含まれない現行の評価グループ）。
  // レビュー閲覧時にレーダーの下へ内訳として表示する。
  const AUX_GROUP_KEYS = ["rules", "internetQuality", "cleanliness", "hostExperience"];

  // Tiered weighted scoring (revised based on student wellbeing research):
  //   T1 Safety/wellbeing (×2.5)   T2 Daily QoL & study-abroad value (×2.0)
  //   T3 Academics/commute (×1.5/×1.0)   T4 Living base (×1.0)
  //   T5 Convenience (×0.5)
  const axisWeights = {
    safetyEnvironment: 2.5,  // T1
    mentalSupport: 2.5,      // T1
    mealQuality: 2.0,        // T2 (promoted from aux)
    englishEnvironment: 2.0, // T2
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
    "safetyEnvironment", "englishEnvironment", "mealQuality", "mentalSupport",
    "transportation", "rideSupport", "study",
    "rules", "internetQuality", "cleanliness", "hostExperience",
  ];

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

  // Categorized filters（Airbnb スタイル、3カテゴリ × 3〜4択）
  // 設計方針：
  //   ① 各フィルターは「あると嬉しい条件」のみ（ネガティブ条件は除外）
  //   ② 同時に複数選択可能（AND 条件）
  //   ③ デフォルトは全解除（state.activeFilters = []）
  //   ④ 件数表示はフィルタリング結果をリアルタイムカウント
  const filterCategories = [
    {
      id: "commute",
      titleJa: "🚌 通学・環境",
      titleEn: "🚌 Commute & study",
      filters: [
        { key: "nearSchool",      labelJa: "学校に近い",         labelEn: "Near school",              match: (h) => groupScore(h, criteriaGroups.find((g) => g.key === "transportation")) >= 4.4 },
        { key: "transitFriendly", labelJa: "公共交通が便利",     labelEn: "Transit-friendly",         match: (h) => h.tags.some((tg) => /バス|transit|bus/i.test(String(tg))) || Number(h.criteria && h.criteria.bus) >= 4.3 },
        { key: "studyStrong",     labelJa: "学習環境が整っている", labelEn: "Study-friendly",          match: (h) => groupScore(h, criteriaGroups.find((g) => g.key === "study")) >= 4.5 },
      ],
    },
    {
      id: "lifestyle",
      titleJa: "🏡 家庭スタイル",
      titleEn: "🏡 Home style",
      filters: [
        { key: "sharedMeals",   labelJa: "家族で食事あり",     labelEn: "Family meals",             match: (h) => h.tags.some((tg) => /夕食|meal|dinner/i.test(String(tg))) || groupScore(h, criteriaGroups.find((g) => g.key === "mealQuality")) >= 4.3 },
        { key: "quiet",         labelJa: "静かな環境",         labelEn: "Quiet home",               match: (h) => groupScore(h, criteriaGroups.find((g) => g.key === "study")) >= 4.4 },
        { key: "englishOnly",   labelJa: "英語漬け環境",       labelEn: "English-immersive",        match: (h) => groupScore(h, criteriaGroups.find((g) => g.key === "englishEnvironment")) >= 4.5 },
        { key: "petFriendly",   labelJa: "ペット可",           labelEn: "Pet-friendly",             match: (h) => getHostFit(h).some((f) => f.toLowerCase().includes("pet") || f.includes("ペット")) },
      ],
    },
    {
      id: "personality",
      titleJa: "😊 タイプ・相性",
      titleEn: "😊 Personality fit",
      filters: [
        { key: "introvertFriendly", labelJa: "内向きな人に優しい",  labelEn: "Introvert-friendly",     match: (h) => getHostFit(h).some((f) => f.toLowerCase().includes("introvert") || f.includes("内向")) },
        { key: "socialFamily",      labelJa: "社交的・にぎやか",   labelEn: "Social & outgoing",      match: (h) => getHostFit(h).some((f) => f.toLowerCase().includes("social") || f.includes("社交")) || groupScore(h, criteriaGroups.find((g) => g.key === "englishEnvironment")) >= 4.5 },
        { key: "independentEnv",    labelJa: "自立型（自由が多い）", labelEn: "Independent lifestyle",  match: (h) => groupScore(h, criteriaGroups.find((g) => g.key === "rules")) >= 4.3 },
        { key: "sportsFriendly",    labelJa: "スポーツ・アクティブ", labelEn: "Sports & active",       match: (h) => getHostFit(h).some((f) => f.toLowerCase().includes("sport") || f.includes("スポーツ")) },
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
      name: "Demo Family",
      isDemo: true,
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
        roomPrivacy: 4.3, roomLock: 4.0, belongings: 4.4,
        choreAmount: 4.1, choreBalance: 4.2,
        hostingYears: 4.0,
      },
    },
    // モデレーションで全レビューを削除した家庭。マップ・一覧には残すため恒久登録する。
    // 評価データ（criteria）は持たせず、レビュー0件＝「レビュー募集中」状態で表示される。
    {
      id: 1780480419270,
      name: "Nollido Family",
      city: "Red Deer, Alberta",
      area: "Johnstone Park",
      lat: 52.3032193,
      lng: -113.8401426,
      reviews: 0,
      moderated: true,
      tags: ["Johnstone Park"],
      tagsEn: ["Johnstone Park"],
      fit: [],
      summary: "",
      summaryEn: "",
      criteria: {},
    },
    {
      id: 1780478547456,
      name: "Liza melgar Family",
      city: "Red Deer, Alberta",
      area: "Red Deer area",
      lat: 52.2711,
      lng: -113.8142,
      reviews: 0,
      moderated: true,
      tags: ["Red Deer area"],
      tagsEn: ["Red Deer area"],
      fit: [],
      summary: "",
      summaryEn: "",
      criteria: {},
    },
  ];

  // モデレーション記録（本文は保存しない＝透明化のための最小ログ）。
  // プロトタイプのため定数で保持。実運用では Supabase の moderation_log 等へ移す想定。
  const MODERATION_LOG = [
    { hostId: 1780480419270, host: "Nollido Family", removedAt: "2026-06-07", reasonCategory: "personal_attack_discrimination" },
    { hostId: 1780478547456, host: "Liza melgar Family", removedAt: "2026-06-07", reasonCategory: "personal_attack_discrimination" },
  ];
  function hostModerationCount(host) {
    if (!host) return 0;
    return MODERATION_LOG.filter((m) => Number(m.hostId) === Number(host.id) || m.host === host.name).length;
  }
  function totalModerationCount() {
    return MODERATION_LOG.length;
  }

  const defaultScores = Object.fromEntries(criteriaGroups.map((group) => [group.key, 0]));

  const state = {
    query: "",
    selectedId: null,
    reviewText: "",
    reviewScores: { ...defaultScores },
    reviewStayPeriod: "",  // レビュー対象家庭に住んでいた期間（structured.stayPeriod として永続化）
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
    signupForm: { signupAs: "user", email: "", password: "", school: "", grade: "", schoolCode: "", hostId: "" },
    loginForm: { email: "", password: "" },
    onboardingOpen: false,
    onboardingStep: 0,
    pendingPreferences: null,  // built up during onboarding
    expandedHostId: null,  // for inline detail expansion in search results
    mapCollapsed: false,   // 統合「探す」ページの埋め込みマップ折りたたみ状態
    missingScores: [],     // for highlighting unfilled required axes after submit attempt
    // ----- new in Phase 4 -----
    favorites: loadFavorites(),
    helpfulVotes: loadHelpful(),  // { [reviewId]: vote count }
    bottomSheetOpen: false,  // mobile filter sheet
    quickFiltersOpen: false, // desktop inline quick-filter panel: open/closed toggle
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
      ? { safetyEnvironment: "安全", englishEnvironment: "英語環境", mealQuality: "食事", mentalSupport: "メンタルサポート", commute: "通学・送迎", study: "学習向き" }
      : { safetyEnvironment: "Safety", englishEnvironment: "English", mealQuality: "Meal", mentalSupport: "Mental support", commute: "Commute", study: "Study fit" };
    const radarValues = {
      safetyEnvironment: radarValue(host, radarAxes[0]),
      englishEnvironment: radarValue(host, radarAxes[1]),
      mealQuality: radarValue(host, radarAxes[2]),
      mentalSupport: radarValue(host, radarAxes[3]),
      commute: radarValue(host, radarAxes[4]),
      study: radarValue(host, radarAxes[5]),
    };
    // Identify top contributing + concerning axes
    Object.keys(importance).forEach((key) => {
      if (!(key in radarValues)) return; // 旧 cultureFit など廃止軸の保存値はスキップ
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
  // レビューは投稿後いつでも編集可能（2026-05-31 に 24h ロックを撤廃）。
  // 投稿者が後から追記・修正できるようにする方針。編集すると editedAt フラグが付き、
  // 「編集済み」表示で透明性を保つ。EDIT_LOCK_HOURS は廃止。
  function isReviewEditable(review) {
    return !!review;
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

  // NOTE: Verified Host 概念は全面廃止（2026-05-31）。ホスト品質バッジは出さない方針。
  // 以前の isVerifiedHost() はここで定義していたが、全参照を削除したため関数も撤去した。

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
  // レーダーチャートの軸。視認性を優先し主要 6 軸の六角形に統一（2026-05-31 に 11 軸へ拡張したが
  // 見にくいため 6 軸へ戻した）。ここに並ぶ軸の単純平均が「総合評価」と完全に一致する
  // （radarOverall / getHostStats）。補助軸（自由度・食事・清潔さ・ネット・受け入れ経験）は
  // 詳細テーブル（renderCriteriaSummary）側で確認できる。
  // 注：transportation と rideSupport は UI 上 1 入力なので "commute" に統合（二重計上を防ぐ）。
  const radarAxes = [
    { key: "safetyEnvironment", label: "安全", labelEn: "Safety", sourceKeys: ["safetyEnvironment"] },
    { key: "englishEnvironment", label: "英語環境", labelEn: "English", sourceKeys: ["englishEnvironment"] },
    { key: "mealQuality", label: "食事", labelEn: "Meal", sourceKeys: ["mealQuality"] },
    { key: "mentalSupport", label: "メンタルサポート", labelEn: "Mental support", sourceKeys: ["mentalSupport"] },
    { key: "commute", label: "通学・送迎", labelEn: "Commute & Ride", sourceKeys: ["transportation", "rideSupport"] },
    { key: "study", label: "学習向き", labelEn: "Study fit", sourceKeys: ["study"] },
  ];

  // レーダーに描画される全軸の単純平均 ＝ 総合評価。
  // 「チャートの見た目の重心」と「総合の数字」を完全一致させるため、ここを単一の真実源にする。
  // transportation/rideSupport を統合した "commute" 軸を 1 つとして数えるので二重計上は起きない。
  function radarOverall(host) {
    if (!host) return 0;
    const vals = radarAxes
      .map((axis) => radarValue(host, axis))
      .filter((v) => Number.isFinite(v) && v > 0);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  }

  // 重み付けは「最適化工程（マッチング設定）を済ませたログイン済みユーザー」だけに適用する。
  // それ以外（未ログイン or 設定未完了）は全軸を一律 1 倍にした単純平均（radarOverall）。
  function viewerIsOptimized() {
    return !!(currentUser && currentUser.preferences && currentUser.preferences.importance);
  }

  // 表示用の総合評価。最適化済みユーザーには本人の重視度（importance 1〜5）で
  // 重み付けした加重平均を返し、そうでなければ単純平均を返す。
  function overallForViewer(host) {
    if (!host) return 0;
    if (!viewerIsOptimized()) return radarOverall(host);
    const importance = currentUser.preferences.importance || {};
    let wSum = 0;
    let wTotal = 0;
    radarAxes.forEach((axis) => {
      const v = radarValue(host, axis);
      if (!Number.isFinite(v) || v <= 0) return;
      // 重視度が未設定の軸は 1 倍扱い。
      const w = Number(importance[axis.key]);
      const weight = Number.isFinite(w) && w > 0 ? w : 1;
      wSum += v * weight;
      wTotal += weight;
    });
    return wTotal > 0 ? wSum / wTotal : radarOverall(host);
  }

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
  let leafletMiniMap = null; // レビュー選択確認用ミニマップ
  let mapRetryTimer = null;  // Leaflet(CDN) 未ロード時のリトライ用タイマー
  let mapRetryCount = 0;     // リトライ回数（CDN が遅い時の一時的失敗をリカバリ）
  let apiSyncStarted = false;
  let repliesSyncStarted = false;
  let locationHealStarted = false;

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
    // URL のハッシュ（#/search など）を「正」としてビューを解決する。
    // - ハッシュがあり既知のビュー → そのビュー（ディープリンク・リロード・共有が機能）
    // - ハッシュがあるが未知のルート → home へフォールバック
    // - ハッシュが無い（トップURL直打ち）→ home（前回ビューが残って混乱するのを防ぐ）
    if (typeof window !== "undefined" && window.location) {
      const fromHash = (window.location.hash || "").replace(/^#\/?/, "").trim();
      if (fromHash) return VIEWS.includes(fromHash) ? fromHash : "home";
    }
    return "home";
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

  // デモ版方針：ログインは sessionStorage に保持する。
  //   - リロードではログイン状態を維持（審査中に誤って消えない）
  //   - タブ／ウィンドウを閉じると自動でログアウト（次の審査員にクリーンな状態で見せられる）
  // 本番で「次回も自動ログイン」が必要になったら localStorage に戻す。
  function sessionStore() {
    // sessionStorage が使えない環境（プライベートモード等）では localStorage にフォールバック。
    if (typeof sessionStorage !== "undefined") return sessionStorage;
    if (typeof localStorage !== "undefined") return localStorage;
    return null;
  }

  function loadSession() {
    const store = sessionStore();
    if (!store) return null;
    try {
      const parsed = JSON.parse(store.getItem(SESSION_KEY) || "null");
      // admin / moderator は公開ビルドでは取得不可能なロール。過去に旧デモアカウントで
      // ログインした端末に残っている特権セッションは復元せず、ログアウト扱いにする
      // （クライアントだけで特権を持ち続けられないようにするため）。
      return parsed && ["user", "host"].includes(parsed.role) ? parsed : null;
    } catch (_error) {
      return null;
    }
  }

  function saveSession() {
    const store = sessionStore();
    if (!store) return;
    if (currentUser) {
      store.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } else {
      store.removeItem(SESSION_KEY);
    }
    // 旧 localStorage のセッションが残っていると混乱するので掃除しておく。
    if (typeof localStorage !== "undefined" && store !== localStorage) {
      try { localStorage.removeItem(SESSION_KEY); } catch (_e) {}
    }
  }

  async function setLanguage(nextLanguage) {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) nextLanguage = "ja";
    language = nextLanguage;
    saveLanguage();
    // <html lang> をスクリーンリーダーのために選択言語に同期
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
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

    if (signupAs === "user") {
      if (!form.school) errors.push(language !== "ja" ? "School required (international student verification)" : "学校選択は必須です（留学生確認のため）");
      if (!form.grade) errors.push(language !== "ja" ? "Grade required" : "学年は必須です");
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

    // 表示名（display name）は廃止。留学生は匿名（レビューは常に匿名表示）、
    // ホストは紐付けた家庭名を内部的な表示名として使う。
    const linkedHost = signupAs === "host" ? allHosts().find((h) => h.id === Number(form.hostId)) : null;
    const derivedName = signupAs === "host"
      ? (linkedHost ? linkedHost.name : (language !== "ja" ? "Host family" : "ホスト家庭"))
      : t.anonymousStudent;

    const newUser = {
      email,
      password: hashedPw,
      name: derivedName,
      school: signupAs === "user" ? form.school : "",
      grade: signupAs === "user" ? form.grade : "",
      language: "",
      nationality: "",
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

    // 表示言語はヘッダーの言語切替で手動選択する（国籍による自動選択は廃止）。

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

  // ===== レビュー本文の機械翻訳（設定言語へ自動翻訳）=====
  // 学生が書く本文は日本語が前提。サイト言語が日本語以外のとき、無料の
  // MyMemory API（APIキー不要・ブラウザから直接呼べる）で翻訳して表示する。
  // 翻訳結果は localStorage にキャッシュし、再表示・言語再切替を高速化＆API節約。
  // 失敗時（上限・通信エラー等）は原文にフォールバックする。
  const REVIEW_TX_KEY = "nestly.reviewTx.v1";
  // サイト言語コード → MyMemory が受け付ける言語コード
  const MT_LANG = { en: "en", zh: "zh-CN", ko: "ko", vi: "vi", es: "es", pt: "pt-BR" };
  let reviewTxCache = loadReviewTx();      // { "id::lang": "翻訳文" }
  const reviewTxFailed = {};               // 同セッションで失敗したキー（再試行しない）
  const reviewTxPending = new Set();        // 取得中のキー
  let reviewTxQueue = [];                   // 翻訳待ち [{ key, id, text, lang }]
  const translationShowOriginal = new Set(); // 「原文を表示」中のレビューID

  function loadReviewTx() {
    if (typeof localStorage === "undefined") return {};
    try {
      const parsed = JSON.parse(localStorage.getItem(REVIEW_TX_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_e) {
      return {};
    }
  }
  function saveReviewTx() {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(REVIEW_TX_KEY, JSON.stringify(reviewTxCache));
    } catch (_e) {
      /* 容量超過などは無視（翻訳はあくまで補助） */
    }
  }

  // MyMemory は1リクエスト約500文字まで。文末で区切ってチャンク分割する。
  function chunkForTranslation(text, max) {
    const parts = String(text).split(/(?<=[。．.!?！？\n])/);
    const chunks = [];
    let cur = "";
    for (const p of parts) {
      if ((cur + p).length > max && cur) {
        chunks.push(cur);
        cur = p;
      } else {
        cur += p;
      }
      while (cur.length > max) {
        chunks.push(cur.slice(0, max));
        cur = cur.slice(max);
      }
    }
    if (cur) chunks.push(cur);
    return chunks.length ? chunks : [String(text)];
  }

  function decodeBasicEntities(str) {
    return String(str)
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  // 1本のレビュー本文を翻訳して返す（失敗時は throw）。
  async function mtTranslate(text, lang) {
    const tl = MT_LANG[lang] || lang;
    const chunks = chunkForTranslation(text, 480);
    const out = [];
    for (const chunk of chunks) {
      const url =
        "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(chunk) +
        "&langpair=" +
        encodeURIComponent("ja|" + tl);
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("translate http " + res.status);
      const data = await res.json();
      const status = Number(data && data.responseStatus);
      const tx = data && data.responseData && data.responseData.translatedText;
      // 上限超過などは responseStatus=403 や警告文が返る → 失敗扱い
      if (status >= 400 || !tx || /MYMEMORY WARNING|INVALID|PLEASE SELECT/i.test(tx)) {
        throw new Error("translate unavailable");
      }
      out.push(decodeBasicEntities(tx));
    }
    return out.join(" ");
  }

  // 翻訳待ちに追加（重複・取得済み・失敗済みはスキップ）。
  function enqueueTranslation(id, text, lang) {
    const key = id + "::" + lang;
    if (reviewTxCache[key] || reviewTxPending.has(key) || reviewTxFailed[key]) return;
    if (reviewTxQueue.some((q) => q.key === key)) return;
    reviewTxQueue.push({ key, id, text, lang });
  }

  // 描画後に呼ぶ。キューを順番に翻訳し、終わったら再描画して反映する。
  async function processTranslationQueue() {
    if (!reviewTxQueue.length) return;
    const batch = reviewTxQueue;
    reviewTxQueue = [];
    let changed = false;
    for (const item of batch) {
      if (reviewTxCache[item.key] || reviewTxPending.has(item.key) || reviewTxFailed[item.key]) continue;
      reviewTxPending.add(item.key);
      try {
        const translated = await mtTranslate(item.text, item.lang);
        if (translated && translated.trim()) {
          reviewTxCache[item.key] = translated;
          changed = true;
        } else {
          reviewTxFailed[item.key] = true;
        }
      } catch (_e) {
        reviewTxFailed[item.key] = true;
      } finally {
        reviewTxPending.delete(item.key);
      }
    }
    if (changed) saveReviewTx();
    // 翻訳が入った／失敗が確定したら、注記や本文を更新するため再描画。
    // ただし入力中（フォーカスが input/textarea）の場合は再描画を見送り、
    // 次の自然な再描画でキャッシュから反映する（入力の中断を防ぐ）。
    const ae = document.activeElement;
    const typing = ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable);
    if (!typing) render();
  }

  // レビュー本文の表示テキストと状態を返す。
  // mode: "none"(翻訳不要) | "translated" | "showing-original" | "pending" | "failed"
  function translatedReviewText(review, original) {
    if (language === "ja" || !original) return { text: original, mode: "none" };
    const id = String(review.id);
    const key = id + "::" + language;
    const cached = reviewTxCache[key];
    if (translationShowOriginal.has(id) && cached) {
      return { text: original, mode: "showing-original" };
    }
    if (cached) return { text: cached, mode: "translated" };
    if (reviewTxFailed[key]) return { text: original, mode: "failed" };
    enqueueTranslation(id, original, language);
    return { text: original, mode: "pending" };
  }

  function renderTranslationNote(review, info) {
    const id = escapeHtml(String(review.id));
    if (info.mode === "pending") {
      return `<div class="review-tx-note">🌐 ${escapeHtml(t.translatingNote)}</div>`;
    }
    if (info.mode === "failed") {
      return `<div class="review-tx-note review-tx-note--failed">🌐 ${escapeHtml(t.translateFailed)}</div>`;
    }
    if (info.mode === "translated") {
      return `<div class="review-tx-note">🌐 ${escapeHtml(t.translatedNote)} · <button type="button" class="review-tx-toggle" data-translate-original="${id}">${escapeHtml(t.showOriginal)}</button></div>`;
    }
    if (info.mode === "showing-original") {
      return `<div class="review-tx-note"><button type="button" class="review-tx-toggle" data-translate-translated="${id}">${escapeHtml(t.showTranslation)}</button></div>`;
    }
    return "";
  }

  // レビュー本文（引用）＋翻訳注記をまとめて描画。両方の表示箇所で共用。
  function renderReviewQuote(review, opts) {
    const emptyPlaceholder = !!(opts && opts.emptyPlaceholder);
    const original = displayReviewText(review.text);
    if (!original) {
      return emptyPlaceholder
        ? `<p class="review-quote review-quote--empty">${t.adminRatingOnly}</p>`
        : "";
    }
    const open = language === "ja" ? "「" : '"';
    const close = language === "ja" ? "」" : '"';
    const info = translatedReviewText(review, original);
    return (
      `<p class="review-quote">${open}${escapeHtml(info.text)}${close}</p>` +
      renderTranslationNote(review, info)
    );
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
    if (!host) return "";
    // 英語UIでは nameEn があればそれを使う（例：デモファミリー → Demo Family）。
    if (language !== "ja" && host.nameEn) return String(host.nameEn);
    return host.name || host.area ? String(host.name || host.area) : "";
  }

  function saveCustomHosts() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CUSTOM_HOSTS_KEY, JSON.stringify(state.customHosts));
    }
  }

  // カスタムホストのタグ/説明文は「追加した時点の言語」で文字列が焼き込まれて保存される。
  // 別言語で閲覧すると日本語などが残って見えるため、表示時に現在の言語へ正規化する。
  const KNOWN_CUSTOM_HOST_TAGS = ["新規追加", "New entry"];
  const KNOWN_CUSTOM_HOST_SUMMARIES = [
    "ユーザーが追加したホストファミリー。レビュー投稿後に評価が反映されます。",
    "A host family added by the user. Ratings update after reviews are posted.",
  ];
  function localizeCustomHostStrings(host) {
    if (!host) return host;
    let tags = host.tags;
    if (Array.isArray(tags) && tags.some((tg) => KNOWN_CUSTOM_HOST_TAGS.includes(tg))) {
      tags = tags.map((tg) => (KNOWN_CUSTOM_HOST_TAGS.includes(tg) ? t.customHostTag : tg));
    }
    let summary = host.summary;
    if (KNOWN_CUSTOM_HOST_SUMMARIES.includes(summary)) summary = t.customHostSummary;
    if (tags === host.tags && summary === host.summary) return host;
    return { ...host, tags, summary };
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

    // 孤児レビューの復元：レビューは存在するが対応ホストが（customHosts 消失などで）
    // どこにも無い場合、レビューに埋め込んだ hostSnapshot からホストを再構築する。
    // これで「ホストが消えてレビューだけ残る」状態を防ぐ。
    const knownHostIds = new Set();
    grouped.forEach((h) => (h.duplicateIds || []).forEach((id) => knownHostIds.add(Number(id))));
    const rebuiltByHostId = new Map();
    (state.userReviews || []).forEach((review) => {
      const hid = Number(review.hostId);
      if (!Number.isFinite(hid) || knownHostIds.has(hid) || hidden.has(hid)) return;
      if (rebuiltByHostId.has(hid)) return;
      const snap = review.hostSnapshot;
      // スナップショットが無い古いレビューでも、最低限 host 名から復元する。
      const name = (snap && snap.name) || review.host;
      if (!name) return;
      const rebuilt = {
        id: hid,
        name,
        city: (snap && snap.city) || "Red Deer, Alberta",
        area: (snap && snap.area) || "",
        lat: snap && Number.isFinite(snap.lat) ? snap.lat : RED_DEER_CENTER.lat,
        lng: snap && Number.isFinite(snap.lng) ? snap.lng : RED_DEER_CENTER.lng,
        rating: 0,
        reviews: 0,
        verified: false,
        tags: [(snap && snap.area) || "", t.customHostTag].filter(Boolean),
        fit: [],
        summary: t.customHostSummary,
        criteria: Object.fromEntries(criteriaGroups.flatMap((group) => group.itemKeys.map((key) => [key, 4]))),
        duplicateIds: [hid],
        rebuiltFromReview: true,
      };
      const key = hostDisplayKey(rebuilt);
      if (key && !grouped.has(key)) {
        grouped.set(key, rebuilt);
        rebuiltByHostId.set(hid, rebuilt);
      }
    });

    return [...grouped.values()].map(localizeCustomHostStrings);
  }

  // 公開リスト：探すページ・マップ・選択UI で使う。Demo Family（isDemo）は
  // ホームの解説（renderHostProfile）専用なので、ここから除外する。
  // 注意：allHosts() からは除外しない（除外すると Demo の seed レビューが
  // 孤児扱いになり、復元ロジックで Demo が再生成されてしまうため）。
  function publicHosts() {
    return allHosts().filter((h) => !h.isDemo);
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
          // サーバー一覧に無いローカルレビューの扱い：
          //   - `local-` ID … まだサーバーへ未送信の下書き投稿の可能性 → 残す。
          //   - `server-` / `seed-` ID … 一度はサーバー由来だったのに今は無い
          //     ＝サーバー側で削除されたとみなして除外する。
          // これをしないと、削除済みレビューが localStorage に残り続け、allHosts()
          // の孤児復元ロジックが「消したはずのホスト」を毎回ゴースト復活させてしまう。
          const pendingLocal = state.userReviews.filter((r) => {
            const id = String(r.id);
            if (serverIds.has(id)) return false; // 下で最新版を入れ直すため除外
            return id.startsWith("local-");        // 未送信ローカルのみ温存
          });
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

  // Red Deer のおおよその範囲（バウンディングボックス）。これより外に出た
  // ジオコーディング結果は「別の街の同名通り」などの誤マッチとみなして弾く。
  // これがないと、住所が曖昧なとき Nominatim が遠い場所を返してピンが大きくズレる。
  const RED_DEER_BOUNDS = { minLat: 52.20, maxLat: 52.34, minLng: -113.92, maxLng: -113.72 };

  function isWithinRedDeer(lat, lng) {
    return lat >= RED_DEER_BOUNDS.minLat && lat <= RED_DEER_BOUNDS.maxLat
        && lng >= RED_DEER_BOUNDS.minLng && lng <= RED_DEER_BOUNDS.maxLng;
  }

  async function geocodeAddress(exactAddress) {
    const query = `${exactAddress}, Red Deer, Alberta, Canada`;
    // viewbox + bounded=1 で Red Deer の矩形内に検索を限定し、誤マッチを抑える。
    // countrycodes=ca でカナダ国外を除外。limit=5 にして候補から範囲内のものを選ぶ。
    // addressdetails=1 は suburb/neighbourhood（エリア名の自動抽出）に必要。
    const viewbox = `${RED_DEER_BOUNDS.minLng},${RED_DEER_BOUNDS.maxLat},${RED_DEER_BOUNDS.maxLng},${RED_DEER_BOUNDS.minLat}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&countrycodes=ca&bounded=1&viewbox=${viewbox}&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) return null;

    const matches = await response.json();
    if (!Array.isArray(matches) || !matches.length) return null;

    // 範囲内（Red Deer）の最初の候補を採用。範囲外しか無ければ誤マッチとして失敗扱い。
    const inArea = matches
      .map((m) => ({ lat: Number(m.lat), lng: Number(m.lon), address: m.address || {} }))
      .find((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng) && isWithinRedDeer(m.lat, m.lng));
    if (!inArea) return null;

    // Extract user-visible area from address parts (privacy-preserving — we
    // never expose the full street address; only the neighbourhood/suburb).
    const a = inArea.address;
    const area = a.neighbourhood || a.suburb || a.quarter || a.city_district
              || a.hamlet || a.village || a.town || "Red Deer";
    return { lat: inArea.lat, lng: inArea.lng, area };
  }

  // 既存の追加ホストで、ピンが Red Deer の範囲外（過去の誤ジオコーディングや
  // 中心へのフォールバック）に置かれているものを、保存済みの exactAddress から
  // 再ジオコーディングして直す。1回だけ・直列実行（Nominatim のレート制限に配慮）。
  async function healCustomHostLocations() {
    if (locationHealStarted || typeof fetch === "undefined") return;
    locationHealStarted = true;
    const targets = (state.customHosts || []).filter((h) =>
      h && h.exactAddress &&
      !(Number.isFinite(h.lat) && Number.isFinite(h.lng) && isWithinRedDeer(h.lat, h.lng))
    );
    if (!targets.length) return;
    let changed = false;
    for (const host of targets) {
      try {
        const loc = await geocodeAddress(host.exactAddress);
        if (loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
          host.lat = loc.lat;
          host.lng = loc.lng;
          if (loc.area && (!host.area || host.area === "Red Deer area")) host.area = loc.area;
          changed = true;
        }
      } catch (_e) { /* 失敗時はそのまま（次回起動で再試行） */ }
      // Nominatim の利用ポリシー（1 req/sec）に配慮して間隔を空ける。
      await new Promise((r) => setTimeout(r, 1100));
    }
    if (changed) {
      saveCustomHosts();
      render();
    }
  }

  async function deleteHost(hostId) {
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

    // 3) このホストに紐づくレビューも削除する。
    //    重要：レビューは Supabase（本番DB）に保存されているため、ローカルから
    //    外すだけでは別端末・本番サイトで再取得され、hostSnapshot からホストが
    //    復元されてしまう（＝「消したのに復活する」バグ）。そこで seed 以外の
    //    レビューはサーバー側でも物理削除する。seed はサーバーが 403 を返すので
    //    hiddenReviewIds による論理削除で扱う。
    const reviewsForHost = state.userReviews.filter((r) => idsToDelete.has(Number(r.hostId)));
    const hiddenReviews = new Set((state.hiddenReviewIds || []).map(String));
    if (typeof fetch !== "undefined") {
      await Promise.all(
        reviewsForHost
          .filter((r) => !String(r.id).startsWith("seed-"))
          .map((r) =>
            fetch(`/api/reviews/${encodeURIComponent(String(r.id))}`, {
              method: "DELETE",
              headers: { Accept: "application/json" },
            }).catch(() => {
              // ネットワーク失敗時もローカル論理削除で続行する。
            })
          )
      );
    }
    // サーバー削除の成否にかかわらず、対象レビューの id を hiddenReviewIds に
    // 積んでおく（再取得されてもフィルタ段階で確実に弾く安全網）。
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
    if (!host) return { rating: 0, reviews: 0, stddev: 0, reliability: reliabilityBand(0), hasReviews: false };
    const reviews = hostReviews(host);
    const reliability = reliabilityBand(reviews.length);
    const hasReviews = reviews.length > 0;
    // 総合評価。最適化工程を済ませたログインユーザーには本人の重視度で重み付けした
    // 加重平均を、それ以外には全軸一律 1 倍の単純平均（＝レーダーの重心と一致）を出す。
    // ★レビュー0件のホストは評価を出さない（「レビュー待ち」）。組み込みベース値だけで
    //   4.0 前後の点が付いてしまう問題を防ぐため、rating は 0 のままにして hasReviews=false を返す。
    const rating = hasReviews ? overallForViewer(host) : 0;
    // stddev は信頼度バンド表示用に、各レビューのおすすめ点のばらつきを引き続き算出。
    const postedScores = reviews
      .map((r) => Number(r.score))
      .filter((s) => Number.isFinite(s) && s > 0);
    const stddev = postedScores.length ? standardDeviation(postedScores) : 0;
    return { rating, reviews: reviews.length, stddev, reliability, hasReviews };
  }

  // モデレーション透明化は「ホーム下部の Trust & Safety 集計のみ」で行う方針。
  // 実名の家庭カードに『1件削除』と個別表示すると、その家庭への示唆的な名誉毀損リスクが
  // あるため、ホスト別注記は出さない（削除済み家庭は無印の「レビュー待ち」になる）。
  // 集計件数は MODERATION_LOG / totalModerationCount() から引き続き算出される。
  function renderModerationNote(_host) {
    return "";
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

  // 滞在期間キー（under1m など）→ 現在の言語のラベルへ変換。
  function stayPeriodLabelFromKey(key) {
    if (!key) return "";
    const opts = Array.isArray(t.stayPeriodOptions) ? t.stayPeriodOptions : [];
    const found = opts.find(([k]) => k === key);
    return found ? found[1] : "";
  }

  // レビュー内の滞在期間バッジ（structured.stayPeriod に保存）。無ければ空。
  function renderStayPeriodBadge(review) {
    const key = review && review.structured && review.structured.stayPeriod;
    const label = stayPeriodLabelFromKey(key);
    if (!label) return "";
    return `<span class="review-stay-badge">🗓 ${escapeHtml((t.stayPeriodPrefix || "") + label)}</span>`;
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

  // 検索反映度（関連度）スコア。クエリがホストのどのフィールドに当たったかで重み付けする。
  // 名前＞エリア＞市＞タグ／相性＞要約＞評価軸テキスト の順に強く効かせ、
  // さらに「前方一致（その単語で始まる）」「完全一致」にボーナスを与える。
  // renderSearchResults の「検索反映度順」ソートで使用。
  function searchRelevance(host, query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return 0;
    let score = 0;
    const scoreField = (text, weight) => {
      if (!text) return;
      const s = String(text).toLowerCase();
      const idx = s.indexOf(q);
      if (idx === -1) return;
      score += weight;                 // ヒットの基礎点
      if (idx === 0) score += weight * 0.5; // 前方一致ボーナス
      if (s === q) score += weight;    // 完全一致ボーナス
    };
    scoreField(host.name, 10);
    scoreField(host.area, 8);
    scoreField(host.city, 4);
    getHostFit(host).forEach((tag) => scoreField(tag, 5));
    (host.tags || []).forEach((tag) => scoreField(tag, 5));
    scoreField(host.summary, 3);
    localizedCriteriaGroups().forEach((group) => {
      scoreField(group.title, 2);
      scoreField(group.description, 1);
    });
    return score;
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
    // レビューフォームから外した軸（受け入れ経験=hostExperience）は集計からも除外する。
    const categoryScores = localizedCriteriaGroups()
      .filter((group) => !DEPRECATED_GROUP_KEYS.includes(group.key))
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
    const groups = localizedCriteriaGroups().filter((g) => !DEPRECATED_GROUP_KEYS.includes(g.key));
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

  // レビュー有無で評価表示を分岐するヘルパー。
  //   - レビューあり：数値（"4.3"）を返す
  //   - レビューなし（hasReviews=false）：「レビュー待ち」プレースホルダ
  // 数字だけ欲しい箇所と、星も出す箇所の両方で使えるよう用途別に用意。
  function ratingNumberHtml(stats) {
    return stats.hasReviews
      ? escapeHtml(stats.rating.toFixed(1))
      : `<span class="rating-pending">${escapeHtml(t.pendingReview)}</span>`;
  }
  function ratingStarsHtml(stats) {
    return stats.hasReviews ? renderStars(stats.rating) : "";
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

  // レーダーチャート描画の共通コア。valueFor(axis) で各軸の値（0〜5）を受け取るので、
  // ホスト全体でもレビュー1件でも同じ見た目で描ける。
  function renderRadarChartCore(valueFor, overall, ariaLabel, options = {}) {
    const size = options.size || 280;
    const padding = options.padding || 56;
    const showLabels = options.showLabels !== false; // 小サイズではラベル非表示にできる
    const centerLabel = options.centerLabel || "avg";
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
      const v = Math.max(0, Math.min(5, valueFor(axis)));
      const a = angleFor(i);
      const r = (v / 5) * radius;
      return { x: center + Math.cos(a) * r, y: center + Math.sin(a) * r, value: v };
    });
    const valuePolygon = `<polygon class="radar-value" points="${valuePoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")}" />`;
    const valueDots = valuePoints.map((p) => `<circle class="radar-dot" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="3.5" />`).join("");

    const labels = showLabels ? axes.map((axis, i) => {
      const a = angleFor(i);
      const lr = radius + 22;
      const lx = center + Math.cos(a) * lr;
      const ly = center + Math.sin(a) * lr;
      const v = valueFor(axis);
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
    }).join("") : "";

    return `
      <div class="radar-wrap" role="img" aria-label="${escapeHtml(ariaLabel)}">
        <svg class="radar-svg" viewBox="0 0 ${size} ${size}" width="100%" height="auto">
          ${ringPaths}
          ${axisLines}
          ${valuePolygon}
          ${valueDots}
          ${labels}
          <text class="radar-center-value" x="${center}" y="${center - 4}" text-anchor="middle">${overall.toFixed(1)}</text>
          <text class="radar-center-label" x="${center}" y="${center + 14}" text-anchor="middle">${escapeHtml(centerLabel)}</text>
        </svg>
      </div>
    `;
  }

  function renderRadarChart(host, options = {}) {
    if (!host) return "";
    // チャート中央に出す総合は radarOverall（= getHostStats.rating）と同じ値。
    const overall = radarOverall(host);
    return renderRadarChartCore(
      (axis) => radarValue(host, axis),
      overall,
      `${hostDisplayName(host)} ${overall.toFixed(1)}/5`,
      options
    );
  }

  // レビュー1件の criteria（軸ごとのスコア）からレーダー軸の値を求める。
  // commute 軸は transportation と rideSupport の平均（ホストと同じ統合ルール）。
  function reviewRadarValue(review, axis) {
    const c = (review && review.criteria) || {};
    const vals = axis.sourceKeys.map((k) => Number(c[k])).filter(Number.isFinite);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  }

  function reviewRadarOverall(review) {
    const vals = radarAxesLocalized()
      .map((axis) => reviewRadarValue(review, axis))
      .filter((v) => v > 0);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  }

  // 個別レビュー用のレーダーチャート。review.criteria が無ければ何も出さない。
  function renderReviewRadarChart(review, options = {}) {
    if (!review || !review.criteria) return "";
    const hasAny = radarAxesLocalized().some((axis) => reviewRadarValue(review, axis) > 0);
    if (!hasAny) return "";
    const overall = reviewRadarOverall(review);
    const who = displayStudentName(review.student) || (language !== "ja" ? "Review" : "レビュー");
    return renderRadarChartCore(
      (axis) => reviewRadarValue(review, axis),
      overall,
      `${who} ${overall.toFixed(1)}/5`,
      options
    );
  }

  // レビュー閲覧時に、レーダー（主要6軸）に加えて補助評価軸の内訳も見せる。
  // 補助評価軸 = 主要6軸・廃止軸を除いた現行の評価グループ。
  function renderReviewAuxScores(review) {
    if (!review || !review.criteria) return "";
    const c = review.criteria;
    const items = localizedCriteriaGroups()
      .filter((g) => AUX_GROUP_KEYS.includes(g.key))
      .map((g) => ({ key: g.key, title: g.title, value: Number(c[g.key]) }))
      .filter((it) => Number.isFinite(it.value) && it.value > 0);
    if (!items.length) return "";
    const label = language !== "ja" ? "Auxiliary ratings" : "補助評価";
    return `
      <div class="review-aux">
        <div class="review-aux-title">${escapeHtml(label)}</div>
        <div class="review-aux-grid">
          ${items.map((it) => `
            <div class="review-aux-row">
              <span class="review-aux-label">${escapeHtml(it.title)}</span>
              <span class="review-aux-bar"><span class="review-aux-bar-fill" style="width:${(it.value / 5 * 100).toFixed(0)}%"></span></span>
              <span class="review-aux-value">${it.value.toFixed(1)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderTabs() {
    const navHome = language === "ja" ? "ホーム" : (t.navHome || "Home");
    const favLabel = language === "ja" ? "保存" : "Saved";
    const favCount = state.favorites.length;
    // 「探す」「マップ」「レビューを書く」を 1 つの統合ページ（search）に集約したため、
    // map / review の独立タブはナビから外す（探すページ内で完結する導線にした）。
    const tabs = [
      { key: "home",   label: navHome },
      { key: "search", label: t.navSearch || "Search" },
      { key: "favorites", label: `${favLabel}${favCount ? ` (${favCount})` : ""}` },
      { key: "how-to", label: t.navHowTo || "How to use" },
      { key: "school", label: t.navSchool || "Schools" },
    ];
    if (isHost()) {
      tabs.push({ key: "my-host", label: `🏠 ${t.navMyHost || "My family"}` });
    }
    // 料金プラン・プライバシー・利用規約を見つけやすいようナビにも露出する
    // （フッターだけだと埋もれるため。コンテスト審査での閲覧性を優先）。
    tabs.push({ key: "pricing", label: `💳 ${t.pricingNav || "Pricing"}` });
    tabs.push({ key: "privacy", label: t.privacyNav || "Privacy" });
    tabs.push({ key: "terms", label: t.termsNav || "Terms" });
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
      <span class="match-chip-label">${escapeHtml(t.matchLabel)}</span>
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
                  <span class="similar-rating">${stats.hasReviews ? `★ ${stats.rating.toFixed(1)}` : escapeHtml(t.pendingReview)}</span>
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
    const matchCount = filterHosts(publicHosts(), state.query || "", state.pendingFilters).length;

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
              <h3>✏️ ${language !== "ja" ? "Editable anytime" : "いつでも編集可能"}</h3>
              <p>${language !== "ja"
                ? "Authors can edit their review at any time. Edited reviews are flagged so readers can see they were updated."
                : "投稿者はいつでもレビューを編集できます。編集すると「編集済み」表示が付き、更新されたことが分かります。"}</p>
            </article>
            <article class="policy-card">
              <h3>🚫 ${language !== "ja" ? "What we remove" : "削除対象"}</h3>
              <p>${language !== "ja"
                ? "Personal attacks, exact addresses, contact info, hateful content, and impersonation. Not negative opinions."
                : "個人攻撃、正確な住所、連絡先、ヘイト、なりすまし。批判的意見は削除されません。"}</p>
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
            </div>
          </div>
          ${renderMatchChip(host)}
          <button type="button" class="button button--ghost button--compact" data-collapse-detail aria-label="Close">×</button>
        </div>
        <div class="inline-detail-body">
          ${stats.hasReviews ? renderRadarChart(host, { size: 240, padding: 50 }) : ""}
          <div class="inline-detail-side">
            ${localizedHostSummary(host) ? `<p class="featured-summary">${escapeHtml(localizedHostSummary(host))}</p>` : ""}
            ${renderModerationNote(host)}
            ${renderInsightChips(host, 4)}
            <div class="inline-detail-actions">
              <button type="button" class="button button--primary" data-write-review-for="${host.id}">${t.writeReviewCta}</button>
              <button type="button" class="button button--secondary" data-host-reviews="${host.id}">${language !== "ja" ? `Read reviews (${stats.reviews})` : `レビューを見る (${stats.reviews})`}</button>
              <button type="button" class="button button--ghost" data-scroll-map="${host.id}">${language !== "ja" ? "Show on map" : "地図で見る"}</button>
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
    // 検索候補はホストのみを対象にする（レビュー本文は検索しない）。Demo は除外。
    const hostMatches = filterHosts(publicHosts(), query, []).slice(0, 8);
    if (!hostMatches.length) {
      return `<div class="search-suggestions search-suggestions--empty">${language !== "ja" ? "No matches" : "一致する結果がありません"}</div>`;
    }
    const hostSection = hostMatches.length ? `
      <div class="suggest-section">
        <div class="suggest-section-head">${language !== "ja" ? "Hosts" : "ホスト"} (${hostMatches.length})</div>
        ${hostMatches.map((host) => {
          const stats = getHostStats(host);
          return `
            <button type="button" class="suggest-item" data-suggest-host="${host.id}">
              <div class="suggest-main">
                <strong>${escapeHtml(hostDisplayName(host))}</strong>
                <span class="suggest-meta">${escapeHtml(host.area)}</span>
              </div>
              <div class="suggest-rating">${stats.hasReviews ? `★ ${stats.rating.toFixed(1)}` : escapeHtml(t.pendingReview)}</div>
            </button>
          `;
        }).join("")}
      </div>
    ` : "";
    return `<div class="search-suggestions">${hostSection}</div>`;
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
    // 廃止軸（文化適応・プライバシー・家事手伝い）は内訳からも除外し、
    // 全画面で同じ11軸だけを表示する。
    return localizedCriteriaGroups()
      .filter((group) => !DEPRECATED_GROUP_KEYS.includes(group.key))
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
          </div>
          <div class="meta-line"><span class="icon-chip">Map</span><span>${escapeHtml(host.area)}</span></div>
          <div class="rating-row">
            <div class="rating-number">${ratingNumberHtml(stats)}</div>
            <div>
              ${ratingStarsHtml(stats)}
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
            <summary>${t.detailedScores} (${language !== "ja" ? "11 axes" : "全11軸"})</summary>
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
      const hostOptions = publicHosts()
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
      { key: "mealQuality", labelJa: "食事", labelEn: "Meal" },
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
          ${publicHosts()
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
              ${publicHosts()
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
        const allHostsList = publicHosts();
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
      const hasActiveFilters = state.activeFilters.length > 0 || state.dateFilter !== "all" || state.query;
      return `
        <div class="card card--soft empty-state empty-state--search">
          <div class="empty-state-icon" aria-hidden="true">🔍</div>
          <p class="empty-state-title">${escapeHtml(t.noResults)}</p>
          <p class="empty-state-hint">${escapeHtml(t.noResultsHint)}</p>
          <div class="empty-state-actions">
            ${hasActiveFilters ? `<button type="button" class="button button--ghost button--compact" id="clear-all-filters-empty">${escapeHtml(t.clearFiltersButton)}</button>` : ""}
            <button type="button" class="button button--primary button--compact" id="empty-add-host">+ ${escapeHtml(ui.addNewFamily)}</button>
          </div>
          <p class="empty-state-hint">${escapeHtml(language !== "ja" ? "Can't find the family you're looking for? Add it and write the first review." : "お探しの家族が見つかりませんか？新しく追加して最初のレビューを書きましょう。")}</p>
          ${relaxBlock}
        </div>`;
    }

    // 並び替え。検索クエリがある時は「検索反映度（関連度）順」、無い時は
    // マッチ度（preferences があれば）→総合評価の順にする。
    let sortedHosts = filteredHosts.slice();
    const hasQuery = !!(state.query && state.query.trim());
    if (hasQuery) {
      sortedHosts.sort((a, b) => {
        const rel = searchRelevance(b, state.query) - searchRelevance(a, state.query);
        if (rel !== 0) return rel;
        // 同点は総合評価で安定ソート
        return getHostStats(b).rating - getHostStats(a).rating;
      });
    } else if (currentUser && currentUser.preferences) {
      sortedHosts.sort((a, b) => computeMatchScore(b, currentUser) - computeMatchScore(a, currentUser));
    }

    // 検索結果の表示件数制限は撤廃（マッチした家族をすべて表示）。

    // マップ／一覧で選択中のファミリーは結果のトップに固定する（マップ⇄リスト連動）。
    if (state.selectedId) {
      const selIdx = sortedHosts.findIndex((h) => h.id === state.selectedId);
      if (selIdx > 0) {
        const [sel] = sortedHosts.splice(selIdx, 1);
        sortedHosts.unshift(sel);
      } else if (selIdx === -1) {
        const sel = filteredHosts.find((h) => h.id === state.selectedId);
        if (sel) {
          sortedHosts.unshift(sel);
        }
      }
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
            <article class="result-card ${host && host.id === item.id ? "is-selected" : ""} ${isExpanded ? "is-expanded" : ""}" data-host-id="${item.id}">
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
                    <div><strong>${ratingNumberHtml(stats)}</strong></div>
                    ${ratingStarsHtml(stats)}
                    <div class="label">${escapeHtml(stats.reviews)} ${t.reviews}</div>
                    ${renderReliabilityBadge(stats)}
                  </div>
                </div>
                <div class="result-card-toggle">${isExpanded
                  ? (language !== "ja" ? "▲ Hide details" : "▲ 詳細を閉じる")
                  : (language !== "ja" ? "▼ Show details" : "▼ 詳細を見る")}</div>
              </button>
              <div class="result-card-foot">
                <button type="button" class="button button--primary button--compact" data-write-review-for="${item.id}">${ui.addReview}</button>
              </div>
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
      const allList = publicHosts();
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
            <div id="review-mini-map-wrap" class="review-mini-map-wrap" aria-label="${escapeHtml(language !== "ja" ? "Host locations preview" : "ホストの位置プレビュー")}">
              <div id="review-mini-map" class="review-mini-map"></div>
              <p class="review-mini-map-hint">${escapeHtml(language !== "ja" ? "Tap a pin to select that family." : "ピンをタップして家族を選択")}</p>
            </div>
            <div class="empty-state">${t.selectFamilyFirst}</div>
          </div>
        </article>
      `;
    }
    return `
      <article id="review" class="card review-card">
        <div class="card-body">
          <h2 class="section-title">${t.reviewForm}</h2>
          <p class="section-text">${t.reviewLead}</p>
          <p class="form-pilot-note">ℹ️ ${escapeHtml(t.verificationPilotNote)}</p>
          <div class="review-target">
            <label for="review-host-select">${t.reviewTarget} <span class="required-mark">*</span></label>
            <select id="review-host-select" class="host-select">
              ${(() => {
                // Demo は選択肢から除外。ただし現在選択中が Demo の場合は表示を保つ。
                const opts = publicHosts();
                if (host.isDemo && !opts.some((o) => o.id === host.id)) opts.unshift(host);
                return opts
                  .map(
                    (item) =>
                      `<option value="${item.id}" ${item.id === host.id ? "selected" : ""}>${escapeHtml(hostDisplayName(item))}</option>`
                  )
                  .join("");
              })()}
            </select>
          </div>
          <div class="review-stay-period">
            <label for="review-stay-period">${t.stayPeriodLabel} <span class="required-mark">*</span></label>
            <p class="form-intro form-intro--compact">${escapeHtml(t.stayPeriodHint)}</p>
            <select id="review-stay-period" class="host-select">
              <option value="" ${!state.reviewStayPeriod ? "selected" : ""}>${escapeHtml(t.stayPeriodSelectDefault)}</option>
              ${(Array.isArray(t.stayPeriodOptions) ? t.stayPeriodOptions : [])
                .map(([key, label]) =>
                  `<option value="${escapeHtml(key)}" ${state.reviewStayPeriod === key ? "selected" : ""}>${escapeHtml(label)}</option>`
                )
                .join("")}
            </select>
          </div>
          <h4 class="detail-subhead detail-subhead--top">${language !== "ja" ? "Primary axes (required)" : "主要軸（必須）"}</h4>
          <p class="form-intro">${language !== "ja"
            ? "Rate each axis from 1 to 5 stars. These are the core signal."
            : "各項目を 1〜5 星で評価してください。これがコア評価です。"}</p>
          <div class="review-score-rows">
            ${["safetyEnvironment", "englishEnvironment", "mealQuality", "mentalSupport", "study"].map((key) => {
              const group = localizedCriteriaGroups().find((g) => g.key === key);
              return group ? renderStarRowInput(key, group.title, { required: true }) : "";
            }).join("")}
          </div>

          <h4 class="detail-subhead">${language !== "ja" ? "Auxiliary axes (transportation / ride / freedom / internet / cleanliness / host experience — required)" : "補助評価（交通 / 送迎 / 自由度 / 通信 / 清潔さ / 受け入れ経験 — 必須）"}</h4>
          <div class="review-score-rows">
            ${["transportation", "rideSupport", "rules", "internetQuality", "cleanliness", "hostExperience"].map((key) => {
              const group = localizedCriteriaGroups().find((g) => g.key === key);
              return group ? renderStarRowInput(key, group.title, { required: true }) : "";
            }).join("")}
          </div>

          <h4 class="detail-subhead">${t.bestFor} <span class="required-mark">*</span></h4>
          <p class="form-intro">${language !== "ja"
            ? "Select at least one. Who would feel at home with this family?"
            : "少なくとも1つ選んでください。どんな人がこの家族に合いそうですか？"}</p>
          <fieldset class="fit-fieldset fit-fieldset--required">
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

          <button id="review-submit" type="button" class="button button--primary">${t.submitReview}</button>
          ${state.submitted ? `<div class="submit-message">${t.submitted}</div>` : ""}
        </div>
      </article>
    `;
  }

  // options.hostOnly: 指定ホスト（selectedHost）のレビューだけを全件表示する専用モード。
  //   - host-reviews ビュー（「この家のレビューを見る」遷移先）で使用。
  //   - 並び替えセレクタは出すが「選択中ホストのみ」オプションは不要なので隠す。
  //   - 8件制限を外し全件表示。タイトルを家族名にする。
  function renderRecentReviews(options = {}) {
    const hostOnly = !!options.hostOnly;
    const sortLabels = language !== "ja"
      ? { latest: "Latest", rating: "Highest rated", helpful: "Most helpful", selected: "Selected host" }
      : { latest: "最新順", rating: "評価が高い順", helpful: "役に立った順", selected: "選択中ホストのみ" };
    // admin が論理削除したレビューは home の一覧からも除外。
    const hiddenReviewsForRecent = new Set((state.hiddenReviewIds || []).map(String));
    let reviews = state.userReviews
      .slice()
      .filter((r) => !hiddenReviewsForRecent.has(String(r.id)));
    const focusHost = hostOnly ? selectedHost() : null;
    if (hostOnly && focusHost) {
      const ids = new Set([focusHost.id, ...(focusHost.duplicateIds || [])].map(Number));
      reviews = reviews.filter((r) => ids.has(Number(r.hostId)));
    } else if (state.recentSort === "selected" && state.selectedId) {
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
    if (!hostOnly) reviews = reviews.slice(0, 8);

    const headerTitle = hostOnly && focusHost
      ? (language !== "ja" ? `Reviews for ${hostDisplayName(focusHost)}` : `${hostDisplayName(focusHost)} のレビュー`)
      : t.recentReviews;

    return `
      <article class="card recent-card">
        <div class="card-body">
          <div class="review-header">
            <h2 class="section-title">${escapeHtml(headerTitle)}</h2>
            <div class="recent-sort">
              <label class="recent-sort-label" for="recent-sort">${language !== "ja" ? "Sort" : "並び順"}</label>
              <select id="recent-sort" class="recent-sort-select">
                <option value="latest" ${state.recentSort === "latest" ? "selected" : ""}>${sortLabels.latest}</option>
                <option value="rating" ${state.recentSort === "rating" ? "selected" : ""}>${sortLabels.rating}</option>
                <option value="helpful" ${state.recentSort === "helpful" ? "selected" : ""}>${sortLabels.helpful}</option>
                ${hostOnly ? "" : `<option value="selected" ${state.recentSort === "selected" ? "selected" : ""} ${!state.selectedId ? "disabled" : ""}>${sortLabels.selected}</option>`}
              </select>
            </div>
          </div>
          ${hostOnly && reviews.length === 0 ? `<p class="section-text">${escapeHtml(language !== "ja" ? "No reviews for this family yet. Be the first to write one." : "この家族のレビューはまだありません。最初のレビューを書いてみましょう。")}</p>` : ""}
          <div class="recent-list">
            ${
              reviews.length === 0
                ? `<div class="empty-state">${t.noReviewsYet}</div>`
                : reviews
                    .map(
                      (review) => {
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
                    ${renderReviewQuote(review, { emptyPlaceholder: true })}
                    ${renderReviewRadarChart(review, { size: 240, padding: 48 })
                      ? `<div class="review-radar">${renderReviewRadarChart(review, { size: 240, padding: 48 })}</div>`
                      : ""}
                    ${renderReviewAuxScores(review)}
                    <div class="review-meta">
                      <span>${escapeHtml(displayStudentName(review.student))}</span>
                      ${renderStayPeriodBadge(review)}
                      ${review.editedAt ? `<span class="edited-flag" title="${escapeHtml(language !== "ja" ? "Edited after posting" : "投稿後に編集されました")}">${language !== "ja" ? "edited" : "編集済み"}</span>` : ""}
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
    const plans = [1, 2, 3].map((i) => ({
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

  function renderAdminRestore() {
    if (!isAdmin()) return "";
    // すべてのホスト（論理削除フィルタを通さない）
    const allHostsRaw = [...hosts, ...state.customHosts];
    const hiddenHostIds = new Set((state.hiddenHostIds || []).map(Number));
    const hiddenHosts = allHostsRaw.filter((h) => hiddenHostIds.has(Number(h.id)));

    // すべてのレビュー（論理削除フィルタを通さない）
    const hiddenReviewIds = new Set((state.hiddenReviewIds || []).map(String));
    const hiddenReviews = state.userReviews.filter((r) => hiddenReviewIds.has(String(r.id)));

    const totalHidden = hiddenHosts.length + hiddenReviews.length;

    const hostsSection = `
      <div class="admin-restore-section">
        <div class="admin-restore-section-head">
          <h3 class="admin-restore-section-title">${escapeHtml(t.adminRestoreHostsSection)}</h3>
          ${hiddenHosts.length > 0 ? `<button type="button" class="button button--ghost button--compact" data-restore-all-hosts>
            ${escapeHtml(t.adminRestoreAllHosts)} (${hiddenHosts.length})
          </button>` : ""}
        </div>
        ${hiddenHosts.length === 0
          ? `<p class="admin-restore-empty">${escapeHtml(t.adminRestoreEmpty)}</p>`
          : hiddenHosts.map((h) => `
            <div class="admin-restore-row">
              <div class="admin-restore-info">
                <strong>${escapeHtml(h.name || "—")}</strong>
                ${h.area ? `<span class="admin-restore-meta"> · ${escapeHtml(h.area)}</span>` : ""}
              </div>
              <button type="button" class="button button--primary button--compact" data-restore-host="${h.id}">
                ${escapeHtml(t.adminRestoreButton)}
              </button>
            </div>`).join("")
        }
      </div>`;

    const reviewsSection = `
      <div class="admin-restore-section">
        <div class="admin-restore-section-head">
          <h3 class="admin-restore-section-title">${escapeHtml(t.adminRestoreReviewsSection)}</h3>
          ${hiddenReviews.length > 0 ? `<button type="button" class="button button--ghost button--compact" data-restore-all-reviews>
            ${escapeHtml(t.adminRestoreAllReviews)} (${hiddenReviews.length})
          </button>` : ""}
        </div>
        ${hiddenReviews.length === 0
          ? `<p class="admin-restore-empty">${escapeHtml(t.adminRestoreEmpty)}</p>`
          : hiddenReviews.map((r) => {
              const hostName = allHostsRaw.find((h) => Number(h.id) === Number(r.hostId))?.name || ("ID " + r.hostId);
              const excerpt = (r.text || "").slice(0, 60) + ((r.text || "").length > 60 ? "…" : "");
              const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString(language === "ja" ? "ja-JP" : "en-US") : "";
              return `
                <div class="admin-restore-row">
                  <div class="admin-restore-info">
                    <strong>${escapeHtml(hostName)}</strong>
                    <span class="admin-restore-meta">${dateStr ? ` · ${escapeHtml(dateStr)}` : ""}</span>
                    <p class="admin-restore-excerpt">${escapeHtml(excerpt)}</p>
                  </div>
                  <button type="button" class="button button--primary button--compact" data-restore-review="${escapeHtml(r.id)}">
                    ${escapeHtml(t.adminRestoreButton)}
                  </button>
                </div>`;
            }).join("")
        }
      </div>`;

    return `
      <section id="admin-restore" class="section-admin-restore">
        <div class="container container--narrow">
          <div class="section-head">
            <h2 class="section-title">${escapeHtml(t.adminRestoreTitle)}</h2>
            <p class="section-text">${language === "ja"
              ? `このページはあなたのブラウザ上のみで有効です。全 ${totalHidden} 件の非表示データがあります。`
              : `Visible only in this browser. ${totalHidden} hidden item(s) total.`}</p>
          </div>
          ${hostsSection}
          ${reviewsSection}
        </div>
      </section>`;
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
    // ホスト本人としてログインしていれば自分の家庭を、そうでなければ
    // 代表デモホスト（デモファミリー）を「お手本」として表示する（#29）。
    // これにより、ログイン前の留学生・ホスト候補にも「ホストのページがどう見えるか」を紹介できる。
    const viewerIsHost = isHost();
    let host = null;
    if (viewerIsHost) {
      const hostId = currentHostId();
      host = hostId ? allHosts().find((h) => h.id === hostId) : null;
    }
    let isDemo = false;
    if (!host) {
      host = allHosts().find((h) => h.id === 1) || allHosts()[0] || null;
      isDemo = true;
    }
    if (!host) {
      return `
        <section class="section-host-profile">
          <div class="container container--narrow">
            <div class="empty-state empty-state--card">${escapeHtml(t.hostProfileNoHost)}</div>
          </div>
        </section>
      `;
    }

    const demoBanner = isDemo ? `
      <div class="host-profile-demo-banner">
        <span class="host-profile-demo-icon" aria-hidden="true">🏠</span>
        <div>
          <strong class="host-profile-demo-title">${escapeHtml(language !== "ja" ? "Sample host home page" : "ホスト用ホームページの見本")}</strong>
          <p class="host-profile-demo-text">${escapeHtml(language !== "ja"
            ? "This is a representative example using the Demo Family. When a host family signs up and links their account, this is the dashboard they see — every review students have left, each shown with its own rating breakdown."
            : "これは Demo Family を使った代表的な見本です。ホスト家庭が登録してアカウントを紐付けると、この画面（寄せられたレビュー一覧と、各レビューの評価内訳）が表示されます。")}</p>
        </div>
      </div>
    ` : "";

    const reviews = hostReviews(host);

    return `
      <section id="my-host" class="section-host-profile">
        <div class="container">
          ${demoBanner}
          <div class="host-profile-head">
            <span class="policy-eyebrow">${escapeHtml(t.hostProfileEyebrow)}</span>
            <h1 class="policy-title">${escapeHtml(hostDisplayName(host))}${host.area ? ` <small class="host-profile-area">— ${escapeHtml(host.area)}</small>` : ""}</h1>
            <p class="policy-intro">${escapeHtml(t.hostProfileIntro)}</p>
          </div>

          <article class="host-profile-card">
            <h2 class="policy-section-title">${escapeHtml(t.hostProfileReviewsTitle)}</h2>
            ${reviews.length === 0
              ? `<div class="empty-state">${escapeHtml(t.hostProfileNoReviews)}</div>`
              : reviews
                  .map((review) => {
                    return `
                      <div class="review-item host-profile-review">
                        <div class="review-header">
                          ${renderStars(review.score)}
                          <span class="review-date-muted">${escapeHtml(displayStudentName(review.student))}</span>
                          ${renderStayPeriodBadge(review)}
                        </div>
                        ${renderReviewQuote(review)}
                        ${review.fit && review.fit.length
                          ? `<div class="result-tags">${review.fit.map((tag) => `<span class="result-tag">${escapeHtml(localizedFitLabel(tag))}</span>`).join("")}</div>`
                          : ""}
                        ${renderReviewRadarChart(review, { size: 240, padding: 48 })
                          ? `<div class="review-radar">${renderReviewRadarChart(review, { size: 240, padding: 48 })}</div>`
                          : ""}
                        ${renderReviewAuxScores(review)}
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

  // ホーム用：ホスト評価の「見方」を説明するセクション。
  // レーダー（主要6軸）＋補助評価軸を、各軸が何を測るのか・どこを見ればよいかと一緒に提示する。
  function renderRatingGuide() {
    // 全画面で同じ11軸（通学＝交通 と 送迎 は別軸）。主要軸はレーダーチャートにも表示する。
    const groups = localizedCriteriaGroups();
    const groupByKey = (k) => groups.find((g) => g.key === k);
    const primaryAxes = [
      { key: "safetyEnvironment", icon: "🛡" },
      { key: "englishEnvironment", icon: "💬" },
      { key: "mealQuality", icon: "🍽" },
      { key: "mentalSupport", icon: "🤝" },
      { key: "study", icon: "📚" },
    ];
    const auxAxes = [
      { key: "transportation", icon: "🚌" },
      { key: "rideSupport", icon: "🚗" },
      { key: "rules", icon: "🕊" },
      { key: "cleanliness", icon: "✨" },
      { key: "internetQuality", icon: "📶" },
      { key: "hostExperience", icon: "🎓" },
    ];
    const axisCard = (entry, isPrimary) => {
      const g = groupByKey(entry.key);
      const title = entry.title || (g ? g.title : entry.key);
      const desc = entry.desc || (g ? g.description : "");
      return `
        <article class="rating-guide-card ${isPrimary ? "rating-guide-card--primary" : ""}">
          <div class="rating-guide-card-head">
            <span class="rating-guide-icon" aria-hidden="true">${entry.icon}</span>
            <strong class="rating-guide-axis">${escapeHtml(title)}</strong>
          </div>
          <p class="rating-guide-desc">${escapeHtml(desc)}</p>
        </article>
      `;
    };
    return `
      <section class="section-rating-guide">
        <div class="container">
          <div class="section-head">
            <h2 class="section-title">${language !== "ja" ? "How to read host ratings" : "ホストの評価の見方"}</h2>
            <p class="section-text">${language !== "ja"
              ? "Each host is rated on 11 axes — primary axes appear on the radar chart and the rest as auxiliary axes."
              : "各ホストは11軸で採点されます。主要軸はレーダーチャートに、残りは補助評価軸として表示されます。"}</p>
          </div>
          <div class="rating-guide-policy">
            <span class="rating-guide-policy-icon" aria-hidden="true">⚖️</span>
            <p class="rating-guide-policy-text">${language !== "ja"
              ? "By default the overall score is a simple average of the radar axes — every axis counts equally (×1). When you log in and finish the matching setup, the overall score is re-weighted by how important each axis is to you, so the same host can score differently for different students."
              : "総合評価は初期状態では全軸を一律1倍にした単純平均です。ログインしてマッチング設定（最適化工程）を済ませると、あなたが重視する軸ほど重く反映した「あなた向けの総合評価」に切り替わります。そのため同じホストでも人によって点数が変わります。"}</p>
          </div>
          <h3 class="rating-guide-subhead">${language !== "ja" ? "Primary axes (radar chart)" : "主要軸（レーダーチャート）"}</h3>
          <div class="rating-guide-grid">
            ${primaryAxes.map((e) => axisCard(e, true)).join("")}
          </div>
          <h3 class="rating-guide-subhead">${language !== "ja" ? "Auxiliary axes" : "補助評価軸"}</h3>
          <div class="rating-guide-grid">
            ${auxAxes.map((e) => axisCard(e, false)).join("")}
          </div>
          <div class="rating-guide-note">
            <span class="rating-pending">${escapeHtml(t.pendingReview)}</span>
            <span>${escapeHtml(language !== "ja" ? "= no reviews yet, so no score is shown." : "＝まだレビューがなく、評価が付いていない状態です。")}</span>
          </div>
        </div>
      </section>
    `;
  }

  // Trust & Safety（モデレーション透明化）：削除実績を控えめな集計で提示する。
  function renderTrustSafety() {
    const count = totalModerationCount();
    if (!count) return "";
    return `
      <section class="section-trust-safety">
        <div class="container">
          <div class="trust-safety-card">
            <span class="trust-safety-icon" aria-hidden="true">🛡️</span>
            <div>
              <h3 class="trust-safety-title">${escapeHtml(t.trustSafetyTitle)}</h3>
              <p class="trust-safety-text">${escapeHtml(t.trustSafetyBody.replace("{count}", String(count)))}</p>
            </div>
          </div>
        </div>
      </section>
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
              <p class="school-pilot-note">${t.schoolPilotNotice}</p>
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
      const schoolCodeEl = document.getElementById("signup-school-code");
      const form = {
        signupAs,
        email: document.getElementById("signup-email").value.trim(),
        password: document.getElementById("signup-password").value,
        school: schoolEl ? schoolEl.value : "",
        grade: gradeEl ? gradeEl.value : "",
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

    // 「この家のレビューを見る」：ホストを選択して家族別レビュー一覧ページへ。
    document.querySelectorAll("[data-host-reviews]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedId = Number(btn.dataset.hostReviews);
        setView("host-reviews");
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
      state.reviewStayPeriod = draft.stayPeriod || "";
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

    // レビュー翻訳トグル（原文を表示／翻訳を表示）
    document.querySelectorAll("[data-translate-original]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        translationShowOriginal.add(String(btn.dataset.translateOriginal));
        render();
      });
    });
    document.querySelectorAll("[data-translate-translated]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        translationShowOriginal.delete(String(btn.dataset.translateTranslated));
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

    // 0件レイアウトの「フィルターをリセット」ボタン
    const clearAllEmptyBtn = document.getElementById("clear-all-filters-empty");
    if (clearAllEmptyBtn) clearAllEmptyBtn.addEventListener("click", () => {
      state.activeFilters = [];
      state.dateFilter = "all";
      state.query = "";
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

    // デスクトップのインライン・クイックフィルター：検索バー直下のトグルで開閉。
    const toggleQuickFiltersBtn = document.getElementById("toggle-quick-filters");
    if (toggleQuickFiltersBtn) toggleQuickFiltersBtn.addEventListener("click", () => {
      state.quickFiltersOpen = !state.quickFiltersOpen;
      render();
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

    const stayPeriodSelect = document.getElementById("review-stay-period");
    if (stayPeriodSelect) stayPeriodSelect.addEventListener("change", (event) => {
      state.reviewStayPeriod = event.target.value;
      // エラー表示を解除（再選択で復帰）。再レンダリングはせず選択状態を保持。
      stayPeriodSelect.classList.remove("review-stay-period--error");
      // 下書きにも反映（本文の自動保存と同じ箱を更新）。
      const draft = loadDraft() || {};
      draft.stayPeriod = state.reviewStayPeriod;
      draft.hostId = state.selectedId;
      draft.savedAt = new Date().toISOString();
      saveDraft(draft);
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
          stayPeriod: state.reviewStayPeriod,
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

      // Validate all required axes are rated. transportation と rideSupport は
      // それぞれ独立した入力欄になったので、両方を検証する（11軸すべて必須）。
      const visibleRequired = requiredAxisKeys;
      const missing = visibleRequired.filter((k) => !(state.reviewScores[k] > 0));
      if (missing.length && !isAdmin()) {
        // Highlight all missing fields + name them explicitly
        state.missingScores = missing;
        const missingLabels = missing.map((k) => {
          // フォームの各入力ラベルと一致させるため criteriaGroups のタイトルを使う。
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
      // 「向いている人」タグは必須（最低1つ）。
      if (!state.reviewFit.length && !isAdmin()) {
        const fieldset = document.querySelector(".fit-fieldset--required");
        if (fieldset) {
          fieldset.classList.add("fit-fieldset--error");
          fieldset.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        alert(language !== "ja"
          ? "Please select at least one “best for” tag."
          : "「向いている人」タグを少なくとも1つ選んでください。");
        return;
      }
      // 「住んでいた期間」は必須。
      if (!state.reviewStayPeriod && !isAdmin()) {
        const stayEl = document.getElementById("review-stay-period");
        if (stayEl) {
          stayEl.classList.add("review-stay-period--error");
          stayEl.scrollIntoView({ behavior: "smooth", block: "center" });
          stayEl.focus();
        }
        alert(t.stayPeriodMissing);
        return;
      }
      if (!state.reviewText.trim() && !isAdmin()) {
        reviewTextarea.classList.add("review-textarea--error");
        reviewTextarea.scrollIntoView({ behavior: "smooth", block: "center" });
        reviewTextarea.focus();
        alert(language !== "ja"
          ? "Please write your review text."
          : "レビュー本文を入力してください。");
        return;
      }
      reviewTextarea.classList.remove("review-textarea--error");

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
        // 孤児レビュー対策：ホストの基本情報をレビューに埋め込んでおく。
        // customHosts（localStorage）が消えても、このスナップショットから
        // allHosts() がホストを復元できる（永続化先の不一致を吸収）。
        hostSnapshot: {
          id: host.id,
          name: host.name,
          area: host.area,
          city: host.city || "Red Deer, Alberta",
          lat: host.lat,
          lng: host.lng,
        },
        student: currentUser ? `${reviewerInfo.verified ? "✓ " : ""}${language !== "ja" ? "Anonymous student" : "匿名留学生"} (${currentUser.grade || ""})` : t.anonymousStudent,
        text: state.reviewText.trim(),
        score: overall,
        criteria: reviewCriteria,
        fit: [...state.reviewFit.map(fitKeyFromLabel)],
        // 滞在期間は structured（jsonb）に同梱して永続化（専用カラム追加不要）。
        structured: { ...state.reviewStructured, stayPeriod: state.reviewStayPeriod },
        reviewer: reviewerInfo,
        createdAt: new Date().toISOString(),
        editedAt: null,
      };

      reviewSubmit.disabled = true;
      await persistReview(review);
      clearDraft();
      state.reviewText = "";
      state.reviewScores = Object.fromEntries(Object.keys(defaultScores).map((k) => [k, 0]));
      state.reviewStayPeriod = "";
      state.reviewFit = [];
      state.reviewStructured = { privacy: "unknown", recommend: "" };
      state.submitted = true;
      // 投稿完了後は探すページへ、投稿した家族を選択した状態で戻る（結果トップに固定＋詳細展開）。
      state.selectedId = host.id;
      state.expandedHostId = host.id;
      setView("search");
      setTimeout(() => highlightHostCard(host.id), 100);
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

    // 検索候補（サジェスト）のタップ：候補を閉じて該当ホストを選択 → 下の検索結果欄へ移動。
    // クエリをクリアすることで候補リストが閉じ、選択ホストは結果トップに固定される（ソートで先頭化）。
    // 描画後に該当カードへスクロール＆ハイライトして「どこへ飛んだか」を明示する。
    document.querySelectorAll("[data-suggest-host]").forEach((button) => {
      button.addEventListener("click", () => {
        const hostId = Number(button.dataset.suggestHost);
        state.selectedId = hostId;
        state.submitted = false;
        state.query = "";          // 候補を閉じる
        state.expandedHostId = hostId; // 選択ホストの詳細を開いておく
        render();
        setTimeout(() => highlightHostCard(hostId), 80);
      });
    });

    // 「地図で見る」：ホストを選択して再描画し、埋め込みマップへスクロール（探すページ内で完結）
    document.querySelectorAll("[data-scroll-map]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedId = Number(button.dataset.scrollMap);
        state.submitted = false;
        render();
        const mapEl = document.getElementById("real-map");
        if (mapEl) setTimeout(() => mapEl.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
      });
    });

    // 結果ヘッダー／0件画面の「+ ホストを追加」：レビュー投稿ページ（家族未選択）へ。
    // そこに家族追加パネル（renderAddFamilyPanel）があるので追加導線はそちらに集約した。
    const goAddHost = () => { state.selectedId = null; setView("review"); };
    const goAddHostBtn = document.getElementById("go-add-host");
    if (goAddHostBtn) goAddHostBtn.addEventListener("click", goAddHost);
    const emptyAddHostBtn = document.getElementById("empty-add-host");
    if (emptyAddHostBtn) emptyAddHostBtn.addEventListener("click", goAddHost);
    const inlineAddHostBtn = document.getElementById("inline-add-host");
    if (inlineAddHostBtn) inlineAddHostBtn.addEventListener("click", goAddHost);

    // マップの折りたたみトグル（探すページ）。再描画でマップを生成/破棄する。
    const toggleMapBtn = document.getElementById("toggle-map");
    if (toggleMapBtn) toggleMapBtn.addEventListener("click", () => {
      state.mapCollapsed = !state.mapCollapsed;
      render();
    });

    document.querySelectorAll("[data-delete-review]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!window.confirm(t.confirmDeleteReview)) return;
        button.disabled = true;
        await deleteReview(button.dataset.deleteReview);
      });
    });

    document.querySelectorAll("[data-delete-host]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!window.confirm(t.confirmDeleteHost)) return;
        button.disabled = true;
        await deleteHost(button.dataset.deleteHost);
      });
    });

    // 復元ボタン：個別ホスト
    document.querySelectorAll("[data-restore-host]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.restoreHost);
        state.hiddenHostIds = (state.hiddenHostIds || []).filter((hid) => Number(hid) !== id);
        saveHiddenHostIds();
        render();
      });
    });

    // 復元ボタン：すべてのホスト
    const restoreAllHostsBtn = document.querySelector("[data-restore-all-hosts]");
    if (restoreAllHostsBtn) {
      restoreAllHostsBtn.addEventListener("click", () => {
        state.hiddenHostIds = [];
        saveHiddenHostIds();
        render();
      });
    }

    // 復元ボタン：個別レビュー
    document.querySelectorAll("[data-restore-review]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = String(button.dataset.restoreReview);
        state.hiddenReviewIds = (state.hiddenReviewIds || []).filter((rid) => String(rid) !== id);
        saveHiddenReviewIds();
        render();
      });
    });

    // 復元ボタン：すべてのレビュー
    const restoreAllReviewsBtn = document.querySelector("[data-restore-all-reviews]");
    if (restoreAllReviewsBtn) {
      restoreAllReviewsBtn.addEventListener("click", () => {
        state.hiddenReviewIds = [];
        saveHiddenReviewIds();
        render();
      });
    }

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

  // マップ⇄リスト連動：指定ホストの結果カードへスクロールし、一時的にハイライトする。
  function highlightHostCard(hostId) {
    const card = document.querySelector(`.result-card[data-host-id="${hostId}"]`);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("result-card--flash");
    setTimeout(() => card.classList.remove("result-card--flash"), 1600);
  }

  function initMap(host) {
    const mapElement = document.getElementById("real-map");
    if (!mapElement) return;

    // Leaflet（地図ライブラリ・CDN 配信）がまだ読み込まれていないことがある。
    // その場合は即「読み込めませんでした」と諦めず、短い間隔で最大10回（約5秒）
    // 再試行する。ロードが間に合えば地図が自動表示され、デモ中にエラー文が出にくくなる。
    if (!window.L) {
      if (mapRetryCount < 10) {
        mapRetryCount += 1;
        clearTimeout(mapRetryTimer);
        mapRetryTimer = setTimeout(() => {
          const wantsMap = state.view === "map" || (state.view === "search" && !state.mapCollapsed);
          if (wantsMap) initMap(host);
        }, 500);
      }
      return;
    }
    mapRetryCount = 0;
    clearTimeout(mapRetryTimer);

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

    publicHosts().forEach((item) => {
      const stats = getHostStats(item);
      // レビュー待ち（未評価）のホストは灰色ピン＋「—」表示にして、評価済みと区別する。
      const color = stats.hasReviews ? ratingToHeatColor(stats.rating) : "#9ca3af";
      const pinText = stats.hasReviews ? stats.rating.toFixed(1) : "—";

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
        html: `<div class="heat-pin" style="background:${color};"><span>${pinText}</span></div>`,
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
          `<strong>${escapeHtml(hostDisplayName(item))}</strong><br><small>${escapeHtml(item.area)}</small><br>${
            stats.hasReviews ? `${stats.rating.toFixed(1)} / 5` : escapeHtml(t.pendingReview)
          }<br><small>📍 ${escapeHtml(privacyNote)}</small>`
        )
        .on("click", () => {
          // マップ⇄リスト連動：ピンを選択 → 再描画後に該当カードへスクロール＆ハイライト。
          state.selectedId = item.id;
          render();
          if (state.view === "search") {
            setTimeout(() => highlightHostCard(item.id), 80);
          }
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

  // レビュー選択確認用ミニマップ（ホスト全件ピン表示、クリックで家族選択）
  function initMiniMap() {
    const mapEl = document.getElementById("review-mini-map");
    if (!mapEl || !window.L) return;

    // 既存インスタンスをクリーンアップ
    if (leafletMiniMap) {
      try { leafletMiniMap.remove(); } catch (_e) {}
      leafletMiniMap = null;
    }

    leafletMiniMap = window.L.map(mapEl, {
      center: [RED_DEER_CENTER.lat, RED_DEER_CENTER.lng],
      zoom: 12,
      maxZoom: 14, // 住所特定防止（メインマップと同じ制約）
      zoomControl: true,
      scrollWheelZoom: false,
    });

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 14,
    }).addTo(leafletMiniMap);

    publicHosts().forEach((h) => {
      if (!h.lat || !h.lng) return;
      const selected = state.selectedId && (h.id === state.selectedId || (h.duplicateIds || []).includes(state.selectedId));
      const marker = window.L.circleMarker([h.lat, h.lng], {
        radius: selected ? 10 : 7,
        color: selected ? "#4f46e5" : "#ef4444",
        fillColor: selected ? "#4f46e5" : "#ef4444",
        fillOpacity: selected ? 0.9 : 0.6,
        weight: selected ? 2 : 1,
      }).addTo(leafletMiniMap);

      marker.bindTooltip(hostDisplayName(h), { permanent: false, direction: "top" });
      marker.on("click", () => {
        state.selectedId = h.id;
        state.reviewScores = {};
        state.reviewText = "";
        state.reviewStructured = { recommend: "" };
        render();
      });
    });

    setTimeout(() => { if (leafletMiniMap) leafletMiniMap.invalidateSize(); }, 50);
  }

  function render() {
    const root = document.getElementById("app");
    if (!root) return;

    const host = selectedHost();
    const filteredHosts = filterHosts(publicHosts(), state.query);
    const focusState = captureFocusState();

    document.title = `${BRAND_NAME} | ${t.subtitle}`;
    document.documentElement.lang = t.htmlLang;
    // meta description を選択言語に同期（SEO・シェアカード用）
    const metaDesc = document.querySelector("meta[name='description']");
    if (metaDesc && t.metaDescription) metaDesc.setAttribute("content", t.metaDescription);

    const placeholderSearch = language !== "ja"
      ? "Search by area or keyword (e.g. Downtown, near school)"
      : "エリア名・キーワードで検索（例: Downtown、学校近い）";
    const searchPlaceholderHint = language !== "ja"
      ? "Tip: use the quick filters below for attribute search."
      : "ヒント：属性で絞り込むには下のクイックフィルターを使ってください。";

    const view = state.view;

    const heroSection = `
      <section class="section-hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            <h1 class="hero-title">${t.heroTitleA}<br />${t.heroTitleB}</h1>
            <span class="hero-tagline">${t.heroTagline}</span>
            <p class="hero-text">${t.heroText}</p>
            <div class="hero-actions">
              <button type="button" class="button button--primary" data-view="search">${t.findHostCta}</button>
              <button id="hero-review-button" type="button" class="button button--ghost">${t.writeReviewCta}</button>
            </div>
          </div>
          <div class="hero-visual" aria-hidden="true">
            <div class="hero-card-preview">
              <div class="hcp-sample-badge">${language !== "ja" ? "Sample image" : "表示はイメージです"}</div>
              <div class="hcp-head">
                <span class="hcp-avatar">🏠</span>
                <div>
                  <div class="hcp-name">${language !== "ja" ? "Thompson Family" : "Thompson ファミリー"}</div>
                  <div class="hcp-area">Downtown · Red Deer</div>
                </div>
                <span class="hcp-match">92%</span>
              </div>
              <div class="hcp-stars">
                ${["★★★★★","★★★★★","★★★★☆","★★★★★","★★★★☆","★★★★★"].map((s, i) => {
                  const labels = language !== "ja"
                    ? ["Safety","English","Meals","Study","Freedom","Cleanliness"]
                    : ["安全性","英語","食事","学習","自由度","清潔さ"];
                  return `<div class="hcp-star-row"><span class="hcp-star-label">${labels[i]}</span><span class="hcp-star-val">${s}</span></div>`;
                }).join("")}
              </div>
              <div class="hcp-footer">
                <span class="hcp-reviews">${language !== "ja" ? "12 reviews" : "12件のレビュー"}</span>
              </div>
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
        <button type="button" class="filter-toggle-btn ${state.quickFiltersOpen ? "is-open" : ""}" id="toggle-quick-filters"
          aria-expanded="${state.quickFiltersOpen ? "true" : "false"}" aria-controls="quick-filter-wrap">
          <span class="filter-toggle-label">⚙ ${language !== "ja" ? "Quick filters" : "クイックフィルター"}${state.activeFilters.length ? ` <span class="filter-badge">${state.activeFilters.length}</span>` : ""}</span>
          <span class="filter-toggle-caret" aria-hidden="true">${state.quickFiltersOpen ? "▴" : "▾"}</span>
        </button>
        <button type="button" class="open-sheet-btn" id="open-sheet-btn" aria-label="${language !== "ja" ? "Open filters" : "フィルターを開く"}">
          ☰ ${language !== "ja" ? "Filters" : "フィルター"} ${state.activeFilters.length ? `<span class="filter-badge">${state.activeFilters.length}</span>` : ""}
        </button>
        <div class="quick-filter-wrap ${state.quickFiltersOpen ? "is-open" : ""}" id="quick-filter-wrap">${renderQuickFilters()}</div>
      </div>
    `;

    // 「ホストの評価の見方」と「ホスト画面の見本」を1つの流れに統合（要望による）：
    // ① 評価軸＋重み付けの説明（renderRatingGuide）→ ② その軸が実画面でどう表示されるかを
    // 代表の Demo Family のダッシュボードで実演（renderHostProfile）。
    // 見本の見出しは guide の続き（h3）として配置し、ひとつのまとまりに見せる。
    const ratingGuideWithSample = `
      ${renderRatingGuide()}
      <section class="section-host-sample-intro">
        <div class="container">
          <h3 class="steps-title">${language !== "ja" ? "See it on a real host page" : "実際のホスト画面で見てみる"}</h3>
          <p class="steps-subtitle">${language !== "ja"
            ? "Here's how those axes appear on an actual host family's page — shown with our Demo Family. Each review carries its own rating breakdown."
            : "上の評価軸が、実際のホスト家庭のページではこのように表示されます。これは代表の Demo Family を使った実画面で、各レビューに評価内訳のレーダーが付きます。"}</p>
        </div>
      </section>
      ${renderHostProfile()}
    `;

    // ホームは hero ＋（評価の見方＋ホスト画面の見本を統合）＋ 安全設計に簡素化。
    // 「おすすめホスト」欄・About Nestly・「なぜNestlyを作るのか」は要望により削除。
    const homeView = view === "home" ? `
      ${heroSection}
      ${ratingGuideWithSample}
      ${renderSafetyDesign()}
      ${renderTrustSafety()}
    ` : "";

    // ログイン済みでプリファレンス設定済み → マッチ度ソート通知
    // ログイン済みだがプリファレンス未設定 → 設定を促す通知（サインアップ訴求は出さない）
    // 未ログイン → サインアップ訴求
    const matchSortNotice = currentUser && currentUser.preferences
      ? `<div class="match-sort-notice">${language !== "ja"
          ? "Results sorted by your personal match score."
          : "あなたとのマッチ度順で並べています。"}</div>`
      : currentUser
      ? `<div class="match-sort-notice match-sort-notice--cta">${language !== "ja"
          ? "Set your match preferences to see personalized scores."
          : "マッチング設定をすると、各ホストへの「マッチ度」が表示されます。"}</div>`
      : `<div class="match-sort-notice match-sort-notice--cta">${language !== "ja"
          ? "Sign up to see personalized match scores for each host."
          : "新規登録すると、各ホストへの「マッチ度」が表示されます。"}</div>`;

    // 統合「探す」ページ：検索バー＋クイックフィルター（searchToolbar 内）→ マップ →
    // 結果（各カードからレビュー投稿へ遷移）→ 末尾にホスト追加カード。
    // 旧「マップ」「レビューを書く」タブの導線をここに集約した。
    const searchView = view === "search" ? `
      <section class="section-search">
        <div class="container">
          ${searchToolbar}
          ${filteredHosts.length === 0 ? `
          <div class="search-add-inline">
            <p class="search-add-inline-text">${escapeHtml(language !== "ja"
              ? "Can't find the family you're looking for?"
              : "お探しの家族が見つかりませんか？")}</p>
            <button type="button" class="button button--primary button--compact" id="inline-add-host">+ ${escapeHtml(ui.addNewFamily)}</button>
          </div>
          ` : ""}
          <div class="search-map-block ${state.mapCollapsed ? "is-collapsed" : ""}">
            <button type="button" id="toggle-map" class="map-toggle" aria-expanded="${state.mapCollapsed ? "false" : "true"}">
              <span class="map-toggle-label">🗺 ${escapeHtml(t.mapTitle)}</span>
              <span class="map-toggle-icon">${state.mapCollapsed
                ? (language !== "ja" ? "▼ Show map" : "▼ 地図を表示")
                : (language !== "ja" ? "▲ Hide map" : "▲ 地図を隠す")}</span>
            </button>
            ${state.mapCollapsed ? "" : `
            <div class="map-canvas search-map-canvas" id="real-map" role="application" aria-label="${escapeHtml(t.mapTitle)}">
              <div class="map-fallback">${t.mapUnavailable}</div>
            </div>
            <div class="search-map-trust">
              <span class="trust-badge">${t.exactAddressHidden}</span>
              <span class="trust-badge">${t.approximatePins}</span>
              <span class="search-map-hint">${escapeHtml(language !== "ja" ? "Tap a pin to focus a host below" : "ピンをタップすると下の一覧で絞り込めます")}</span>
            </div>
            `}
          </div>
          <div class="results-head results-head--full">
            <h2 class="section-title">${t.searchResults}</h2>
            <span class="results-count">${filteredHosts.length}</span>
            <button type="button" class="button button--ghost button--compact" id="go-add-host">+ ${escapeHtml(ui.addNewFamily)}</button>
          </div>
          ${matchSortNotice}
          ${renderSearchResults(filteredHosts, host)}
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
    const adminRestoreView = view === "admin-restore" ? renderAdminRestore() : "";

    // 家族別レビュー一覧ページ（探すページの「この家のレビューを見る」遷移先）。
    const hostReviewsView = view === "host-reviews" ? `
      <section class="section-search">
        <div class="container">
          <div class="host-reviews-head">
            <button type="button" class="button button--ghost button--compact" data-view="search">${language !== "ja" ? "← Back to search" : "← 検索に戻る"}</button>
            ${host ? `<button type="button" class="button button--primary button--compact" data-write-review-for="${host.id}">${ui.addReview}</button>` : ""}
          </div>
          ${host
            ? renderRecentReviews({ hostOnly: true })
            : `<div class="card card--soft empty-state"><p class="empty-state-title">${escapeHtml(language !== "ja" ? "No family selected" : "家族が選択されていません")}</p></div>`}
        </div>
      </section>
    ` : "";

    root.innerHTML = `
      <div class="site-shell">
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
                  ? `<span class="status-pill status-pill--admin">${t.adminBadge}</span>
                     <button type="button" class="button button--ghost button--header button--compact" data-view="admin-restore" title="${escapeHtml(t.adminRestoreLink)}">${escapeHtml(t.adminRestoreLink)}</button>`
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
          ${adminRestoreView}
          ${hostReviewsView}
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
    // レビュー本文の機械翻訳を非同期で取得（取得後に再描画して反映）。
    processTranslationQueue();
    // マップは「探す」ページに埋め込み（旧 map ビューも後方互換で維持）。どちらでも #real-map を初期化。
    // ただし探すページでマップを折りたたんでいる場合は #real-map が存在しないので初期化しない。
    const shouldInitMap = state.view === "map" || (state.view === "search" && !state.mapCollapsed);
    if (shouldInitMap) {
      initMap(host);
    } else if (leafletMap) {
      try { leafletMap.remove(); } catch (_e) {}
      leafletMap = null;
    }
    // レビュー画面のミニマップ初期化（ホスト未選択時のみ全件表示）
    if (state.view === "review" && !state.selectedId) {
      initMiniMap();
    } else if (leafletMiniMap && state.view !== "review") {
      try { leafletMiniMap.remove(); } catch (_e) {}
      leafletMiniMap = null;
    }
    restoreFocusState(focusState);
    syncReviewsFromApi();
    syncHostRepliesFromApi();
    healCustomHostLocations();
  }

  // URL のハッシュが（ブラウザの戻る/進む・アドレスバー編集・外部リンクで）変わったら
  // ビューを再解決して描画し直す。自前のナビゲーション（saveView の replaceState）は
  // hashchange を発火しないので、無限ループにはならない。
  if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("hashchange", () => {
      const next = loadView();
      if (next !== state.view) {
        state.view = next;
        render();
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    });
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
