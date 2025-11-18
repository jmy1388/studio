
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
  // --- 학업 관련 글 5개 ---
  {
    authorUsername: '공부벌레',
    title: '시험 기간, 정말 잠 줄이는 게 맞을까?',
    summary: '시험 기간만 되면 밤을 새우는 친구들이 많다. 하지만 잠을 줄이는 게 정말 성적에 도움이 되는 걸까? 나의 솔직한 경험을 이야기해본다.',
    content:
      '중간고사가 코앞으로 다가왔다. 친구들은 하나둘씩 "어제 3시간밖에 못 잤다"며 피곤함을 자랑처럼 늘어놓는다. 나도 불안한 마음에 새벽까지 책상에 앉아 있었지만, 막상 다음 날 학교에서는 꾸벅꾸벅 졸기만 했다. \n\n결국 중요한 건 공부의 양이 아니라 질이라는 걸 깨달았다. 충분히 자고 맑은 정신으로 수업에 집중하는 것이, 몽롱한 상태로 밤을 새우는 것보다 훨씬 효율적이었다. 사람마다 맞는 방법은 다르겠지만, 무작정 잠을 줄이기 전에 자신의 몸 상태부터 확인해보는 게 중요한 것 같다.',
    slug: 'is-less-sleep-right-for-exams',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['학업', '시험', '건강'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '수포자탈출기',
    title: '수학, 대체 어디서부터 잘못된 걸까',
    summary: '초등학교 때는 나름 수학을 잘했는데, 어느 순간부터 수포자가 되어버렸다. 수학과 다시 친해지기 위한 나의 눈물겨운 노력기다.',
    content:
      '분명 나도 수학경시대회에서 상을 받던 시절이 있었다. 그런데 중학교에 올라오고, 고등학교에 와서는 문제조차 이해하기 어려워졌다. 공식은 외계어 같고, 친구들은 너무 쉽게 푸는 것 같아 자존심도 상했다.\n\n다시 시작하기 위해 초등학교 수학책부터 다시 펴봤다. 처음엔 창피했지만, 내가 어디서부터 놓쳤는지 알게 되었다. 작은 성공이 쌓이니 조금씩 자신감이 붙었다. 아직 갈 길은 멀지만, 이제는 수학 문제를 봐도 도망치고 싶다는 생각은 들지 않는다.',
    slug: 'where-did-i-go-wrong-with-math',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['학업', '수학', '극복'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '암기왕',
    title: '효율적인 암기법, 나만 알고 싶지만 특별히 공유한다',
    summary: '벼락치기는 이제 그만! 꾸준히, 그리고 똑똑하게 암기하는 나만의 비법을 공개한다. 나와 같은 암기 과목 약자를 위해 준비했다.',
    content:
      '사회, 역사, 영어 단어... 외울 건 산더미인데 머리는 따라주지 않았다. 깜지를 써봐도, 소리 내어 읽어봐도 다음 날이면 머릿속이 하얘졌다.\n\n그러다 찾은 방법이 바로 ‘이야기 만들기’다. 예를 들어, 역사적 사건의 순서를 외울 때 각 사건의 앞 글자를 따서 웃긴 이야기를 만드는 것이다. 유치해 보여도 효과는 엄청났다. 덕분에 암기 과목에 대한 스트레스가 많이 줄었다. 나만의 암기법을 찾는 여정, 생각보다 재미있다.',
    slug: 'my-secret-memorization-technique',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['학업', '공부법', '암기'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '딴짓대마왕',
    title: '책상 앞에만 앉으면 왜 이렇게 딴짓이 하고 싶을까?',
    summary: '공부하려고 마음먹고 책상에 앉는 순간, 갑자기 시작되는 방 청소와 스마트폰. 집중력을 되찾기 위한 나의 분투를 기록한다.',
    content:
      '분명히 오늘은 10시간 공부를 목표로 했다. 하지만 책상에 앉자마자 눈에 들어온 먼지, 갑자기 궁금해진 연예인 소식, 친구의 SNS까지. 정신을 차려보니 2시간이 훌쩍 지나 있었다.\n\n이 문제를 해결하기 위해 ‘뽀모도로 기법’을 써보기로 했다. 25분 집중하고 5분 쉬는 것을 반복하는 방법이다. 처음에는 25분도 길게 느껴졌지만, 점점 집중하는 시간이 늘어나는 게 느껴졌다. 완벽하지는 않아도, 딴짓하는 나 자신과 타협하는 법을 배우고 있다.',
    slug: 'why-do-i-get-distracted-at-my-desk',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['학업', '집중력', '습관'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '프로계획러',
    title: 'J와 P 사이, 완벽한 공부 계획이란 뭘까',
    summary: 'MBTI가 J라서 계획은 열심히 세우지만, 정작 지키지는 못하는 나. 실천 가능한 공부 계획을 세우기 위한 고민의 흔적이다.',
    content:
      '새 학기가 되면 가장 먼저 하는 일은 스터디 플래너를 사는 것이다. 시간대별로 과목을 나누고, 형형색색의 펜으로 꾸미다 보면 벌써 공부를 다 한 것 같은 기분이 든다. 하지만 계획은 첫날부터 틀어지기 일쑤다.\n\n너무 빡빡한 계획이 문제라는 걸 알게 되었다. 그래서 요즘은 ‘오늘 꼭 해야 할 3가지’만 정하는 방식으로 바꿨다. 거창한 계획보다 작은 성공을 매일 경험하는 것이 나를 더 움직이게 만드는 원동력이었다. 나에게 맞는 계획법을 찾는 것, 그것도 공부의 일부다.',
    slug: 'what-is-the-perfect-study-plan',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['학업', '계획', 'MBTI'],
    likeCount: Math.floor(Math.random() * 100),
  },
  // --- 진로 관련 글 3개 ---
  {
    authorUsername: '꿈찾는중',
    title: '하고 싶은 게 없는데, 저 비정상인가요?',
    summary: '다들 꿈이 있는 것 같은데 나만 없는 것 같아 불안하다. 하고 싶은 일을 찾기 위해 무엇부터 시작해야 할지 막막한 나의 이야기다.',
    content:
      '어른들은 항상 "꿈이 뭐니?"라고 묻는다. 친구들은 의사, 개발자, 아이돌 등 확실한 목표가 있는 것 같은데, 나는 정말 아무 생각이 없다. 하고 싶은 것도, 되고 싶은 것도 없는 내가 한심하게 느껴진다.\n\n최근에는 다양한 분야의 책을 읽고, 온라인 클래스를 들어보고 있다. 직접 경험해보지 않으면 내가 뭘 좋아하고 잘하는지 알 수 없다는 생각이 들었기 때문이다. 꿈이 없다고 조급해하기보다, 세상을 넓게 보는 연습을 하는 중이다. 언젠가 나의 길을 찾을 수 있을 거라 믿는다.',
    slug: 'is-it-abnormal-to-have-no-dream',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['진로', '꿈', '고민'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '문과생존기',
    title: '문과를 선택했는데, 먹고 살 수 있을까요?',
    summary: '‘문송합니다’라는 말이 유행하는 시대. 문과를 선택한 것을 후회하지 않기 위해, 나만의 길을 개척하려는 한 문과생의 고민이다.',
    content:
      '글쓰기와 역사를 좋아해서 문과를 선택했다. 하지만 주변에서는 "취업하기 힘들다", "결국 공무원 시험 볼 거 아니냐"는 말을 너무 많이 한다. 가끔은 이과를 선택한 친구들이 부럽기도 하다.\n\n하지만 나는 내가 좋아하는 분야에서 나만의 강점을 만들기로 했다. 단순히 국어, 영어를 잘하는 것을 넘어, 데이터 분석 툴을 배우거나, 마케팅 관련 공모전에 참여하는 등 문과 지식과 다른 기술을 융합하려는 시도를 하고 있다. 문과라서 안 되는 게 아니라, 문과라서 더 잘할 수 있는 일을 찾으면 된다고 생각한다.',
    slug: 'can-i-survive-as-a-liberal-arts-student',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['진로', '문과', '취업'],
    likeCount: Math.floor(Math.random() * 100),
  },
  {
    authorUsername: '대학보다경험',
    title: '좋은 대학 가는 것만이 정답일까?',
    summary: '모두가 좋은 대학을 목표로 달릴 때, 나는 잠시 멈춰서 다른 길은 없는지 둘러보기로 했다. 대학이 인생의 전부는 아니라고 믿는 나의 생각이다.',
    content:
      '우리 사회는 좋은 대학에 가는 것을 성공의 유일한 척도처럼 이야기한다. 나도 그 길을 따라 열심히 공부했지만, 마음 한편에는 항상 의문이 있었다. 이게 정말 내가 원하는 삶일까?\n\n최근에는 대학 진학 대신, 1년 동안 세계 여행을 하거나, 직접 창업을 하는 사람들의 이야기를 많이 찾아봤다. 물론 두려운 마음도 크다. 하지만 남들이 정해놓은 길을 따라가는 것만이 정답은 아니라는 확신이 들었다. 나만의 속도로, 나만의 길을 만들어가는 것. 그것이 진정한 성공일지도 모른다.',
    slug: 'is-a-good-university-the-only-answer',
    imageId: `article-${Math.ceil(Math.random() * 7)}`,
    tags: ['진로', '대학', '인생'],
    likeCount: Math.floor(Math.random() * 100),
  },
];

export async function seedArticles(db: Firestore) {
  const articlesCollection = collection(db, 'articles');

  // Check if there's any data already
  const snapshot = await getDocs(articlesCollection);
  if (!snapshot.empty) {
    console.log('Database already seeded.');
    return; // Don't seed if data exists
  }

  console.log('Seeding database with initial articles...');

  const batch = writeBatch(db);

  for (const article of articlesToSeed) {
    const docRef = doc(collection(db, 'articles'));
    batch.set(docRef, {
      ...article,
      createdAt: randomDateInPastSevenDays(),
    });
  }

  await batch.commit();

  console.log('Database seeded successfully!');
}
