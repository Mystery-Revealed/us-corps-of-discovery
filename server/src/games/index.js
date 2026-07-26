// games/index.js — registry of playable games. GameManager looks games up here.
// This repo ships one U.S. History Unit 4 game: Corps of Discovery: Mission West.

import usCorpsOfDiscovery from './usCorpsOfDiscovery.js';

export const GAMES = {
  [usCorpsOfDiscovery.id]: usCorpsOfDiscovery,
};

export function getGame(id) {
  return GAMES[id] || null;
}
