import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    const validCode = process.env.PREMIUM_CODE || 'NEXTSTEP2026';

    if (code === validCode) {
      return NextResponse.json({ success: true, message: '验证成功' });
    }

    return NextResponse.json(
      { success: false, message: '验证码错误，请确认支付后联系客服获取正确验证码' },
      { status: 403 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: '验证失败，请重试' },
      { status: 500 }
    );
  }
}
