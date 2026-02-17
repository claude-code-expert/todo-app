'use client';

import { useState } from 'react';
import { Button } from '@/client/components/ui/Button';
import { PriorityBadge, DueDateBadge } from '@/client/components/ui/Badge';
import { Modal } from '@/client/components/ui/Modal';
import { ConfirmDialog } from '@/client/components/ui/ConfirmDialog';

export default function PreviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
        <p style={{ color: '#94a3b8' }}>구현 후 이곳에 TicketCard, ColumnHeader, Column, Board가 표시됩니다.</p>
      </section>

      {/* Phase 3: Ticket 컴포넌트 */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          Phase 3: Ticket 컴포넌트
        </h2>
        <p style={{ color: '#94a3b8' }}>구현 후 이곳에 TicketDetailView, TicketForm, TicketModal이 표시됩니다.</p>
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
