// Importa os módulos necessários
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
    user: 'postgresaula',
    host: 'postgres-aula.cuebxlhckhcy.us-east-1.rds.amazonaws.com',
    database: 'postgresaula',
    password: 'PostgresAula123!',
    port: 5432,
    ssl: { rejectUnauthorized: false }, // Configuração de SSL, se necessário
});

// Configuração do servidor Express
const app = express();
app.use(cors()); // Habilita CORS para permitir requisições de outros domínios
app.use(express.urlencoded({ extended: true })); // Para processar dados de formulários
app.use(express.json()); // Para processar dados JSON

// Função para inserir dados na tabela "pacientes_lucas"
async function inserirPacientes({ nome, email, telefone }) {
    const query = `
        INSERT INTO pacientes_lucas (nome_completo, email, telefone)
        VALUES ($1, $2, $3)
        RETURNING id;
    `;
    const values = [nome, email, telefone];

    const result = await pool.query(query, values);
    return result.rows[0].id; // Retorna o ID do paciente inserido
}


// Função para inserir dados na tabela "consulta_lucas"
async function inserirConsulta({ pacienteId, data, hora, motivo }) {
    const query = `
        INSERT INTO consulta_lucas (paciente_id, data_consulta, hora_consulta, motivo_consulta)
        VALUES ($1, $2, $3, $4);
    `;
    const values = [pacienteId, data, hora, motivo];

    await pool.query(query, values);
}

// Rota para receber dados do formulário e inserir no banco
app.post('/submit', async (req, res) => {
    console.log('Dados recebidos:', req.body); // Log dos dados recebidos

    try {
        const { nome, email, telefone, data, hora, motivo } = req.body;

        // Inserir os dados do paciente
        const pacienteId = await inserirPacientes({ nome, email, telefone });

        // Inserir os dados da consulta
        await inserirConsulta({ pacienteId, data, hora, motivo });

        res.status(200).send('Dados inseridos com sucesso!');
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        res.status(500).send('Erro ao inserir dados: ' + error.message);
    }
});

// Rota para testar o servidor
app.get('/', (req, res) => {
    res.send('Servidor funcionando222!');
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
