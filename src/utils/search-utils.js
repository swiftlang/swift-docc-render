import { escapeRegExp, whiteSpaceIgnorantRegex } from 'docc-render/utils/strings';

// eslint-disable-next-line import/prefer-default-export
export function safeHighlightPattern(text) {
  const sanitizedText = whiteSpaceIgnorantRegex(escapeRegExp(text));
  return new RegExp(sanitizedText, 'ig');
}
