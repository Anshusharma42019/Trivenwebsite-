import { connectDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    return successResponse({
      addresses: user.addresses || [],
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required to save address', 401);
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault = false,
      type = 'home',
    } = body;

    if (!addressLine1 || !city || !state || !pincode) {
      return errorResponse('Address, city, state, and 6-digit PIN code are required', 400);
    }

    await connectDB();

    const existingUser = await User.findById(user._id);
    if (!existingUser) {
      return errorResponse('User not found', 404);
    }

    const addresses = existingUser.addresses || [];
    const shouldBeDefault = isDefault || addresses.length === 0;

    if (shouldBeDefault) {
      addresses.forEach((a) => {
        a.isDefault = false;
      });
    }

    const newAddress = {
      fullName: fullName || existingUser.name,
      phone: phone || existingUser.phone || '',
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      pincode,
      isDefault: shouldBeDefault,
      type: type || 'home',
    };

    addresses.push(newAddress);
    existingUser.addresses = addresses;
    await existingUser.save();

    return successResponse(
      {
        addresses: existingUser.addresses,
        address: addresses[addresses.length - 1],
      },
      201,
      'Delivery address saved successfully.'
    );
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const { addressId, isDefault, ...updateFields } = body;

    if (!addressId) {
      return errorResponse('Address ID is required', 400);
    }

    await connectDB();
    const existingUser = await User.findById(user._id);
    if (!existingUser) {
      return errorResponse('User not found', 404);
    }

    const target = existingUser.addresses.id(addressId);
    if (!target) {
      return errorResponse('Address not found', 404);
    }

    if (isDefault) {
      existingUser.addresses.forEach((a) => {
        a.isDefault = false;
      });
      target.isDefault = true;
    }

    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] !== undefined) {
        target[key] = updateFields[key];
      }
    });

    await existingUser.save();

    return successResponse({
      addresses: existingUser.addresses,
    }, 200, 'Address updated successfully.');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return errorResponse('Address ID is required', 400);
    }

    await connectDB();
    const existingUser = await User.findById(user._id);
    if (!existingUser) {
      return errorResponse('User not found', 404);
    }

    existingUser.addresses = existingUser.addresses.filter(
      (a) => a._id.toString() !== addressId
    );

    // If removed was default and others exist, set first as default
    if (existingUser.addresses.length > 0 && !existingUser.addresses.some((a) => a.isDefault)) {
      existingUser.addresses[0].isDefault = true;
    }

    await existingUser.save();

    return successResponse({
      addresses: existingUser.addresses,
    }, 200, 'Address removed successfully.');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
