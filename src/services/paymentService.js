import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * Creates a Razorpay order on their API, or returns a simulated order in test mode
 */
export async function createRazorpayOrder({ amountInRupees, receipt, notes = {} }) {
  const amountInPaise = Math.round(amountInRupees * 100);

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    // Development/demo mode simulation when credentials are not yet configured
    return {
      id: `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      status: 'created',
      isSimulated: true,
    };
  }

  const authString = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.description || 'Failed to create Razorpay order');
  }

  return response.json();
}

/**
 * Verifies Razorpay payment signature
 */
export function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!RAZORPAY_KEY_SECRET) {
    // If running in development without keys, accept test signature format
    if (razorpaySignature === 'simulated_success_signature' || razorpayOrderId.startsWith('order_sim_')) {
      return true;
    }
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return expectedSignature === razorpaySignature;
}
