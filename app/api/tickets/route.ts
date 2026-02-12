import { NextRequest, NextResponse } from 'next/server';
import { createTicketSchema } from '@/shared/validations/ticket';
import * as ticketService from '@/server/services/ticketService';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validationResult = createTicketSchema.safeParse(body);

  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: firstError.message,
        },
      },
      { status: 400 }
    );
  }

  const ticket = await ticketService.create(validationResult.data);

  return NextResponse.json(ticket, { status: 201 });
}
