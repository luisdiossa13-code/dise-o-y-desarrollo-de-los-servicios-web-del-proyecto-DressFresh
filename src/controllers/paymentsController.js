const db = require('../db/Database');
const { ApiError, uid, now, sequenceCode, nextSequence } = require('../utils/helpers');

const METHODS = [
  { code: 'tarjeta', name: 'Tarjeta de crédito/débito', description: 'Visa, Mastercard y Amex', requires: ['cardNumber', 'cardHolder', 'expiry', 'cvc'] },
  { code: 'pse', name: 'PSE (Pagos Seguros en Línea)', description: 'Débito desde tu cuenta bancaria', requires: ['bank'] },
  { code: 'nequi', name: 'Nequi', description: 'Paga desde tu billetera digital Nequi', requires: ['phone'] },
  { code: 'paypal', name: 'PayPal', description: 'Paga con tu cuenta PayPal', requires: [], gate: 'redirect' },
  { code: 'contraentrega', name: 'Contra entrega', description: 'Paga al recibir tu pedido', requires: [] }
];

function paymentDTO(payment) {
  if (!payment) return null;
  const order = payment.orderId ? db.collection('orders').findById(payment.orderId) : null;
  return { ...payment, order: order || null };
}

function listMethods(req, res) {
  res.json({ success: true, data: METHODS });
}

/**
 * Simula la integración con la pasarela de pago.
 * En producción, este paso delegaría en la API real de la pasarela
 * (Stripe, PayU, Wompi, etc.) usando PAYMENT_GATEWAY_KEY.
 */
function simulateGateway(method, body) {
  switch (method) {
    case 'contraentrega':
      return { approved: false, pending: true, transactionId: null, response: { status: 'pending', message: 'Pago contra entrega: se cobra al recibir el pedido.' } };
    case 'tarjeta': {
      const number = String(body.cardNumber || '').replace(/\s+/g, '');
      const valid = /^\d{15,16}$/.test(number);
      const cvcOk = /^\d{3,4}$/.test(String(body.cvc || ''));
      if (!valid || !cvcOk || !body.cardHolder || !body.expiry) {
        return { approved: false, pending: false, transactionId: null, response: { status: 'invalid', message: 'Datos de la tarjeta inválidos o incompletos.' } };
      }
      const approved = number.startsWith('4');
      return {
        approved,
        pending: false,
        transactionId: approved ? `TXN-${Date.now()}` : null,
        response: approved
          ? { status: 'approved', brand: 'Visa', last4: number.slice(-4), message: 'Pago aprobado por la pasarela (simulación).' }
          : { status: 'rejected', message: 'La pasarela rechazó la transacción (simulación: usa una tarjeta que inicie en 4).' }
      };
    }
    case 'pse': {
      if (!body.bank) return { approved: false, pending: false, transactionId: null, response: { status: 'invalid', message: 'Debes seleccionar la entidad bancaria.' } };
      const approved = String(body.bank).length >= 3;
      return {
        approved,
        pending: false,
        transactionId: approved ? `PSE-${Date.now()}` : null,
        response: approved ? { status: 'approved', bank: body.bank, message: 'Transferencia PSE procesada (simulación).' } : { status: 'rejected', message: 'PSE rechazado.' }
      };
    }
    case 'nequi': {
      if (!/^\d{10,12}$/.test(String(body.phone || ''))) {
        return { approved: false, pending: false, transactionId: null, response: { status: 'invalid', message: 'Debes indicar un número de celular Nequi válido.' } };
      }
      return { approved: true, pending: false, transactionId: `NEQ-${Date.now()}`, response: { status: 'approved', phone: body.phone, message: 'Pago Nequi procesado (simulación).' } };
    }
    case 'paypal':
      return { approved: true, pending: false, transactionId: `PPL-${Date.now()}`, response: { status: 'approved', message: 'Pago PayPal procesado (redirección simulada a PayPal).' } };
    default:
      return { approved: false, pending: false, transactionId: null, response: { status: 'error', message: 'Método de pago no soportado.' } };
  }
}

function createPayment(req, res) {
  const { orderId, method, ...gatewayFields } = req.body;

  const methodInfo = METHODS.find((m) => m.code === method);
  if (!methodInfo) {
    throw new ApiError(400, `Método de pago inválido. Válidos: ${METHODS.map((m) => m.code).join(', ')}.`);
  }

  const orders = db.collection('orders');
  const order = orders.findById(orderId);
  if (!order) throw new ApiError(404, 'Pedido no encontrado.');
  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    throw new ApiError(403, 'No puedes pagar un pedido que no te pertenece.');
  }
  if (order.status === 'cancelado' || order.status === 'entregado') {
    throw new ApiError(400, `No se puede pagar un pedido en estado "${order.status}".`);
  }
  if (order.paymentId) {
    throw new ApiError(409, 'Este pedido ya tiene un pago registrado.');
  }

  const result = simulateGateway(method, gatewayFields);

  const payments = db.collection('payments');
  const seq = nextSequence(payments.all(), 'sequence');
  const payment = payments.create({
    id: uid('pay'),
    sequence: seq,
    number: sequenceCode('PAY', seq),
    orderId,
    userId: order.userId,
    method,
    amount: order.total,
    status: result.approved ? 'aprobado' : result.pending ? 'pendiente' : result.response.status === 'invalid' ? 'rechazado' : 'rechazado',
    transactionId: result.transactionId,
    gatewayResponse: result.response,
    createdAt: now(),
    updatedAt: now()
  });

  if (result.approved) {
    orders.update(order.id, { paymentId: payment.id, status: 'pagado', updatedAt: now() });
  } else if (result.pending) {
    orders.update(order.id, { paymentId: payment.id, updatedAt: now() });
  }

  res.status(201).json({
    success: true,
    message: result.approved ? 'Pago procesado exitosamente.' : 'Pago registrado. Verifica el estado.',
    data: paymentDTO(payment)
  });
}

function listMyPayments(req, res) {
  const payments = db
    .collection('payments')
    .find((p) => p.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: payments.map(paymentDTO) });
}

function listAllPayments(req, res) {
  const { status = '', method = '', userId = '' } = req.query;
  let payments = db.collection('payments').all();
  if (status) payments = payments.filter((p) => p.status === status);
  if (method) payments = payments.filter((p) => p.method === method);
  if (userId) payments = payments.filter((p) => p.userId === userId);
  payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: payments.map(paymentDTO) });
}

function getPayment(req, res) {
  const payment = db.collection('payments').findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Pago no encontrado.');
  if (req.user.role !== 'admin' && payment.userId !== req.user.id) {
    throw new ApiError(403, 'No tienes permisos para ver este pago.');
  }
  res.json({ success: true, data: paymentDTO(payment) });
}

/**
 * Confirmación manual: usada para pagos pendientes (p. ej. contra entrega)
 * cuando el pedido ya fue entregado o por decisión del administrador.
 */
function confirmPayment(req, res) {
  const payments = db.collection('payments');
  const payment = payments.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Pago no encontrado.');
  if (payment.status === 'aprobado') throw new ApiError(400, 'El pago ya está aprobado.');

  const updated = payments.update(payment.id, {
    status: 'aprobado',
    transactionId: payment.transactionId || `TXN-${Date.now()}`,
    gatewayResponse: { ...payment.gatewayResponse, status: 'approved', message: 'Pago confirmado manualmente por el administrador.' },
    updatedAt: now()
  });

  const orders = db.collection('orders');
  const order = orders.findById(payment.orderId);
  if (order && order.status === 'pendiente') {
    orders.update(order.id, { paymentId: payment.id, status: 'pagado', updatedAt: now() });
  }

  res.json({ success: true, message: 'Pago confirmado.', data: paymentDTO(updated) });
}

function refundPayment(req, res) {
  const payments = db.collection('payments');
  const payment = payments.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Pago no encontrado.');
  if (payment.status !== 'aprobado') throw new ApiError(400, 'Solo se pueden reembolsar pagos aprobados.');

  const updated = payments.update(payment.id, {
    status: 'reembolsado',
    gatewayResponse: { ...payment.gatewayResponse, status: 'refunded', message: 'Reembolso procesado.' },
    updatedAt: now()
  });
  res.json({ success: true, message: 'Reembolso procesado.', data: paymentDTO(updated) });
}

module.exports = { listMethods, createPayment, listMyPayments, listAllPayments, getPayment, confirmPayment, refundPayment };