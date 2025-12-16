import { http, HttpResponse } from 'msw';
import { createMockMatterListResponse } from './mockData';

const API_URL = 'http://localhost:3000/api/v1';

export const handlers = [
  // GET /matters - List matters with pagination
  http.get(`${API_URL}/matters`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '25');
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const search = url.searchParams.get('search') || '';

    // For now, return mock data without applying sort/search
    // In a real implementation, you would filter and sort the data
    const response = createMockMatterListResponse(page, limit);

    return HttpResponse.json(response);
  }),

  // GET /matters/:id - Get single matter
  http.get(`${API_URL}/matters/:id`, ({ params }) => {
    const { id } = params;
    const mockData = createMockMatterListResponse();
    const matter = mockData.data.find((m) => m.id === id);

    if (!matter) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(matter);
  }),

  // PATCH /matters/:id - Update matter
  http.patch(`${API_URL}/matters/:id`, async ({ request, params }) => {
    const { id } = params;
    const body = await request.json();
    
    // Return success response
    // In a real implementation, you would update the mock data
    return HttpResponse.json({ success: true, id, ...body });
  }),
];
