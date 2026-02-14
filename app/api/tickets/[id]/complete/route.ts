import { NextRequest, NextResponse } from 'next/server';
import { ticketService } from '@/server/services';
import { TicketNotFoundError } from '@/shared/errors';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const ticketId = Number(id);

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 티켓 ID입니다' } },
        { status: 400 }
      );
    }

    const ticket = await ticketService.complete(ticketId);
    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof TicketNotFoundError) {
      return NextResponse.json(
        { error: { code: 'TICKET_NOT_FOUND', message: error.message } },
        { status: 404 }
      );
    }

    console.error('Unexpected error in PATCH /api/tickets/:id/complete:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
