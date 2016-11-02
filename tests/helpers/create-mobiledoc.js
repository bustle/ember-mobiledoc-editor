import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc';

export function blankMobiledoc() {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [],
    sections: []
  };
}

export function simpleMobileDoc(text) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [],
    sections: [
      [1, 'p', [
        [0, [], 0, text]
      ]]
    ]
  };
}

export function mobiledocWithList(text, listTagName='ol') {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [],
    sections: [
      [3, listTagName, [
        [
          [0, [], 0, text]
        ]
      ]]
    ]
  };
}

export function mobiledocWithCard(cardName, cardPayload={}) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [
      [cardName, cardPayload]
    ],
    sections: [
      [10, 0]
    ]
  };
}

export function mobiledocWithAtom(atomName, atomText='atom', atomPayload={}) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [
      [atomName, atomText, atomPayload]
    ],
    cards: [],
    sections: [
      [1, "P",
        [
          [0, [], 0, "text before atom"],
          [1, [], 0, 0],
          [0, [], 0, "text after atom"]
        ]
      ]
    ]
  };
}

export function linkMobileDoc(text) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [
      ['a', ['href', 'http://example.com']]
    ],
    atoms: [],
    cards: [],
    sections: [
      [1, 'p', [
        [0, [0], 1, text]
      ]]
    ]
  };
}

