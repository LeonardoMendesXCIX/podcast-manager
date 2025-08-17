const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authController = {
  async register(req, res) {
    try {
      const { username, email, password, fullName } = req.body;

      // Validações
      if (!username || !email || !password || !fullName) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Verificar se usuário já existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Nome de usuário já existe' });
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10);

      // Criar usuário
      const userId = await User.create({
        username,
        email,
        passwordHash,
        fullName
      });

      // Gerar token
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        user: {
          id: userId,
          username,
          email,
          fullName
        }
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Verificar se usuário existe
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name
        }
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        createdAt: user.created_at
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { fullName, bio } = req.body;
      const avatarUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const updateData = { fullName, bio };
      if (avatarUrl) {
        updateData.avatarUrl = avatarUrl;
      }

      const updated = await User.update(req.userId, updateData);
      if (!updated) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const user = await User.findById(req.userId);
      res.json({
        message: 'Perfil atualizado com sucesso',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
          bio: user.bio
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }
};

module.exports = authController;
