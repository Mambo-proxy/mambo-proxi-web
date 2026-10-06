import { http, HttpResponse } from 'msw';
import { categories, categorySummaries, normalize, services } from '../data/catalogue';

export const catalogueHandlers = [
  http.get('*/v1/categories', ({ request }) => {
    const include = new URL(request.url).searchParams.get('include');
    return HttpResponse.json(include === 'services' ? categories : categorySummaries);
  }),

  http.get('*/v1/services', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const category = query.get('category');
    const featured = query.get('featured');
    const search = query.get('q') ? normalize(query.get('q') ?? '') : null;
    return HttpResponse.json(
      services.filter(
        (service) =>
          (!category || service.category.slug === category) &&
          (featured === null || service.featuredOnHome === (featured === 'true')) &&
          (!search || normalize(`${service.name} ${service.summary}`).includes(search)),
      ),
    );
  }),
];
