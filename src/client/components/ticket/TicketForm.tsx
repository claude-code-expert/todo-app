'use client';

import { useState } from 'react';
import { Button } from '@/client/components/ui/Button';
import { createTicketSchema, updateTicketSchema } from '@/shared/validations/ticket';
import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketPriority } from '@/shared/types';

interface TicketFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Ticket>;
  onSubmit: (data: CreateTicketInput | UpdateTicketInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TicketForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: TicketFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [priority, setPriority] = useState(initialData?.priority ?? 'MEDIUM');
  const [plannedStartDate, setPlannedStartDate] = useState(initialData?.plannedStartDate ?? '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = mode === 'create'
      ? {
          title,
          description: description || undefined,
          priority,
          plannedStartDate: plannedStartDate || undefined,
          dueDate: dueDate || undefined,
        }
      : {
          title,
          description: description || null,
          priority,
          plannedStartDate: plannedStartDate || null,
          dueDate: dueDate || null,
        };

    const schema = mode === 'create' ? createTicketSchema : updateTicketSchema;
    const result = schema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !fieldErrors[field]) {
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
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="priority">우선순위</label>
        <select
          id="priority"
          className="form-input"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority)}
        >
          <option value="LOW">낮음</option>
          <option value="MEDIUM">보통</option>
          <option value="HIGH">높음</option>
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

      <div className="ticket-form-actions">
        <Button type="submit" isLoading={isLoading}>
          {mode === 'create' ? '생성' : '저장'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          취소
        </Button>
      </div>
    </form>
  );
}
