import { NextRequest, NextResponse } from 'next/server';
import { createTicketSchema } from '@/shared/validations/ticket';
import { ticketService } from '@/server/services';

export async function GET() {
  try {
    const boardData = await ticketService.getBoard();
    return NextResponse.json(boardData);
  } catch (error) {
    console.error('Unexpected error in GET /api/tickets:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 내부 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate with Zod
    const result = createTicketSchema.safeParse(body);

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

    // 3. Create ticket via service
    const ticket = await ticketService.create(result.data);

    // 4. Return success response
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    // 5. Handle unexpected errors
    console.error('Unexpected error in POST /api/tickets:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 내부 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
