// ========== Lessons Data ==========
const lessonsData = [
    {
        id: 1,
        title: "الحروف الإنجليزية",
        titleEn: "English Alphabet",
        description: "تعلم الأبجدية الإنجليزية والنطق الصحيح لكل حرف مع أمثلة تطبيقية من GitHub",
        level: "beginner",
        icon: "fas fa-font",
        githubPath: "alphabet.html"
    },
    {
        id: 2,
        title: "التحيات والسلام",
        titleEn: "Greetings",
        description: "تعلم طرق الترحيب والسلام المختلفة في المواقف الرسمية وغير الرسمية",
        level: "beginner",
        icon: "fas fa-handshake",
        githubPath: "greetings.html"
    },
    {
        id: 3,
        title: "الألوان والأشكال",
        titleEn: "Colors and Shapes",
        description: "تعلم أسماء الألوان الأساسية والأشكال الهندسية مع الاستخدام العملي",
        level: "beginner",
        icon: "fas fa-palette",
        githubPath: "colors-shapes.html"
    },
    {
        id: 4,
        title: "العائلة والمنزل",
        titleEn: "Family and Home",
        description: "مفردات أفراد العائلة والمنزل وطريقة وصف العلاقات الأسرية",
        level: "beginner",
        icon: "fas fa-home",
        githubPath: "family-home.html"
    },
    {
        id: 5,
        title: "الوقت والتاريخ",
        titleEn: "Time and Date",
        description: "تعلم قراءة الساعة والتعبير عن التواريخ والأوقات",
        level: "beginner",
        icon: "fas fa-clock",
        githubPath: "time-date.html"
    },
    {
        id: 6,
        title: "الأفعال الأساسية",
        titleEn: "Basic Verbs",
        description: "تعلم الأفعال الأساسية والأكثر استخداماً في اللغة الإنجليزية",
        level: "intermediate",
        icon: "fas fa-running",
        githubPath: "basic_virbs.html"
    },
    {
        id: 7,
        title: "الأفعال المساعدة",
        titleEn: "Auxiliary Verbs",
        description: "فهم واستخدام الأفعال المساعدة في تكوين الجمل والأزمنة",
        level: "intermediate",
        icon: "fas fa-hands-helping",
        githubPath: "Auxliary_verb.html"
    },
    {
        id: 8,
        title: "المفردات اليومية",
        titleEn: "Daily Vocabulary",
        description: "مفردات الحياة اليومية والكلمات الأكثر استخداماً",
        level: "intermediate",
        icon: "fas fa-calendar-day",
        githubPath: "Dailyvocabulary.html"
    },
    {
        id: 9,
        title: "كلمات الاستفهام",
        titleEn: "Question Words",
        description: "تعلم كلمات الاستفهام وكيفية تكوين الأسئلة بطريقة صحيحة",
        level: "intermediate",
        icon: "fas fa-question-circle",
        githubPath: "Question_words.html"
    },
    {
        id: 10,
        title: "الصفات",
        titleEn: "Adjectives",
        description: "تعلم الصفات الأساسية وكيفية استخدامها لوصف الأشياء والأشخاص",
        level: "intermediate",
        icon: "fas fa-tags",
        githubPath: "adjective.html"
    },
    {
        id: 11,
        title: "المحادثة المتقدمة",
        titleEn: "Advanced Conversation",
        description: "محادثات معقدة وتعبيرات متقدمة للمواقف المختلفة",
        level: "advanced",
        icon: "fas fa-comments",
        githubPath: "advanced-conversation.html"
    },
    {
        id: 12,
        title: "الكلام المنقول",
        titleEn: "Reported Speech",
        description: "تعلم قواعد الكلام المنقول وكيفية نقل أقوال الآخرين",
        level: "advanced",
        icon: "fas fa-quote-right",
        githubPath: "Reported_Speech.html"
    },
    {
        id: 13,
        title: "المضارع التام البسيط والمستمر",
        titleEn: "Present Perfect Simple & Continuous",
        description: "إتقان استخدام المضارع التام في صيغتيه البسيطة والمستمرة",
        level: "advanced",
        icon: "fas fa-check-circle",
        githubPath: "Present_Perfect_Simple.html"
    },
    {
        id: 14,
        title: "الأفعال المركبة",
        titleEn: "Phrasal Verbs",
        description: "استكشاف الأفعال المركبة الشائعة ومعانيها المختلفة",
        level: "advanced",
        icon: "fas fa-link",
        githubPath: "Phrasal_Verbs.html"
    },
    {
        id: 15,
        title: "الماضي البسيط مقابل الماضي المستمر",
        titleEn: "Past Simple vs Past Continuous",
        description: "فهم الفروق بين الماضي البسيط والماضي المستمر",
        level: "advanced",
        icon: "fas fa-history",
        githubPath: "Past_simple_vs.html"
    },
    {
        id: 16,
        title: "المبني للمجهول",
        titleEn: "Passive Voice",
        description: "فهم بنية المبني للمجهول واستخدامه في السياقات المختلفة",
        level: "advanced",
        icon: "fas fa-eye-slash",
        githubPath: "Passive_Voice.html"
    },
    {
        id: 17,
        title: "الأفعال الناقصة",
        titleEn: "Modal Verbs",
        description: "تعلم الأفعال الناقصة ومعانيها المختلفة في السياق",
        level: "advanced",
        icon: "fas fa-exclamation-triangle",
        githubPath: "Modal_verbs.html"
    },
    {
        id: 18,
        title: "أزمنة المستقبل والمضارع المستمر",
        titleEn: "Future Tenses & Present Continuous",
        description: "إتقان استخدام أزمنة المستقبل والمضارع المستمر",
        level: "advanced",
        icon: "fas fa-forward",
        githubPath: "Future_times.html"
    },
    {
        id: 19,
        title: "التركيب الأساسي للجملة",
        titleEn: "Basic Sentence Structure",
        description: "تعلم التركيب الأساسي للجملة الإنجليزية وأجزائها الرئيسية",
        level: "beginner",
        icon: "fas fa-paragraph",
        githubPath: "ls.v1/Basic_Structure.html"
    },
    {
        id: 20,
        title: "أدوات التعريف والنكرة: A, An, The",
        titleEn: "Articles: A, An, The",
        description: "فهم استخدام أدوات التعريف والنكرة في اللغة الإنجليزية",
        level: "beginner",
        icon: "fas fa-book",
        githubPath: "ls.v1/Articles.html"
    },
    {
        id: 21,
        title: "الاختصارات الشائعة في الإنجليزية",
        titleEn: "Common Contractions",
        description: "تعلم الاختصارات الشائعة مثل I'm, you're, don't وغيرها",
        level: "beginner",
        icon: "fas fa-compress-arrows-alt",
        githubPath: "ls.v1/Common_Contractions.html"
    },
    {
        id: 22,
        title: "كلمات الربط في الجمل",
        titleEn: "Linking Words",
        description: "كيفية ربط الأفكار والجمل باستخدام كلمات الربط",
        level: "intermediate",
        icon: "fas fa-chain",
        githubPath: "ls.v1/LinkingWords.html"
    },
    {
        id: 23,
        title: "قواعد النفي المزدوج",
        titleEn: "Double Negatives",
        description: "فهم قواعد النفي المزدوج ومتى يُستخدم",
        level: "intermediate",
        icon: "fas fa-ban",
        githubPath: "ls.v1/Double_Negatives.html"
    },
    {
        id: 24,
        title: "الإنجليزية في مقابلات العمل",
        titleEn: "English in Job Interviews",
        description: "نصائح وتعبيرات لإجراء مقابلات عمل بالإنجليزية",
        level: "advanced",
        icon: "fas fa-briefcase",
        githubPath: "ls.v1/Job_interview.html"
    },
    {
        id: 25,
        title: "التعبيرات الاصطلاحية",
        titleEn: "Idioms",
        description: "تعلم التعبيرات الاصطلاحية الشائعة ومعانيها",
        level: "advanced",
        icon: "fas fa-lightbulb",
        githubPath: "ls.v1/Idioms.html"
    },
    {
        id: 26,
        title: "الفرق بين Gerund و Infinitive",
        titleEn: "Gerund vs Infinitive",
        description: "فهم الفرق بين الجرند والإنفينيتيف واستخدامهما",
        level: "advanced",
        icon: "fas fa-exchange-alt",
        githubPath: "ls.v1/Gerund_Infinitive.html"
    }
];

// ========== Tips Data ==========
const tipsData = [
    {
        id: 1,
        icon: "fa-lightbulb",
        title: "نصيحة التكرار المتباعد",
        content: "مارس اللغة يومياً لمدة 15 دقيقة على الأقل لتحقيق تقدم ملحوظ. التكرار المتباعد يعزز الذاكرة طويلة الأمد!"
    },
    {
        id: 2,
        icon: "fa-book-open",
        title: "القراءة الموسعة",
        content: "اقرأ موضوعات تهمك بالإنجليزية. ابدأ بمستواك واستخدم القاموس بحكمة. القراءة توسع المفردات بشكل طبيعي."
    },
    {
        id: 3,
        icon: "fa-headphones",
        title: "الاستماع النشط",
        content: "استمع للبودكاست والأغاني الإنجليزية. حاول فهم السياق قبل البحث عن الكلمات. الاستماع يحسن النطق والفهم."
    },
    {
        id: 4,
        icon: "fa-comments",
        title: "التحدث بثقة",
        content: "لا تخف من الأخطاء! تحدث مع نفسك أو مع متعلمين آخرين. الممارسة اليومية تبني الطلاقة والثقة."
    },
    {
        id: 5,
        icon: "fa-sticky-note",
        title: "دفتر الملاحظات",
        content: "احتفظ بدفتر للكلمات الجديدة مع جمل توضيحية. راجعها أسبوعياً. الكتابة تساعد على الحفظ والفهم العميق."
    }
];

// ========== State ==========
const levelMeta = {
    beginner: { label: 'مبتدئ', className: 'badge-beginner', emoji: '🔰' },
    intermediate: { label: 'متوسط', className: 'badge-intermediate', emoji: '🌟' },
    advanced: { label: 'متقدم', className: 'badge-advanced', emoji: '⚡' }
};

let currentTheme = localStorage.getItem('theme') || 'default';
let currentSlide = 0;
let carouselInterval = null;
let currentLevelFilter = 'all';
let currentSearchQuery = '';
let currentLessonList = [...lessonsData];
let currentLessonIndex = -1;

// ========== Initialization ==========
document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNavigation();
    initCarousel();
    initLessons();
    initModals();
    bindSearchIfExists();
    updateLessonStats();
});

// ========== Theme Management ==========
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === currentTheme);
        btn.addEventListener('click', function () {
            const theme = this.dataset.theme;
            setTheme(theme);
            closeMobileMenu();
        });
    });
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

// ========== Navigation ==========
function initNavigation() {
    document.querySelectorAll('[data-scroll]').forEach(btn => {
        btn.addEventListener('click', function () {
            const target = this.dataset.scroll;
            const section = document.getElementById(target);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            closeMobileMenu();
        });
    });

    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');
            updateMobileMenuIcon();
        });
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        updateMobileMenuIcon();
    }
}

function updateMobileMenuIcon() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenuToggle || !mobileMenu) return;

    const icon = mobileMenuToggle.querySelector('i');
    if (!icon) return;
    icon.className = mobileMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
}

// ========== Carousel ==========
function initCarousel() {
    const carousel = document.getElementById('tipsCarousel');
    const dotsContainer = document.getElementById('carouselDots');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (!carousel || !dotsContainer || !prevBtn || !nextBtn) return;

    carousel.innerHTML = '';
    dotsContainer.innerHTML = '';

    tipsData.forEach((tip, index) => {
        const slide = document.createElement('div');
        slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-label', `نصيحة ${index + 1} من ${tipsData.length}`);
        slide.innerHTML = `
            <i class="fas ${tip.icon}" aria-hidden="true"></i>
            <h3>${tip.title}</h3>
            <p>${tip.content}</p>
        `;
        carousel.appendChild(slide);

        const dot = document.createElement('button');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.type = 'button';
        dot.setAttribute('aria-label', `الانتقال إلى النصيحة ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    startCarouselAutoRotation();
    carousel.addEventListener('mouseenter', stopCarouselAutoRotation);
    carousel.addEventListener('mouseleave', startCarouselAutoRotation);
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    if (!slides.length || !dots.length) return;

    slides[currentSlide]?.classList.remove('active');
    dots[currentSlide]?.classList.remove('active');

    currentSlide = index;

    slides[currentSlide]?.classList.add('active');
    dots[currentSlide]?.classList.add('active');
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % tipsData.length;
    goToSlide(nextIndex);
}

function prevSlide() {
    const prevIndex = (currentSlide - 1 + tipsData.length) % tipsData.length;
    goToSlide(prevIndex);
}

function startCarouselAutoRotation() {
    stopCarouselAutoRotation();
    carouselInterval = setInterval(nextSlide, 5000);
}

function stopCarouselAutoRotation() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

// ========== Lessons ==========
function initLessons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            currentLevelFilter = this.dataset.level;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderLessons();
        });
    });

    renderLessons();
}

function bindSearchIfExists() {
    const searchInput = document.getElementById('lessonSearch');
    const clearBtn = document.getElementById('clearLessonSearch');

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentSearchQuery = this.value.trim().toLowerCase();
            if (clearBtn) clearBtn.hidden = !currentSearchQuery;
            renderLessons();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            currentSearchQuery = '';
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
            }
            clearBtn.hidden = true;
            renderLessons();
        });
    }
}

function getFilteredLessons() {
    return lessonsData.filter(lesson => {
        const levelMatch = currentLevelFilter === 'all' || lesson.level === currentLevelFilter;
        const searchPool = `${lesson.title} ${lesson.titleEn} ${lesson.description}`.toLowerCase();
        const searchMatch = !currentSearchQuery || searchPool.includes(currentSearchQuery);
        return levelMatch && searchMatch;
    });
}

function renderLessons() {
    const grid = document.getElementById('lessonsGrid');
    const emptyState = document.getElementById('lessonsEmptyState');
    if (!grid) return;

    grid.innerHTML = '';
    currentLessonList = getFilteredLessons();

    if (!currentLessonList.length) {
        if (emptyState) emptyState.hidden = false;
        updateLessonStats(0);
        return;
    }

    if (emptyState) emptyState.hidden = true;

    currentLessonList.forEach((lesson, index) => {
        const meta = levelMeta[lesson.level] || levelMeta.beginner;
        const card = document.createElement('article');
        card.className = 'lesson-card';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${lesson.title} - ${meta.label}`);
        card.innerHTML = `
            <div class="lesson-icon">
                <i class="${lesson.icon}" aria-hidden="true"></i>
            </div>
            <div class="lesson-badge-container">
                <span class="lesson-badge ${meta.className}">${meta.emoji} ${meta.label}</span>
            </div>
            <h3 class="lesson-title">${lesson.title}</h3>
            <p class="lesson-title-en">${lesson.titleEn}</p>
            <p class="lesson-description">${lesson.description}</p>
            <div class="lesson-card-footer">
                <span class="lesson-open-cta">فتح الدرس <i class="fas fa-arrow-left" aria-hidden="true"></i></span>
            </div>
        `;

        card.addEventListener('click', () => openLessonModal(lesson, index));
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLessonModal(lesson, index);
            }
        });

        grid.appendChild(card);
    });

    updateLessonStats(currentLessonList.length);
}

function updateLessonStats(visibleCount = currentLessonList.length) {
    const counts = {
        all: lessonsData.length,
        beginner: lessonsData.filter(item => item.level === 'beginner').length,
        intermediate: lessonsData.filter(item => item.level === 'intermediate').length,
        advanced: lessonsData.filter(item => item.level === 'advanced').length
    };

    const summary = document.getElementById('lessonsSummary');
    const allCount = document.getElementById('countAll');
    const beginnerCount = document.getElementById('countBeginner');
    const intermediateCount = document.getElementById('countIntermediate');
    const advancedCount = document.getElementById('countAdvanced');

    if (summary) {
        const filterLabel = currentLevelFilter === 'all' ? 'كل المستويات' : levelMeta[currentLevelFilter].label;
        const searchSuffix = currentSearchQuery ? ` — البحث: “${currentSearchQuery}”` : '';
        summary.textContent = `يعرض ${visibleCount} من أصل ${counts.all} درساً — ${filterLabel}${searchSuffix}`;
    }

    if (allCount) allCount.textContent = counts.all;
    if (beginnerCount) beginnerCount.textContent = counts.beginner;
    if (intermediateCount) intermediateCount.textContent = counts.intermediate;
    if (advancedCount) advancedCount.textContent = counts.advanced;
}

// ========== Modals ==========
function initModals() {
    const showFlashlessonBtn = document.getElementById('showFlashlesson');
    const flashlessonModal = document.getElementById('flashlessonModal');
    const closeFlashlessonBtn = document.getElementById('closeFlashlessonModal');
    const openFlashlessonNewTabBtn = document.getElementById('openFlashlessonNewTab');
    const lessonModal = document.getElementById('lessonModal');
    const closeLessonBtn = document.getElementById('closeLessonModal');
    const prevLessonBtn = document.getElementById('prevLessonBtn');
    const nextLessonBtn = document.getElementById('nextLessonBtn');

    if (showFlashlessonBtn) {
        showFlashlessonBtn.addEventListener('click', openFlashlessonModal);
    }

    if (closeFlashlessonBtn) {
        closeFlashlessonBtn.addEventListener('click', () => closeModal('flashlessonModal'));
    }

    if (openFlashlessonNewTabBtn) {
        openFlashlessonNewTabBtn.addEventListener('click', () => {
            window.open('https://cdn.jsdelivr.net/gh/AchRafAyaOu/english-lessons@main/tips/Flashlesson/index.html', '_blank', 'noopener');
        });
    }

    if (flashlessonModal) {
        flashlessonModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal('flashlessonModal');
            }
        });
    }

    if (closeLessonBtn) {
        closeLessonBtn.addEventListener('click', () => closeModal('lessonModal'));
    }

    if (lessonModal) {
        lessonModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal('lessonModal');
            }
        });
    }

    if (prevLessonBtn) {
        prevLessonBtn.addEventListener('click', showPreviousLesson);
    }

    if (nextLessonBtn) {
        nextLessonBtn.addEventListener('click', showNextLesson);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal('lessonModal');
            closeModal('flashlessonModal');
        }
    });
}

function openFlashlessonModal() {
    const modal = document.getElementById('flashlessonModal');
    const modalBody = document.getElementById('flashlessonModalBody');
    if (!modal || !modalBody) return;

    modal.classList.add('active');
    document.body.classList.add('modal-open');
    modalBody.innerHTML = getLoaderMarkup('جاري تحميل بطاقات الدروس...');

    fetch('https://cdn.jsdelivr.net/gh/AchRafAyaOu/english-lessons@main/tips/Flashlesson/index.html')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load flashlesson');
            return response.text();
        })
        .then(html => {
            modalBody.innerHTML = `<iframe title="بطاقات الدروس" srcdoc="${html.replace(/"/g, '&quot;')}" style="width:100%;height:100%;border:none;border-radius:0.75rem;background:#fff;"></iframe>`;
        })
        .catch(error => {
            console.error('Error loading flashlesson:', error);
            modalBody.innerHTML = '<p style="text-align:center;color:var(--muted-foreground);padding:1rem;">حدث خطأ في تحميل المحتوى</p>';
        });
}

function openLessonModal(lesson, index = -1) {
    const modal = document.getElementById('lessonModal');
    const modalTitle = document.getElementById('lessonModalTitle');
    const modalBody = document.getElementById('lessonModalBody');
    const openNewTabBtn = document.getElementById('openLessonNewTab');
    const lessonCounter = document.getElementById('lessonModalCounter');
    const prevLessonBtn = document.getElementById('prevLessonBtn');
    const nextLessonBtn = document.getElementById('nextLessonBtn');

    if (!modal || !modalTitle || !modalBody) return;

    currentLessonIndex = index;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    modalTitle.textContent = lesson.title;
    modalBody.innerHTML = getLoaderMarkup('جاري تحميل الدرس...');

    if (openNewTabBtn) {
        openNewTabBtn.onclick = () => {
            window.open(`https://cdn.jsdelivr.net/gh/AchRafAyaOu/english-lessons@main/lessons/${lesson.githubPath}`, '_blank', 'noopener');
        };
    }

    if (lessonCounter) {
        lessonCounter.textContent = index >= 0 ? `${index + 1} / ${currentLessonList.length}` : '— / —';
    }

    if (prevLessonBtn) prevLessonBtn.disabled = index <= 0;
    if (nextLessonBtn) nextLessonBtn.disabled = index >= currentLessonList.length - 1 || index === -1;

    fetch(`https://cdn.jsdelivr.net/gh/AchRafAyaOu/english-lessons@main/lessons/${lesson.githubPath}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load lesson');
            return response.text();
        })
        .then(html => {
            modalBody.innerHTML = `<iframe title="${lesson.title}" srcdoc="${html.replace(/"/g, '&quot;')}" style="width:100%;height:100%;border:none;border-radius:0.75rem;background:#fff;"></iframe>`;
        })
        .catch(error => {
            console.error('Error loading lesson:', error);
            modalBody.innerHTML = '<p style="text-align:center;color:var(--muted-foreground);padding:1rem;">حدث خطأ في تحميل الدرس</p>';
        });
}

function showPreviousLesson() {
    if (currentLessonIndex > 0) {
        openLessonModal(currentLessonList[currentLessonIndex - 1], currentLessonIndex - 1);
    }
}

function showNextLesson() {
    if (currentLessonIndex < currentLessonList.length - 1) {
        openLessonModal(currentLessonList[currentLessonIndex + 1], currentLessonIndex + 1);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');

    const frameHost = modal.querySelector('iframe');
    if (frameHost) frameHost.remove();

    if (!document.querySelector('.modal.active')) {
        document.body.classList.remove('modal-open');
    }
}

function getLoaderMarkup(message) {
    return `
        <div class="loader" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.75rem;height:100%;padding:2rem;">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
}
