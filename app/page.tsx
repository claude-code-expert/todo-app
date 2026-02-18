import { ticketService } from '@/server/services';
import { BoardContainer } from '@/client/components/board/BoardContainer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const initialData = await ticketService.getBoard();

  return (
    <div className="board-layout">
      <BoardContainer initialData={initialData} />
    </div>
  );
}
