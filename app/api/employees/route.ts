import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM employees ORDER BY id DESC');
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } 
  catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, position, contact } = await req.json();

    if (!name || !email || !position || !contact) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO employees (name, email, position, contact) VALUES (?, ?, ?, ?)',
      [name, email, position, contact]
    );

    return NextResponse.json({ message: 'Employee added', id: (result as any).insertId });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
