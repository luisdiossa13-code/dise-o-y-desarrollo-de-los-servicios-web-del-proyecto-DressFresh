const crypto = require('crypto');

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function uid(prefix = '') {
  const id = crypto.randomUUID();
  return prefix ? `${prefix}-${id}` : id;
}

function sequenceCode(prefix, seq) {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(seq).padStart(6, '0')}`;
}

function nextSequence(rows, key = 'sequence') {
  let max = 0;
  for (const row of rows) {
    if (Number(row[key]) > max) max = Number(row[key]);
  }
  return max + 1;
}

function now() {
  return new Date().toISOString();
}

function round(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function buildMeta(page, limit, total) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

module.exports = {
  ApiError,
  uid,
  sequenceCode,
  nextSequence,
  now,
  round,
  buildMeta
};