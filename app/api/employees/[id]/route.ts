import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [params.id]);
    if ((rows as any).length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    return NextResponse.json((rows as any)[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, email, position, contact } = await req.json();

    if (!name || !email || !position || !contact) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const [result] = await pool.query(
      'UPDATE employees SET name=?, email=?, position=?, contact=? WHERE id=?',
      [name, email, position, contact, params.id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Employee updated' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [result] = await pool.query('DELETE FROM employees WHERE id=?', [params.id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Employee deleted' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
