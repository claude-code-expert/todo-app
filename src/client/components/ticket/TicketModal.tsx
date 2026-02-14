'use client';

import { useState } from 'react';
import type { TicketWithMeta, UpdateTicketInput } from '@/shared/types';
import { Modal } from '@/client/components/ui/Modal';
import { Button } from '@/client/components/ui/Button';
import { ConfirmDialog } from '@/client/components/ui/ConfirmDialog';
import { TicketDetailView } from './TicketDetailView';
import { TicketForm } from './TicketForm';

interface TicketModalProps {
  ticket: TicketWithMeta;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateTicketInput) => void;
  onDelete: (id: number) => void;
}

export function TicketModal({ ticket, isOpen, onClose, onUpdate, onDelete }: TicketModalProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdate = (data: UpdateTicketInput) => {
    onUpdate(ticket.id, data);
  };

  const handleDelete = () => {
    setShowConfirm(false);
    onDelete(ticket.id);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="modal-header">
          <h2>{ticket.title}</h2>
          <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>삭제</Button>
        </div>
        <TicketDetailView ticket={ticket} />
        <TicketForm
          mode="edit"
          initialData={ticket}
          onSubmit={handleUpdate}
          onCancel={onClose}
          isLoading={false}
        />
      </Modal>
      <ConfirmDialog
        isOpen={showConfirm}
        message="정말 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
