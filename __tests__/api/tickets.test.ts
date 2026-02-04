/**
 * @jest-environment node
 *
 * TC-API-001: POST /api/tickets — 티켓 생성
 * TDD Red 단계: 테스트만 작성, 구현 없음
 */

import { POST } from '@/app/api/tickets/route';
import { NextRequest } from 'next/server';

function createRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/tickets', () => {
  describe('정상 생성', () => {
    it('모든 필드를 포함한 티켓을 생성한다', async () => {
      // Given
      const request = createRequest({
        title: 'API 설계 문서 작성',
        description: 'REST API 엔드포인트와 요청/응답 형식을 정의한다',
        priority: 'HIGH',
        plannedStartDate: '2026-02-10',
        dueDate: '2026-02-15',
      });

      // When
      const response = await POST(request);
      const data = await response.json();

      // Then
      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        title: 'API 설계 문서 작성',
        description: 'REST API 엔드포인트와 요청/응답 형식을 정의한다',
        status: 'BACKLOG',
        priority: 'HIGH',
        plannedStartDate: '2026-02-10',
        dueDate: '2026-02-15',
        startedAt: null,
        completedAt: null,
      });
      expect(data.id).toBeDefined();
      expect(data.position).toBeDefined();
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });

    it('제목만으로 티켓을 생성하면 기본값이 적용된다', async () => {
      // Given
      const request = createRequest({
        title: '테스트 할일',
      });

      // When
      const response = await POST(request);
      const data = await response.json();

      // Then
      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        title: '테스트 할일',
        description: null,
        status: 'BACKLOG',
        priority: 'MEDIUM',
        plannedStartDate: null,
        dueDate: null,
        startedAt: null,
        completedAt: null,
      });
    });
  });

  describe('검증 에러', () => {
    it('제목이 없으면 400 에러를 반환한다', async () => {
      // Given
      const request = createRequest({});

      // When
      const response = await POST(request);
      const data = await response.json();

      // Then
      expect(response.status).toBe(400);
      expect(data.error).toEqual({
        code: 'VALIDATION_ERROR',
        message: '제목을 입력해주세요',
      });
    });

    it('제목이 200자를 초과하면 400 에러를 반환한다', async () => {
      // Given
      const request = createRequest({
        title: 'a'.repeat(201),
      });

      // When
      const response = await POST(request);
      const data = await response.json();

      // Then
      expect(response.status).toBe(400);
      expect(data.error).toEqual({
        code: 'VALIDATION_ERROR',
        message: '제목은 200자 이내로 입력해주세요',
      });
    });

    it('과거 마감일이면 400 에러를 반환한다', async () => {
      // Given
      const request = createRequest({
        title: '테스트',
        dueDate: '2020-01-01',
      });

      // When
      const response = await POST(request);
      const data = await response.json();

      // Then
      expect(response.status).toBe(400);
      expect(data.error).toEqual({
        code: 'VALIDATION_ERROR',
        message: '종료예정일은 오늘 이후 날짜를 선택해주세요',
      });
    });

    it('잘못된 우선순위면 400 에러를 반환한다', async () => {
      // Given
      const request = createRequest({
        title: '테스트',
        priority: 'URGENT',
      });

      // When
      const response = await POST(request);
      const data = await response.json();

      // Then
      expect(response.status).toBe(400);
      expect(data.error).toEqual({
        code: 'VALIDATION_ERROR',
        message: '우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요',
      });
    });
  });
});
