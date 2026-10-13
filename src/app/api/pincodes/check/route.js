import { successResponse, errorResponse } from '@/lib/errors';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get('pincode');

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return errorResponse('Please provide a valid 6-digit Indian PIN code', 400);
  }

  let city = 'India';
  let state = '';

  // 1. Try real-time Indian postal PIN code lookup with fast timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        city = po.District || po.Block || po.Division || 'India';
        state = po.State || '';
      }
    }
  } catch (err) {
    // If external postal API times out, fallback to internal zone lookup
  }

  // 2. Fallback zone heuristics if city wasn't found
  if (city === 'India') {
    const p2 = pincode.substring(0, 2);
    if (p2 === '11') { city = 'New Delhi'; state = 'Delhi'; }
    else if (p2 === '12' || p2 === '13') { city = 'Gurugram'; state = 'Haryana'; }
    else if (p2 === '14' || p2 === '15') { city = 'Ludhiana'; state = 'Punjab'; }
    else if (p2 === '16') { city = 'Chandigarh'; state = 'Chandigarh'; }
    else if (p2 === '20') { city = 'Noida'; state = 'Uttar Pradesh'; }
    else if (p2 === '22') { city = 'Lucknow'; state = 'Uttar Pradesh'; }
    else if (p2 === '24') { city = 'Haridwar'; state = 'Uttarakhand'; }
    else if (p2 === '26') { city = 'Dehradun'; state = 'Uttarakhand'; }
    else if (p2 === '28') { city = 'Agra'; state = 'Uttar Pradesh'; }
    else if (p2 === '30' || p2 === '31') { city = 'Jaipur'; state = 'Rajasthan'; }
    else if (p2 === '38' || p2 === '39') { city = 'Ahmedabad'; state = 'Gujarat'; }
    else if (p2 === '40') { city = 'Mumbai'; state = 'Maharashtra'; }
    else if (p2 === '41') { city = 'Pune'; state = 'Maharashtra'; }
    else if (p2 === '50') { city = 'Hyderabad'; state = 'Telangana'; }
    else if (p2 === '56') { city = 'Bengaluru'; state = 'Karnataka'; }
    else if (p2 === '60') { city = 'Chennai'; state = 'Tamil Nadu'; }
    else if (p2 === '70') { city = 'Kolkata'; state = 'West Bengal'; }
    else if (p2 === '80') { city = 'Patna'; state = 'Bihar'; }
    else { city = 'India'; }
  }

  const zonePrefix = pincode.charAt(0);
  let estimatedDays = '2 - 3 business days';
  if (['1', '2', '3', '4'].includes(zonePrefix)) {
    estimatedDays = '1 - 2 business days';
  } else if (['7', '8'].includes(zonePrefix)) {
    estimatedDays = '3 - 5 business days';
  }

  return successResponse({
    pincode,
    city,
    state,
    serviceable: true,
    codAvailable: true,
    estimatedDelivery: estimatedDays,
    message: `Delivery available to ${city}${state ? `, ${state}` : ''}. Fast Triven Prime dispatch supported.`,
  });
}
