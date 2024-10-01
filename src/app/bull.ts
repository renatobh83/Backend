import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import Queue from '../libs/Queue';


export default async function bullMQ(app: any) {
  console.info("bullMQ started");
  await Queue.process();

  await Queue.add("VerifyTicketsChatBotInactives", {});
  await Queue.add("SendMessageSchenduled", {});

  if (process.env.NODE_ENV !== "production") {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: Queue.queues.map((q: any) => new BullMQAdapter(q.bull)),
      serverAdapter: serverAdapter,
    });

    app.use('/admin/queues', serverAdapter.getRouter());
  }
}