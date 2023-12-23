const Fastify = require("fastify");
const neon = require("neon-js");
const pg = require("pg");
require("dotenv").config();

const fastify = Fastify({
  logger: false,
});

fastify.register(require("@fastify/cors"), {
  origin: true,
});

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString: connectionString,
});

fastify.decorate("pg", {
  query: async function (text, values) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, values);
      return result.rows;
    } finally {
      client.release();
    }
  },
});

fastify.get("/teste/:numero", function (request, reply) {
  reply.send(`${request.params.numero}`);
});

fastify.get("/products", async function (request, reply) {
  try {
    const result = await fastify.pg.query("SELECT * FROM produtos");
    reply.send(result);
  } catch (error) {
    reply.send(error);
  }
});

fastify.get("/products/:id", async function (request, reply) {
  try {
    const result = await fastify.pg.query(
      "SELECT * FROM produtos WHERE id = $1",
      [Number(request.params.id)]
    );
    reply.send(result);
  } catch (error) {
    reply.send(error);
  }
});

fastify.post("/products", async function (request, reply) {
  try {
    const result = await fastify.pg.query(
      "INSERT INTO produtos (id, name, price) VALUES ($1, $2, $3)",
      [request.body.id, request.body.name, request.body.price]
    );
    reply.send(result);
  } catch (error) {
    reply.send(error);
  }
});

fastify.put("/products/:id", async function (request, reply) {
  try {
    const result = await fastify.pg.query(
      "UPDATE produtos SET name = $1, price = $2 WHERE id = $3",
      [request.body.name, request.body.price, Number(request.params.id)]
    );
    reply.send(result);
  } catch (error) {
    reply.send(error);
  }
});

fastify.delete("/products/:id", async function (request, reply) {
  try {
    const result = await fastify.pg.query(
      "DELETE FROM produtos WHERE id = $1",
      [Number(request.params.id)]
    );
    reply.send(result);
  } catch (error) {
    reply.send(error);
  }
});

fastify.listen({ port: 3000 }, function (error, address) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log("Servidor rodando", address);
});
