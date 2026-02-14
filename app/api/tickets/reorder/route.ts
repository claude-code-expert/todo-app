import { NextRequest, NextResponse } from 'next/server';
import { reorderTicketSchema } from '@/shared/validations/ticket';
import { ticketService } from '@/server/services';
import { TicketNotFoundError } from '@/shared/errors';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = reorderTicketSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.errors[0].message,
          },
        },
        { status: 400 }
      );
    }

    const data = await ticketService.reorder(result.data);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof TicketNotFoundError) {
      return NextResponse.json(
        { error: { code: 'TICKET_NOT_FOUND', message: error.message } },
        { status: 404 }
      );
    }

    console.error('Unexpected error in PATCH /api/tickets/reorder:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
