import 'server-only';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

type SupportedLocale = 'zh-TW' | 'en' | 'ja';

function getPayloadInstance() {
  return getPayload({ config: configPromise });
}

export async function getNewsItems(locale: string, limit = 20) {
  try {
    const payload = await getPayloadInstance();
    const { docs } = await payload.find({
      collection: 'news',
      locale: locale as SupportedLocale,
      where: { status: { equals: 'published' } },
      sort: '-date',
      limit,
    });
    return docs.map((doc) => ({
      slug: doc.slug as string,
      date: doc.date
        ? new Date(doc.date as string).toISOString().slice(0, 10)
        : '',
      title: (doc.title as string) ?? '',
    }));
  } catch {
    return null;
  }
}

export async function getNewsItem(slug: string, locale: string) {
  try {
    const payload = await getPayloadInstance();
    const { docs } = await payload.find({
      collection: 'news',
      locale: locale as SupportedLocale,
      where: {
        and: [
          { slug: { equals: slug } },
          { status: { equals: 'published' } },
        ],
      },
      limit: 1,
    });
    return docs[0] ?? null;
  } catch {
    return null;
  }
}

export async function getFAQs(locale: string) {
  try {
    const payload = await getPayloadInstance();
    const { docs } = await payload.find({
      collection: 'faqs',
      locale: locale as SupportedLocale,
      sort: 'order',
      limit: 20,
    });
    return docs.map((doc) => ({
      id: doc.id as string,
      question: (doc.question as string) ?? '',
      answer: (doc.answer as string) ?? '',
    }));
  } catch {
    return null;
  }
}

export async function getHomePageGlobal(locale: string) {
  try {
    const payload = await getPayloadInstance();
    return await payload.findGlobal({
      slug: 'home-page',
      locale: locale as SupportedLocale,
    });
  } catch {
    return null;
  }
}

export async function getAboutPageGlobal(locale: string) {
  try {
    const payload = await getPayloadInstance();
    return await payload.findGlobal({
      slug: 'about-page',
      locale: locale as SupportedLocale,
    });
  } catch {
    return null;
  }
}

export async function getSiteSettings(locale: string) {
  try {
    const payload = await getPayloadInstance();
    return await payload.findGlobal({
      slug: 'site-settings',
      locale: locale as SupportedLocale,
    });
  } catch {
    return null;
  }
}
