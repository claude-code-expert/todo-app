import { config } from 'dotenv';
config({ path: '.env.local' });

async function seed() {
  // dotenv 실행 후 동적 import (ESM import 호이스팅 방지)
  const { db } = await import('./index');
  const { tickets } = await import('./schema');

  await db.delete(tickets);

  await db.insert(tickets).values([
    { title: '프로젝트 요구사항 정리', status: 'DONE', priority: 'HIGH', position: 0, completedAt: new Date() },
    { title: 'API 설계 문서 작성', status: 'IN_PROGRESS', priority: 'HIGH', position: 1024 },
    { title: '로그인 페이지 구현', status: 'TODO', priority: 'MEDIUM', position: 0, startedAt: new Date() },
    { title: '알림 기능 조사', status: 'BACKLOG', priority: 'LOW', position: 0 },
  ]);

  console.log('시드 데이터 삽입 완료');
  process.exit(0);
}

seed();
