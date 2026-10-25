/**
 * ====================================================================
 * LG 틔운 미니 (LG Tiiun Mini) - Interactive App & Event Bindings
 * With ThinQ Virtual Character (다마고치 새싹이)
 * ====================================================================
 */

// 씨앗 키트 패키지 데이터
const SEED_KITS = {
  herb: [
    {
      id: 'herb-1',
      name: '스위트바질 & 루꼴라',
      icon: '🌿',
      recipe: '파스타, 카프레제 샐러드, 바질페스토',
      difficulty: '초보 추천 (쉬움)',
      harvest: '3~4주 수확',
      tags: ['베스트셀러', '식집사 입문']
    },
    {
      id: 'herb-2',
      name: '페퍼민트 & 타임',
      icon: '🍃',
      recipe: '모히또, 홈카페 허브티, 스테이크 시즈닝',
      difficulty: '쉬움',
      harvest: '3주 수확',
      tags: ['은은한 향', '홈카페']
    }
  ],
  salad: [
    {
      id: 'salad-1',
      name: '청치마상추 & 비타민',
      icon: '🥬',
      recipe: '삼겹살 쌈채소, 모둠 비타민 샐러드',
      difficulty: '매우 쉬움',
      harvest: '4주 수확',
      tags: ['무농약', '매일 수확']
    },
    {
      id: 'salad-2',
      name: '쌈배추 & 로메인',
      icon: '🥗',
      recipe: '시저 샐러드, 아삭한 샌드위치',
      difficulty: '쉬움',
      harvest: '4~5주 수확',
      tags: ['아삭한 식감', '다이어트']
    }
  ],
  flower: [
    {
      id: 'flower-1',
      name: '메리골드 & 비올라',
      icon: '🌼',
      recipe: '식용 꽃차, 꽃 샐러드 가니쉬',
      difficulty: '보통',
      harvest: '5~6주 개화',
      tags: ['노란 꽃망울', '공간 화사함']
    },
    {
      id: 'flower-2',
      name: '백일홍 & 촛불맨드라미',
      icon: '🌸',
      recipe: '감성 플라워 인테리어, 꽃꽂이 오브제',
      difficulty: '보통',
      harvest: '6주 개화',
      tags: ['비비드 컬러', '선물용']
    }
  ]
};

// 캐릭터 성장 단계 정의
const PET_STAGES = {
  seed: {
    levelName: 'Lv.1 씨앗 요정',
    expText: '애착도 25%',
    expPercent: '25%',
    leaf: '🌰',
    eyes: '◡   ◡',
    mouth: 'o',
    defaultMsg: '"어두운 흙 대신 포근한 배지 속에서 대기 중!"',
    afterWaterMsg: '"따뜻한 물을 머금고 싹틀 준비를 마쳤어요! 🌰"'
  },
  sprout: {
    levelName: 'Lv.2 아기 새싹이',
    expText: '애착도 75%',
    expPercent: '75%',
    leaf: '🌱',
    eyes: '●   ●',
    mouth: '◡',
    defaultMsg: '"나 목말라 물줘!~ 💧"',
    afterWaterMsg: '"물을 줘서 고마워요! 오늘도 조금 자랐어요🌱"'
  },
  leaf: {
    levelName: 'Lv.3 무럭무럭 초록이',
    expText: '애착도 90%',
    expPercent: '90%',
    leaf: '🌿',
    eyes: '❛   ˂̵',
    mouth: 'ᗜ',
    defaultMsg: '"새 잎이 3장이나 더 돋았어요! 햇살 최고 ☀️"',
    afterWaterMsg: '"시원한 물 마시고 쑥쑥 자라는 중! 🌿"'
  },
  bloom: {
    levelName: 'Lv.4 바질&꽃 요정',
    expText: '애착도 100% (완전체)',
    expPercent: '100%',
    leaf: '🌼',
    eyes: '≧   ≦',
    mouth: '▽',
    defaultMsg: '"풍성하게 자랐어요! 오늘 파스타에 얹어주세요 🍝"',
    afterWaterMsg: '"주인님과 함께한 초록 일기, 매일이 행복해요 💚"'
  }
};

// 공식몰 대상 링크
const OFFICIAL_PURCHASE_URL = 'https://www.lge.co.kr/product/lg-tiiun/l023e1p42?modelId=MD10823857&pdpType=PURCHASE';

document.addEventListener('DOMContentLoaded', () => {
  initLightSwitcher();
  initTamagotchiSimulator();
  initSeedKitSelector();
  initFaqAccordion();
  initCtaButtons();
  initShareAction();
  initScrollNudge();
  initGa4DebuggerUI();
});

/**
 * 1. 조명 모드 체험 인터랙션
 */
function initLightSwitcher() {
  const card = document.getElementById('hero-visual');
  const btnGrow = document.getElementById('btn-mode-grow');
  const btnMood = document.getElementById('btn-mode-mood');

  if (!card || !btnGrow || !btnMood) return;

  btnGrow.addEventListener('click', () => {
    btnGrow.classList.add('active');
    btnMood.classList.remove('active');
    card.classList.remove('mode-mood');
    showToast('🌱 식물 생장 특화 LED (주광색) 모드로 전환되었습니다.');

    if (window.ga4Tracker) {
      window.ga4Tracker.trackLightInteraction('grow_mode', '100%');
    }
  });

  btnMood.addEventListener('click', () => {
    btnMood.classList.add('active');
    btnGrow.classList.remove('active');
    card.classList.add('mode-mood');
    showToast('🌙 은은한 감성 무드등 (웜톤) 모드로 전환되었습니다.');

    if (window.ga4Tracker) {
      window.ga4Tracker.trackLightInteraction('mood_mode', '50%');
    }
  });
}

/**
 * 2. ★ [핵심] ThinQ 가상 새싹이 다마고치 시뮬레이터 인터랙션
 */
function initTamagotchiSimulator() {
  const stageBtns = document.querySelectorAll('.stage-btn');
  const dialogueEl = document.getElementById('pet-dialogue-text');
  const leafEl = document.getElementById('pet-top-leaf');
  const mouthEl = document.getElementById('pet-mouth');
  const sweatEl = document.getElementById('pet-sweat');
  const levelNameEl = document.getElementById('meter-level-name');
  const expTextEl = document.getElementById('meter-exp-text');
  const fillEl = document.getElementById('meter-fill');
  const waterBtn = document.getElementById('btn-give-water');
  const touchBtn = document.getElementById('btn-pet-touch');
  const creatureEl = document.getElementById('pet-creature');
  const heartsLayer = document.getElementById('pet-hearts-layer');

  let currentStage = 'sprout';
  let isWatered = false;

  function setStage(stageKey) {
    const data = PET_STAGES[stageKey];
    if (!data) return;

    currentStage = stageKey;
    isWatered = false;

    // UI 변경
    leafEl.textContent = data.leaf;
    mouthEl.textContent = data.mouth;
    dialogueEl.textContent = data.defaultMsg;
    levelNameEl.textContent = data.levelName;
    expTextEl.textContent = data.expText;
    fillEl.style.width = data.expPercent;

    if (stageKey === 'sprout') {
      sweatEl.style.display = 'block';
    } else {
      sweatEl.style.display = 'none';
    }

    // GA4 이벤트
    if (window.ga4Tracker) {
      window.ga4Tracker.trackCharacterStage(data.levelName, stageKey);
    }
  }

  // 1) 성장 단계 탭 클릭
  stageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stageBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setStage(btn.dataset.stage);
      triggerHeartAnimation();
    });
  });

  // 2) 물 채워주기 클릭
  if (waterBtn) {
    waterBtn.addEventListener('click', () => {
      isWatered = true;
      const data = PET_STAGES[currentStage];
      
      // 목마름 해소 표현
      sweatEl.style.display = 'none';
      mouthEl.textContent = '▽';
      dialogueEl.textContent = data.afterWaterMsg;

      // 하트 애니메이션 및 캐릭터 점프
      triggerHeartAnimation();
      creatureEl.style.transform = 'translateY(-12px) scale(1.1)';
      setTimeout(() => {
        creatureEl.style.transform = '';
      }, 400);

      showToast('💧 틔운 미니에 물을 채웠습니다! 새싹이가 기뻐합니다.');

      // GA4 이벤트
      if (window.ga4Tracker) {
        window.ga4Tracker.trackCharacterWater('give_water', 'happy');
      }
    });
  }

  // 3) 쓰다듬기 클릭
  function handleTouch() {
    triggerHeartAnimation();
    mouthEl.textContent = '◡';
    dialogueEl.textContent = '"간질간질~ 기분 좋아요! 사랑해요 주인님 💚"';

    creatureEl.style.transform = 'rotate(-5deg) scale(1.05)';
    setTimeout(() => {
      creatureEl.style.transform = '';
    }, 300);

    showToast('💚 새싹이와의 친밀도가 상승했습니다!');

    if (window.ga4Tracker) {
      window.ga4Tracker.trackCharacterWater('tap_character', 'love');
    }
  }

  if (touchBtn) touchBtn.addEventListener('click', handleTouch);
  if (creatureEl) creatureEl.addEventListener('click', handleTouch);

  // 하트 애니메이션 헬퍼
  function triggerHeartAnimation() {
    if (!heartsLayer) return;
    const hearts = ['💚', '🌱', '✨', '💖'];
    for (let i = 0; i < 4; i++) {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.left = `${30 + Math.random() * 40}%`;
      heart.style.bottom = `${40 + Math.random() * 20}px`;
      heartsLayer.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 1200);
    }
  }

  // 초기 상태
  setStage('sprout');
}

/**
 * 3. 씨앗 키트 선택기
 */
function initSeedKitSelector() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const container = document.getElementById('kit-cards-container');
  const summaryName = document.getElementById('summary-kit-name');
  const buyBtn = document.getElementById('btn-kit-buy');

  let currentCategory = 'herb';
  let selectedKit = SEED_KITS.herb[0];

  function renderCards(category) {
    const list = SEED_KITS[category] || [];
    container.innerHTML = '';

    list.forEach((kit) => {
      const isSelected = selectedKit.id === kit.id;
      const card = document.createElement('div');
      card.className = `kit-card ${isSelected ? 'selected' : ''}`;
      card.dataset.id = kit.id;

      card.innerHTML = `
        <div class="kit-info">
          <div class="kit-icon">${kit.icon}</div>
          <div>
            <div class="kit-title">${kit.name}</div>
            <div class="kit-recipe">${kit.recipe}</div>
            <div class="kit-badge-group">
              <span class="kit-badge">${kit.difficulty}</span>
              <span class="kit-badge">${kit.harvest}</span>
            </div>
          </div>
        </div>
        <div class="kit-check">✓</div>
      `;

      card.addEventListener('click', () => {
        selectedKit = kit;
        summaryName.textContent = kit.name;

        document.querySelectorAll('.kit-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        showToast(`'${kit.name}' 키트가 선택되었습니다.`);

        if (window.ga4Tracker) {
          window.ga4Tracker.trackSeedKitSelect(kit.name, category, 199000);
        }
      });

      container.appendChild(card);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      currentCategory = btn.dataset.category;
      renderCards(currentCategory);
    });
  });

  if (buyBtn) {
    buyBtn.addEventListener('click', () => {
      handlePurchaseRedirect('seed_kit_selector', `선택 구성 (${selectedKit.name})`);
    });
  }

  renderCards(currentCategory);
}

/**
 * 4. FAQ 아코디언
 */
function initFaqAccordion() {
  const items = document.querySelectorAll('.accordion-item');

  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      const questionTitle = header.querySelector('span:first-child').textContent.trim();

      items.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      item.classList.toggle('active');

      if (window.ga4Tracker) {
        window.ga4Tracker.trackFaqToggle(questionTitle, !isOpen);
      }
    });
  });
}

/**
 * 5. CTA 버튼 클릭 처리
 */
function initCtaButtons() {
  const ctaButtons = [
    { el: document.getElementById('hero-cta-btn'), loc: 'hero' },
    { el: document.getElementById('bottom-main-cta'), loc: 'mid_banner' },
    { el: document.getElementById('sticky-cta-btn'), loc: 'floating_bottom' }
  ];

  ctaButtons.forEach(({ el, loc }) => {
    if (!el) return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const text = el.innerText.trim();
      handlePurchaseRedirect(loc, text);
    });
  });
}

function handlePurchaseRedirect(location, buttonText) {
  if (window.ga4Tracker) {
    window.ga4Tracker.trackCtaClick(location, buttonText);
  }

  showToast('🛒 LG전자 공식몰로 이동 중입니다...');

  const currentUtm = window.ga4Tracker ? window.ga4Tracker.utmParams : {};
  const targetUrl = new URL(OFFICIAL_PURCHASE_URL);

  if (currentUtm.utm_source) targetUrl.searchParams.set('utm_source', currentUtm.utm_source);
  if (currentUtm.utm_medium) targetUrl.searchParams.set('utm_medium', currentUtm.utm_medium);
  if (currentUtm.utm_campaign) targetUrl.searchParams.set('utm_campaign', currentUtm.utm_campaign);
  if (currentUtm.utm_content) targetUrl.searchParams.set('utm_content', currentUtm.utm_content);

  setTimeout(() => {
    window.open(targetUrl.toString(), '_blank', 'noopener,noreferrer');
  }, 250);
}

/**
 * 6. 공유하기
 */
function initShareAction() {
  const shareBtn = document.getElementById('btn-share');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: 'LG 틔운 미니 | 물만 채우면, 나머지는 구경하세요',
      text: '내가 챙겨주면 반응하고 함께 자라는 나만의 작은 친구, LG 틔운 미니를 확인해보세요!',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (window.ga4Tracker) window.ga4Tracker.trackShare('native_share');
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('📋 링크가 클립보드에 복사되었습니다!');
        if (window.ga4Tracker) window.ga4Tracker.trackShare('copy_link');
      } catch (e) {
        showToast('링크 복사 권한이 필요합니다.');
      }
    }
  });
}

/**
 * 7. 스크롤 넛지
 */
function initScrollNudge() {
  const nudge = document.getElementById('scroll-nudge');
  const target = document.getElementById('tamagotchi-simulator');
  if (!nudge || !target) return;

  nudge.addEventListener('click', () => {
    target.scrollIntoView({ behavior: 'smooth' });
  });
}

/**
 * 8. GA4 디버거 드로어 UI
 */
function initGa4DebuggerUI() {
  const toggleBtn = document.getElementById('btn-ga4-toggle');
  const drawer = document.getElementById('ga4-debug-drawer');
  const closeBtn = document.getElementById('btn-close-ga4-drawer');
  const clearBtn = document.getElementById('btn-clear-ga4-log');
  const utmInfo = document.getElementById('drawer-utm-info');

  if (!toggleBtn || !drawer) return;

  if (utmInfo && window.ga4Tracker) {
    const utm = window.ga4Tracker.utmParams;
    utmInfo.innerHTML = `
      <span>source: <strong class="utm-tag">${utm.utm_source}</strong></span>
      <span>medium: <strong class="utm-tag">${utm.utm_medium}</strong></span>
      <span>campaign: <strong class="utm-tag">${utm.utm_campaign}</strong></span>
    `;
  }

  toggleBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const list = document.getElementById('ga4-debug-log-list');
      if (list) list.innerHTML = '';
      if (window.ga4Tracker) {
        window.ga4Tracker.eventHistory = [];
        const badge = document.getElementById('ga4-debug-count');
        if (badge) badge.textContent = '0';
      }
    });
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast-popup');
  const textEl = document.getElementById('toast-message');
  if (!toast || !textEl) return;

  textEl.textContent = msg;
  toast.classList.add('show');

  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}
