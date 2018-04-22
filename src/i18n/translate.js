import {availableLanguages} from './available';

export const navigatorLanguage = (
  navigator.language.split('-')[0]
);

export let currentLanguage = (
  availableLanguages.hasOwnProperty(navigatorLanguage) ? navigatorLanguage : 'en'
);

export const loadTranslations = (l) => {
  currentLanguage = l;
  return require(`./${ l }.json`);
};
