import { z } from 'zod';
import { TICKET_PRIORITY, TICKET_STATUS } from '@/shared/types';

export const createTicketSchema = z.object({
  title: z
    .string({ required_error: '제목을 입력해주세요' })
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이내로 입력해주세요')
    .refine((val) => val.trim().length > 0, '제목을 입력해주세요'),
  description: z
    .string()
    .max(1000, '설명은 1000자 이내로 입력해주세요')
    .optional(),
  priority: z
    .enum([TICKET_PRIORITY.LOW, TICKET_PRIORITY.MEDIUM, TICKET_PRIORITY.HIGH], {
      errorMap: () => ({ message: '우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요' }),
    })
    .optional(),
  plannedStartDate: z.string().optional(),
  dueDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const today = new Date().toISOString().split('T')[0];
        return val >= today;
      },
      '종료예정일은 오늘 이후 날짜를 선택해주세요'
    ),
});

export type CreateTicketSchema = z.infer<typeof createTicketSchema>;

export const updateTicketSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이내로 입력해주세요')
    .refine((val) => val.trim().length > 0, '제목을 입력해주세요')
    .optional(),
  description: z
    .string()
    .max(1000, '설명은 1000자 이내로 입력해주세요')
    .nullable()
    .optional(),
  priority: z
    .enum([TICKET_PRIORITY.LOW, TICKET_PRIORITY.MEDIUM, TICKET_PRIORITY.HIGH], {
      errorMap: () => ({ message: '우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요' }),
    })
    .optional(),
  plannedStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (val) => !val || val >= new Date().toISOString().split('T')[0],
      '종료예정일은 오늘 이후 날짜를 선택해주세요'
    )
    .nullable()
    .optional(),
});

export type UpdateTicketSchema = z.infer<typeof updateTicketSchema>;

export const reorderTicketSchema = z.object({
  ticketId: z.number().int().positive(),
  status: z.enum([TICKET_STATUS.BACKLOG, TICKET_STATUS.TODO, TICKET_STATUS.IN_PROGRESS], {
    errorMap: () => ({ message: '상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요' }),
  }),
  position: z.number().int(),
});

export type ReorderTicketSchema = z.infer<typeof reorderTicketSchema>;
