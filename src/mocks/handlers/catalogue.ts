import { http, HttpResponse } from 'msw';
import { categoryDetails, categoryDetailsEn, otherCategorySlugs } from '../data/category-details';
import { serviceDetails } from '../data/service-details';
import { problem } from '../problem';
import { getCategories, getCategorySummaries, getServices, langOf, normalize } from '../data/catalogue';

export const catalogueHandlers = [
  http.get('*/v1/categories', ({ request }) => {
    const include = new URL(request.url).searchParams.get('include');
    const lang = langOf(request);
    return HttpResponse.json(include === 'services' ? getCategories(lang) : getCategorySummaries(lang));
  }),

  http.get('*/v1/services', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const category = query.get('category');
    const featured = query.get('featured');
    const search = query.get('q') ? normalize(query.get('q') ?? '') : null;
    return HttpResponse.json(
      getServices(langOf(request)).filter(
        (service) =>
          (!category || service.category.slug === category) &&
          (featured === null || service.featuredOnHome === (featured === 'true')) &&
          (!search || normalize(`${service.name} ${service.summary}`).includes(search)),
      ),
    );
  }),

  http.get('*/v1/services/:slug', ({ params, request }) => {
    const detail = serviceDetails[langOf(request)][String(params.slug)];
    return detail ? HttpResponse.json(detail) : problem(404, "Ce service n'existe pas.");
  }),

  // Page rubrique : résumé + services + contenu de la page + 3 autres rubriques.
  http.get('*/v1/categories/:slug', ({ params, request }) => {
    const slug = String(params.slug);
    const lang = langOf(request);
    const category = getCategories(lang).find((item) => item.slug === slug);
    const detail = (lang === 'en' ? categoryDetailsEn[slug] : undefined) ?? categoryDetails[slug];
    if (!category || !detail) return problem(404, "Cette rubrique n'existe pas.");
    const summaries = getCategorySummaries(lang);
    const others = otherCategorySlugs[slug];
    return HttpResponse.json({
      ...category,
      ...detail,
      services: category.services ?? [],
      otherCategories: others
        ? others.flatMap((other) => summaries.filter((item) => item.slug === other))
        : summaries.filter((item) => item.slug !== slug).slice(0, 3),
    });
  }),
];
