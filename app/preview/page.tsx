'use client';

import { useState } from 'react';
import { Button } from '@/client/components/ui/Button';
import { PriorityBadge, DueDateBadge } from '@/client/components/ui/Badge';
import { Modal } from '@/client/components/ui/Modal';
import { ConfirmDialog } from '@/client/components/ui/ConfirmDialog';
import { Board } from '@/client/components/board/Board';
import { TicketForm } from '@/client/components/ticket/TicketForm';
import { TicketModal } from '@/client/components/ticket/TicketModal';
import type { BoardData, TicketWithMeta } from '@/shared/types';

const mockBoard: BoardData = {
  board: {
    BACKLOG: [
      { id: 1, title: '기술 스택 조사', description: '프레임워크 비교 분석', status: 'BACKLOG', priority: 'HIGH', position: -1024, plannedStartDate: null, dueDate: '2026-03-15', startedAt: null, completedAt: null, createdAt: new Date(), updatedAt: new Date(), isOverdue: false },
      { id: 2, title: '디자인 시스템 검토', description: null, status: 'BACKLOG', priority: 'MEDIUM', position: 0, plannedStartDate: null, dueDate: null, startedAt: null, completedAt: null, createdAt: new Date(), updatedAt: new Date(), isOverdue: false },
    ],
    TODO: [
      { id: 3, title: 'API 엔드포인트 설계', description: 'REST API 명세 작성', status: 'TODO', priority: 'HIGH', position: -2048, plannedStartDate: '2026-02-17', dueDate: '2026-02-14', startedAt: new Date(), completedAt: null, createdAt: new Date(), updatedAt: new Date(), isOverdue: true },
      { id: 4, title: '데이터베이스 스키마 설계', description: null, status: 'TODO', priority: 'MEDIUM', position: -1024, plannedStartDate: null, dueDate: '2026-03-01', startedAt: new Date(), completedAt: null, createdAt: new Date(), updatedAt: new Date(), isOverdue: false },
      { id: 5, title: '인증 시스템 구현', description: 'JWT 기반 인증', status: 'TODO', priority: 'LOW', position: 0, plannedStartDate: null, dueDate: '2026-03-10', startedAt: new Date(), completedAt: null, createdAt: new Date(), updatedAt: new Date(), isOverdue: false },
    ],
    IN_PROGRESS: [
      { id: 6, title: '프런트엔드 컴포넌트 개발', description: 'React 컴포넌트 TDD', status: 'IN_PROGRESS', priority: 'HIGH', position: 0, plannedStartDate: '2026-02-10', dueDate: '2026-02-28', startedAt: new Date(), completedAt: null, createdAt: new Date(), updatedAt: new Date(), isOverdue: false },
    ],
    DONE: [
      { id: 7, title: '프로젝트 초기 설정', description: 'Next.js + TypeScript 셋업', status: 'DONE', priority: 'MEDIUM', position: 0, plannedStartDate: null, dueDate: '2026-02-15', startedAt: new Date(), completedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), isOverdue: false },
    ],
  },
  total: 7,
};

export default function PreviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMeta | null>(null);

  return (
    <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        Tika 컴포넌트 프리뷰
      </h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>
        Phase별로 구현된 컴포넌트를 시각적으로 확인하는 갤러리입니다.
      </p>

      {/* Phase 1: UI 기본 컴포넌트 */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          Phase 1: UI 기본 컴포넌트
        </h2>

        {/* Button */}
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>Button</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button isLoading>로딩 중</Button>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>

        {/* Badge */}
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>Badge</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px' }}>
          <PriorityBadge priority="LOW" />
          <PriorityBadge priority="MEDIUM" />
          <PriorityBadge priority="HIGH" />
          <DueDateBadge dueDate="2026-03-01" isOverdue={false} />
          <DueDateBadge dueDate="2026-02-10" isOverdue={true} />
        </div>

        {/* Modal */}
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>Modal</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <Button onClick={() => setIsModalOpen(true)}>모달 열기</Button>
          <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>삭제 확인</Button>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="modal-header">
            <h2>모달 제목</h2>
          </div>
          <div className="modal-body">
            <p>모달 내용입니다. ESC 키 또는 바깥 클릭으로 닫을 수 있습니다.</p>
          </div>
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>닫기</Button>
          </div>
        </Modal>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          message="정말 삭제하시겠습니까?"
          onConfirm={() => { setIsConfirmOpen(false); }}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </section>

      {/* Phase 2: Board 컴포넌트 */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          Phase 2: Board 컴포넌트
        </h2>
        <div style={{ height: '500px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <Board
            board={mockBoard}
            onTicketClick={(ticket) => setSelectedTicket(ticket)}
          />
        </div>
      </section>

      {/* Phase 3: Ticket 컴포넌트 */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          Phase 3: Ticket 컴포넌트
        </h2>

        {/* TicketForm (생성 모드) */}
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>TicketForm (생성 모드)</h3>
        <div style={{ marginBottom: '24px' }}>
          <Button onClick={() => setIsCreateOpen(true)}>티켓 생성</Button>
        </div>
        <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
          <div className="modal-header">
            <h2>새 업무 생성</h2>
          </div>
          <div className="modal-body">
            <TicketForm
              mode="create"
              onSubmit={(data) => { alert(`생성: ${JSON.stringify(data, null, 2)}`); setIsCreateOpen(false); }}
              onCancel={() => setIsCreateOpen(false)}
            />
          </div>
        </Modal>

        {/* TicketModal (상세/수정/삭제) */}
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>TicketModal</h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
          위 Board에서 티켓 카드를 클릭하면 TicketModal이 열립니다.
        </p>
        {selectedTicket && (
          <TicketModal
            ticket={selectedTicket}
            isOpen={true}
            onClose={() => setSelectedTicket(null)}
            onUpdate={(id, data) => { alert(`수정 [${id}]: ${JSON.stringify(data, null, 2)}`); setSelectedTicket(null); }}
            onDelete={(id) => { alert(`삭제: ${id}`); setSelectedTicket(null); }}
          />
        )}
      </section>

      {/* Phase 4-5 */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          Phase 4-5: 데이터 레이어 + 컨테이너
        </h2>
        <p style={{ color: '#94a3b8' }}>Phase 5 완료 시 이 프리뷰 페이지는 제거되고, app/page.tsx가 실제 칸반 보드로 전환됩니다.</p>
      </section>
    </main>
  );
}
