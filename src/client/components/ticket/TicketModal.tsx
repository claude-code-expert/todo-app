'use client';

import { useState } from 'react';
import { Modal } from '@/client/components/ui/Modal';
import { ConfirmDialog } from '@/client/components/ui/ConfirmDialog';
import { Button } from '@/client/components/ui/Button';
import { TicketDetailView } from './TicketDetailView';
import { TicketForm } from './TicketForm';
import type { TicketWithMeta, CreateTicketInput, UpdateTicketInput } from '@/shared/types';

interface TicketModalProps {
  ticket: TicketWithMeta;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateTicketInput) => void;
  onDelete: (id: number) => void;
}

export function TicketModal({
  ticket,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: TicketModalProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSubmit = (data: CreateTicketInput | UpdateTicketInput) => {
    onUpdate(ticket.id, data as UpdateTicketInput);
  };

  const handleDelete = () => {
    setIsConfirmOpen(false);
    onDelete(ticket.id);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="modal-header">
          <h2>{ticket.title}</h2>
          <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
            삭제
          </Button>
        </div>
        <div className="modal-body">
          <TicketDetailView ticket={ticket} />
          <TicketForm
            mode="edit"
            initialData={ticket}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </Modal>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        message="정말 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
