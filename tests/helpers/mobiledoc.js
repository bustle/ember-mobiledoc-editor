const MOBILEDOC_VERSION = '0.3.0';

export function createSimpleMobiledoc(text) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [],
    sections: [
      [1, 'P', [
        [0, [], 0, text]
      ]]
    ]
  };
}

export function createMobiledocWithAtom(atomName) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [
      [atomName, 'value', {foo: 'bar'}]
    ],
    cards: [],
    sections: [
      [1, 'P', [
        [1, [], 0, 0]
      ]]
    ]
  };
}

export function createMobiledocWithCard(cardName) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [
      [cardName, {foo: 'bar'}]
    ],
    sections: [
      [10, 0]
    ]
  };
}


