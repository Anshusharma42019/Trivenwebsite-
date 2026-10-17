import { NextResponse } from 'next/server';

export function successResponse(data, status = 200, message = 'Success', headers = {}) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status, headers }
  );
}

export function errorResponse(message = 'An unexpected error occurred', status = 500, details = null) {
  const body = {
    success: false,
    error: message,
  };

  if (details && process.env.NODE_ENV !== 'production') {
    body.details = details;
  }

  return NextResponse.json(body, { status });
}
