const db = require('../config/database');

class Patient {
  static async create(patientData) {
    const { name, email, phone } = patientData;
    const [result] = await db.query(
      'INSERT INTO patients (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM patients WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
    return rows;
  }

  static async update(id, patientData) {
    const { name, email, phone } = patientData;
    const [result] = await db.query(
      'UPDATE patients SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM patients WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Patient;
