/**
 * @jest-environment node
 *
 * TC-API-001: POST /api/tickets — 티켓 생성
 * TDD Red 단계: 테스트만 작성, 구현 없음
 */

import { POST } from '@/app/api/tickets/route';
import { NextRequest } from 'next/server';

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

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
        dueDate: futureDate(7),
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
        dueDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
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

    it('빈 제목이면 400 에러를 반환한다', async () => {
      // Given
      const request = createRequest({
        title: '',
      });

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

    it('공백만 있는 제목이면 400 에러를 반환한다', async () => {
      // Given
      const request = createRequest({
        title: '   ',
      });

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

    it('설명이 1000자를 초과하면 400 에러를 반환한다', async () => {
      // Given
      const request = createRequest({
        title: '테스트',
        description: 'a'.repeat(1001),
      });

      // When
      const response = await POST(request);
      const data = await response.json();

      // Then
      expect(response.status).toBe(400);
      expect(data.error).toEqual({
        code: 'VALIDATION_ERROR',
        message: '설명은 1000자 이내로 입력해주세요',
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

  describe('비즈니스 로직', () => {
    it('연속으로 생성된 티켓은 나중 티켓의 position이 더 작다', async () => {
      // Given: 첫 번째 티켓 생성
      const request1 = createRequest({ title: '첫 번째 티켓' });
      const response1 = await POST(request1);
      const ticket1 = await response1.json();

      // When: 두 번째 티켓 생성
      const request2 = createRequest({ title: '두 번째 티켓' });
      const response2 = await POST(request2);
      const ticket2 = await response2.json();

      // Then: 나중 생성된 티켓의 position이 더 작음 (맨 위에 배치)
      expect(response2.status).toBe(201);
      expect(ticket2.position).toBeLessThan(ticket1.position);
    });

    it('생성된 티켓의 startedAt과 completedAt은 null이다', async () => {
      // Given
      const request = createRequest({
        title: '테스트 티켓',
      });

      // When
      const response = await POST(request);
      const data = await response.json();

      // Then
      expect(response.status).toBe(201);
      expect(data.startedAt).toBeNull();
      expect(data.completedAt).toBeNull();
    });
  });
});
