const db = require('../config/database');

class Doctor {
  static async create(doctorData) {
    const { name, specialty } = doctorData;
    const [result] = await db.query(
      'INSERT INTO doctors (name, specialty) VALUES (?, ?)',
      [name, specialty]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM doctors WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM doctors ORDER BY name');
    return rows;
  }

  static async update(id, doctorData) {
    const { name, specialty } = doctorData;
    const [result] = await db.query(
      'UPDATE doctors SET name = ?, specialty = ? WHERE id = ?',
      [name, specialty, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM doctors WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Doctor;
