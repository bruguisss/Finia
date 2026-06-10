const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres un asistente de finanzas personales. Categoriza cada transacción bancaria.
Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown.
Formato exacto: [{"id": 0, "category": "...", "subcategory": "..."}]

Categorías disponibles:
- Alimentación (supermercados, restaurantes, comida a domicilio)
- Transporte (gasolina, transporte público, taxi, parking)
- Ocio (cine, conciertos, suscripciones, juegos)
- Salud (farmacia, médico, gimnasio)
- Hogar (alquiler, electricidad, agua, internet, equipamiento)
- Compras (ropa, electrónica, tiendas)
- Viajes (vuelos, hoteles, actividades turísticas)
- Servicios (seguros, banca, comisiones)
- Transferencias (envíos a personas, bizum)
- Ingresos (nómina, freelance, devoluciones)
- Sin categoría (si no encaja en ninguna)`;

async function categorizeTransactions(transactions) {
  if (!transactions || transactions.length === 0) return {};

  // Process in batches of 50
  const BATCH_SIZE = 50;
  const results = {};

  for (let batchStart = 0; batchStart < transactions.length; batchStart += BATCH_SIZE) {
    const batch = transactions.slice(batchStart, batchStart + BATCH_SIZE);

    const items = batch.map((t, i) => `${i}: "${t.description}" (${t.amount}€)`).join('\n');
    const userMessage = `Categoriza estas transacciones bancarias:\n${items}`;

    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      });

      const text = response.content[0]?.text || '[]';

      // Strip any markdown fences if present
      const jsonText = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonText);

      for (const item of parsed) {
        const globalIndex = batchStart + item.id;
        results[globalIndex] = {
          category: item.category || 'Sin categoría',
          subcategory: item.subcategory || null,
        };
      }
    } catch (err) {
      console.error(`AI categorization error for batch starting at ${batchStart}:`, err.message);
      // Fall back to "Sin categoría" for this batch
      for (let i = 0; i < batch.length; i++) {
        results[batchStart + i] = { category: 'Sin categoría', subcategory: null };
      }
    }
  }

  return results;
}

module.exports = { categorizeTransactions };
