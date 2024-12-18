import { STYLE_TAG_END, STYLE_TAG_START } from './consts';

export function styleEncode(template: string) {
  const regexp = /<style.*>([\s\S]*?)<\/style>/g;
  return template.replaceAll(regexp, (_match, p1) => `/*${STYLE_TAG_START}${Buffer.from(p1, 'utf-8').toString('base64')}${STYLE_TAG_END}*/`);
}

export function styleDecode(template: string) {
  const regexp = new RegExp(`(\\/\\*${STYLE_TAG_START})([A-Za-z0-9+/=]*)(${STYLE_TAG_END}\\*\\/)`, 'g');
  return template.replaceAll(regexp, (_match, _p1, p2, _p3) => {
    const content = Buffer.from(p2, 'base64').toString('utf-8');
    return `<style>${content}</style>`;
  });
}
