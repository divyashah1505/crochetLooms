const { Client } = require('pg');

const liveUrl = 'postgresql://crochet_db_5tnm_user:M5p65NDUioQzh0AkaoXGzVfSgcB0CPor@dpg-dagfrt8u01pc73fmm4r0-a.oregon-postgres.render.com/crochet_db_5tnm?ssl=true';

async function fixLiveOrders() {
  const client = new Client({
    connectionString: liveUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Render live DB');

    // Find all pending orders
    const res = await client.query(`
      SELECT o.id, o.order_number, o."totalAmount",
             COALESCE(SUM(oi.price * oi.quantity), 0) as items_total
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.status = 'PENDING'
      GROUP BY o.id, o.order_number, o."totalAmount"
    `);

    console.log('Found pending orders:', res.rows);

    for (const row of res.rows) {
      const itemsTotal = Number(row.items_total);
      if (itemsTotal > 0 && itemsTotal !== Number(row.totalAmount)) {
        console.log(`Fixing order ${row.order_number}: changing totalAmount from ${row.totalAmount} to ${itemsTotal}`);
        await client.query('UPDATE orders SET "totalAmount" = $1 WHERE id = $2', [itemsTotal, row.id]);
        await client.query('UPDATE payments SET amount = $1 WHERE order_id = $2', [itemsTotal, row.id]);
      }
    }

    console.log('Finished updating pending orders.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixLiveOrders();
