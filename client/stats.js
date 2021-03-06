import toDataByLocation from './toDataByLocation.js';
import countries from '../constants/countries.js';
import { getCountry } from './getCountry.js';
import { FtmUrl } from './utils.js';

const currentCountry = getCountry();

const renderStats = (totalCount, totalCities, stateCounts) => {
  const statsHtml = [];

  statsHtml.push(`<p><strong>${$.i18n('ftm-total-donation-sites-count')}</strong> ${totalCount}</p>`);
  statsHtml.push(`<p><strong>${$.i18n('ftm-total-donation-sites-cities-count')}</strong> ${totalCities}</p>`);
  statsHtml.push(`<p><strong>${$.i18n('ftm-stats-donation-cities-by-region', $.i18n(countries[currentCountry].administrativeRegionI18nString))}</strong></p>`);
  for (const state of Object.keys(stateCounts)) {
    statsHtml.push(`<div>${state}: ${stateCounts[state]}</div>`);
  }

  $('.stats-container').html(statsHtml);
};

document.addEventListener('DOMContentLoaded', () => {
  const url = new FtmUrl(window.location);
  const directories = url.pathname.split('/');

  let countryDataFilename;

  // TODO: super brittle
  if (directories.length > 2 && directories[1] !== 'us') {
    countryDataFilename = `data-${directories[1]}.json`;
  } else {
    countryDataFilename = 'data.json';
  }

  $.getJSON(`https://findthemasks.com/${countryDataFilename}`, (result) => {
    const locations = toDataByLocation(result);

    let totalCount = 0;
    let totalCities = 0;
    const stateCounts = {};

    for (const state of Object.keys(locations).sort()) {
      const { cities } = locations[state];
      const citiesKeys = Object.keys(cities);
      const stateCitiesCount = citiesKeys.length;

      totalCities += stateCitiesCount;
      stateCounts[state] = stateCitiesCount;

      for (const city of citiesKeys) {
        totalCount += cities[city].entries.length;
      }
    }

    if (window.i18nReady) {
      renderStats(totalCount, totalCities, stateCounts);
    } else {
      $('html').on('i18n:ready', () => {
        renderStats(totalCount, totalCities, stateCounts);
      });
    }
  });
});
