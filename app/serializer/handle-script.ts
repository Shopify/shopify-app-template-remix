import { DESIGN_MODE_END, DESIGN_MODE_START } from './consts';

export function getScriptContent(template: string) {
  let result = template.match(/<script\s+design-mode([\s\S]*?)<\/script>/g)?.[0] ?? '';
  result = result
    .replace(/<script\s+design-mode>/, '')
    .replace(/<\/script>/, '')
    .trim();

  return result;
}

export function scriptEncode(scriptContent: string) {
  return `/*${DESIGN_MODE_START}${Buffer.from(scriptContent, 'utf-8').toString('base64')}${DESIGN_MODE_END}*/`;
}

export function scriptDecode(template: string) {
  const regexp = new RegExp(`(\\/\\*${DESIGN_MODE_START})([A-Za-z0-9+/=]*)(${DESIGN_MODE_END}\\*\\/)`, 'g');
  return template.replaceAll(regexp, (_match, _p1, p2, _p3) => {
    const content = Buffer.from(p2, 'base64').toString('utf-8');
    return `<script design-mode>${content}</script>`;
  });
}
