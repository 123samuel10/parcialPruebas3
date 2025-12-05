const db = require('../config/database');

class Appointment {
  static async create(appointmentData) {
    const { patient_id, doctor_id, date, time, reason } = appointmentData;
    const [result] = await db.query(
      'INSERT INTO appointments (patient_id, doctor_id, date, time, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_id, doctor_id, date, time, reason || '', 'active']
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT
        a.*,
        p.name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        d.name as doctor_name,
        d.specialty as doctor_specialty
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `, [id]);
    return rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT
        a.*,
        p.name as patient_name,
        p.email as patient_email,
        d.name as doctor_name,
        d.specialty as doctor_specialty
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND a.status = ?';
      params.push(filters.status);
    }

    if (filters.patient_id) {
      query += ' AND a.patient_id = ?';
      params.push(filters.patient_id);
    }

    if (filters.doctor_id) {
      query += ' AND a.doctor_id = ?';
      params.push(filters.doctor_id);
    }

    if (filters.date) {
      query += ' AND a.date = ?';
      params.push(filters.date);
    }

    query += ' ORDER BY a.date DESC, a.time DESC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async findByDoctorDateTime(doctor_id, date, time) {
    const [rows] = await db.query(
      'SELECT * FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND status = ?',
      [doctor_id, date, time, 'active']
    );
    return rows[0];
  }

  static async cancel(id) {
    const [result] = await db.query(
      'UPDATE appointments SET status = ?, cancelled_at = NOW() WHERE id = ? AND status = ?',
      ['cancelled', id, 'active']
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM appointments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async deleteAll() {
    const [result] = await db.query('DELETE FROM appointments');
    return result.affectedRows;
  }
}

module.exports = Appointment;
