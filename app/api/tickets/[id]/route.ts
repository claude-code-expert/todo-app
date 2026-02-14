import { NextRequest, NextResponse } from 'next/server';
import { updateTicketSchema } from '@/shared/validations/ticket';
import { ticketService } from '@/server/services';
import { TicketNotFoundError } from '@/shared/errors';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
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

    const ticket = await ticketService.getById(ticketId);
    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof TicketNotFoundError) {
      return NextResponse.json(
        { error: { code: 'TICKET_NOT_FOUND', message: error.message } },
        { status: 404 }
      );
    }

    console.error('Unexpected error in GET /api/tickets/:id:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
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

    const body = await request.json();
    const result = updateTicketSchema.safeParse(body);

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

    const ticket = await ticketService.update(ticketId, result.data);
    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof TicketNotFoundError) {
      return NextResponse.json(
        { error: { code: 'TICKET_NOT_FOUND', message: error.message } },
        { status: 404 }
      );
    }

    console.error('Unexpected error in PATCH /api/tickets/:id:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await ticketService.remove(ticketId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof TicketNotFoundError) {
      return NextResponse.json(
        { error: { code: 'TICKET_NOT_FOUND', message: error.message } },
        { status: 404 }
      );
    }

    console.error('Unexpected error in DELETE /api/tickets/:id:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
