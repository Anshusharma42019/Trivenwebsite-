import crypto from 'crypto';

/**
 * Normalizes and hashes strings with SHA-256 according to Meta Conversions API requirements.
 */
function hashMetaField(value) {
  if (!value || typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Normalizes Indian and International phone numbers and returns SHA-256 hash.
 */
function hashMetaPhone(phone) {
  if (!phone || typeof phone !== 'string') return undefined;
  // Remove all non-digits
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return undefined;

  // If 10 digits Indian mobile, prepend country code '91'
  const formatted = digits.length === 10 ? `91${digits}` : digits;
  return crypto.createHash('sha256').update(formatted).digest('hex');
}

/**
 * Sends a server-side 'Purchase' event to Meta Conversions API (CAPI)
 * using the configured Meta Pixel ID (921140677629160) and dynamic order total.
 * 
 * @param {object} order - Mongoose Order document
 * @param {object} clientInfo - Optional client network context { ip, userAgent }
 */
export async function sendMetaPurchaseCAPI(order, clientInfo = {}) {
  try {
    if (!order) return { success: false, error: 'No order provided' };

    // Prevent duplicate Purchase tracking for the same order
    if (order.metaPurchaseTracked) {
      return { success: true, skipped: true, reason: 'Already tracked previously' };
    }

    const pixelId =
      process.env.META_PIXEL_ID ||
      process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ||
      '921140677629160';

    const accessToken =
      process.env.META_CONVERSIONS_API_TOKEN ||
      process.env.META_ACCESS_TOKEN ||
      process.env.FACEBOOK_ACCESS_TOKEN;

    const testEventCode = process.env.META_TEST_EVENT_CODE || null;

    // Dynamic order total amount directly from verified order record
    const dynamicTotalAmount = Number(order.totalAmount || 0);

    const emailHash = hashMetaField(order.customerDetails?.email);
    const phoneHash = hashMetaPhone(order.customerDetails?.phone || order.shippingAddress?.phone);

    const fullName = (order.shippingAddress?.fullName || order.customerDetails?.name || '').trim();
    const nameParts = fullName.split(/\s+/);
    const firstNameHash = hashMetaField(nameParts[0] || '');
    const lastNameHash = nameParts.length > 1 ? hashMetaField(nameParts.slice(1).join(' ')) : undefined;

    const cityHash = hashMetaField((order.shippingAddress?.city || '').replace(/\s+/g, ''));
    const stateHash = hashMetaField((order.shippingAddress?.state || '').replace(/\s+/g, ''));
    const zipHash = hashMetaField((order.shippingAddress?.pincode || '').replace(/\s+/g, ''));
    const countryHash = hashMetaField('in');

    const userData = {
      country: countryHash ? [countryHash] : undefined,
    };
    if (emailHash) userData.em = [emailHash];
    if (phoneHash) userData.ph = [phoneHash];
    if (firstNameHash) userData.fn = [firstNameHash];
    if (lastNameHash) userData.ln = [lastNameHash];
    if (cityHash) userData.ct = [cityHash];
    if (stateHash) userData.st = [stateHash];
    if (zipHash) userData.zp = [zipHash];

    if (clientInfo.ip) {
      userData.client_ip_address = clientInfo.ip.split(',')[0].trim();
    }
    if (clientInfo.userAgent) {
      userData.client_user_agent = clientInfo.userAgent;
    }

    // Build line items array
    const contents = Array.isArray(order.items)
      ? order.items.map((item) => ({
          id: String(item.product || item.sku || item._id),
          quantity: Number(item.quantity || 1),
          item_price: Number(item.unitPrice || item.totalPrice || 0),
        }))
      : [];

    const totalQuantity = Array.isArray(order.items)
      ? order.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
      : 1;

    // Meta CAPI Purchase event payload
    const eventPayload = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: String(order.orderNumber), // Shared deduplication key with browser pixel
      event_source_url: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.orderNumber}`
        : `https://trivenayurveda.com/orders/${order.orderNumber}`,
      action_source: 'website',
      user_data: userData,
      custom_data: {
        currency: 'INR',
        value: dynamicTotalAmount, // Dynamic variable for actual order total amount
        content_type: 'product',
        contents,
        num_items: totalQuantity,
        order_id: String(order.orderNumber),
      },
    };

    if (accessToken) {
      const endpoint = `https://graph.facebook.com/v19.0/${pixelId}/events`;
      const requestBody = {
        data: [eventPayload],
      };
      if (testEventCode) {
        requestBody.test_event_code = testEventCode;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const resJson = await res.json();

      if (!res.ok) {
        console.error('Meta Conversions API Error:', JSON.stringify(resJson));
      } else {
        console.log(
          `[Meta CAPI] Purchase event sent successfully for order ${order.orderNumber} with amount ₹${dynamicTotalAmount}`
        );
      }
    } else {
      console.log(
        `[Meta CAPI Ready] Order ${order.orderNumber} Purchase event prepared with amount ₹${dynamicTotalAmount}. Add META_CONVERSIONS_API_TOKEN in .env to enable direct server dispatch to Meta.`
      );
    }

    // Mark order as tracked in database
    order.metaPurchaseTracked = true;
    order.metaPurchaseTrackedAt = new Date();
    await order.save();

    return {
      success: true,
      orderNumber: order.orderNumber,
      totalAmount: dynamicTotalAmount,
    };
  } catch (err) {
    console.error('Error dispatching Meta Purchase event from backend:', err.message);
    return { success: false, error: err.message };
  }
}
