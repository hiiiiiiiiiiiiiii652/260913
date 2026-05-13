/**
 * Original Warm Wedding Invitation Configuration
 *
 * 이 파일에서 청첩장의 모든 정보를 수정할 수 있습니다.
 *
 * 이미지 폴더 구조 (파일명 규칙):
 *   images/hero/1.jpg      - 메인 사진 (1장, 필수)
 *   images/story/1.jpg, 2.jpg, ...  - 스토리 사진들 (순번, 자동 감지)
 *   images/gallery/1.jpg, 2.jpg, ... - 갤러리 사진들 (순번, 자동 감지)
 *   images/school/1.jpg, 2.jpg, ... - 학교 사진들 (순번, 자동 감지)
 *   images/jeju/1.jpg, 2.jpg, ...   - 제주도 사진들 (순번, 자동 감지)
 *   images/location/1.jpg  - 약도/지도 이미지 (1장)
 *   images/og/1.jpg        - 카카오톡 공유 썸네일 (1장)
 */
const CONFIG = {
  // ── 초대장 열기 ──
  useCurtain: false,  // 커튼 열림 애니메이션 사용 여부 (true: 사용, false: 바로 본문 표시)

  // ── 메인 (히어로) ──
  groom: {
    name: "최현진",
    father: "최재호",
    mother: "김정은",
    fatherDeceased: false,
    motherDeceased: false
  },
  bride: {
    name: "원희재",
    father: "원유천",
    mother: "조은정",
    fatherDeceased: false,
    motherDeceased: false
  },
  wedding: {
    date: "2026-09-13",
    time: "16:00",
    venue: "더채플앳논현 라포레홀",
    address: "서울시 강남구 논현로 549",
    mapLinks: {
      kakao: "https://place.map.kakao.com/1992754829",
      naver: "https://map.naver.com/p/entry/place/1106412731?c=15.00,0,0,0,dh&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202605120940&locale=ko&svcName=map_pcv5"
    },
    transport: {
      subway: "2호선 강남역 1번 출구에서 도보 5분",
      bus: "강남역 정류장 하차\n간선 140, 145, 146번\n지선 3412, 4412번",
      car: "강남구 논현로 549\n주차는 건물 지하 2층~4층 이용 가능\n(2시간 무료)"
    }
  },

  // ── 우리의 이야기 ──
  story: {
    title: "초대합니다",
    content: "서로 다른 길을 걷던 두 사람이\n하나의 길을 함께 걷게 되었습니다.\n\n여러분을 소중한 자리에 초대합니다."
  },

  // ── 마음 전하실 곳 ──
  accounts: {
    groom: [
      { role: "신랑", bank: "OO은행", number: "000-000-000000" },
      { role: "아버지", bank: "OO은행", number: "000-00-000000" },
      { role: "어머니", bank: "OO은행", number: "000-00-000000" }
    ],
    bride: [
      { role: "신부", bank: "OO은행", number: "00000-0000-00" },
      { role: "아버지", bank: "OO은행", number: "000000-00-000000" },
      { role: "어머니", bank: "OO은행", number: "000-00-000000-0" }
    ]
  },

  // ── 링크 공유 시 나타나는 문구 ──
  meta: {
    title: "최현진 ♥ 원희재 결혼합니다",
    description: "9월 13일 일요일 오후 4시, 소중한 분들을 초대합니다."
  }
};
