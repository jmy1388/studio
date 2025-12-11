
'use client';

import {
  collection,
  getDocs,
  writeBatch,
  Timestamp,
  doc,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Article } from './data';

// Helper function to generate a random date within the last 7 days
const randomDateInPastSevenDays = () => {
  const date = new Date();
  const pastDate = date.getDate() - Math.floor(Math.random() * 7);
  date.setDate(pastDate);
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return Timestamp.fromDate(date);
};

const articlesToSeed: Omit<Article, 'id' | 'createdAt'>[] = [
  {
    authorUsername: '고민많은너구리',
    title: '뒷담화, 이제 그만하고 싶어',
    summary: '친한 친구들이 다른 친구 험담하는 걸 들을 때마다 마음이 불편해. 어떻게 해야 이 상황을 벗어날 수 있을까?',
    content:
      '어제도 그랬다. 점심시간에 모여서 밥을 먹는데, 한 친구가 자리에 없는 다른 친구 이야기를 시작했다. 처음에는 그냥 듣고만 있었는데, 점점 심한 말이 오고 갔다. 웃으면서 맞장구를 쳐야 할지, 아니면 정색하고 그만하라고 해야 할지 몰라 그냥 어색하게 웃기만 했다.\n\n나도 모르게 그 대화에 참여하게 될까 봐 두렵다. 나도 언젠가 저 뒷담화의 주인공이 될 수 있다는 생각에 잠이 오지 않는다. 이건 정말 나의 큰 비밀이자 고민이다. 친구 관계, 정말 어떻게 해야 하는 걸까?',
    slug: 'i-want-to-stop-gossiping',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['친구 관계', '싫어요', '나의 비밀'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '급식탐험대',
    title: '오늘 급식 메뉴, 레전드 아니야?',
    summary: '우리 학교 급식 클라스 좀 봐! 매일매일이 기대되는 점심시간. 다른 학교 친구들은 뭐 먹는지 궁금하다.',
    content:
      '오늘 점심 메뉴는 진짜 역대급이었다. 바삭한 돈까스에, 크림 수프, 그리고 디저트로 아이스크림까지! 급식 먹으려고 학교 온다는 말이 괜히 있는 게 아니다. 점심시간 10분 전부터 이미 내 마음은 식당에 가 있었다.\n\n우리 학교 영양사 선생님은 정말 최고인 것 같다. 가끔 맛없는 메뉴가 나올 때도 있지만, 이런 날 한 번이면 모든 게 용서된다. 친구들이랑 \'오늘 급식 뭐지?\' 하고 맞추는 것도 소소한 재미다. #급식 #좋아요',
    slug: 'todays-school-lunch-is-legendary',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['급식 메뉴', '좋아요'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '겜생겜사',
    title: '부모님 몰래 밤새 게임하기',
    summary: '새벽 2시, 모두가 잠든 시간. 나만의 PC방이 열린다. 들키지 않고 밤새 게임하는 나만의 꿀팁 대방출!',
    content:
      '고요한 새벽, 내 방에서 들리는 건 오직 키보드와 마우스 소리뿐. 방문 틈으로 새어 나가는 불빛을 막기 위해 수건으로 문틈을 막는 건 기본이다. 사운드 플레이는 포기할 수 없으니, 이어폰은 필수. 혹시라도 부모님이 거실로 나오실까 봐 발소리에 온 신경을 곤두세운다.\n\n"공부한다"고 거짓말하고 게임하는 게 마음 편하지는 않다. 하지만 새로운 시즌이 시작됐는데 어떻게 참을 수 있겠는가. 레벨업의 짜릿함은 시험 성적의 압박감을 잠시 잊게 해준다. 이건 나만의 스트레스 해소법이다. #부모님몰래 #게임',
    slug: 'playing-games-all-night-secretly',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['부모님 몰래', '게임', '나의 비밀'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '프로반항러',
    title: '부모님과의 대화, 꼭 그렇게 해야만 속이 시원하셨나요',
    summary: '가끔 부모님의 말이 비수처럼 꽂힐 때가 있다. 사랑해서 하는 말인 건 알지만, 너무 아프다. 우리, 조금만 더 예쁘게 말해주면 안 될까요?',
    content:
      '"다 널 위해서 하는 말이야." 이 말만큼 무서운 말이 또 있을까. 어제는 성적표를 보시더니 한숨을 쉬며 "옆집 애는 장학금 받았다더라"라고 하셨다. 내 노력은 한순간에 물거품이 되는 기분이었다. \n\n나도 잘하고 싶은데, 마음처럼 되지 않아서 속상한 건 나 자신이다. 가끔은 그냥 "힘들지?" 하고 따뜻하게 안아주셨으면 좋겠다. 부모님과의 관계, 정말 세상에서 제일 어려운 숙제 같다.',
    slug: 'conversation-with-parents',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['부모님 관계', '싫어요'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '댄싱머신',
    title: '요즘 틱톡 챌린지, 이거 모르면 간첩',
    summary: '15초 안에 나를 표현하는 방법! 요즘 제일 핫한 틱톡 댄스 챌린지, 같이 배워볼래? #인싸되는법',
    content:
      '요즘 쉬는 시간마다 친구들이랑 틱톡 챌린지 영상을 찍는 재미에 푹 빠졌다. 처음에는 삐걱거리는 몸짓이 부끄러웠는데, 자꾸 추다 보니 나름 그럴싸해졌다. 중독성 있는 음악에 맞춰 친구들과 합을 맞추다 보면 스트레스가 확 풀린다.\n\n인스타그램 릴스에도 영상을 올렸는데, \'좋아요\'가 순식간에 100개를 넘었다. 유명해지고 싶은 마음보다는, 그냥 지금 이 순간의 즐거움을 기록하고 싶을 뿐이다. 다음엔 어떤 챌린지가 유행할까? 벌써부터 기대된다.',
    slug: 'tiktok-challenge-you-must-know',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['틱톡', '인스타그램', '좋아요'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '길잃은별',
    title: '내 꿈이 뭔지 아직도 모르겠어',
    summary: '어른들은 꿈을 가지라고 하는데, 나는 뭘 좋아하는지, 뭘 잘하는지도 모르겠다. 진로에 대한 고민, 나만 하는 거 아니지?',
    content:
      '진로 상담 시간이었다. 선생님은 나에게 장래 희망이 뭐냐고 물으셨다. 나는 아무 말도 할 수 없었다. 친구들은 의사, 변호사, 개발자 등 멋진 꿈들을 이야기하는데, 나는 마치 텅 빈 깡통이 된 기분이었다.\n\n부모님은 안정적인 직업을 원하시지만, 나는 그게 정말 내가 원하는 삶인지 확신이 서지 않는다. 지금은 그냥 다양한 경험을 해보는 게 중요하다고 생각한다. 그래서 이번 주말에는 코딩 동아리 설명회에 가볼 생각이다. 내 안의 작은 불씨를 찾을 수 있을까?',
    slug: 'i-still-dont-know-my-dream',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['진로'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '시험기간엔딴짓',
    title: '시험 D-7, 공부 빼고 다 재밌다',
    summary: '분명 시험공부를 시작하려고 했는데... 왜 내 손은 스마트폰을, 내 눈은 책상 위 먼지를 향하는 걸까? 시험 기간 국룰, 나만 이런 거 아니지?',
    content:
      '책상 앞에 앉은 지 1시간째. 펼쳐진 문제집의 첫 장을 넘기지 못하고 있다. 갑자기 어제 본 드라마의 결말이 궁금해지고, 인스타그램에 새로 올라온 친구의 스토리를 확인하고 싶다. "잠깐만" 하고 시작한 딴짓은 꼬리에 꼬리를 물고 이어진다.\n\n정신을 차려보니 새벽 1시. "내일부터 진짜 열심히 해야지" 다짐하며 침대에 눕는다. 시험 기간이 되면 왜 평소에는 하지도 않던 방 청소가 하고 싶어지는 걸까? 공부라는 거, 정말 쉽지 않다.',
    slug: 'everything-is-fun-except-studying-during-exams',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['시험', '공부', '싫어요'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '학원버스안에서',
    title: '집보다 학원에 있는 시간이 더 많은 것 같아',
    summary: '학교 끝나고 학원, 학원 끝나면 또 다른 학원. 뺑뺑이 도는 일상에 지쳐간다. 학원 가기 싫은 날, 몰래 빠져나와 PC방에 갔다.',
    content:
      '오늘도 학교가 끝나자마자 학원 버스에 몸을 실었다. 영어, 수학, 논술... 쉴 틈 없이 이어지는 수업에 머리가 핑 돈다. 창밖을 보니 친구들은 운동장에서 축구를 하고 있었다. 나는 지금 여기서 뭘 하고 있는 걸까.\n\n결국 오늘은 용기를 내봤다. 수학 학원 가는 길에 몰래 빠져나와 PC방으로 향했다. 1시간의 자유는 달콤했지만, 엄마에게 걸려온 전화를 받는 순간 심장이 철렁 내려앉았다. 학원 이야기만 나오면 답답한 이 마음, 언제쯤이면 괜찮아질까?',
    slug: 'i-spend-more-time-at-academy-than-home',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['학원 이야기', '부모님 몰래', '게임'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '별빛소녀',
    title: '부모님 몰래 야식 먹는 나만의 꿀팁',
    summary: '밤늦게 배고플 때 부모님 안 깨우고 조용히 야식 먹는 방법 공유해요. 소리 안 나게 라면 끓이는 법도 있어요 ㅋㅋ',
    content: '요즘 밤에 공부하다 보면 배가 엄청 고파지더라고. 그래서 나만의 조용한 야식 타임을 개발했어 ㅋㅋ 먼저 냉장고 문은 천천히 열어야 해. 그 소리가 생각보다 크거든. 그리고 라면 먹고 싶을 땐 물 끓일 때 뚜껑 살짝만 열어놓으면 소리가 덜 나. 봉지 뜯을 때도 가위로 조심조심 자르고. 제일 중요한 건 설거지까지 완벽하게 해놔야 한다는 거! 아침에 흔적 남으면 바로 들키거든 ㅠㅠ 요즘은 전자레인지로 컵라면 해먹는데 이게 제일 조용한 것 같아. 너희도 야식 먹을 때 들킨 적 있어?',
    slug: 'secretly-eating-late-night-snacks',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['부모님 몰래'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '민트초코',
    title: '부모님 몰래 친구 선물 준비한 썰',
    summary: '단짝 생일인데 용돈이 부족해서 부모님 몰래 알바비 모아서 선물 준비했어요. 성공했고 친구가 엄청 좋아했어요!',
    content: '내 베프 생일이 다음 주인데 갖고 싶어 하던 게 좀 비싸더라고. 그래서 부모님 몰래 동네 편의점에서 주말 알바를 시작했어. 물론 부모님한테는 도서관 간다고 했지 ㅋㅋ 한 달 동안 열심히 모아서 드디어 선물을 샀는데 친구가 진짜 좋아하더라. 눈물까지 글썽이면서 고맙다고 하는데 나까지 울 뻔했잖아 ㅠㅠ 나중에 부모님한테 들켰는데 의외로 칭찬해주셔서 다행이었어. 친구를 위해 노력한 게 뿌듯하더라. 너희는 친구 선물 뭐 준비해?',
    slug: 'secretly-preparing-friend-gift',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['부모님 몰래'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '하늘이',
    title: '몰래 키우던 식물이 들통났어',
    summary: '방에서 다육이 몰래 키웠는데 어제 엄마한테 들켰어요. 그런데 오히려 더 예쁜 화분 사주셔서 기분 좋아요 ㅎㅎ',
    content: '원래 우리 집은 반려식물도 엄마가 관리하시는데 내가 직접 키워보고 싶어서 작은 다육이를 몰래 샀어. 책상 뒤에 숨겨놓고 매일 물 주고 햇빛 쬐어주면서 키웠는데 한 달 만에 들켰어 ㅋㅋ 혼날 줄 알았는데 엄마가 "이렇게 책임감 있게 키울 줄 몰랐네" 하시면서 더 예쁜 화분을 사주셨어. 이제는 당당하게 창가에 놓고 키우고 있어. 작은 잎이 하나 더 나왔는데 너무 신기하고 뿌듯해. 식물 키우는 거 생각보다 재밌더라. 너희도 뭐 키워본 적 있어?',
    slug: 'secretly-growing-plants',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['부모님 몰래'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '맛있는하루',
    title: '우리 학교 급식 찐 맛집 메뉴 순위',
    summary: '3년 동안 먹어본 급식 중에서 진짜 맛있는 메뉴 베스트5 정리해봤어요. 떡볶이가 1등인 이유도 알려드려요!',
    content: '급식 3년 차로서 찐 후기 남긴다. 5위는 짜장면인데 면이 쫄깃해서 좋아. 4위는 돈가스. 바삭하게 튀겨져 나와. 3위는 치킨마요덮밥! 이건 나오는 날 줄이 길어져 ㅋㅋ 2위는 카레라이스. 우리 학교 카레는 진짜 맛있어. 그리고 1위는 단연 떡볶이!! 매콤달콤한 게 딱 내 스타일이야. 떡도 엄청 쫄깃하고 어묵도 많이 들어있어. 떡볶이 나오는 날은 친구들이랑 일찍 식당 가서 대기해 ㅋㅋ 가끔 별로인 메뉴도 있지만 전체적으로 우리 학교 급식은 맛있는 편이야. 너희 학교는 어떤 메뉴가 제일 맛있어?',
    slug: 'school-lunch-ranking',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['급식 메뉴'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '음식탐험가',
    title: '급식에 이런 게 나왔다고?! 신기한 메뉴',
    summary: '지난주에 나온 퓨전 메뉴들이 진짜 신기했어요. 김치파스타랑 불고기피자 같은 거 처음 먹어봤는데 의외로 괜찮더라고요.',
    content: '우리 학교 영양사 선생님이 새로 오셨는데 요즘 메뉴가 진짜 독특해. 지난주엔 김치파스타가 나왔어. 처음엔 \'이게 뭐야?\' 했는데 먹어보니까 김치랑 크림소스가 은근 잘 어울리더라 ㅋㅋ 친구들 반응도 반반이었어. 좋아하는 애들도 있고 별로라는 애들도 있고. 어제는 불고기피자가 나왔는데 이건 대박이었어! 불고기 양념이 치즈랑 만나니까 완전 맛있더라. 다음 달에는 또 어떤 신기한 메뉴가 나올지 기대돼. 새로운 거 시도하는 거 좋은 것 같아. 너희 학교도 특이한 급식 메뉴 나와?',
    slug: 'unique-school-lunch-menu',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['급식 메뉴'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '점심러버',
    title: '급식 먹을 때 나만의 조합법',
    summary: '급식을 더 맛있게 먹는 나만의 꿀조합 소개합니다. 밥이랑 반찬 섞어 먹는 것부터 소스 활용법까지!',
    content: '급식 먹을 때 내가 항상 하는 조합이 있어. 비빔밥 나오면 계란 프라이 올려서 비비면 완전 꿀맛이야. 그리고 고추장이랑 참기름 좀 더 넣으면 더 맛있어. 김치찌개 나오는 날엔 밥 말아먹는데 김도 구워서 같이 먹으면 좋아. 돈가스 나올 땐 소스를 반은 돈가스에, 반은 밥에 뿌려서 먹어. 친구들이 내가 급식 맛있게 먹는다고 신기해해 ㅋㅋ 사실 조합만 잘하면 더 맛있게 먹을 수 있거든. 후식으로 나오는 요구르트는 꼭 얼려서 먹는데 이게 진짜 아이스크림 같아. 너희는 어떤 조합으로 먹어?',
    slug: 'school-lunch-combinations',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['급식 메뉴'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '우정지킴이',
    title: '친구랑 싸웠다가 화해한 이야기',
    summary: '베프랑 오해로 싸웠는데 진솔하게 대화하니까 금방 풀렸어요. 오히려 더 친해진 것 같아요.',
    content: '지난주에 베프랑 싸웠어. 내가 다른 친구랑 놀았다고 삐진 거야. 며칠 동안 서로 말도 안 하고 어색했는데 진짜 답답하더라. 그래서 먼저 연락해서 솔직하게 이야기했어. "너랑 놀기 싫어서 그런 게 아니라 그냥 그날 먼저 약속이 있었던 거야"라고. 친구도 자기가 너무 예민했다고 미안하다고 하더라. 우리 둘 다 서로 소중하게 생각한다는 걸 확인하고 나니까 기분이 너무 좋았어. 이제는 오해 생기면 바로바로 얘기하기로 했어. 친구 관계에서 소통이 제일 중요한 것 같아. 너희는 친구랑 싸우면 어떻게 풀어?',
    slug: 'making-up-with-friend',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['친구 관계'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '소통왕',
    title: '새 학기에 친구 사귀는 나만의 방법',
    summary: '전학 와서 친구 없을 때 정말 힘들었는데 이 방법들로 지금은 좋은 친구들 많이 생겼어요!',
    content: '작년에 전학 왔을 때 진짜 막막했어. 아무도 모르는 교실에 혼자 앉아있으니까 외롭더라. 그래서 용기 내서 먼저 말 걸기 시작했어. "같이 밥 먹을래?" 한마디가 시작이었어. 처음엔 떨렸지만 생각보다 다들 친절하게 받아줬어. 그리고 동아리도 가입했는데 거기서 취미가 같은 친구들 만났어. 공통 관심사가 있으니까 대화하기 훨씬 쉽더라. 쉬는 시간에도 혼자 있지 말고 누구한테든 말 걸어보는 게 중요한 것 같아. 지금은 점심 먹을 친구도 많고 주말에 만날 친구도 생겼어. 용기만 있으면 친구는 금방 사귈 수 있어!',
    slug: 'making-new-friends',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['친구 관계'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '행복바이러스',
    title: '우리 단짝들 특징 정리해봄 ㅋㅋ',
    summary: '제일 친한 친구 3명의 특징을 재밌게 정리해봤어요. 다 다른 성격이지만 그래서 더 잘 맞는 것 같아요.',
    content: '우리 단짝 3명 특징 소개할게 ㅋㅋ 첫째는 수진이. 완전 계획형 인간이야. 시험 한 달 전부터 플래너 쓰고 공부 스케줄 짜는 타입. 우리 숙제 언제까지인지 항상 알려줘서 고마워 ㅋㅋ 둘째는 민지. 얘는 분위기 메이커야. 심심할 틈이 없어. 항상 재밌는 얘기로 우리 웃겨줘. 셋째는 나! 친구들 말로는 내가 중간 역할을 잘한대. 수진이 너무 빡빡할 때 좀 풀어주고 민지가 너무 산만하면 정리해주는 역할? 우리 셋이 모이면 정말 완벽한 조합이야. 성격은 다 다르지만 그래서 더 잘 맞는 것 같아. 너희 친구들은 어때?',
    slug: 'my-best-friends-characteristics',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['친구 관계'],
    likeCount: Math.floor(Math.random() * 100),
  },
];

export async function seedArticles(db: Firestore) {
  const articlesCollection = collection(db, 'articles');

  // Check if there's any data already
  const snapshot = await getDocs(articlesCollection);
  if (!snapshot.empty) {
    // console.log('Database already seeded.');
    return; // Don't seed if data exists
  }

  // console.log('Seeding database with initial articles...');

  const batch = writeBatch(db);

  for (const article of articlesToSeed) {
    const docRef = doc(collection(db, 'articles'));
    batch.set(docRef, {
      ...article,
      createdAt: randomDateInPastSevenDays(),
    });
  }

  await batch.commit();

  // console.log('Database seeded successfully!');
}
