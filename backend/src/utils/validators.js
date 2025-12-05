class Validators {
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  static validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    // Acepta formatos: 1234567890, 123-456-7890, (123) 456-7890, +1234567890
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return cleanPhone.length >= 10 && /^\+?\d+$/.test(cleanPhone);
  }

  static validateDate(date) {
    if (!date) return false;
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
  }

  static validateTime(time) {
    if (!time) return false;
    // Formato HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  static validateRequiredFields(data, fields) {
    const missing = [];
    for (const field of fields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missing.push(field);
      }
    }
    return missing.length === 0 ? null : missing;
  }
}

module.exports = Validators;
