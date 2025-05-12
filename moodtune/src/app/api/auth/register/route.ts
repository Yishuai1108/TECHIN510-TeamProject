import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    // 创建用户
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    return NextResponse.json({ message: 'Registration successful' }, { status: 200 });
  } catch (err: any) {
    console.error('Registration error:', err?.stack || err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
} 