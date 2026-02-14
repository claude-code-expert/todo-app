import { ticketService } from '@/server/services';
import { BoardContainer } from '@/client/components/board/BoardContainer';

export default async function HomePage() {
  const initialData = await ticketService.getBoard();

  return (
    <main>
      <BoardContainer initialData={initialData} />
    </main>
  );
}
