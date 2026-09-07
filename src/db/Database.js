const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

/**
 * Colección persistida en un archivo JSON dentro de src/data/.
 */
class Collection {
  constructor(name) {
    this.name = name;
    this.file = filePath(name);
    if (!fs.existsSync(this.file)) {
      fs.writeFileSync(this.file, '[]', 'utf8');
    }
  }

  _read() {
    try {
      return JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch {
      return [];
    }
  }

  _write(rows) {
    fs.writeFileSync(this.file, JSON.stringify(rows, null, 2), 'utf8');
  }

  all() {
    return this._read();
  }

  find(predicate) {
    return this._read().filter(predicate);
  }

  findOne(predicate) {
    return this._read().find(predicate) || null;
  }

  findById(id) {
    return this.findOne((row) => row.id === id);
  }

  create(data) {
    const rows = this._read();
    rows.push(data);
    this._write(rows);
    return data;
  }

  update(id, patch) {
    const rows = this._read();
    const index = rows.findIndex((row) => row.id === id);
    if (index === -1) return null;
    rows[index] = { ...rows[index], ...patch };
    this._write(rows);
    return rows[index];
  }

  remove(id) {
    const rows = this._read();
    const filtered = rows.filter((row) => row.id !== id);
    if (filtered.length === rows.length) return false;
    this._write(filtered);
    return true;
  }

  removeWhere(predicate) {
    const rows = this._read();
    const filtered = rows.filter((row) => !predicate(row));
    if (filtered.length === rows.length) return false;
    this._write(filtered);
    return true;
  }
}

class Database {
  constructor() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    this.collections = {};
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new Collection(name);
    }
    return this.collections[name];
  }
}

module.exports = new Database();
module.exports.Collection = Collection;