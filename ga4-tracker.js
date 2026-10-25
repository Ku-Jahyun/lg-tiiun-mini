/**
 * ====================================================================
 * LG 틔운 미니 (LG Tiiun Mini) - Instagram Campaign GA4 Event Tracker
 * ====================================================================
 * 인스타그램 프로필 링크(Link-in-bio) 및 인스타 광고 유입 트래픽을 정밀 측정하기 위한
 * Google Analytics 4 (GA4) 트래킹 모듈입니다.
 */

const GA4_CONFIG = {
  // [필수] 여기에 본인의 GA4 측정 ID(Measurement ID)를 입력하세요. (예: 'G-XXXXXXXXXX')
  measurementId: 'G-RJ1L3SS148',

  // 디버그 모드: true일 경우 화면 상단/하단 디버그 패널 및 브라우저 콘솔에 이벤트 페이로드가 실시간 표시됩니다.
  debugMode: true,

  // 기본 인스타그램 유입 파라미터 (URL에 UTM이 없을 때 폴백값)
  defaultUtm: {
    source: 'instagram',
    medium: 'bio_link',
    campaign: 'tiiun_mini_spring_2026',
    content: 'organic_profile'
  },

  // 스크롤 깊이 추적 임계값 (%)
  scrollThresholds: [25, 50, 75, 90, 100],

  // 체류 시간 추적 임계값 (초)
  dwellTimeThresholds: [10, 30, 60, 120, 180]
};

class GA4Tracker {
  constructor(config = {}) {
    this.config = { ...GA4_CONFIG, ...config };
    this.utmParams = this.extractUtmParams();
    this.trackedScrollPercentages = new Set();
    this.dwellTimer = null;
    this.startTime = Date.now();
    this.eventHistory = [];

    this.initGA4();
    this.initAutoTrackers();
  }

  /**
   * 1. URL에서 UTM 파라미터 및 인스타그램 레퍼러 추출
   */
  extractUtmParams() {
    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer.toLowerCase();

    let isInstagramRef = referrer.includes('instagram.com') || navigator.userAgent.toLowerCase().includes('instagram');

    const utm = {
      utm_source: params.get('utm_source') || (isInstagramRef ? 'instagram' : this.config.defaultUtm.source),
      utm_medium: params.get('utm_medium') || (isInstagramRef ? 'in_app_browser' : this.config.defaultUtm.medium),
      utm_campaign: params.get('utm_campaign') || this.config.defaultUtm.campaign,
      utm_content: params.get('utm_content') || this.config.defaultUtm.content,
      utm_term: params.get('utm_term') || 'tiiun_mini_L023E1P42',
      referrer: document.referrer || 'direct',
      device_type: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      is_inapp: /Instagram|KAKAOTALK/i.test(navigator.userAgent)
    };

    // 세션 스토리지에 최초 유입 UTM 보존
    if (!sessionStorage.getItem('tiiun_utm_first')) {
      sessionStorage.setItem('tiiun_utm_first', JSON.stringify(utm));
    }

    return utm;
  }

  /**
   * 2. gtag.js 동적 스크립트 로드 및 초기화
   */
  initGA4() {
    const id = this.config.measurementId;

    // 글로벌 dataLayer 및 gtag 함수 정의
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());

    // Measurement ID가 유효한 경우 스크립트 비동기 주입
    if (id && id !== 'G-MEASUREMENT_ID') {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);

      gtag('config', id, {
        send_page_view: false, // 커스텀 파라미터와 함께 명시적 발화
        custom_map: {
          dimension1: 'utm_source',
          dimension2: 'utm_campaign',
          dimension3: 'device_type'
        }
      });
    } else {
      console.info(`[GA4 Tracker] Measurement ID '${id}' is using placeholder. Running in Simulation / Debug mode.`);
    }

    // 최초 페이지뷰 이벤트 발화
    this.sendEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...this.utmParams
    });
  }

  /**
   * 3. 핵심 이벤트 전송 메서드
   * @param {string} eventName - GA4 이벤트 이름
   * @param {object} eventParams - 이벤트 매개변수
   */
  sendEvent(eventName, eventParams = {}) {
    const enrichedParams = {
      ...this.utmParams,
      timestamp: new Date().toISOString(),
      time_elapsed: Math.round((Date.now() - this.startTime) / 1000),
      ...eventParams
    };

    // 실제 gtag 호출
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, enrichedParams);
    }

    // 이벤트 이력 저장
    const logItem = {
      eventName,
      params: enrichedParams,
      time: new Date().toLocaleTimeString('ko-KR')
    };
    this.eventHistory.unshift(logItem);
    if (this.eventHistory.length > 50) this.eventHistory.pop();

    // 디버그 모드 출력
    if (this.config.debugMode) {
      this.renderDebugLog(logItem);
      console.log(`%c[GA4 EVENT] %c${eventName}`, 'background:#236141;color:#fff;font-weight:bold;padding:2px 6px;border-radius:3px;', 'color:#15803d;font-weight:bold;', enrichedParams);
    }
  }

  /**
   * 4. 자동 이벤트 수집 등록 (스크롤, 체류시간 등)
   */
  initAutoTrackers() {
    this.initScrollDepthTracker();
    this.initDwellTimeTracker();
  }

  /**
   * 스크롤 깊이 트래커 (25%, 50%, 75%, 90%, 100%)
   */
  initScrollDepthTracker() {
    let scrollThrottleTimeout = null;

    window.addEventListener('scroll', () => {
      if (scrollThrottleTimeout) return;

      scrollThrottleTimeout = setTimeout(() => {
        scrollThrottleTimeout = null;

        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;

        const currentScroll = window.scrollY;
        const scrollPercent = Math.min(100, Math.round((currentScroll / scrollHeight) * 100));

        this.config.scrollThresholds.forEach(threshold => {
          if (scrollPercent >= threshold && !this.trackedScrollPercentages.has(threshold)) {
            this.trackedScrollPercentages.add(threshold);

            this.sendEvent('scroll_depth', {
              percent_scrolled: threshold,
              page_location: window.location.href
            });
          }
        });
      }, 200);
    }, { passive: true });
  }

  /**
   * 체류 시간 트래커 (10s, 30s, 60s, 120s, 180s)
   */
  initDwellTimeTracker() {
    const checkDwellTime = () => {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);

      this.config.dwellTimeThresholds.forEach(threshold => {
        const key = `dwell_${threshold}s`;
        if (elapsedSeconds >= threshold && !this[key]) {
          this[key] = true;
          this.sendEvent('user_engagement_time', {
            engagement_time_seconds: threshold,
            milestone: `${threshold}s`
          });
        }
      });
    };

    this.dwellTimer = setInterval(checkDwellTime, 5000);
  }

  /**
   * ====================================================================
   * 비즈니스 전환 맞춤 이벤트 (Custom Conversion Events)
   * ====================================================================
   */

  /**
   * 1) 구매 CTA 버튼 클릭 (공식몰 전환)
   */
  trackCtaClick(buttonLocation, buttonText, productData = {}) {
    const defaultProduct = {
      item_id: 'L023E1P42',
      item_name: 'LG 틔운 미니 (L023E1P42)',
      price: 199000,
      currency: 'KRW',
      item_brand: 'LG Electronics',
      item_category: '식물생활가전'
    };

    const finalProduct = { ...defaultProduct, ...productData };

    this.sendEvent('click_cta', {
      cta_location: buttonLocation, // 'hero', 'mid_banner', 'floating_bottom', 'package_card'
      cta_text: buttonText,
      target_url: 'https://www.lge.co.kr/product/lg-tiiun/l023e1p42?modelId=MD10823857&pdpType=PURCHASE',
      ...finalProduct
    });

    // GA4 전자상거래 표준 'begin_checkout' 이벤트도 동시 전송
    this.sendEvent('begin_checkout', {
      currency: 'KRW',
      value: finalProduct.price,
      items: [finalProduct]
    });
  }

  /**
   * 2) 씨앗 키트 패키지 선택 이벤트
   */
  trackSeedKitSelect(kitName, kitType, kitPrice = 0) {
    this.sendEvent('select_seed_kit', {
      kit_name: kitName, // '루꼴라 & 비타민', '스위트바질 & 메리골드' 등
      kit_type: kitType, // 'herb', 'salad', 'flower'
      estimated_days: 28,
      kit_price: kitPrice
    });
  }

  /**
   * 3) 스마트 LED 조명 모드 전환 인터랙션
   */
  trackLightInteraction(modeName, brightnessLevel) {
    this.sendEvent('interact_light_feature', {
      light_mode: modeName, // 'grow_mode' (생장), 'mood_mode' (수면/무드)
      brightness: brightnessLevel
    });
  }

  /**
   * 4) ThinQ 가상 반려식물 캐릭터 인터랙션 이벤트
   */
  trackCharacterWater(actionType, characterMood) {
    this.sendEvent('interact_character_water', {
      action: actionType, // 'give_water', 'tap_character'
      mood_before: 'thirsty',
      mood_after: 'happy',
      dialogue: '물을 줘서 고마워요! 오늘도 조금 자랐어요🌱'
    });
  }

  /**
   * 5) 캐릭터 성장 단계(다마고치 진화) 열람 이벤트
   */
  trackCharacterStage(stageName, stageLevel) {
    this.sendEvent('view_character_stage', {
      stage_name: stageName, // '씨앗 요정', '아기 새싹', '무럭무럭 줄기', '풍성한 꽃/채소'
      stage_level: stageLevel
    });
  }

  /**
   * 6) FAQ 질문 펼침/접힘
   */
  trackFaqToggle(questionTitle, isOpen) {
    this.sendEvent('faq_interaction', {
      faq_question: questionTitle,
      action: isOpen ? 'open' : 'close'
    });
  }

  /**
   * 7) 링크 복사 / 인스타그램 공유하기 클릭
   */
  trackShare(shareMethod) {
    this.sendEvent('share', {
      method: shareMethod, // 'copy_link', 'instagram_story', 'kakaotalk'
      content_type: 'product_landing_page',
      item_id: 'L023E1P42'
    });
  }

  /**
   * 8) 실시간 디버그 모달 렌더링
   */
  renderDebugLog(logItem) {
    const listEl = document.getElementById('ga4-debug-log-list');
    const badgeEl = document.getElementById('ga4-debug-count');
    if (!listEl) return;

    if (badgeEl) {
      badgeEl.textContent = this.eventHistory.length;
    }

    const itemEl = document.createElement('div');
    itemEl.className = 'debug-log-item';
    itemEl.innerHTML = `
      <div class="log-head">
        <span class="log-name">${logItem.eventName}</span>
        <span class="log-time">${logItem.time}</span>
      </div>
      <div class="log-params">
        <pre>${JSON.stringify(logItem.params, null, 2)}</pre>
      </div>
    `;

    listEl.insertBefore(itemEl, listEl.firstChild);
  }
}

// 싱글톤 인스턴스 전역 노출
window.ga4Tracker = new GA4Tracker();
