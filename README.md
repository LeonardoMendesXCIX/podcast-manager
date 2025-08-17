# Podcast Manager Backend

Backend API para gerenciamento de podcasts desenvolvido com Node.js, TypeScript, Express e Sequelize.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **TypeScript** - Superset de JavaScript com tipagem estática
- **Express** - Framework web para Node.js
- **Sequelize** - ORM para Node.js
- **SQLite** - Banco de dados (pode ser configurado para PostgreSQL)
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas
- **Multer** - Upload de arquivos

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd podcast-manager-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações do banco de dados:
```bash
npm run build
npm start
```

## 🚧 Desenvolvimento

Para rodar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📚 Documentação da API

### Autenticação

#### Registro de usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "password": "senha123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

### Podcasts

#### Criar podcast
```http
POST /api/podcasts
Authorization: Bearer [token]
Content-Type: application/json

{
  "title": "Título do Podcast",
  "description": "Descrição do podcast",
  "category": "Tecnologia"
}
```

#### Listar podcasts
```http
GET /api/podcasts
```

#### Obter podcast específico
```http
GET /api/podcasts/:id
```

#### Atualizar podcast
```http
PUT /api/podcasts/:id
Authorization: Bearer [token]
Content-Type: application/json

{
  "title": "Novo título",
  "description": "Nova descrição"
}
```

#### Deletar podcast
```http
DELETE /api/podcasts/:id
Authorization: Bearer [token]
```

### Episódios

#### Criar episódio
```http
POST /api/podcasts/:podcastId/episodes
Authorization: Bearer [token]
Content-Type: application/json

{
  "title": "Título do Episódio",
  "description": "Descrição do episódio",
  "duration": 3600,
  "audioUrl": "https://exemplo.com/audio.mp3"
}
```

#### Listar episódios de um podcast
```http
GET /api/podcasts/:podcastId/episodes
```

#### Publicar episódio
```http
PATCH /api/episodes/:id/publish
Authorization: Bearer [token]
```

## 🧪 Testes

Para executar os testes:

```bash
npm test
```

## 📁 Estrutura do Projeto

```
src/
├── controllers/     # Controladores das rotas
├── middlewares/     # Middlewares (autenticação, tratamento de erros)
├── models/         # Modelos do banco de dados
├── routes/         # Definição das rotas
├── utils/          # Funções utilitárias
└── app.ts          # Arquivo principal do servidor
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em modo de desenvolvimento
- `npm run build` - Compila o TypeScript para JavaScript
- `npm test` - Executa os testes
- `npm run lint` - Executa o linter
- `npm run lint:fix` - Executa o linter e corrige problemas automaticamente

## 🔐 Segurança

- Senhas são hasheadas com bcrypt
- Autenticação via JWT
- Validação de entrada de dados
- Proteção contra SQL injection via Sequelize ORM
- Headers de segurança com Helmet

## 🚀 Deploy

Para deploy em produção:

1. Configure as variáveis de ambiente
2. Execute `npm run build`
3. Execute `npm start`

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
