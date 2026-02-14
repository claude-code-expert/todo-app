'use client';

import { useState } from 'react';
import type { Ticket, CreateTicketInput, UpdateTicketInput } from '@/shared/types';
import { createTicketSchema } from '@/shared/validations/ticket';
import { Button } from '@/client/components/ui/Button';

interface TicketFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Ticket>;
  onSubmit: (data: CreateTicketInput | UpdateTicketInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function TicketForm({ mode, initialData, onSubmit, onCancel, isLoading }: TicketFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [priority, setPriority] = useState(initialData?.priority ?? 'MEDIUM');
  const [plannedStartDate, setPlannedStartDate] = useState(initialData?.plannedStartDate ?? '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateTicketInput = {
      title,
      ...(description && { description }),
      priority,
      ...(plannedStartDate && { plannedStartDate }),
      ...(dueDate && { dueDate }),
    };

    const result = createTicketSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-field">
          <label className="form-label" htmlFor="title">제목</label>
          <input
            id="title"
            className="form-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="description">설명</label>
          <textarea
            id="description"
            className="form-input form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="priority">우선순위</label>
          <select
            id="priority"
            className="form-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="plannedStartDate">시작예정일</label>
          <input
            id="plannedStartDate"
            className="form-input"
            type="date"
            value={plannedStartDate}
            onChange={(e) => setPlannedStartDate(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="dueDate">종료예정일</label>
          <input
            id="dueDate"
            className="form-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
        </div>
      </div>

      <div className="modal-footer">
        <Button variant="secondary" onClick={onCancel}>취소</Button>
        <Button isLoading={isLoading}>
          {mode === 'create' ? '생성' : '저장'}
        </Button>
      </div>
    </form>
  );
}
