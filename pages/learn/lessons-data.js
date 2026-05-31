// ══════════════════════════════════════════
//  BlogArch — Lessons Data
//  GitHub Pages base URL
// ══════════════════════════════════════════
const LESSONS_BASE_URL =
  'https://achrafayaou.github.io/english-lessons/lessons/';

const LESSONS_DATA = [
  { id:1,  title:'الحروف الإنجليزية',       titleEn:'English Alphabet',        description:'تعلم الأبجدية الإنجليزية والنطق الصحيح لكل حرف',           level:'beginner',     icon:'fas fa-font',                  githubPath:'alphabet.html' },
  { id:2,  title:'التحيات والسلام',          titleEn:'Greetings',               description:'طرق الترحيب في المواقف الرسمية وغير الرسمية',              level:'beginner',     icon:'fas fa-handshake',             githubPath:'greetings.html' },
  { id:3,  title:'الألوان والأشكال',         titleEn:'Colors and Shapes',       description:'أسماء الألوان والأشكال الهندسية باللغة الإنجليزية',         level:'beginner',     icon:'fas fa-palette',               githubPath:'colors-shapes.html' },
  { id:4,  title:'العائلة والمنزل',          titleEn:'Family and Home',         description:'مفردات العائلة وأفراد المنزل بالإنجليزية',                  level:'beginner',     icon:'fas fa-home',                  githubPath:'family-home.html' },
  { id:5,  title:'الوقت والتاريخ',           titleEn:'Time and Date',           description:'قراءة الساعة والتعبير عن التواريخ بشكل صحيح',              level:'beginner',     icon:'fas fa-clock',                 githubPath:'time-date.html' },
  { id:19, title:'تركيب الجملة',             titleEn:'Sentence Structure',      description:'التركيب الأساسي للجمل الإنجليزية من الصفر',                level:'beginner',     icon:'fas fa-paragraph',             githubPath:'ls.v1/Basic_Structure.html' },
  { id:20, title:'أدوات التعريف',            titleEn:'Articles',                description:'استخدام A و An و The بشكل صحيح',                           level:'beginner',     icon:'fas fa-book',                  githubPath:'ls.v1/Articles.html' },
  { id:21, title:'الاختصارات',               titleEn:'Contractions',            description:"I'm, you're, don't وغيرها من الاختصارات الشائعة",          level:'beginner',     icon:'fas fa-compress-arrows-alt',   githubPath:'ls.v1/Common_Contractions.html' },
  { id:6,  title:'الأفعال الأساسية',         titleEn:'Basic Verbs',             description:'الأفعال الأكثر استخداماً في الحياة اليومية',               level:'intermediate', icon:'fas fa-running',               githubPath:'basic_virbs.html' },
  { id:7,  title:'الأفعال المساعدة',         titleEn:'Auxiliary Verbs',         description:'كيفية استخدام الأفعال المساعدة في الجمل',                   level:'intermediate', icon:'fas fa-hands-helping',         githubPath:'Auxliary_verb.html' },
  { id:8,  title:'المفردات اليومية',         titleEn:'Daily Vocabulary',        description:'كلمات الحياة اليومية الأكثر استخداماً',                    level:'intermediate', icon:'fas fa-calendar-day',          githubPath:'Dailyvocabulary.html' },
  { id:9,  title:'كلمات الاستفهام',          titleEn:'Question Words',          description:'تكوين الأسئلة بشكل صحيح: Who, What, When…',              level:'intermediate', icon:'fas fa-question-circle',       githubPath:'Question_words.html' },
  { id:10, title:'الصفات',                   titleEn:'Adjectives',              description:'استخدام الصفات لوصف الأشخاص والأشياء',                     level:'intermediate', icon:'fas fa-tags',                  githubPath:'adjective.html' },
  { id:22, title:'كلمات الربط',              titleEn:'Linking Words',           description:'ربط الأفكار والجمل ببعضها بأسلوب سلس',                    level:'intermediate', icon:'fas fa-link',                  githubPath:'ls.v1/LinkingWords.html' },
  { id:23, title:'النفي المزدوج',            titleEn:'Double Negatives',        description:'قواعد النفي المزدوج وكيفية تجنب الأخطاء',                  level:'intermediate', icon:'fas fa-ban',                   githubPath:'ls.v1/Double_Negatives.html' },
  { id:11, title:'المحادثة المتقدمة',        titleEn:'Advanced Conversation',   description:'تعبيرات متقدمة لإجراء محادثات طبيعية',                     level:'advanced',     icon:'fas fa-comments',              githubPath:'advanced-conversation.html' },
  { id:12, title:'الكلام المنقول',           titleEn:'Reported Speech',         description:'قواعد نقل الكلام من مباشر إلى غير مباشر',                  level:'advanced',     icon:'fas fa-quote-right',           githubPath:'Reported_Speech.html' },
  { id:13, title:'المضارع التام',            titleEn:'Present Perfect',         description:'المضارع التام البسيط والمستمر واستخداماتهما',              level:'advanced',     icon:'fas fa-check-double',          githubPath:'Present_Perfect_Simple.html' },
  { id:14, title:'الأفعال المركبة',          titleEn:'Phrasal Verbs',           description:'الأفعال المركبة الأكثر شيوعاً وطريقة استخدامها',           level:'advanced',     icon:'fas fa-layer-group',           githubPath:'Phrasal_Verbs.html' },
  { id:15, title:'الماضي البسيط vs المستمر', titleEn:'Past Tenses',             description:'الفرق بين الماضي البسيط والماضي المستمر',                  level:'advanced',     icon:'fas fa-history',               githubPath:'Past_simple_vs.html' },
  { id:16, title:'المبني للمجهول',           titleEn:'Passive Voice',           description:'بنية الجملة المبنية للمجهول وتحويلها من المعلوم',           level:'advanced',     icon:'fas fa-eye-slash',             githubPath:'Passive_Voice.html' },
  { id:17, title:'الأفعال الناقصة',          titleEn:'Modal Verbs',             description:'Can, Could, Must, Should ومعانيها المختلفة',              level:'advanced',     icon:'fas fa-sliders-h',             githubPath:'Modal_verbs.html' },
  { id:18, title:'أزمنة المستقبل',           titleEn:'Future Tenses',           description:'Will, Going to وبقية أزمنة المستقبل',                    level:'advanced',     icon:'fas fa-forward',               githubPath:'Future_times.html' },
  { id:24, title:'مقابلات العمل',            titleEn:'Job Interviews',          description:'اللغة الإنجليزية المستخدمة في مقابلات التوظيف',           level:'advanced',     icon:'fas fa-briefcase',             githubPath:'ls.v1/Job_interview.html' },
  { id:25, title:'التعبيرات الاصطلاحية',     titleEn:'Idioms',                  description:'أشهر التعبيرات الاصطلاحية الإنجليزية ومعانيها',           level:'advanced',     icon:'fas fa-lightbulb',             githubPath:'ls.v1/Idioms.html' },
  { id:26, title:'Gerund vs Infinitive',     titleEn:'Gerund vs Infinitive',    description:'الفرق بين الاسم الفعلي والمصدر وأين يُستخدم كل منهما',     level:'advanced',     icon:'fas fa-exchange-alt',          githubPath:'ls.v1/Gerund_Infinitive.html' },
];
