const fastify = require("fastify")();
//Importação das variaveis de ambiente
require("dotenv").config();

fastify.register(require("@fastify/cors"), {
  origin: true,
});

// Efetua a conexão no DB via Postgress
const url_postgress = process.env.POSTGRES_URL + "?sslmode=require";
fastify.register(require("@fastify/postgres"), {
  connectionString: url_postgress,
});

// Rotas
fastify.get("/", function (request, reply) {
  reply.send(`Olá`);
});

// Get accounts
fastify.get("/accounts", async function (request, reply) {
  try {
    const result = await fastify.pg.query("SELECT * FROM accounts");
    reply.send(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    reply.status(500).send({
      error: "Internal Server Error",
      message: error.message, // Adicionando a mensagem de erro para maior detalhamento
    });
  }
});

fastify.get("/users", async function (request, reply) {
  try {
    const result = await fastify.pg.query("SELECT * FROM usuarios");
    reply.send(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    reply.status(500).send({
      error: "Internal Server Error",
      message: error.message, // Adicionando a mensagem de erro para maior detalhamento
    });
  }
});

fastify.get("/users/:id", async function (request, reply) {
  try {
    const userId = Number(request.params.id);
    const result = await fastify.pg.query(
      "SELECT * FROM usuarios WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      reply.status(404).send("User not found");
    } else {
      reply.send(result.rows[0]);
    }
  } catch (error) {
    console.error("Error fetching user by id:", error);
    reply.status(500).send("Internal Server Error");
  }
});

fastify.post("/users", async function (request, reply) {
  try {
    const result = await fastify.pg.query(
      "INSERT INTO usuarios (name, price) VALUES ($1, $2)",
      [request.body.name, request.body.price]
    );
    reply.send(result);
  } catch (error) {
    console.error("Error creating user:", error);
    reply.status(500).send("Internal Server Error");
  }
});

fastify.put("/users/:id", async function (request, reply) {
  try {
    const result = await fastify.pg.query(
      "UPDATE usuarios SET name = $1, price = $2 WHERE id = $3",
      [request.body.name, request.body.price, Number(request.params.id)]
    );
    reply.send(result);
  } catch (error) {
    console.error("Error updating user:", error);
    reply.status(500).send("Internal Server Error");
  }
});

fastify.delete("/users/:id", async function (request, reply) {
  try {
    const result = await fastify.pg.query(
      "DELETE FROM usuarios WHERE id = $1",
      [Number(request.params.id)]
    );
    reply.send(result);
  } catch (error) {
    console.error("Error deleting user:", error);
    reply.status(500).send("Internal Server Error");
  }
});

fastify.listen({ port: 3000 }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log("Servidor rodando", address);
});
