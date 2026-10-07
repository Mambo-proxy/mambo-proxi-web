import { http, HttpResponse } from 'msw';
import { categoryDetails } from '../data/category-details';
import { serviceDetails } from '../data/service-details';
import { problem } from '../problem';
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

  http.get('*/v1/services/:slug', ({ params }) => {
    const detail = serviceDetails[String(params.slug)];
    return detail ? HttpResponse.json(detail) : problem(404, "Ce service n'existe pas.");
  }),

  // Page rubrique : résumé + services + contenu de la page + 3 autres rubriques.
  http.get('*/v1/categories/:slug', ({ params }) => {
    const slug = String(params.slug);
    const category = categories.find((item) => item.slug === slug);
    const detail = categoryDetails[slug];
    if (!category || !detail) return problem(404, "Cette rubrique n'existe pas.");
    return HttpResponse.json({
      ...category,
      ...detail,
      services: category.services ?? [],
      otherCategories: categorySummaries.filter((item) => item.slug !== slug),
    });
  }),
];
