import { NextResponse } from 'next/server';
import { FacilityType } from '@amisimedos/db';
import { suggestModulesForFacility } from '@/lib/crm-automation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const facilityType = searchParams.get('facilityType') as FacilityType | null;

  if (!facilityType || !Object.values(FacilityType).includes(facilityType as any)) {
    return NextResponse.json(
      { error: 'Missing or invalid facilityType parameter' },
      { status: 400 }
    );
  }

  const suggestions = suggestModulesForFacility(facilityType as FacilityType);

  return NextResponse.json({ facilityType, suggestions });
}
